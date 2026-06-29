import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getRequestIP, readBody, setResponseStatus } from "h3"
import type { H3Event } from "h3"

import { basePromptHints, chatRetrievalRules } from "../rag/chat-retrieval-rules"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  role: ChatRole
  content: string
}

type ChatRequestBody = {
  message?: string
  history?: ChatMessage[]
}

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

type OpenAiEmbeddingResponse = {
  data?: Array<{
    embedding?: number[]
  }>
}

type RetrievalChunk = {
  id: string
  category_slug: string | null
  service_slug: string | null
  section_type: string
  section_key: string
  content_text: string
  similarity: number
}

type DirectChunkRow = {
  id: string
  category_slug: string | null
  service_slug: string | null
  section_type: string
  section_key: string
  content_text: string
}

const MAX_MESSAGE_LENGTH = 1200
const MAX_HISTORY_ITEMS = 12
const CHAT_REPLY_DISCLAIMER =
  "לתשומת לבך: המידע באתר ובתשובות המערכת נועד להרחבת הידע הכללי בלבד, ואין לראות בו המלצה רפואית או תחליף להתייעצות ישירה עם רופא/ה מוסמך/ת."

type ChatRuntimeConfig = {
  rateLimitWindowMs?: number
  rateLimitMaxRequests?: number
  openAiTimeoutMs?: number
  openAiMaxAttempts?: number
  retrievalTopK?: number
}

type RateLimitEntry = {
  windowStartMs: number
  count: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  const rounded = Math.floor(parsed)

  if (rounded <= 0) {
    return fallback
  }

  return rounded
}

const getClientKey = (event: H3Event): string => {
  const ip = getRequestIP(event, { xForwardedFor: true })

  if (ip && ip.trim().length > 0) {
    return ip
  }

  return "unknown"
}

const checkRateLimit = (
  key: string,
  windowMs: number,
  maxRequests: number,
): { allowed: boolean; retryAfterSec: number } => {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || now - current.windowStartMs >= windowMs) {
    rateLimitStore.set(key, {
      windowStartMs: now,
      count: 1,
    })

    return {
      allowed: true,
      retryAfterSec: 0,
    }
  }

  current.count += 1
  rateLimitStore.set(key, current)

  if (current.count <= maxRequests) {
    return {
      allowed: true,
      retryAfterSec: 0,
    }
  }

  const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - current.windowStartMs)) / 1000))

  return {
    allowed: false,
    retryAfterSec,
  }
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const shouldRetryStatus = (status: number): boolean => {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

const envFirst = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (value && value.trim().length > 0) {
      return value
    }
  }

  return ""
}

const getMatchedRules = (message: string) => {
  const normalized = message.trim().toLowerCase()

  return chatRetrievalRules.filter((rule) =>
    rule.matches.some((keyword) => normalized.includes(keyword.toLowerCase())),
  )
}

