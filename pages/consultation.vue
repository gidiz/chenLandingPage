<template>
  <div>
    <PageHero
      eyebrow="פגישת ייעוץ"
      title="בואי נבנה יחד את הטיפול המתאים"
      subtitle="עמוד ייעודי ללידים עם מסר ברור, טופס קצר וקריאה לפעולה אחת."
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
            הדף הזה נועד לקמפיינים ולתנועה ממוקדת, ולכן הוא שומר על מסלול קצר
            וברור עד להשארת ליד.
          </p>
        </article>
      </div>
    </section>

    <ContactSection />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  description:
    "עמוד ייעוץ ייעודי ללידים מקמפיינים ולפניות ישירות לקליניקה.",
  ogTitle: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  ogDescription: "עמוד ייעוץ ייעודי ללידים מקמפיינים. קבעו פגישת ייעוץ עם ד\"ר חן פרדו בכפר סבא.",
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/consultation",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  twitterDescription: "עמוד ייעוץ ייעודי ללידים מקמפיינים. קבעו פגישת ייעוץ עם ד\"ר חן פרדו בכפר סבא.",
  canonicalUrl: "https://drchenpardo.co.il/consultation",
})
</script>