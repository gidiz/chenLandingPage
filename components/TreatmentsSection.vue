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

<script setup lang="ts">
const { treatmentCategories } = useTreatmentCatalog()
const nuxtApp = useNuxtApp() as {
  $analytics: {
    trackEvent: (eventName: string, payload: Record<string, unknown>) => void
  }
}

const trackClick = (eventName: string, clickLocation: string): void => {
  nuxtApp.$analytics.trackEvent(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}
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
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.treatment-category-card h3 {
  margin-top: 0;
  overflow-wrap: anywhere;
}

.treatment-category-card {
  min-width: 0;
}

.treatment-category-card p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.treatment-category-card:focus-visible p,
.treatment-category-card:hover p {
  display: block;
  overflow: visible;
  -webkit-line-clamp: unset;
}

.cta {
  text-align: center;
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .treatment-category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .treatment-category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 359px) {
  .treatment-category-card p {
    display: block;
    overflow: visible;
    -webkit-line-clamp: unset;
  }
}
</style>
