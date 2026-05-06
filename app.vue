<template>
  <div>
    <header class="main-header">
      <div class="container">
        <img src="/assets/logo.png" alt="Dr. Chen Pardo Logo" class="logo" />

        <button
          class="menu-toggle"
          @click="isOpen = !isOpen"
          aria-label="תפריט"
        >
          ☰
        </button>

        <nav class="nav-menu" :class="{ open: isOpen }">
          <a href="#about" @click="isOpen = false">אודות</a>
          <a href="#treatments" @click="isOpen = false">טיפולים</a>
          <a href="#contact" @click="isOpen = false">יצירת קשר</a>
        </nav>
      </div>
    </header>

    <div class="content">
      <section class="hero-section">
        <div class="hero-content">
          <h1>ד"ר חן פרדו</h1>
          <p class="subtitle">
            קליניקה לאסתטיקה רפואית וטיפולים כנגד הזעת יתר בכל הגוף
          </p>
        </div>
      </section>

      <section id="about" class="about-section">
        <div class="container">
          <div class="about-content">
            <div class="about-text">
              <h2 class="section-title">אודות</h2>
              <p>
                נעים מאוד, שמי ד"ר חן פרדו, בוגרת לימודי רפואה בטכניון
                שבחיפה.<br />
                לאחר מספר שנים של התמחות בכירורגיה כללית בבי"ח במרכז הארץ, פתחתי
                בעיר ילדותי את הקליניקה שלי המתמחה בטיפולים אסתטיים בדגש על מראה
                טבעי ובטיפולים כנגד הזעת יתר בכל הגוף.<br /><br />
                ה"אני המאמין" שלי תומך בשמירה על מראה טבעי, כזה שמדגיש את היופי
                של כל אחד מאיתנו, מבלי לייצר מראה מזויף.<br />
                בקליניקה שלי אני מציעה כנות, אמינות, שירות מקצועי, הסבר בגובה
                העיניים והכל עם חיוך על הפנים. כמובן שכל זאת תוך כדי שימוש
                בחומרי גלם איכותיים המשלימים את התמונה למלאה.<br /><br />
                בקליניקה תוכלו גם למצוא טיפולים כנגד הזעה בכל הגוף, לרבות בית
                שחי, פנים, מפשעות, כפות ידיים ועוד...<br />
                מוזמנים להגיע לפגישת ייעוץ עמי.
              </p>
            </div>
            <div class="about-image">
              <img src="/assets/about-doctor.jpeg" />
            </div>
          </div>
        </div>
      </section>
      <section id="treatments" class="treatments-section">
        <div class="container">
          <h2 class="section-title">סוגי טיפולים בקליניקה</h2>
          <ul class="treatment-list">
            <li>טיפול בבוטוקס full face וצוואר</li>
            <li>טיפול בחיוך חושף שיניים ובנעילת לסתות</li>
            <li>טיפול בפציאליס (שיתוק עצב הפנים)</li>
            <li>טיפול בהזעת יתר בכל הגוף</li>
            <li>פיסול ועיצוב פנים מלא בדגש על מראה טבעי</li>
            <li>ביוסטימולטורים(רדיאס, סקולפטרה, הרמוניקה ועוד)</li>
            <li>מכשור רפואי מתקדם לפנים ולגוף</li>
            <li>מורפאוס – טיפול מחליף ניתוח להרמת פנים</li>
            <li>טיפולי פיגמנטציה</li>
            <li>טיפול בבוטוקס למיגרנה</li>
            <li>טיפול להזעה בבית השחי, כפות ידיים, פנים ועוד</li>
            <li>טיפול להזעה באיזורים אינטימיים</li>
            <li>טיפול באקסוזומים</li>
            <li>טיפולי מרקם עור מתקדמים</li>
            <li>בדיקה 333</li>
          </ul>

          <div class="cta">
            <a
              href="#contact"
              class="cta-button"
              @click="trackClick('cta_click', 'hero_consultation_button')"
              >לתיאום פגישת ייעוץ</a
            >
          </div>
        </div>
      </section>
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

          <!-- Alert Message -->
          <div id="form-alert" :class="['form-alert', alertState]">
            {{ alertMessage }}
          </div>

          <p class="footer-address">📍 התע"ש 20, כפר סבא</p>
          <p class="footer-phone">
            📞
            <a
              href="tel:0547577214"
              @click="trackClick('phone_click', 'footer_phone')"
              >054-757-7214</a
            >
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

      <!-- כפתור WhatsApp צף -->
      <a
        class="whatsapp-float"
        href="https://wa.me/972547577214"
        target="_blank"
        aria-label="WhatsApp"
        @click="trackClick('whatsapp_click', 'floating_whatsapp')"
      >
      </a>
    </div>
  </div>
</template>

<style scoped></style>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
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
