// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["@/assets/css/index.css"],
  // robots.txt is prerendered so the static S3 build still gets the env-aware server route output.
  nitro: {
    prerender: {
      routes: ["/robots.txt"],
    },
    ...(isDev
      ? {
          output: {
            dir: ".output-dev",
            serverDir: ".output-dev/server",
            publicDir: ".output-dev/public",
          },
        }
      : {}),
  },
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://drchenpardo.co.il',
  },
  sitemap: {
    sitemapName: 'sitemap.xml',
    sources: ['/api/_sitemap-urls'],
    exclude: ['/api/**', '/lp/**'],
  },
  app: {
    head: {
      htmlAttrs: {
        dir: "rtl",
        lang: "he",
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:image', content: 'https://drchenpardo.co.il/og-image.jpg' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'ד"ר חן פרדו' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://drchenpardo.co.il/og-image.jpg' },
        { name: 'theme-color', content: '#c8a96e' },
      ],
      link: [
        { rel: 'alternate', hreflang: 'he', href: 'https://drchenpardo.co.il/' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  ssr: true,
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
