<template>
  <div>
    <footer id="contact" class="contact-footer">
      <div class="container">
        <h3 class="footer-title">יצירת קשר</h3>

        <form
          id="contact-form"
          ref="contactForm"
          @submit.prevent="handleSubmit"
        >
          <input type="text" name="name" placeholder="שם מלא" required />
          <input type="email" name="email" placeholder="אימייל" required />
          <input type="tel" name="phone" placeholder="טלפון" required />
          <textarea name="message" placeholder="הודעה" required></textarea>
          <button type="submit">שלח</button>
        </form>

        <div id="form-alert" :class="['form-alert', alertState]">
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

        <div class="social-icons">
          <a
            class="icon instagram"
            href="https://www.instagram.com/dr_chen_pardo/"
            target="_blank"
            aria-label="Instagram"
            @click="trackClick('instagram_click', 'footer_instagram')"
          ></a>
          <a
            class="icon facebook"
            href="https://www.facebook.com/profile.php?id=61577031445942"
            target="_blank"
            aria-label="Facebook"
            @click="trackClick('facebook_click', 'footer_facebook')"
          ></a>
        </div>
      </div>
    </footer>

    <a
      class="whatsapp-float"
      href="https://wa.me/972547577214"
      target="_blank"
      aria-label="WhatsApp"
      @click="trackClick('whatsapp_click', 'floating_whatsapp')"
    >
    </a>
  </div>
</template>

<script setup>
import { ref } from "vue";

const contactForm = ref(null);
const alertState = ref("hidden");
const alertMessage = ref("");
const { $analytics } = useNuxtApp();

const showAlert = (state, message) => {
  alertState.value = state;
  alertMessage.value = message;

  window.setTimeout(() => {
    alertState.value = "hidden";
    alertMessage.value = "";
  }, 5000);
};

const trackClick = (eventName, clickLocation) => {
  $analytics.trackEvent(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  });
};

const handleSubmit = async () => {
  if (!contactForm.value) {
    return;
  }

  const formData = new FormData(contactForm.value);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  };

  try {
    const [lambdaRes, makeRes] = await Promise.allSettled([
      fetch(
        "https://vxu8elp5u8.execute-api.us-east-1.amazonaws.com/v1/sendContactEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      ),
      fetch("https://hook.eu1.make.com/2754n2mdnhkuwadra1tp8m7pkr4f3el6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    ]);

    const lambdaSuccess =
      lambdaRes.status === "fulfilled" && lambdaRes.value.ok;
    const makeSuccess = makeRes.status === "fulfilled" && makeRes.value.ok;

    if (lambdaSuccess || makeSuccess) {
      showAlert("success", "הטופס נשלח בהצלחה!");
      contactForm.value.reset();
      $analytics.trackEvent("contact_form_submit", {
        form_id: "contact-form",
        form_location: "footer_contact_section",
        transport_lambda: lambdaSuccess,
        transport_make: makeSuccess,
      });

      if (!lambdaSuccess) {
        console.warn("שגיאה בשליחת מייל (Lambda):", lambdaRes);
      }
      if (!makeSuccess) {
        console.warn("שגיאה בשליחה ל־Make Webhook:", makeRes);
      }
    } else {
      showAlert("error", "אירעה שגיאה בשליחה.");
      console.error("שתי השליחות נכשלו:", { lambdaRes, makeRes });
    }
  } catch (error) {
    showAlert("error", "שגיאה כללית, נסה שוב.");
    console.error("שגיאה כללית:", error);
  }
};
</script>

<style scoped>
.contact-footer {
  background-color: #f0ece6;
  padding: 2rem 1rem;
  text-align: center;
  direction: rtl;
}

.contact-footer .container {
  max-width: 800px;
}

.footer-title {
  font-size: 1.8rem;
  color: #5a7c7a;
  margin-bottom: 1rem;
}

.footer-address,
.footer-phone {
  font-size: 1.1rem;
  color: #333;
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
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
}

#contact-form input[type="tel" i] {
  direction: rtl;
}

#contact-form textarea {
  resize: vertical;
  min-height: 80px;
}

#contact-form button {
  background-color: #a9c4c0;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s ease;
}

#contact-form button:hover {
  background-color: #5a7c7a;
}

.social-icons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.icon {
  width: 32px;
  height: 32px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: cover;
}

.icon.instagram {
  background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 2C4.298 2 2 4.298 2 7.75v8.5C2 19.702 4.298 22 7.75 22h8.5c3.452 0 5.75-2.298 5.75-5.75v-8.5C22 4.298 19.702 2 16.25 2h-8.5zM4 7.75C4 5.679 5.679 4 7.75 4h8.5C18.321 4 20 5.679 20 7.75v8.5C20 18.321 18.321 20 16.25 20h-8.5C5.679 20 4 18.321 4 16.25v-8.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-2a1 1 0 100 2 1 1 0 000-2z"/></svg>');
  color: #e1306c;
}

.icon.facebook {
  background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.5c0-2.4 1.43-3.8 3.63-3.8 1.05 0 2.15.2 2.15.2v2.36h-1.21c-1.2 0-1.58.74-1.58 1.5V12H18l-.4 3h-2.8v7A10 10 0 0022 12z"/></svg>');
  color: #3b5998;
}

.form-alert {
  max-width: 500px;
  margin: 1.5rem auto 0;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  text-align: center;
  transition: opacity 0.3s ease;
  direction: rtl;
}

.form-alert.success {
  background-color: #d6efed;
  color: #2f4f4e;
  border: 1px solid #a9c4c0;
}

.form-alert.error {
  background-color: #ffe0e0;
  color: #722e2e;
  border: 1px solid #ddaaaa;
}

.hidden {
  display: none;
}

.whatsapp-float {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 55px;
  height: 55px;
  background-color: #25d366;
  border-radius: 50%;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.002 2.004c-7.732 0-14 6.27-14 14 0 2.469.648 4.826 1.882 6.92l-1.998 7.07 7.257-1.9c1.978 1.08 4.21 1.646 6.86 1.646 7.732 0 14-6.27 14-14s-6.27-14-14-14zm0 2c6.627 0 12 5.373 12 12 0 6.627-5.373 12-12 12-2.32 0-4.375-.598-6.215-1.754l-.43-.258-4.3 1.124 1.172-4.148-.28-.442C4.676 20.88 4 18.493 4 16.004c0-6.627 5.373-12 12-12zm-3.414 6.828l-1.172.078c-.324.01-.633.148-.863.387-.227.24-.352.558-.352.887 0 .305-.016.621-.043.95-.082.988.176 2.145.823 3.362.648 1.215 1.625 2.406 2.922 3.57 1.3 1.164 2.555 1.793 3.766 1.883.32.02.637-.09.875-.305.238-.219.375-.523.387-.844l.07-1.164c.02-.32-.09-.637-.305-.875l-1.074-1.07c-.289-.293-.672-.441-1.063-.414-.289.016-.57.109-.816.27l-.86.554a8.345 8.345 0 01-2.118-2.34c-.324-.52-.484-.96-.48-1.324.008-.34.125-.66.344-.918l.738-.89c.238-.285.355-.648.324-1.016-.027-.39-.191-.754-.488-1.028l-1.062-1.078c-.23-.238-.543-.371-.867-.387z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 60%;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
</style>
