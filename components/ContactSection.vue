<template>
  <div>
    <footer id="contact" class="contact-footer" v-reveal>
      <div class="container">
        <h2 class="footer-title">יצירת קשר</h2>
        <div class="contact-footer__methods" aria-label="פרטי קשר">
          <a
            href="tel:0547577214"
          >
            <span aria-hidden="true">📞</span>
            <bdi dir="ltr">054-757-7214</bdi>
          </a>
          <a
            href="https://wa.me/972547577214"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>WhatsApp</span>
          </a>
        </div>

        <form
          id="contact-form"
          ref="contactForm"
          :aria-busy="isSubmitting"
          @submit.prevent="handleSubmit"
        >
          <label class="contact-form__field" for="contact-name">
            <span>
              שם מלא
              <span class="contact-form__required" aria-hidden="true">*</span>
              <span class="contact-form__visually-hidden">שדה חובה</span>
            </span>
            <input id="contact-name" type="text" name="name" placeholder="שם מלא" maxlength="100" required />
          </label>
          <label class="contact-form__field" for="contact-email">
            <span>
              אימייל
              <span class="contact-form__required" aria-hidden="true">*</span>
              <span class="contact-form__visually-hidden">שדה חובה</span>
            </span>
            <input id="contact-email" type="email" name="email" placeholder="אימייל" maxlength="254" required />
          </label>
          <label class="contact-form__field" for="contact-phone">
            <span>
              טלפון
              <span class="contact-form__required" aria-hidden="true">*</span>
              <span class="contact-form__visually-hidden">שדה חובה</span>
            </span>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              placeholder="טלפון"
              dir="ltr"
              maxlength="32"
              required
            />
          </label>
          <label class="contact-form__field" for="contact-message">
            <span>
              הודעה
              <span class="contact-form__required" aria-hidden="true">*</span>
              <span class="contact-form__visually-hidden">שדה חובה</span>
            </span>
            <textarea id="contact-message" name="message" placeholder="הודעה" maxlength="2000" required></textarea>
          </label>
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
            <bdi dir="ltr">054-757-7214</bdi>
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

.contact-footer__methods {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 0.75rem;
}

.contact-footer__methods a {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding-block: 0.45rem;
  padding-inline: 0.8rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  color: var(--color-primary-deep);
  text-decoration: none;
  font-weight: 700;
}

.contact-footer__methods a:hover {
  background: var(--color-surface);
}

#contact-form {
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
}

#contact-form .contact-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: start;
}

#contact-form .contact-form__required {
  color: var(--color-error-text);
  font-weight: 700;
}

#contact-form .contact-form__visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  box-shadow: 0 0 0 3px rgba(90, 124, 122, 0.15);
}

#contact-form input:focus-visible,
#contact-form textarea:focus-visible {
  outline: 3px solid var(--color-primary-dark);
  outline-offset: 2px;
  box-shadow: none;
}

#contact-form input::placeholder,
#contact-form textarea::placeholder {
  color: var(--color-text-soft);
}

#contact-form input[type="tel" i] {
  direction: ltr;
  text-align: start;
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
