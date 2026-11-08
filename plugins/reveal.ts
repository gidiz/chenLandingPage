export default defineNuxtPlugin((nuxtApp) => {
  const observers = new WeakMap<Element, IntersectionObserver>()

  nuxtApp.vueApp.directive("reveal", {
    getSSRProps() {
      return {}
    },
    mounted(element) {
      element.classList.add("reveal")

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)
      ) {
        element.classList.add("is-visible")
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            element.classList.add("is-visible")
            observer.unobserve(element)
          }
        },
        { threshold: 0.12 },
      )

      observers.set(element, observer)
      observer.observe(element)
    },
    unmounted(element) {
      observers.get(element)?.disconnect()
      observers.delete(element)
    },
  })
})
