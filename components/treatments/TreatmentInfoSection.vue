<template>
  <section class="page-section treatment-info-section">
    <div class="container page-grid treatment-info-section__grid">
      <article class="page-card treatment-info-section__main-card">
        <h2 class="section-title">מה חשוב לדעת לפני הטיפול</h2>
        <div class="rich-text" v-html="summary" />

        <ul class="info-list" aria-label="מידע לפני הטיפול">
          <li>
            <h3>התאמה רפואית</h3>
            <p class="info-list__lead">
              {{ suitabilityLead }}
            </p>
            <div class="rich-text" v-html="suitability" />
          </li>

          <li>
            <h3>מהלך הטיפול</h3>
            <p class="info-list__lead">
              {{ processLead }}
            </p>
            <div class="rich-text" v-html="process" />
          </li>

          <li>
            <h3>תוצאות צפויות ותיאום ציפיות</h3>
            <p class="info-list__lead">
              {{ expectationsLead }}
            </p>
            <div class="rich-text" v-html="expectations" />
          </li>
        </ul>
      </article>

      <slot name="cta" />
    </div>
  </section>
</template>

<script setup>
defineProps({
  summary: {
    type: String,
    required: true,
  },
  suitabilityLead: {
    type: String,
    default: "הערכת התאמה אישית לפי מצב רפואי, אזור הטיפול והמטרות שלך.",
  },
  suitability: {
    type: String,
    required: true,
  },
  processLead: {
    type: String,
    default: "שלבי הטיפול בקליניקה, משך המפגש והנחיות חשובות לפני ואחרי.",
  },
  process: {
    type: String,
    required: true,
  },
  expectationsLead: {
    type: String,
    default: "מתי רואים שינוי, כמה זמן נשמר האפקט ומה נחשב לתוצאה ריאלית.",
  },
  expectations: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
/* .treatment-info-section__grid {
  align-items: stretch;
} */

/* .treatment-info-section__main-card {
  height: 100%;
} */

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.info-list__lead {
  font-weight: 500;
}

.rich-text :deep(p) {
  margin: 0 0 0.75rem;
}

.rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-text :deep(ul) {
  margin: 0.5rem 0 0.75rem;
  padding-inline-start: 1.25rem;
}

.rich-text :deep(li + li) {
  margin-top: 0.45rem;
}

.rich-text :deep(strong) {
  font-weight: 700;
}
</style>
