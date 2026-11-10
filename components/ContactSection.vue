<template>
  <div>
    <footer id="contact" class="contact-footer" v-reveal>
      <div class="container">
        <h3 class="footer-title">יצירת קשר</h3>

        <form
          id="contact-form"
          ref="contactForm"
          :aria-busy="isSubmitting"
          @submit.prevent="handleSubmit"
        >
          <input type="text" name="name" placeholder="שם מלא" aria-label="שם מלא" maxlength="100" required />
          <input type="email" name="email" placeholder="אימייל" aria-label="אימייל" maxlength="254" required />
          <input type="tel" name="phone" placeholder="טלפון" aria-label="טלפון" maxlength="32" required />
          <textarea name="message" placeholder="הודעה" aria-label="הודעה" maxlength="2000" required></textarea>
          <button type="submit" :disabled="isSubmitting || isRetryBlocked">
            {{ isSubmitting ? "שולח..." : isRetryBlocked ? "נא להמתין" : "שלח" }}
          </button>
        </form>

        <div
          id="form-alert"
          :class="['form-alert', alertState]"
          :role="alertState === 'error' ? 'alert' : 'status'"
          :aria-live="alertState === 'error' ? 'assertive' : 'polite'"
          aria-atomic="true"
        >
          {{ alertMessage }}
        </div>

        <p class="footer-address">📍 התע"ש 20, כפר סבא</p>
        <p class="footer-phone">
          📞
          <a
            href="tel:0547577214"
            @click="trackClick('phone_click', 'footer_phone')"
          >
            054-757-7214
          </a>
        </p>

      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"

const contactForm = ref<HTMLFormElement | null>(null)
const alertState = ref<"hidden" | "success" | "error">("hidden")
const alertMessage = ref("")
const isSubmitting = ref(false)
const isRetryBlocked = ref(false)
let retryTimeout: ReturnType<typeof setTimeout> | null = null
const nuxtApp = useNuxtApp() as {
  $analytics?: {
    trackEvent?: (eventName: string, payload: Record<string, unknown>) => void
  }
}

const showAlert = (state: "success" | "error", message: string): void => {
  alertState.value = state
  alertMessage.value = message
}

onBeforeUnmount(() => {
  if (retryTimeout !== null) {
    clearTimeout(retryTimeout)
  }
})

const trackClick = (eventName: string, clickLocation: string): void => {
  nuxtApp.$analytics?.trackEvent?.(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}

const handleSubmit = async (): Promise<void> => {
  if (!contactForm.value || isSubmitting.value || isRetryBlocked.value) {
    return
  }

  isSubmitting.value = true
  alertState.value = "hidden"
  alertMessage.value = ""
  const formData = new FormData(contactForm.value)

  const data = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result: {
        success: boolean
        delivery: { lambda: boolean; make: boolean }
      } = await response.json()
      if (
        result?.success !== true ||
        typeof result.delivery?.lambda !== "boolean" ||
        typeof result.delivery?.make !== "boolean" ||
        (!result.delivery.lambda && !result.delivery.make)
      ) {
        showAlert("error", "לא התקבל אישור לשליחת הטופס. נא לנסות שוב מאוחר יותר.")
        return
      }
      showAlert("success", "הטופס נשלח בהצלחה!")
      contactForm.value.reset()
      nuxtApp.$analytics?.trackEvent?.("contact_form_submit", {
        form_id: "contact-form",
        form_location: "footer_contact_section",
        transport_lambda: result.delivery.lambda,
        transport_make: result.delivery.make,
      })
    } else {
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"))
        if (Number.isSafeInteger(retryAfter) && retryAfter > 0 && retryAfter <= 2147483) {
          isRetryBlocked.value = true
          retryTimeout = setTimeout(() => {
            isRetryBlocked.value = false
            retryTimeout = null
          }, retryAfter * 1000)
        }
      }
      showAlert("error", response.status === 429
        ? "נשלחו יותר מדי פניות. נא להמתין ולנסות שוב."
        : "אירעה שגיאה בשליחה. נא לנסות שוב מאוחר יותר.")
    }
  } catch {
    showAlert("error", "שגיאה כללית, נסה שוב.")
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-footer {
  background: linear-gradient(145deg, var(--color-surface-warm), var(--color-accent-tint));
  padding: 2rem 1rem;
  text-align: center;
  direction: rtl;
}

.contact-footer .container {
  max-width: 800px;
}

.footer-title {
  font-size: 1.8rem;
  color: var(--color-primary-deep);
  margin-bottom: 1rem;
}

.footer-address,
.footer-phone {
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 0.3rem 0;
}

.footer-phone a {
  color: inherit;
  text-decoration: none;
  font-weight: bold;
}

#contact-form {
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
}

#contact-form input,
#contact-form textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

#contact-form input:focus,
#contact-form textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(90, 124, 122, 0.15);
}

#contact-form input::placeholder,
#contact-form textarea::placeholder {
  color: var(--color-text-soft);
}

#contact-form input[type="tel" i] {
  direction: rtl;
}

#contact-form textarea {
  resize: vertical;
  min-height: 80px;
}

#contact-form button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s ease;
}

#contact-form button:hover {
  background: var(--gradient-primary-hover);
}

#contact-form button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.form-alert {
  max-width: 500px;
  margin: 1.5rem auto 0;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  text-align: center;
  transition: opacity 0.3s ease;
  direction: rtl;
}

.form-alert.success {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
  border: 1px solid var(--color-success-border);
}

.form-alert.error {
  background-color: var(--color-error-bg);
  color: var(--color-error-text);
  border: 1px solid var(--color-error-border);
}

.hidden {
  display: none;
}

</style>
