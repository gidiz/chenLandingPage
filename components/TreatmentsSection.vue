<template>
  <section id="treatments" class="treatments-section" v-reveal>
    <div class="container">
      <h2 class="section-title">השירותים שלנו</h2>
      <div class="treatment-category-grid reveal--stagger" v-reveal>
        <NuxtLink
          v-for="category in treatmentCategories"
          :key="category.slug"
          :to="`/${category.slug}`"
          class="page-card page-card--link treatment-category-card"
        >
          <h3>{{ category.title }}</h3>
          <p>{{ category.description }}</p>
        </NuxtLink>
      </div>

      <div class="cta">
        <NuxtLink
          to="/treatments"
          class="cta-button"
          @click="trackClick('cta_click', 'treatments_catalog_button')"
        >
          לכל תחומי הטיפול
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const { treatmentCategories } = useTreatmentCatalog();
const { $analytics } = useNuxtApp();

const trackClick = (eventName, clickLocation) => {
  $analytics.trackEvent(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  });
};
</script>

<style scoped>
.treatments-section {
  background: var(--gradient-soft-vertical);
  padding: var(--space-section) 1.5rem;
  direction: rtl;
  text-align: right;
}

.treatments-section .container {
  max-width: 1000px;
}

.treatment-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.treatment-category-card h3 {
  margin-top: 0;
}

.treatment-category-card {
  min-height: 100%;
}

.cta {
  text-align: center;
  margin-top: 2rem;
}
</style>
