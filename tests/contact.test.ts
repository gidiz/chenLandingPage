import assert from "node:assert/strict"
import { createServer, request } from "node:http"
import type { AddressInfo } from "node:net"
import { after, test } from "node:test"
import { readFile } from "node:fs/promises"
import { createApp, defineEventHandler, toNodeListener } from "h3"

import { handleContact } from "../server/lib/contact"
import { logger } from "../server/lib/logger"

const config = {
  canonicalOrigin: "https://drchenpardo.co.il",
  lambdaUrl: "https://lambda.example.invalid/contact",
  makeWebhookUrl: "https://make.example.invalid/contact",
}
const contact = {
  name: "Test Person",
  email: "person@example.invalid",
  phone: "+972 50-123-4567",
  message: "Please contact me",
}
const logs: unknown[] = []
const reporters = [...logger.options.reporters]
logger.setReporters([{ log: (entry): void => { logs.push(entry.args) } }])
after(() => logger.setReporters(reporters))
let clientId = 0

const fixture = async (
  fetcher: typeof fetch = async () => new Response(null, { status: 204 }),
  settings = config,
): Promise<{
  url: string
  close: () => Promise<void>
  post: (body?: unknown, headers?: Record<string, string>) => Promise<Response>
}> => {
  const ip = `192.0.2.${++clientId}`
  const app = createApp()
  app.use(defineEventHandler((event) => {
    Object.defineProperty(event.node.req.socket, "remoteAddress", { value: ip, configurable: true })
    return handleContact(event, settings, fetcher)
  }))
  const server = createServer(toNodeListener(app))
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/contact`
  return {
    url,
    close: async (): Promise<void> => {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    },
    post: async (body: unknown = contact, headers = {}): Promise<Response> =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(!Object.hasOwn(headers, "Origin") && !Object.hasOwn(headers, "Referer")
            ? { Origin: config.canonicalOrigin }
            : {}),
          ...headers,
        },
        body: JSON.stringify(body),
      }),
  }
}

test("client submits only to same-origin contact route with no provider logger", async () => {
  const source = await readFile(new URL("../components/ContactSection.vue", import.meta.url), "utf8")
  const script = source.split("<script setup")[1]?.split("</script>")[0] || ""
  assert.match(script, /fetch\("\/api\/contact"/)
  assert.doesNotMatch(script, /https?:\/\/|consola|console\./)
})

test("forwards only validated fields as JSON to both configured destinations", async (t) => {
  const calls: Array<{ url: string; options?: RequestInit }> = []
  const app = await fixture(async (url, options) => {
    calls.push({ url: String(url), options })
    return new Response(null, { status: 204 })
  })
  t.after(app.close)
  const response = await app.post({ ...contact, name: ` ${contact.name} ` })
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.deepEqual(result.delivery, { lambda: true, make: true })
  assert.equal(calls.length, 2)
  assert.deepEqual(calls.map((call) => call.url), [config.lambdaUrl, config.makeWebhookUrl])
  for (const call of calls) {
    assert.deepEqual(JSON.parse(String(call.options?.body)), contact)
    assert.equal(call.options?.redirect, "error")
    assert.ok(call.options?.signal instanceof AbortSignal)
  }
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.ok(result.requestId)
})

for (const successful of ["lambda", "make"]) {
  test(`reports success when only ${successful} succeeds`, async (t) => {
    const app = await fixture(async (url) => new Response(null, {
      status: String(url) === (successful === "lambda" ? config.lambdaUrl : config.makeWebhookUrl) ? 204 : 503,
    }))
    t.after(app.close)
    const response = await app.post()
    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).delivery, {
      lambda: successful === "lambda",
      make: successful === "make",
    })
  })
}

test("redacts network errors and provider payloads when both destinations fail", async (t) => {
  const app = await fixture(async () => { throw new Error(`${contact.email} ${config.makeWebhookUrl}`) })
  t.after(app.close)
  const response = await app.post()
  assert.equal(response.status, 502)
  const body = await response.json()
  assert.equal(body.error.code, "CONTACT_DELIVERY_FAILED")
  assert.ok(body.requestId)
  const output = JSON.stringify([body, logs])
  for (const value of [...Object.values(contact), ...Object.values(config)]) {
    assert.ok(!output.includes(value))
  }
})

for (const name of ["lambdaUrl", "makeWebhookUrl"] as const) {
  test(`succeeds through the configured destination when ${name} is missing`, async (t) => {
    const calls: string[] = []
    const logStart = logs.length
    const app = await fixture(async (url) => {
      calls.push(String(url))
      return new Response(null, { status: 204 })
    }, { ...config, [name]: "" })
    t.after(app.close)
    const response = await app.post()
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.success, true)
    assert.deepEqual(body.delivery, {
      lambda: name !== "lambdaUrl",
      make: name !== "makeWebhookUrl",
    })
    assert.deepEqual(calls, [name === "lambdaUrl" ? config.makeWebhookUrl : config.lambdaUrl])
    assert.deepEqual(logs.slice(logStart), [[{
      requestId: body.requestId,
      operation: "contact.config",
      configName: name === "lambdaUrl" ? "CONTACT_LAMBDA_URL" : "CONTACT_MAKE_WEBHOOK_URL",
    }]])
  })

  test(`returns a delivery error when the only configured destination fails with ${name} missing`, async (t) => {
    const calls: string[] = []
    const app = await fixture(async (url) => {
      calls.push(String(url))
      return new Response("Untrusted provider payload", { status: 503 })
    }, { ...config, [name]: "" })
    t.after(app.close)
    const response = await app.post()
    assert.equal(response.status, 502)
    const body = await response.json()
    assert.equal(body.error.code, "CONTACT_DELIVERY_FAILED")
    assert.ok(body.requestId)
    assert.deepEqual(calls, [name === "lambdaUrl" ? config.makeWebhookUrl : config.lambdaUrl])
    assert.ok(!JSON.stringify(body).includes("Untrusted provider payload"))
  })
}

test("returns explicit 503 without forwarding when neither destination is configured", async (t) => {
  let calls = 0
  const logStart = logs.length
  const app = await fixture(async () => {
    calls += 1
    return new Response(null, { status: 204 })
  }, { canonicalOrigin: config.canonicalOrigin, lambdaUrl: "", makeWebhookUrl: "" })
  t.after(app.close)
  const response = await app.post()
  assert.equal(response.status, 503)
  const body = await response.json()
  assert.equal(body.error.code, "CONTACT_NOT_CONFIGURED")
  assert.match(body.error.message, /CONTACT_LAMBDA_URL/)
  assert.match(body.error.message, /CONTACT_MAKE_WEBHOOK_URL/)
  assert.equal(calls, 0)
  assert.deepEqual(logs.slice(logStart), [
    [{ requestId: body.requestId, operation: "contact.config", configName: "CONTACT_LAMBDA_URL" }],
    [{ requestId: body.requestId, operation: "contact.config", configName: "CONTACT_MAKE_WEBHOOK_URL" }],
  ])
})

test("returns a delivery error when both configured endpoints return failures", async (t) => {
  let calls = 0
  const app = await fixture(async () => {
    calls += 1
    return new Response(null, { status: 500 })
  })
  t.after(app.close)
  const response = await app.post()
  assert.equal(response.status, 502)
  assert.equal((await response.json()).error.code, "CONTACT_DELIVERY_FAILED")
  assert.equal(calls, 2)
})

test("rejects non-HTTPS destination configuration without disclosing its value", async (t) => {
  const app = await fixture(undefined, { ...config, makeWebhookUrl: "http://example.invalid" })
  t.after(app.close)
  const response = await app.post()
  assert.equal(response.status, 503)
  assert.equal((await response.json()).error.code, "CONTACT_CONFIG_INVALID")
})

const invalidInputs: unknown[] = [
  null,
  { ...contact, name: " " },
  { ...contact, name: "a".repeat(101) },
  { ...contact, email: "invalid" },
  { ...contact, email: `${"a".repeat(250)}@example.invalid` },
  { ...contact, phone: "123" },
  { ...contact, phone: "1234567890123456" },
  { ...contact, phone: "phone number" },
  { ...contact, message: "a".repeat(2001) },
  { ...contact, message: "\u0000" },
  { ...contact, webhookUrl: "https://example.invalid" },
]
for (const [index, input] of invalidInputs.entries()) {
  test(`rejects invalid contact input case ${index + 1} before forwarding`, async (t) => {
    let calls = 0
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    })
    t.after(app.close)
    const response = await app.post(input)
    assert.equal(response.status, 422)
    assert.equal((await response.json()).error.code, "INVALID_CONTACT")
    assert.equal(calls, 0)
  })
}

test("rejects malformed JSON, unsupported content type, compressed and cross-origin requests", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const malformed = await fetch(app.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: config.canonicalOrigin },
    body: "{",
  })

  assert.equal(malformed.status, 400)
  assert.equal((await malformed.json()).error.code, "INVALID_JSON")
  assert.equal((await app.post(contact, { "Content-Type": "text/plain" })).status, 400)
  assert.equal((await app.post(contact, { "Content-Encoding": "gzip" })).status, 400)
  const crossOrigin = await app.post(contact, { Origin: "https://example.invalid" })
  assert.equal(crossOrigin.status, 403)
  assert.equal(crossOrigin.headers.get("access-control-allow-origin"), null)
  assert.equal((await app.post(contact, { "Sec-Fetch-Site": "cross-site" })).status, 403)
})

test("accepts same-origin browser requests, including trusted TLS termination", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const origin = config.canonicalOrigin
  assert.equal((await app.post(contact, { Origin: origin })).status, 200)
  assert.equal((await app.post(contact, {
    Origin: origin,
    "X-Forwarded-Proto": "https",
    "Sec-Fetch-Site": "same-origin",
  })).status, 200)
})

test("accepts a same-origin Referer when Origin is absent", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const response = await app.post(contact, { Referer: `${config.canonicalOrigin}/contact` })
  assert.equal(response.status, 200)
})

test("rejects malformed and cross-origin Referers when Origin is absent", async (t) => {
  const app = await fixture()
  t.after(app.close)
  for (const referer of ["not-a-valid-url", "https://example.invalid/contact"]) {
    const response = await app.post(contact, { Referer: referer })
    assert.equal(response.status, 403)
    assert.equal((await response.json()).error.code, "ORIGIN_REJECTED")
  }
})

test("rejects contact requests when Origin and Referer are both absent", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const response = await fetch(app.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  })
  assert.equal(response.status, 403)
  assert.equal((await response.json()).error.code, "ORIGIN_REJECTED")
})

test("limits declared and streamed request bodies", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const response = await app.post({ ...contact, message: "a".repeat(20000) })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).error.code, "BODY_TOO_LARGE")
  const status = await new Promise<number | undefined>((resolve, reject) => {
    const req = request(app.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
        Origin: config.canonicalOrigin,
      },
    }, (res) => { res.resume(); resolve(res.statusCode) })
    req.on("error", reject)
    req.write("a".repeat(20000))
    req.end()
  })
  assert.equal(status, 400)
})

test("enforces five requests per minute and ignores spoofed forwarded IPs", async (t) => {
  const app = await fixture()
  t.after(app.close)
  for (let index = 0; index < 5; index += 1) {
    assert.equal((await app.post()).status, 200)
  }
  const response = await app.post(contact, { "X-Forwarded-For": "198.51.100.1" })
  assert.equal(response.status, 429)
  assert.ok(Number(response.headers.get("retry-after")) > 0)
  const body = await response.json()
  assert.equal(body.error.code, "RATE_LIMITED")
  assert.ok(body.requestId)
})

test("aborts stalled upstream deliveries within their timeout", async (t) => {
  const app = await fixture(async (_url, options) => new Promise<Response>((_resolve, reject) => {
    options?.signal?.addEventListener("abort", () => reject(new Error("timeout")), { once: true })
  }))
  t.after(app.close)
  const response = await app.post()
  assert.equal(response.status, 502)
  assert.equal((await response.json()).error.code, "CONTACT_DELIVERY_FAILED")
})

test("times out an incomplete request body", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const status = await new Promise<number | undefined>((resolve, reject) => {
    const req = request(app.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
        Origin: config.canonicalOrigin,
      },
    }, (res) => { res.resume(); req.end(); resolve(res.statusCode) })
    req.on("error", reject)
    req.write("{")
  })
  assert.equal(status, 400)
})
