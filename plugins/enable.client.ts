const ENABLE_TEST_ORIGIN = "https://test.drchenpardo.co.il"
const ENABLE_SCRIPT_ID = "enable-accessibility-script"
const ENABLE_SCRIPT_SRC =
  "https://cdn.enable.co.il/licenses/enable-L55868azwufvuoa6-0726-84216/init.js"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    if (
      window.location.origin !== ENABLE_TEST_ORIGIN ||
      document.getElementById(ENABLE_SCRIPT_ID)
    ) {
      return
    }

    document.body.classList.add("enable-test-toolbar")
    const script = document.createElement("script")
    script.id = ENABLE_SCRIPT_ID
    script.src = ENABLE_SCRIPT_SRC
    script.async = true
    script.onerror = () => {
      console.error("Failed to load the Enable accessibility widget.")
    }
    document.head.appendChild(script)
  })
})
