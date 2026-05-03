// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["@/assets/css/index.css"],
  ssr: false,
  runtimeConfig: {
    public: {
      gaMeasurementId: "G-X3E61VSZXK",
      gtmContainerId: "GTM-WXGV32T9",
    },
  },
});
