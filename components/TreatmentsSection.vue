<template>
  <section id="treatments" class="treatments-section">
    <div class="container">
      <h2 class="section-title">השירותים שלנו</h2>
      <div class="treatment-category-grid">
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
