<template>
  <div>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-MMZ89TFS"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->

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
          </ul>

          <div class="cta">
            <a href="#contact" class="cta-button">לתיאום פגישת ייעוץ</a>
          </div>
        </div>
      </section>
      <footer id="contact" class="contact-footer">
        <div class="container">
          <h3 class="footer-title">יצירת קשר</h3>

          <form id="contact-form">
            <input type="text" name="name" placeholder="שם מלא" required />
            <input type="email" name="email" placeholder="אימייל" required />
            <input type="tel" name="phone" placeholder="טלפון" required />
            <textarea name="message" placeholder="הודעה" required></textarea>
            <button type="submit">שלח</button>
          </form>

          <!-- Alert Message -->
          <div id="form-alert" class="form-alert hidden"></div>

          <p class="footer-address">📍 התע"ש 20, כפר סבא</p>
          <p class="footer-phone">
            📞 <a href="tel:0547577214">054-757-7214</a>
          </p>

          <div class="social-icons">
            <a
              class="icon instagram"
              href="https://www.instagram.com/dr_chen_pardo/"
              target="_blank"
              aria-label="Instagram"
            ></a>
            <a
              class="icon facebook"
              href="https://www.facebook.com/profile.php?id=61577031445942"
              target="_blank"
              aria-label="Facebook"
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
      >
      </a>
    </div>
  </div>
</template>

<style scoped>
/* הכנס כאן את הסגנון מ־index.css */
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useHead } from "#imports"; // חשוב כדי ש-useHead יעבוד

// ✅ הוספת Google Tag Manager ל-head
useHead({
  script: [
    {
      hid: "gtm",
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-MMZ89TFS');`,
      type: "text/javascript",
    },
  ],
  __dangerouslyDisableSanitizersByTagID: {
    gtm: ["innerHTML"],
  },
});

const isOpen = ref(false);

onMounted(() => {
  const form = document.getElementById("contact-form");
  const alertBox = document.getElementById("form-alert");

  if (form && alertBox) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      };

      try {
        const response = await fetch(
          "https://vxu8elp5u8.execute-api.us-east-1.amazonaws.com/v1/sendContactEmail",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (response.ok) {
          alertBox.className = "form-alert success";
          alertBox.textContent = "הטופס נשלח בהצלחה!";
          form.reset();
        } else {
          alertBox.className = "form-alert error";
          alertBox.textContent = result.error || "אירעה שגיאה בשליחה.";
        }
      } catch (error) {
        alertBox.className = "form-alert error";
        alertBox.textContent = "שגיאה כללית, נסה שוב.";
      }

      setTimeout(() => {
        alertBox.className = "form-alert hidden";
      }, 5000);
    });
  }
});
</script>
