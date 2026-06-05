<template>
  <div>
    <PageHero
      eyebrow="מפת טיפולים"
      title="קטגוריות הטיפול בקליניקה"
      subtitle="עמוד מרכזי שמרכז את כל תחומי הטיפול ומוביל לדפי קטגוריה ולדפי שירות מדויקים יותר."
    />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">למה המבנה החדש חשוב</h2>
          <p>
            במקום רשימה שטוחה של טיפולים בודדים, האתר בנוי עכשיו כעץ תוכן: דפי
            קטגוריה רחבים ודפי שירות ממוקדים. זה מחזק גם את ה-SEO וגם את היכולת
            של מטופלות להגיע בדיוק למה שהן מחפשות.
          </p>
          <div class="info-list">
            <div>
              <h3>ניווט ברור יותר</h3>
              <p>
                כל תחום טיפול מרוכז תחת קטגוריה אחת עם תתי-טיפולים רלוונטיים.
              </p>
            </div>
            <div>
              <h3>קישורים פנימיים חזקים יותר</h3>
              <p>
                דפי הקטגוריה מובילים לדפי השירות, והם חוזרים חזרה למבנה ההיררכי.
              </p>
            </div>
            <div>
              <h3>הזעת יתר כתחום ליבה</h3>
              <p>
                נבנה כעמוד מרכזי עצמאי עם תתי-דפים, בהתאם לפוטנציאל החיפוש הגבוה
                שלו.
              </p>
            </div>
          </div>
        </article>

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
  </div>
</template>

<script setup>
const { treatmentCategories } = useTreatmentCatalog();

useSeoMeta({
  title: 'מפת טיפולים אסתטיים ורפואיים | ד"ר חן פרדו',
  description:
    "עמוד מרכזי לכל קטגוריות הטיפול בקליניקה: הזרקות, הזעת יתר, מכשור טכנולוגי, איכות העור ועוד.",
});
</script>
