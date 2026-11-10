import { ref } from "vue"

import assert from "node:assert/strict"
import { createServer, request } from "node:http"
import type { AddressInfo } from "node:net"
import { after, test } from "node:test"
import { readFile } from "node:fs/promises"
import { createApp, defineEventHandler, toNodeListener } from "h3"
import { transpileModule } from "typescript"

import { handleContact } from "../server/lib/contact"
import { logger } from "../server/lib/logger"

const config = {
  canonicalOrigin: "https://drchenpardo.co.il",
  trustedProxyIps: "",
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
  socketIp?: string,
  contextAddress?: string,
): Promise<{
  url: string
  close: () => Promise<void>
  post: (body?: unknown, headers?: Record<string, string>) => Promise<Response>
}> => {
  const ip = socketIp ?? `192.0.2.${++clientId}`
  const app = createApp()
  app.use(defineEventHandler((event) => {
    Object.defineProperty(event.node.req.socket, "remoteAddress", { value: ip, configurable: true })
    if (contextAddress) event.context.clientAddress = contextAddress
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

type ClientForm = {
  values: typeof contact
  reset: () => void
}
type ClientState = {
  contactForm: { value: ClientForm | null }
  alertState: { value: string }
  alertMessage: { value: string }
  isSubmitting: { value: boolean }
  isRetryBlocked: { value: boolean }
  handleSubmit: () => Promise<void>
}
type ClientFixture = {
  client: ClientState
  events: unknown[]
  calls: Array<{ url: string; options?: RequestInit }>
  counters: { resets: number; clearedTimers: number }
  timerCount: () => number
  advance: (milliseconds: number) => void
  unmount: () => void
}

const acceptedResponse = (lambda = true, make = true): Response =>
  new Response(JSON.stringify({
    success: true,
    delivery: { lambda, make },
    deliveryStatus: lambda && make ? "complete" : "partial",
    requestId: "local-test",
  }), { status: 200 })

const clientFixture = async (
  fetcher: typeof fetch = async () => acceptedResponse(),
): Promise<ClientFixture> => {
  const source = await readFile(new URL("../components/ContactSection.vue", import.meta.url), "utf8")
  const script = source.split("<script setup")[1]?.split("</script>")[0]?.replace(/^[^>]*>/, "")
  assert.ok(script)
  // Execute the actual read-only script with isolated browser/lifecycle/clock stubs.
  // These timers never patch globals or wait in real time.
  const compiled = transpileModule(script.replace(/^import .*$/gm, ""), {}).outputText
  const load = new Function(
    "ref", "useNuxtApp", "onBeforeUnmount", "window", "fetch", "FormData", "setTimeout", "clearTimeout",
    `${compiled}\nreturn { contactForm, alertState, alertMessage, isSubmitting, isRetryBlocked, handleSubmit }`,
  ) as (...args: unknown[]) => ClientState
  const events: unknown[] = []
  const calls: ClientFixture["calls"] = []
  const counters = { resets: 0, clearedTimers: 0 }
  const timers = new Map<number, { callback: () => void; at: number }>()
  const unmountCallbacks: Array<() => void> = []
  let now = 0
  let timerId = 0
  const schedule = (callback: () => void, delay: number): number => {
    const id = ++timerId
    timers.set(id, { callback, at: now + delay })
    return id
  }
  const cancel = (id: number): void => {
    counters.clearedTimers += 1
    timers.delete(id)
  }
  const client = load(ref, () => ({
    $analytics: { trackEvent: (...args: unknown[]): void => { events.push(args) } },
  }), (callback: () => void): void => { unmountCallbacks.push(callback) },
  { location: { pathname: "/local-test" }, setTimeout: schedule, clearTimeout: cancel },
  async (url: Parameters<typeof fetch>[0], options?: RequestInit): Promise<Response> => {
    calls.push({ url: String(url), options })
    return fetcher(url, options)
  }, class {
    constructor(private readonly form: ClientForm) {}
    get(key: keyof typeof contact): string { return this.form.values[key] }
  }, schedule, cancel)
  client.contactForm.value = {
    values: { ...contact },
    reset: (): void => {
      counters.resets += 1
      assert.ok(client.contactForm.value)
      for (const key of Object.keys(contact) as Array<keyof typeof contact>) {
        client.contactForm.value.values[key] = ""
      }
    },
  }
  return {
    client, events, calls, counters,
    timerCount: (): number => timers.size,
    advance: (milliseconds: number): void => {
      const target = now + milliseconds
      while (true) {
        const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0]
        if (!next || next[1].at > target) break
        now = next[1].at
        timers.delete(next[0])
        next[1].callback()
      }
      now = target
    },
    unmount: (): void => {
      assert.equal(unmountCallbacks.length, 1)
      for (const callback of unmountCallbacks) callback()
    },
  }
}

for (const outcome of ["complete", "partial", "single", "429", "502", "503", "network"]) {
  test(`browser script handles ${outcome} without leaking contact fields to analytics`, async () => {
    const success = ["complete", "partial", "single"].includes(outcome)
    const app = await clientFixture(async () => {
      if (outcome === "network") throw new Error("Local simulated network failure")
      return new Response(JSON.stringify(success
        ? {
            success: true,
            delivery: { lambda: true, make: outcome === "complete" },
            deliveryStatus: outcome === "single" ? "complete" : outcome,
          }
        : { error: { code: "TEST_FAILURE", message: "Safe failure" }, requestId: "test-request" }),
      { status: success ? 200 : Number(outcome) })
    })
    await app.client.handleSubmit()
    assert.equal(app.calls.length, 1)
    assert.equal(app.calls[0]?.url, "/api/contact")
    assert.equal(app.calls[0]?.options?.method, "POST")
    assert.deepEqual(JSON.parse(String(app.calls[0]?.options?.body)), contact)
    assert.equal(app.client.alertState.value, success ? "success" : "error")
    assert.ok(app.client.alertMessage.value)
    assert.equal(app.client.isSubmitting.value, false)
    assert.equal(app.counters.resets, success ? 1 : 0)
    assert.deepEqual(app.client.contactForm.value?.values, success
      ? { name: "", email: "", phone: "", message: "" }
      : contact)
    assert.equal(app.events.length, success ? 1 : 0)
    for (const value of Object.values(contact)) assert.ok(!JSON.stringify(app.events).includes(value))
    const message = app.client.alertMessage.value
    app.advance(60000)
    assert.equal(app.client.alertMessage.value, message)
    assert.equal(app.client.alertState.value, success ? "success" : "error")
    app.unmount()
  })
}

test("client markup keeps bounded labelled fields, pending controls and persistent live feedback", async () => {
  const source = await readFile(new URL("../components/ContactSection.vue", import.meta.url), "utf8")
  const template = source.split("<script setup")[0] || ""
  const fields = [...template.matchAll(/<(?:input|textarea)\b[^>]*>/g)].map((match) => match[0])
  assert.equal(fields.length, 4)
  for (const [name, max] of Object.entries({ name: 100, email: 254, phone: 32, message: 2000 })) {
    const field = fields.find((value) => value.includes(`name="${name}"`))
    assert.ok(field, `Missing ${name} field`)
    assert.match(field, new RegExp(`\\bmaxlength="${max}"`))
    assert.match(field, /\baria-label="[^"]+"/)
    assert.match(field, /\brequired\b/)
  }
  assert.match(template, /<form\b[^>]*:aria-busy="isSubmitting"/)
  assert.match(template, /<button\b[^>]*:disabled="isSubmitting \|\| isRetryBlocked"/)
  const region = template.match(/<div\b[^>]*id="form-alert"[^>]*>/)?.[0]
  assert.ok(region)
  assert.match(region, /:role="alertState === 'error' \? 'alert' : 'status'"/)
  assert.match(region, /:aria-live="alertState === 'error' \? 'assertive' : 'polite'"/)
  assert.match(region, /aria-atomic="true"/)
  assert.doesNotMatch(region, /\bv-if=|\bv-show=|\bhidden(?:\s|=|>)/)
})

test("pending submission suppresses duplicates until the first request settles", async () => {
  let resolve: ((response: Response) => void) | undefined
  const pending = new Promise<Response>((complete) => { resolve = complete })
  const app = await clientFixture(async () => pending)
  const first = app.client.handleSubmit()
  assert.equal(app.client.isSubmitting.value, true)
  assert.equal(app.calls.length, 1)
  await app.client.handleSubmit()
  await app.client.handleSubmit()
  assert.equal(app.calls.length, 1)
  assert.deepEqual(app.client.contactForm.value?.values, contact)
  assert.equal(app.counters.resets, 0)
  assert.ok(resolve)
  resolve(acceptedResponse())
  await first
  assert.equal(app.client.isSubmitting.value, false)
  assert.equal(app.counters.resets, 1)
  assert.equal(app.events.length, 1)
  app.unmount()
})

test("valid partial success through Make resets once and does not retry the failed destination", async () => {
  const app = await clientFixture(async () => acceptedResponse(false, true))
  await app.client.handleSubmit()
  assert.equal(app.client.alertState.value, "success")
  assert.equal(app.counters.resets, 1)
  assert.equal(app.client.isSubmitting.value, false)
  assert.deepEqual(app.events, [["contact_form_submit", {
    form_id: "contact-form",
    form_location: "footer_contact_section",
    transport_lambda: false,
    transport_make: true,
  }]])
  app.advance(60000)
  assert.equal(app.calls.length, 1)
  assert.equal(app.timerCount(), 0)
  app.unmount()
})

const malformedSuccesses: Array<{ label: string; body: string }> = [
  { label: "invalid JSON", body: "{" },
  { label: "null", body: "null" },
  { label: "empty object", body: "{}" },
  { label: "missing success flag", body: JSON.stringify({ delivery: { lambda: true, make: true } }) },
  { label: "false success flag", body: JSON.stringify({ success: false, delivery: { lambda: true, make: true } }) },
  { label: "truthy nonboolean success", body: JSON.stringify({ success: "true", delivery: { lambda: true, make: true } }) },
  { label: "missing delivery", body: JSON.stringify({ success: true }) },
  { label: "string delivery flag", body: JSON.stringify({ success: true, delivery: { lambda: "true", make: false } }) },
  { label: "missing delivery flag", body: JSON.stringify({ success: true, delivery: { lambda: true } }) },
  { label: "both deliveries false", body: JSON.stringify({ success: true, delivery: { lambda: false, make: false } }) },
]
for (const { label, body } of malformedSuccesses) {
  test(`client preserves fields and reports error for malformed 2xx: ${label}`, async () => {
    const app = await clientFixture(async () => new Response(body, { status: 200 }))
    await app.client.handleSubmit()
    assert.equal(app.client.alertState.value, "error")
    assert.ok(app.client.alertMessage.value)
    assert.equal(app.client.isSubmitting.value, false)
    assert.equal(app.counters.resets, 0)
    assert.deepEqual(app.client.contactForm.value?.values, contact)
    assert.equal(app.events.length, 0)
    assert.equal(app.timerCount(), 0)
    app.unmount()
  })
}

test("Retry-After blocks submissions for the complete cooldown and permits a later retry", async () => {
  let attempts = 0
  const app = await clientFixture(async () => ++attempts === 1
    ? new Response(null, { status: 429, headers: { "Retry-After": "2" } })
    : acceptedResponse())
  await app.client.handleSubmit()
  assert.equal(app.client.isSubmitting.value, false)
  assert.equal(app.client.isRetryBlocked.value, true)
  assert.equal(app.client.alertState.value, "error")
  assert.equal(app.timerCount(), 1)
  assert.deepEqual(app.client.contactForm.value?.values, contact)
  await app.client.handleSubmit()
  assert.equal(app.calls.length, 1)
  app.advance(1999)
  await app.client.handleSubmit()
  assert.equal(app.calls.length, 1)
  assert.equal(app.client.isRetryBlocked.value, true)
  app.advance(1)
  assert.equal(app.client.isRetryBlocked.value, false)
  assert.equal(app.timerCount(), 0)
  await app.client.handleSubmit()
  assert.equal(app.calls.length, 2)
  assert.equal(app.counters.resets, 1)
  assert.equal(app.client.alertState.value, "success")
  app.unmount()
  assert.equal(app.counters.clearedTimers, 0)
})

test("unmount cancels an active Retry-After timer without later state changes or requests", async () => {
  const app = await clientFixture(async () =>
    new Response(null, { status: 429, headers: { "Retry-After": "60" } }))
  await app.client.handleSubmit()
  assert.equal(app.timerCount(), 1)
  const message = app.client.alertMessage.value
  app.unmount()
  assert.equal(app.counters.clearedTimers, 1)
  assert.equal(app.timerCount(), 0)
  app.advance(120000)
  assert.equal(app.client.isRetryBlocked.value, true)
  assert.equal(app.client.alertMessage.value, message)
  assert.equal(app.calls.length, 1)
  assert.equal(app.counters.resets, 0)
  assert.deepEqual(app.client.contactForm.value?.values, contact)
})

for (const retryAfter of [null, "", "0", "-1", "1.5", "not-a-number", "Infinity", "2147484", "Wed, 21 Oct 2099 07:28:00 GMT"]) {
  test(`invalid or unsupported Retry-After ${JSON.stringify(retryAfter)} does not schedule an unsafe timer`, async () => {
    const app = await clientFixture(async () => new Response(null, {
      status: 429,
      headers: retryAfter === null ? {} : { "Retry-After": retryAfter },
    }))
    await app.client.handleSubmit()
    assert.equal(app.client.alertState.value, "error")
    assert.equal(app.client.isSubmitting.value, false)
    assert.equal(app.client.isRetryBlocked.value, false)
    assert.equal(app.timerCount(), 0)
    assert.equal(app.counters.resets, 0)
    assert.deepEqual(app.client.contactForm.value?.values, contact)
    app.unmount()
    assert.equal(app.counters.clearedTimers, 0)
  })
}

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
  assert.equal(result.deliveryStatus, "complete")
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
    const result = await response.json()
    assert.equal(result.deliveryStatus, "partial")
    assert.deepEqual(result.delivery, {
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
  for (const value of [...Object.values(contact), ...Object.values(config).filter(Boolean)]) {
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
    assert.equal(body.deliveryStatus, "complete")
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
  }, { ...config, lambdaUrl: "", makeWebhookUrl: "" })
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

for (const value of [
  "not-a-url", "https://user:password@example.invalid/contact",
  "https://example.invalid/contact#fragment", "ftp://example.invalid/contact",
]) {
  test("rejects invalid destination before attempting either provider", async (t) => {
    let calls = 0
    const start = logs.length
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    }, { ...config, lambdaUrl: value })
    t.after(app.close)
    const response = await app.post()
    const body = await response.json()
    assert.equal(response.status, 503)
    assert.equal(body.error.code, "CONTACT_CONFIG_INVALID")
    assert.equal(calls, 0)
    assert.ok(!JSON.stringify([body, logs.slice(start)]).includes(value))
  })
}

for (const canonicalOrigin of [
  "", "not-a-url", "http://example.invalid", `${config.canonicalOrigin}/`,
  `${config.canonicalOrigin}/contact`, "https://user:password@example.invalid",
]) {
  test("fails closed on missing or malformed canonical origin configuration", async (t) => {
    let calls = 0
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    }, { ...config, canonicalOrigin })
    t.after(app.close)
    const response = await app.post()
    assert.equal(response.status, 503)
    assert.equal((await response.json()).error.code, "CONTACT_CONFIG_INVALID")
    assert.equal(calls, 0)
  })
}

