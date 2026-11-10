import { useRuntimeConfig } from "#imports"

import { defineEventHandler } from "h3"

import { handleContact } from "../lib/contact"

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event)

  return handleContact(event, {
    canonicalOrigin: process.env.CONTACT_CANONICAL_ORIGIN ?? runtimeConfig.contact.canonicalOrigin,
    trustedProxyIps: process.env.CONTACT_TRUSTED_PROXY_IPS ?? runtimeConfig.contact.trustedProxyIps,
    makeWebhookUrl: process.env.CONTACT_MAKE_WEBHOOK_URL ?? runtimeConfig.contact.makeWebhookUrl,
    lambdaUrl: process.env.CONTACT_LAMBDA_URL ?? runtimeConfig.contact.lambdaUrl,
  })
})
