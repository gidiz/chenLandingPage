<template>
  <nav
    v-show="!isKeyboardActive"
    class="mobile-contact-bar"
    aria-label="קביעת ייעוץ ודרכי יצירת קשר"
  >
    <NuxtLink
      to="/consultation"
      class="mobile-contact-bar__action mobile-contact-bar__action--primary"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 6h14v14H5zM8 3.5v5M16 3.5v5M5 10h14"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
      </svg>
      <span>קביעת ייעוץ</span>
    </NuxtLink>

    <a
      href="tel:0547577214"
      class="mobile-contact-bar__action"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M7.2 3.5h3l1.2 4-2 1.6a15 15 0 0 0 5.5 5.5l1.6-2 4 1.2v3c0 1.2-1 2.2-2.2 2.2A15.8 15.8 0 0 1 5 5.7c0-1.2 1-2.2 2.2-2.2Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
      </svg>
      <span>טלפון</span>
    </a>

    <a
      href="https://wa.me/972547577214"
      target="_blank"
      rel="noopener noreferrer"
      class="mobile-contact-bar__action mobile-contact-bar__action--whatsapp"
      @click="trackClick('whatsapp_click', 'floating_whatsapp')"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5a8.5 8.5 0 0 0-7.2 13l-.9 4 4.1-1a8.5 8.5 0 1 0 4-16Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
        <path
          d="M9 8.5c.3 2.8 2.7 5.2 5.5 5.5l1.1-1.1-2-.7-.8.8a6 6 0 0 1-2.8-2.8l.8-.8-.7-2L9 8.5Z"
          fill="currentColor"
        />
      </svg>
      <span>WhatsApp</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const nuxtApp = useNuxtApp() as {
  $analytics?: {
    trackEvent?: (eventName: string, payload: Record<string, unknown>) => void
  }
}

const isKeyboardActive = ref(false)

const isEditableElement = (element: Element | null): boolean =>
  element instanceof HTMLElement &&
  (element.matches("input, textarea, select") ||
    element.isContentEditable)

const updateKeyboardState = (): void => {
  isKeyboardActive.value = isEditableElement(document.activeElement)
}

const handleFocusOut = (): void => {
  window.requestAnimationFrame(updateKeyboardState)
}

const trackClick = (eventName: string, clickLocation: string): void => {
  nuxtApp.$analytics?.trackEvent?.(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}

onMounted(() => {
  document.addEventListener("focusin", updateKeyboardState)
  document.addEventListener("focusout", handleFocusOut)
})

onBeforeUnmount(() => {
  document.removeEventListener("focusin", updateKeyboardState)
  document.removeEventListener("focusout", handleFocusOut)
})
</script>

<style scoped>
.mobile-contact-bar {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: var(--z-floating);
  display: none;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 0.35rem;
  min-height: calc(
    var(--mobile-action-bar-height) + env(safe-area-inset-bottom, 0px)
  );
  padding-block-start: 0.4rem;
  padding-block-end: calc(0.4rem + env(safe-area-inset-bottom, 0px));
  padding-inline-start: max(0.5rem, env(safe-area-inset-right, 0px));
  padding-inline-end: max(0.5rem, env(safe-area-inset-left, 0px));
  border-top: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4px 18px rgba(38, 63, 62, 0.12);
  direction: rtl;
}

.mobile-contact-bar__action {
  min-width: 0;
  min-height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  padding-block: 0.25rem;
  padding-inline: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-soft);
  color: var(--color-primary-deep);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.mobile-contact-bar__action svg {
  width: 1.2rem;
  height: 1.2rem;
  flex: 0 0 auto;
}

.mobile-contact-bar__action--primary {
  border-color: var(--color-primary-deep);
  background: var(--gradient-primary);
  color: var(--color-on-primary);
}

.mobile-contact-bar__action--whatsapp {
  border-color: #178b49;
  background: #e6f5ec;
  color: #155d35;
}

.mobile-contact-bar__action:active {
  filter: brightness(0.96);
}

:global(html.mobile-menu-open .mobile-contact-bar) {
  display: none;
}

@media (max-width: 768px) {
  .mobile-contact-bar {
    display: grid;
  }
}

</style>
