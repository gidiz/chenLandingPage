import { randomUUID } from "node:crypto"
import { isIP } from "node:net"
import {
  getHeader,
  setHeader,
  setResponseStatus,
} from "h3"
import type { H3Event } from "h3"
import { z } from "zod"

import { logger } from "./logger"

const MAX_BODY_BYTES = 16 * 1024
const BODY_TIMEOUT_MS = 5000
const DELIVERY_TIMEOUT_MS = 8000
const RATE_WINDOW_MS = 60000
const RATE_MAX_REQUESTS = 5
const MAX_RATE_ENTRIES = 10000

// Single-instance protection only. Replace with a shared store before scaling out.
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>()

const singleLine = (max: number): z.ZodString =>
  z.string().trim().min(1).max(max).regex(/^[^\u0000-\u001f\u007f]+$/u)

const contactSchema = z.object({
  name: singleLine(100),
  email: singleLine(254).email(),
  phone: singleLine(32)
    .regex(/^\+?[\d ()-]+$/)
    .refine((value) => {
      const length = value.replace(/\D/g, "").length
      return length >= 7 && length <= 15
    }),
  message: z.string().trim().min(1).max(2000)
    .regex(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+$/u),
}).strict()

const destinationSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password && !url.hash
  } catch {
    return false
  }
})

const canonicalOriginSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.origin === value
  } catch {
    return false
  }
})
const trustedProxySchema = z.string().transform((value) =>
  value === "" ? [] : value.split(",").map((ip) => ip.trim()),
).pipe(z.array(z.string().refine((ip) => isIP(ip) !== 0)).max(32))

type ContactConfig = {
  canonicalOrigin: string
  trustedProxyIps: string
  makeWebhookUrl: string
  lambdaUrl: string
}

type ContactResult = {
  success: true
  delivery: { lambda: boolean; make: boolean }
  deliveryStatus: "complete" | "partial"
  requestId: string
} | {
  error: { code: string; message: string }
  requestId: string
}

class ContactBodyError extends Error {
  constructor(readonly code: string) {
    super(code)
  }
}

const readBoundedBody = (event: H3Event): Promise<string> =>
  new Promise((resolve, reject) => {
    const request = event.node.req
    const chunks: Buffer[] = []
    let size = 0
    const cleanup = (): void => {
      clearTimeout(timer)
      request.off("data", onData)
      request.off("end", onEnd)
      request.off("error", onError)
      request.off("aborted", onError)
    }
    const fail = (code: string): void => {
      cleanup()
      chunks.length = 0
      request.resume()
      reject(new ContactBodyError(code))
    }
    const onData = (chunk: Buffer): void => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        fail("BODY_TOO_LARGE")
        return
      }
      chunks.push(chunk)
    }
    const onEnd = (): void => {
      cleanup()
      resolve(Buffer.concat(chunks).toString("utf8"))
    }
    const onError = (): void => fail("INVALID_BODY")
    const timer = setTimeout(() => fail("BODY_TIMEOUT"), BODY_TIMEOUT_MS)
    request.on("data", onData)
    request.once("end", onEnd)
    request.once("error", onError)
    request.once("aborted", onError)
  })

const checkRateLimit = (key: string): number => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (entry.expiresAt <= now) rateLimitStore.delete(key)
  }

  const entry = rateLimitStore.get(key)
  if (!entry) {
    if (rateLimitStore.size >= MAX_RATE_ENTRIES) return 60
    rateLimitStore.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS })
    return 0
  }
  if (entry.count >= RATE_MAX_REQUESTS) {
    return Math.max(1, Math.ceil((entry.expiresAt - now) / 1000))
  }
  entry.count += 1
  return 0
}

const deliver = async (
  destination: "lambda" | "make",
  url: string,
  body: string,
  requestId: string,
  fetcher: typeof fetch,
): Promise<boolean> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS)
  try {
    const response = await fetcher(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
      redirect: "error",
    })
    // Never read or log provider response bodies.
    await response.body?.cancel()
    if (!response.ok) {
      logger.warn({ requestId, operation: "contact.deliver", destination, status: response.status })
    }
    return response.ok
  } catch {
    logger.error({ requestId, operation: "contact.deliver", destination, code: "DELIVERY_FAILED" })
    return false
  } finally {
    clearTimeout(timer)
  }
}

