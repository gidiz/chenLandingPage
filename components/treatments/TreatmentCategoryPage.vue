<template>
  <div>
    <PageHero
      :eyebrow="category.eyebrow"
      :title="category.title"
      :subtitle="category.description"
    />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">מה תמצאו בקטגוריה הזו</h2>
          <p>{{ category.intro }}</p>

          <div class="info-list">
            <div>
              <h3>למי זה מתאים</h3>
              <p>
                למי שמחפשת להבין אילו טיפולים שייכים לאותה משפחת פתרונות, להשוות
                ביניהם ולהגיע לייעוץ עם כוונה ברורה יותר.
              </p>
            </div>

            <div>
              <h3>איך נכון להשתמש בדף</h3>
              <p>
                התחילי מדף הקטגוריה, עברי לדף הטיפול הספציפי שמתאים למה שמטריד
                אותך, ואז תיאמי ייעוץ כדי לקבל התאמה רפואית אישית.
              </p>
            </div>

            <div>
              <h3>למה זה חשוב</h3>
              <p>
                מבנה היררכי כזה נותן גם למטופלות וגם לגוגל תמונה ברורה של תחום
                המומחיות והקשר בין הטיפולים.
              </p>
            </div>
          </div>
        </article>

        <aside class="page-card page-card--accent">
          <h2>פגישת ייעוץ אישית</h2>
          <p>
            כל טיפול בקטגוריה דורש התאמה לפי מצב העור, המבנה האנטומי, ההיסטוריה
            הרפואית והמטרה שאת רוצה להשיג.
          </p>
          <NuxtLink to="/consultation" class="cta-button">
            לקביעת פגישת ייעוץ
          </NuxtLink>
        </aside>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="container">
        <h2 class="section-title">תתי-הטיפולים בקטגוריה</h2>
        <div class="page-cards-grid">
          <NuxtLink
            v-for="service in category.services"
            :key="service.slug"
            :to="`/${category.slug}/${service.slug}`"
            class="page-card page-card--link"
          >
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categorySlug: string;
}>();

const { getCategoryBySlug } = useTreatmentCatalog();
const category = getCategoryBySlug(props.categorySlug);

if (!category) {
  throw createError({
    statusCode: 404,
    statusMessage: "Treatment category not found",
  });
}

useSeoMeta({
  title: category.seoTitle,
  description: category.seoDescription,
});
</script>
