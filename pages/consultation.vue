<template>
  <div>
    <PageHero
      eyebrow="פגישת ייעוץ"
      title="בואי נבנה יחד את הטיפול המתאים"
      subtitle="פגישת ייעוץ אישית עם ד&quot;ר חן פרדו בכפר סבא: אבחון, הסבר בגובה העיניים והתאמה של תוכנית טיפול שמתאימה לך."
    />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">מה מקבלים בפגישת הייעוץ</h2>
          <ul class="feature-list">
            <li>אבחון ראשוני והבנת המטרה האסתטית או הרפואית</li>
            <li>הסבר ברור על אפשרויות טיפול והתאמה אישית</li>
            <li>ציפיות ריאליות, תהליך החלמה ותכנון המשך</li>
          </ul>
        </article>

        <article class="page-card page-card--accent">
          <h2>השאירי פרטים ונחזור אלייך</h2>
          <p>
            ממלאים את הטופס הקצר למטה, ואנחנו חוזרים אלייך לתיאום מועד נוח
            לפגישה בקליניקה. אפשר גם להתקשר ישירות או לכתוב לנו בוואטסאפ.
          </p>
          <p class="consultation-note">
            המידע באתר הוא כללי ואינו מחליף ייעוץ או בדיקה רפואית אישית.
            ההתאמה לטיפול נקבעת רק לאחר הערכה רפואית בפגישה.
          </p>
        </article>
      </div>
    </section>

    <ContactSection />
  </div>
</template>

<script setup lang="ts">
const seoDescription =
  "קביעת פגישת ייעוץ אישית עם ד\"ר חן פרדו בכפר סבא: אבחון רפואי, הסבר על אפשרויות הטיפול והתאמה אישית של תוכנית טיפול."

useSeoMeta({
  title: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  description: seoDescription,
  ogTitle: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  ogDescription: seoDescription,
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/consultation",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  twitterDescription: seoDescription,
})
</script>

<style scoped>
.consultation-note {
  font-size: 0.95rem;
  color: #5f5f5f;
}
</style>