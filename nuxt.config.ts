// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["@/assets/css/index.css"],
  nitro: isDev
    ? {
        output: {
          dir: ".output-dev",
          serverDir: ".output-dev/server",
          publicDir: ".output-dev/public",
        },
      }
    : undefined,
  app: {
    head: {
      htmlAttrs: {
        dir: "rtl",
        lang: "he",
      },
    },
  },
  ssr: false,
  runtimeConfig: {
    chat: {
      rateLimitWindowMs: Number(process.env.RAG_CHAT_RATE_LIMIT_WINDOW_MS || 60000),
      rateLimitMaxRequests: Number(process.env.RAG_CHAT_RATE_LIMIT_MAX_REQUESTS || 8),
      openAiTimeoutMs: Number(process.env.RAG_CHAT_OPENAI_TIMEOUT_MS || 15000),
      openAiMaxAttempts: Number(process.env.RAG_CHAT_OPENAI_MAX_ATTEMPTS || 3),
      retrievalTopK: Number(process.env.RAG_CHAT_RETRIEVAL_TOP_K || 6),
    },
    public: {
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || "",
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || "",
      gtmAuth: process.env.NUXT_PUBLIC_GTM_AUTH || "",
      gtmPreview: process.env.NUXT_PUBLIC_GTM_PREVIEW || "",
      gtmCookiesWin: process.env.NUXT_PUBLIC_GTM_COOKIES_WIN || "x",
      appEnvironment: process.env.NUXT_PUBLIC_APP_ENVIRONMENT || "local",
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
      supabasePublishableKey:
        process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    },
  },
});
