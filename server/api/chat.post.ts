import { randomUUID } from "node:crypto"
import { readBody, setResponseStatus } from "h3"

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
  const requestId = randomUUID()

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
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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