export const handleContact = async (
  event: H3Event,
  config: ContactConfig,
  fetcher: typeof fetch = fetch,
): Promise<ContactResult> => {
  const requestId = randomUUID()
  setHeader(event, "X-Request-Id", requestId)
  setHeader(event, "Cache-Control", "no-store")
  const fail = (status: number, code: string, message: string): ContactResult => {
    setResponseStatus(event, status)
    return { error: { code, message }, requestId }
  }

  try {
    const canonicalOrigin = canonicalOriginSchema.safeParse(config.canonicalOrigin)
    const trustedProxyIps = trustedProxySchema.safeParse(config.trustedProxyIps)
    if (!canonicalOrigin.success || !trustedProxyIps.success) {
      logger.error({
        requestId,
        operation: "contact.config",
        configName: !canonicalOrigin.success ? "CONTACT_CANONICAL_ORIGIN" : "CONTACT_TRUSTED_PROXY_IPS",
        code: "CONTACT_CONFIG_INVALID",
      })
      return fail(503, "CONTACT_CONFIG_INVALID", "Contact service configuration is unavailable.")
    }

    // Only socket peers explicitly allowlisted by operators may supply one client IP.
    // The trusted ingress MUST strip incoming X-Forwarded-For and overwrite it.
    // Host, Forwarded, X-Forwarded-Host and X-Forwarded-Proto never establish origin.
    const socketIp = event.node.req.socket.remoteAddress || "unknown"
    let clientIp = socketIp
    if (trustedProxyIps.data.includes(socketIp)) {
      const forwardedIp = getHeader(event, "x-forwarded-for")
      if (!forwardedIp || isIP(forwardedIp) === 0) {
        return fail(400, "INVALID_PROXY_IP", "Invalid request routing metadata.")
      }
      clientIp = forwardedIp
    }
    const retryAfter = checkRateLimit(clientIp)
    if (retryAfter) {
      setHeader(event, "Retry-After", retryAfter)
      return fail(429, "RATE_LIMITED", "Too many submissions. Please try again later.")
    }

    const origin = getHeader(event, "origin")
    const referer = getHeader(event, "referer")
    const expectedOrigin = canonicalOrigin.data
    let refererOrigin: string | undefined
    if (origin === undefined && referer) {
      try {
        const refererUrl = new URL(referer)
        if ((refererUrl.protocol === "http:" || refererUrl.protocol === "https:")
          && !refererUrl.username && !refererUrl.password) {
          refererOrigin = refererUrl.origin
        }
      } catch {
        // An invalid Referer cannot establish a trusted origin.
      }
    }
    if (getHeader(event, "sec-fetch-site") === "cross-site"
      || (origin !== undefined ? origin !== expectedOrigin : refererOrigin !== expectedOrigin)) {
      return fail(403, "ORIGIN_REJECTED", "Cross-origin submissions are not allowed.")
    }
    if (getHeader(event, "content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
      return fail(400, "INVALID_CONTENT_TYPE", "Expected application/json.")
    }
    if (getHeader(event, "content-encoding") && getHeader(event, "content-encoding") !== "identity") {
      return fail(400, "INVALID_ENCODING", "Compressed requests are not supported.")
    }
    const declaredLength = getHeader(event, "content-length")
    if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
      return fail(400, "BODY_TOO_LARGE", "Request body exceeds the allowed size.")
    }

    let input: unknown
    try {
      input = JSON.parse(await readBoundedBody(event))
    } catch (error: unknown) {
      return fail(400, error instanceof ContactBodyError ? error.code : "INVALID_JSON", "Invalid request body.")
    }
    const parsed = contactSchema.safeParse(input)
    if (!parsed.success) {
      return fail(422, "INVALID_CONTACT", "Check the name, email, phone and message fields.")
    }

    const destinations = [
      { name: "CONTACT_LAMBDA_URL", value: config.lambdaUrl },
      { name: "CONTACT_MAKE_WEBHOOK_URL", value: config.makeWebhookUrl },
    ]
    for (const destination of destinations) {
      if (!destination.value) {
        logger.warn({ requestId, operation: "contact.config", configName: destination.name })
        continue
      }
      if (!destinationSchema.safeParse(destination.value).success) {
        logger.error({ requestId, operation: "contact.config", configName: destination.name })
        return fail(503, "CONTACT_CONFIG_INVALID", `Invalid server configuration: ${destination.name}.`)
      }
    }
    if (!config.lambdaUrl && !config.makeWebhookUrl) {
      return fail(503, "CONTACT_NOT_CONFIGURED", "Configure CONTACT_LAMBDA_URL or CONTACT_MAKE_WEBHOOK_URL.")
    }

    const body = JSON.stringify(parsed.data)
    const [lambda, make] = await Promise.all([
      config.lambdaUrl ? deliver("lambda", config.lambdaUrl, body, requestId, fetcher) : false,
      config.makeWebhookUrl ? deliver("make", config.makeWebhookUrl, body, requestId, fetcher) : false,
    ])
    if (!lambda && !make) {
      return fail(502, "CONTACT_DELIVERY_FAILED", "Delivery unavailable. Please try again later.")
    }
    const partial = (Boolean(config.lambdaUrl) && !lambda) || (Boolean(config.makeWebhookUrl) && !make)
    return { success: true, delivery: { lambda, make }, deliveryStatus: partial ? "partial" : "complete", requestId }
  } catch {
    logger.error({ requestId, operation: "contact.submit", code: "UNEXPECTED_ERROR" })
    return fail(500, "CONTACT_INTERNAL_ERROR", "Unable to process the submission.")
  }
}
