import { randomUUID } from "node:crypto"
import { getRequestIP, readBody, setResponseStatus } from "h3"
import type { H3Event } from "h3"

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

const MAX_MESSAGE_LENGTH = 1200
const MAX_HISTORY_ITEMS = 12

type ChatRuntimeConfig = {
  rateLimitWindowMs?: number
  rateLimitMaxRequests?: number
  openAiTimeoutMs?: number
  openAiMaxAttempts?: number
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

const requestOpenAiChat = async (
  apiKey: string,
  model: string,
  history: ChatMessage[],
  message: string,
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
                "את עוזרת קליניקה רפואית-אסתטית. השיבי בעברית, בטון מקצועי וחם, בלי להבטיח תוצאה רפואית. אם יש סימפטומים רפואיים חריגים או דחופים, המליצי לפנות לבדיקה רפואית.",
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

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  const chatConfig = (runtime.chat || {}) as ChatRuntimeConfig
  const rateLimitWindowMs = toPositiveInt(chatConfig.rateLimitWindowMs, 60_000)
  const rateLimitMaxRequests = toPositiveInt(chatConfig.rateLimitMaxRequests, 8)
  const openAiTimeoutMs = toPositiveInt(chatConfig.openAiTimeoutMs, 15_000)
  const openAiMaxAttempts = toPositiveInt(chatConfig.openAiMaxAttempts, 3)

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
    const upstream = await requestOpenAiChat(
      apiKey,
      model,
      history,
      message,
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
      reply,
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
