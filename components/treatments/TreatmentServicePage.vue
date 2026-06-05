<template>
  <div>
    <TreatmentPageShell
      :eyebrow="category.title"
      :title="service.title"
      :short-title="service.shortTitle"
      :subtitle="service.description"
      :summary="service.summary"
      :suitability="service.suitability"
      :process="service.process"
      :expectations="service.expectations"
      :cta-label="service.ctaLabel"
      :questions="service.questions"
    />

    <section class="page-section page-section--soft">
      <div class="container">
        <h2 class="section-title">עוד טיפולים ב{{ category.shortTitle }}</h2>
        <div class="page-cards-grid">
          <NuxtLink
            v-for="relatedService in relatedServices"
            :key="relatedService.slug"
            :to="`/${category.slug}/${relatedService.slug}`"
            class="page-card page-card--link"
          >
            <h3>{{ relatedService.title }}</h3>
            <p>{{ relatedService.description }}</p>
          </NuxtLink>

          <NuxtLink
            :to="`/${category.slug}`"
            class="page-card page-card--link page-card--accent"
          >
            <h3>חזרה לעמוד הקטגוריה</h3>
            <p>
              לעמוד המרכזי של {{ category.title }} עם כל הטיפולים וההסבר הרחב על
              תחום הטיפול.
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categorySlug: string;
  serviceSlug: string;
}>();

const { getServiceBySlugs } = useTreatmentCatalog();
const result = getServiceBySlugs(props.categorySlug, props.serviceSlug);

if (!result) {
  throw createError({
    statusCode: 404,
    statusMessage: "Treatment service not found",
  });
}

const { category, service } = result;
const relatedServices = category.services.filter(
  (relatedService) => relatedService.slug !== service.slug,
);

useSeoMeta({
  title: service.seoTitle,
  description: service.seoDescription,
});
</script>
