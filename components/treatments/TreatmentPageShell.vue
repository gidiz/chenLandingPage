<template>
  <div>
    <PageHero :eyebrow="eyebrow" :title="title" :subtitle="subtitle" />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">מה חשוב לדעת לפני הטיפול</h2>
          <p>{{ summary }}</p>

          <div class="info-list">
            <div>
              <h3>למי זה מתאים</h3>
              <p>{{ suitability }}</p>
            </div>

            <div>
              <h3>איך נראה התהליך</h3>
              <p>{{ process }}</p>
            </div>

            <div>
              <h3>תוצאות וציפיות</h3>
              <p>{{ expectations }}</p>
            </div>
          </div>
        </article>

        <aside class="page-card page-card--accent">
          <h2>פגישת ייעוץ אישית</h2>
          <p>
            לפני כל טיפול חשוב לבצע התאמה מדויקת לפי מבנה הפנים, מצב העור והמטרה
            שלך.
          </p>
          <NuxtLink to="/consultation" class="cta-button">
            {{ ctaLabel }}
          </NuxtLink>
        </aside>
      </div>
    </section>

    <section class="page-section page-section--soft">
      <div class="container faq-preview">
        <h2 class="section-title">שאלות נפוצות סביב {{ shortTitle }}</h2>
        <div class="faq-preview__items">
          <article
            v-for="question in questions"
            :key="question.title"
            class="page-card"
          >
            <h3>{{ question.title }}</h3>
            <p>{{ question.answer }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: "טיפולים בקליניקה",
  },
  title: {
    type: String,
    required: true,
  },
  shortTitle: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  suitability: {
    type: String,
    required: true,
  },
  process: {
    type: String,
    required: true,
  },
  expectations: {
    type: String,
    required: true,
  },
  ctaLabel: {
    type: String,
    default: "לקביעת פגישת ייעוץ",
  },
  questions: {
    type: Array,
    required: true,
  },
});
</script>