for (const trustedProxyIps of ["*", "192.0.2.0/24", "proxy.example.invalid", "192.0.2.1,", Array(33).fill("192.0.2.1").join(",")]) {
  test("rejects invalid proxy allowlists without forwarding", async (t) => {
    let calls = 0
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    }, { ...config, trustedProxyIps })
    t.after(app.close)
    const response = await app.post()
    assert.equal(response.status, 503)
    assert.equal((await response.json()).error.code, "CONTACT_CONFIG_INVALID")
    assert.equal(calls, 0)
  })
}

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
  { ...contact, name: "Name\nInjected" },
  { ...contact, phone: "1".repeat(33) },
  { ...contact, message: " " },
  { ...contact, name: 42 },
  { ...contact, email: undefined },
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

test("uses configured origin without trusting forwarded protocol or host", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const origin = config.canonicalOrigin
  assert.equal((await app.post(contact, { Origin: origin })).status, 200)
  assert.equal((await app.post(contact, {
    Origin: origin,
    "X-Forwarded-Proto": "http",
    "X-Forwarded-Host": "attacker.example.invalid",
    Forwarded: "host=attacker.example.invalid;proto=http",
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

const invalidOriginEvidence: Array<Record<string, string>> = [
  { Origin: "", Referer: `${config.canonicalOrigin}/contact` },
  { Origin: "null", Referer: `${config.canonicalOrigin}/contact` },
  { Origin: `${config.canonicalOrigin}/contact` },
  { Origin: `${config.canonicalOrigin}, https://example.invalid` },
  { Origin: "https://attacker.example.invalid", "X-Forwarded-Host": "attacker.example.invalid", "X-Forwarded-Proto": "https" },
  { Referer: "https://user:password@drchenpardo.co.il/contact" },
  { Referer: "http://drchenpardo.co.il/contact" },
]
for (const headers of invalidOriginEvidence) {
  test("rejects invalid origin evidence without forwarding or falling back from Origin", async (t) => {
    let calls = 0
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    })
    t.after(app.close)
    const response = await app.post(contact, headers)
    const body = await response.json()
    assert.equal(response.status, 403)
    assert.deepEqual(Object.keys(body).sort(), ["error", "requestId"])
    assert.equal(body.error.code, "ORIGIN_REJECTED")
    assert.equal(body.requestId, response.headers.get("x-request-id"))
    assert.equal(calls, 0)
  })
}

test("accepts boundary-length fields and multiline messages", async (t) => {
  const app = await fixture()
  t.after(app.close)
  const response = await app.post({
    ...contact,
    name: "a".repeat(100),
    phone: "+1 (234) 567-8901",
    message: `First line\n${"a".repeat(1989)}`,
  })
  assert.equal(response.status, 200)
})

test("trusts a single overwritten client IP only from an allowlisted socket peer", async (t) => {
  const peer = "192.0.2.240"
  const app = await fixture(undefined, { ...config, trustedProxyIps: peer }, peer)
  t.after(app.close)
  for (let index = 0; index < 5; index += 1) {
    assert.equal((await app.post(contact, { "X-Forwarded-For": "198.51.100.240" })).status, 200)
  }
  assert.equal((await app.post(contact, { "X-Forwarded-For": "198.51.100.240" })).status, 429)
  assert.equal((await app.post(contact, { "X-Forwarded-For": "198.51.100.241" })).status, 200)
  assert.equal((await app.post(contact, {
    "X-Forwarded-For": "198.51.100.242", Origin: "https://attacker.example.invalid",
    "X-Forwarded-Host": "attacker.example.invalid", "X-Forwarded-Proto": "https",
  })).status, 403)
})

for (const forwarded of ["", "not-an-ip", "198.51.100.1, 198.51.100.2"]) {
  test("fails closed on missing, malformed or appended IPs from trusted ingress", async (t) => {
    const peer = "192.0.2.241"
    let calls = 0
    const app = await fixture(async () => {
      calls += 1
      return new Response(null, { status: 204 })
    }, { ...config, trustedProxyIps: peer }, peer)
    t.after(app.close)
    const response = await app.post(contact, forwarded ? { "X-Forwarded-For": forwarded } : {})
    assert.equal(response.status, 400)
    assert.equal((await response.json()).error.code, "INVALID_PROXY_IP")
    assert.equal(calls, 0)
  })
}

test("an unlisted socket peer cannot use forwarded IPs to bypass quota even when proxy trust is configured", async (t) => {
  const app = await fixture(undefined, { ...config, trustedProxyIps: "192.0.2.242" })
  t.after(app.close)
  for (let index = 0; index < 5; index += 1) {
    assert.equal((await app.post(contact, { "X-Forwarded-For": `198.51.100.${index}` })).status, 200)
  }
  assert.equal((await app.post(contact, { "X-Forwarded-For": "198.51.100.99" })).status, 429)
})

test("adapter clientAddress cannot establish proxy trust instead of the socket peer", async (t) => {
  const claimedPeer = "192.0.2.243"
  const app = await fixture(undefined, { ...config, trustedProxyIps: claimedPeer }, undefined, claimedPeer)
  t.after(app.close)
  for (let index = 0; index < 5; index += 1) {
    assert.equal((await app.post(contact, { "X-Forwarded-For": `198.51.100.${index}` })).status, 200)
  }
  assert.equal((await app.post(contact, { "X-Forwarded-For": "198.51.100.99" })).status, 429)
})

test("supports explicitly allowlisted IPv4-mapped IPv6 socket peers", async (t) => {
  const peer = "::ffff:192.0.2.244"
  const app = await fixture(undefined, { ...config, trustedProxyIps: peer }, peer)
  t.after(app.close)
  assert.equal((await app.post(contact, { "X-Forwarded-For": "2001:db8::244" })).status, 200)
})

test("unexpected errors return only stable redacted JSON and request-correlated logs", async (t) => {
  const start = logs.length
  const settings = { ...config }
  Object.defineProperty(settings, "canonicalOrigin", {
    get: (): never => { throw new Error(`${contact.email} ${config.lambdaUrl}`) },
  })
  const app = await fixture(undefined, settings)
  t.after(app.close)
  const response = await app.post()
  const body = await response.json()
  assert.equal(response.status, 500)
  assert.equal(body.error.code, "CONTACT_INTERNAL_ERROR")
  assert.deepEqual(logs.slice(start), [[{
    requestId: body.requestId, operation: "contact.submit", code: "UNEXPECTED_ERROR",
  }]])
  assert.ok(!JSON.stringify([body, logs.slice(start)]).includes(contact.email))
  assert.ok(!JSON.stringify([body, logs.slice(start)]).includes(config.lambdaUrl))
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
    }, (res) => {
      res.resume()
      resolve(res.statusCode)
    })
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
    }, (res) => {
      res.resume()
      req.end()
      resolve(res.statusCode)
    })
    req.on("error", reject)
    req.write("{")
  })
  assert.equal(status, 400)
})
