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
