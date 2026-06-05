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

<script setup>
useSeoMeta({
  title: "קביעת פגישת ייעוץ | ד\"ר חן פרדו",
  description:
    "עמוד ייעוץ ייעודי ללידים מקמפיינים ולפניות ישירות לקליניקה.",
});
</script>