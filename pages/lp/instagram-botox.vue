<template>
  <div>
    <PageHero
      eyebrow="בוטוקס במראה טבעי"
      title="הגעת מאינסטגרם? בוטוקס במראה טבעי מתחיל באבחון נכון"
      subtitle="ד&quot;ר חן פרדו, רופאה בוגרת הטכניון, מתאימה כל טיפול למבנה הפנים ולהבעה הטבעית שלך. בלי מראה קפוא, בלי הבטחות מוגזמות."
    />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">מה חשוב לדעת לפני טיפול בוטוקס</h2>
          <ul class="feature-list">
            <li>הטיפול מרכך קמטי הבעה (מצח, בין הגבות, צידי העיניים) ושומר על תנועה טבעית</li>
            <li>כל טיפול מתחיל באבחון רפואי ובהסבר ברור על מה מתאים לך ומה לא</li>
            <li>חזרה מיידית לשגרה, והתוצאה מתייצבת בהדרגה תוך כשבועיים</li>
            <li>בפגישה נדבר גם על ציפיות, מגבלות ומצבים שבהם הטיפול אינו מתאים</li>
          </ul>
          <p class="lp-note">
            המידע באתר הוא כללי ואינו מחליף ייעוץ או בדיקה רפואית אישית.
            ההתאמה לטיפול נקבעת רק לאחר הערכה רפואית.
          </p>
        </article>

        <article class="page-card page-card--accent">
          <h2>פגישת ייעוץ אישית</h2>
          <p>
            השאירי פרטים ונחזור אלייך לתיאום פגישה בקליניקה בכפר סבא. בפגישה
            נבחן יחד מה מתאים לך, בגובה העיניים וללא התחייבות.
          </p>
          <NuxtLink
            to="/consultation"
            class="cta-button"
            @click="trackCtaClick"
          >
            לתיאום פגישת ייעוץ
          </NuxtLink>
        </article>
      </div>
    </section>

    <ContactSection />
  </div>
</template>

<script setup lang="ts">
const { $analytics } = useNuxtApp()

const trackCtaClick = (): void => {
  $analytics.trackEvent("cta_click", {
    click_location: "lp_instagram_botox_consultation",
    page_path: window.location.pathname,
  })
}

const seoDescription =
  "טיפול בוטוקס במראה טבעי בקליניקה של ד\"ר חן פרדו בכפר סבא. אבחון רפואי, התאמה אישית ותיאום פגישת ייעוץ."

// Campaign page: kept out of search results so it does not compete with /consultation.
useSeoMeta({
  title: "בוטוקס במראה טבעי בכפר סבא | ד\"ר חן פרדו",
  description: seoDescription,
  ogTitle: "בוטוקס במראה טבעי בכפר סבא | ד\"ר חן פרדו",
  ogDescription: seoDescription,
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogType: "website",
  robots: "noindex, follow",
})
</script>

<style scoped>
.lp-note {
  font-size: 0.95rem;
  color: #5f5f5f;
}
</style>
