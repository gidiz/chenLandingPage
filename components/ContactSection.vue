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

      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { createConsola } from "consola";

const contactForm = ref(null);
const alertState = ref("hidden");
const alertMessage = ref("");
const { $analytics } = useNuxtApp();
const consola = createConsola({ tag: "chen-contact" });

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
        consola.warn("contact_lambda_failed", lambdaRes);
      }
      if (!makeSuccess) {
        consola.warn("contact_make_failed", makeRes);
      }
    } else {
      showAlert("error", "אירעה שגיאה בשליחה.");
      consola.error("contact_both_failed", { lambdaRes, makeRes });
    }
  } catch (error) {
    showAlert("error", "שגיאה כללית, נסה שוב.");
    consola.error("contact_submit_error", error);
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

</style>
