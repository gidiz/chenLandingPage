import { useRuntimeConfig } from "#imports"

import { handleContact } from "../lib/contact"

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event)

  return handleContact(event, {
    canonicalOrigin: runtimeConfig.public.canonicalSiteUrl,
    makeWebhookUrl: process.env.CONTACT_MAKE_WEBHOOK_URL ?? runtimeConfig.contact.makeWebhookUrl,
    lambdaUrl: process.env.CONTACT_LAMBDA_URL ?? runtimeConfig.contact.lambdaUrl,
  })
})
