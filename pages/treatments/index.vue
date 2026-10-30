<template>
  <div>
    <PageHero
      eyebrow="מפת טיפולים"
      title="קטגוריות הטיפול בקליניקה"
      subtitle="עמוד מרכזי שמרכז את כל תחומי הטיפול ומוביל לדפי קטגוריה ולדפי שירות מדויקים יותר."
    />

    

    <section class="page-section page-section--soft">
      <div class="container">
        <h2 class="section-title">כל הקטגוריות</h2>
        <div class="page-cards-grid">
          <NuxtLink
            v-for="category in treatmentCategories"
            :key="category.slug"
            :to="`/${category.slug}`"
            class="page-card page-card--link"
          >
            <h2>{{ category.title }}</h2>
            <p>{{ category.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
    <section class="page-section">
      <div class="container page-grid">
        

        <aside class="page-card page-card--accent">
          <h2>תיאום ייעוץ</h2>
          <p>
            אחרי מעבר על תחום הטיפול הרלוונטי ודף השירות המדויק, אפשר לעבור
            לפגישת ייעוץ אישית ולהתאים תוכנית טיפול מסודרת.
          </p>
          <NuxtLink to="/consultation" class="cta-button">
            לקביעת פגישת ייעוץ
          </NuxtLink>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { treatmentCategories } = useTreatmentCatalog();

useSeoMeta({
  title: 'מפת טיפולים אסתטיים ורפואיים | ד"ר חן פרדו',
  description:
    "עמוד מרכזי לכל קטגוריות הטיפול בקליניקה: הזרקות, הזעת יתר, מכשור טכנולוגי, איכות העור ועוד.",
  ogTitle: 'מפת טיפולים אסתטיים ורפואיים | ד"ר חן פרדו',
  ogDescription: "עמוד מרכזי לכל קטגוריות הטיפול האסתטי בקליניקת ד\"ר חן פרדו.",
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/treatments",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: 'מפת טיפולים אסתטיים ורפואיים | ד"ר חן פרדו',
  twitterDescription: "עמוד מרכזי לכל קטגוריות הטיפול האסתטי בקליניקת ד\"ר חן פרדו.",
  canonicalUrl: "https://drchenpardo.co.il/treatments",
})
</script>