const dedupeChunks = (chunks: RetrievalChunk[]): RetrievalChunk[] => {
  const seen = new Set<string>()

  return chunks.filter((chunk) => {
    const key = `${chunk.section_type}:${chunk.section_key}:${chunk.content_text}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const mapDirectChunkRow = (row: DirectChunkRow, similarity: number): RetrievalChunk => {
  return {
    id: row.id,
    category_slug: row.category_slug,
    service_slug: row.service_slug,
    section_type: row.section_type,
    section_key: row.section_key,
    content_text: row.content_text,
    similarity,
  }
}

const fetchSourceChunks = async (
  supabase: SupabaseClient,
  sourceIds: readonly string[],
  similarityBase: number,
): Promise<RetrievalChunk[]> => {
  const { data, error } = await supabase
    .from("treatment_content_chunks")
    .select("id, category_slug, service_slug, section_type, section_key, content_text")
    .eq("source_table", "site_content")
    .in("source_id", [...sourceIds])
    .order("display_order", { ascending: true })

  if (error || !Array.isArray(data)) {
    return []
  }

  return (data as DirectChunkRow[])
    .filter((item) => item.content_text?.trim().length > 0)
    .map((item, index) => mapDirectChunkRow(item, similarityBase - index * 0.01))
}

const fetchCategoryChunks = async (
  supabase: SupabaseClient,
  categorySlug: string,
  similarityBase: number,
  maxChunks: number,
): Promise<RetrievalChunk[]> => {
  const { data, error } = await supabase
    .from("treatment_content_chunks")
    .select("id, category_slug, service_slug, section_type, section_key, content_text")
    .eq("category_slug", categorySlug)
    .in("source_table", ["treatment_services", "treatment_questions"])
    .order("display_order", { ascending: true })

  if (error || !Array.isArray(data)) {
    return []
  }

  return (data as DirectChunkRow[])
    .filter((item) => item.content_text?.trim().length > 0)
    .slice(0, maxChunks)
    .map((item, index) => mapDirectChunkRow(item, similarityBase - index * 0.01))
}

const createQueryEmbedding = async (
  apiKey: string,
  model: string,
  input: string,
  timeoutMs: number,
): Promise<number[] | null> => {
  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input,
      }),
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as OpenAiEmbeddingResponse
    const embedding = payload.data?.[0]?.embedding

    if (!embedding || embedding.length === 0) {
      return null
    }

    return embedding
  } finally {
    clearTimeout(timeoutHandle)
  }
}

const fetchRelevantChunks = async (
  event: H3Event,
  apiKey: string,
  message: string,
  timeoutMs: number,
  topK: number,
): Promise<RetrievalChunk[]> => {
  const runtime = useRuntimeConfig(event)
  const supabaseUrl = envFirst(
    process.env.SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    runtime.public.supabaseUrl,
  )
  const supabaseKey = envFirst(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    runtime.public.supabasePublishableKey,
  )

  if (!supabaseUrl || !supabaseKey) {
    return []
  }

  const embeddingModel = process.env.RAG_OPENAI_EMBEDDING_MODEL || "text-embedding-3-small"
  const embedding = await createQueryEmbedding(apiKey, embeddingModel, message, timeoutMs)

  if (!embedding) {
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const matchedRules = getMatchedRules(message)
  const preferredChunkBatches = await Promise.all(
    matchedRules.map(async (rule) => {
      if (rule.sourceIds && rule.sourceIds.length > 0) {
        return fetchSourceChunks(supabase, rule.sourceIds, rule.similarityBase)
      }

      if (rule.categorySlug) {
        return fetchCategoryChunks(
          supabase,
          rule.categorySlug,
          rule.similarityBase,
          rule.maxCategoryChunks ?? 8,
        )
      }

      return []
    }),
  )

  const preferredChunks = preferredChunkBatches.flat()
  const { data, error } = await supabase.rpc("match_treatment_content", {
    query_embedding: `[${embedding.join(",")}]`,
    match_count: topK,
    match_category_slug: null,
    match_service_slug: null,
  })

  if (error || !Array.isArray(data)) {
    return dedupeChunks(preferredChunks)
  }

  const matchedChunks = (data as RetrievalChunk[]).filter((item) => item.content_text?.trim().length > 0)

  return dedupeChunks([...preferredChunks, ...matchedChunks]).slice(
    0,
    topK + preferredChunks.length,
  )
}

const buildSystemPrompt = (message: string): string => {
  const matchedRules = getMatchedRules(message)
  const ruleHints = matchedRules.map((rule) => rule.promptHint)

  return [
    "את עוזרת קליניקה רפואית-אסתטית של ד\"ר חן פרדו. השיבי בעברית, בטון מקצועי וחם, בלי להבטיח תוצאה רפואית.",
    ...basePromptHints,
    ...ruleHints,
  ].join(" ")
}

const buildContextBlock = (chunks: RetrievalChunk[]): string => {
  if (chunks.length === 0) {
    return ""
  }

  return chunks
    .map((chunk, index) => {
      const location = chunk.service_slug
        ? `${chunk.category_slug || "general"}/${chunk.service_slug}`
        : chunk.category_slug || chunk.section_key

      return `${index + 1}. מקור: ${location} | סוג: ${chunk.section_type}\n${chunk.content_text}`
    })
    .join("\n\n")
}

const requestOpenAiChat = async (
  apiKey: string,
  model: string,
  history: ChatMessage[],
  message: string,
  contextBlock: string,
  timeoutMs: number,
  maxAttempts: number,
): Promise<Response> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                buildSystemPrompt(message),
            },
            {
              role: "system",
              content: contextBlock ? `CONTEXT:\n${contextBlock}` : "CONTEXT: אין הקשר רלוונטי זמין מהאתר כרגע.",
            },
            ...history,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      })

      clearTimeout(timeoutHandle)

      if (!upstream.ok && shouldRetryStatus(upstream.status) && attempt < maxAttempts) {
        await sleep(300 * attempt)
        continue
      }

      return upstream
    } catch (error) {
      clearTimeout(timeoutHandle)

      if (attempt < maxAttempts) {
        await sleep(300 * attempt)
        continue
      }

      throw error
    }
  }

  throw new Error("OpenAI request exhausted retries")
}

const toValidationError = (
  requestId: string,
  details: Record<string, string>,
): { error: { code: string; message: string; details: Record<string, string> }; requestId: string } => {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid chat request",
      details,
    },
    requestId,
  }
}

const sanitizeHistory = (history: unknown): ChatMessage[] => {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((item): item is ChatMessage => {
      if (!item || typeof item !== "object") {
        return false
      }

      const role = (item as ChatMessage).role
      const content = (item as ChatMessage).content

      return (role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0
    })
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
}

const appendDisclaimer = (reply: string): string => {
  const trimmed = reply.trim()

  if (!trimmed) {
    return `**${CHAT_REPLY_DISCLAIMER}**`
  }

  if (trimmed.includes(CHAT_REPLY_DISCLAIMER)) {
    return trimmed
  }

  return `${trimmed}\n\n**${CHAT_REPLY_DISCLAIMER}**`
}

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  const chatConfig = (runtime.chat || {}) as ChatRuntimeConfig
  const rateLimitWindowMs = toPositiveInt(chatConfig.rateLimitWindowMs, 60_000)
  const rateLimitMaxRequests = toPositiveInt(chatConfig.rateLimitMaxRequests, 8)
  const openAiTimeoutMs = toPositiveInt(chatConfig.openAiTimeoutMs, 15_000)
  const openAiMaxAttempts = toPositiveInt(chatConfig.openAiMaxAttempts, 3)
  const retrievalTopK = toPositiveInt(chatConfig.retrievalTopK, 6)

  const requestId = randomUUID()
  const clientKey = getClientKey(event)
  const rate = checkRateLimit(clientKey, rateLimitWindowMs, rateLimitMaxRequests)

  if (!rate.allowed) {
    event.node.res.setHeader("Retry-After", String(rate.retryAfterSec))
    setResponseStatus(event, 429)

    return {
      error: {
        code: "RATE_LIMITED",
        message: "Too many chat requests. Please try again shortly",
        details: {
          retryAfterSec: String(rate.retryAfterSec),
        },
      },
      requestId,
    }
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.RAG_OPENAI_API_KEY || ""
  const model = process.env.RAG_OPENAI_ANSWER_MODEL || "gpt-4o-mini"

  if (!apiKey) {
    setResponseStatus(event, 503)
    return {
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Chat service is not configured",
      },
      requestId,
    }
  }

  const body = (await readBody(event)) as ChatRequestBody | null
  const message = String(body?.message || "").trim()

  if (!message) {
    setResponseStatus(event, 422)
    return toValidationError(requestId, {
      message: "Message is required",
    })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    setResponseStatus(event, 422)
    return toValidationError(requestId, {
      message: `Message exceeds ${MAX_MESSAGE_LENGTH} characters`,
    })
  }

  const history = sanitizeHistory(body?.history)

  try {
    const contextChunks = await fetchRelevantChunks(event, apiKey, message, openAiTimeoutMs, retrievalTopK)
    const contextBlock = buildContextBlock(contextChunks)

    const upstream = await requestOpenAiChat(
      apiKey,
      model,
      history,
      message,
      contextBlock,
      openAiTimeoutMs,
      openAiMaxAttempts,
    )

    if (!upstream.ok) {
      setResponseStatus(event, 503)
      return {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Chat service is temporarily unavailable",
        },
        requestId,
      }
    }

    const payload = (await upstream.json()) as OpenAiChatResponse
    const reply = payload.choices?.[0]?.message?.content?.trim() || ""

    if (!reply) {
      setResponseStatus(event, 503)
      return {
        error: {
          code: "UPSTREAM_EMPTY_RESPONSE",
          message: "Chat service returned an empty response",
        },
        requestId,
      }
    }

    return {
      reply: appendDisclaimer(reply),
      requestId,
    }
  } catch (error) {
    console.error("chat_api_error", {
      requestId,
      message: error instanceof Error ? error.message : "unknown",
    })

    setResponseStatus(event, 503)
    return {
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Chat service is temporarily unavailable",
      },
      requestId,
    }
  }
})
