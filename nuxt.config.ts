// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["@/assets/css/index.css"],
  ssr: false,
  runtimeConfig: {
    public: {
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || "",
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || "",
      gtmAuth: process.env.NUXT_PUBLIC_GTM_AUTH || "",
      gtmPreview: process.env.NUXT_PUBLIC_GTM_PREVIEW || "",
      gtmCookiesWin: process.env.NUXT_PUBLIC_GTM_COOKIES_WIN || "x",
      appEnvironment: process.env.NUXT_PUBLIC_APP_ENVIRONMENT || "local",
    },
  },
});
