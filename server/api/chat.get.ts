import { randomUUID } from "node:crypto"
import { setResponseStatus } from "h3"

export default defineEventHandler((event) => {
  setResponseStatus(event, 405)

  return {
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "Use POST /api/chat with JSON body: { message: string, history?: ChatMessage[] }",
    },
    requestId: randomUUID(),
  }
})
