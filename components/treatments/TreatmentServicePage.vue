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

    <TreatmentVideoSection :category-slug="category.slug" :service-slug="service.slug" />

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
            <p>{{ relatedService.shortDescription }}</p>
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
import TreatmentPageShell from './TreatmentPageShell.vue'
import TreatmentVideoSection from './TreatmentVideoSection.vue'

const props = defineProps<{
  categorySlug: string;
  serviceSlug: string;
}>();

const { getServiceBySlugs } = useTreatmentCatalog()
const result = getServiceBySlugs(props.categorySlug, props.serviceSlug)

if (!result) {
  throw createError({
    statusCode: 404,
    statusMessage: "Treatment service not found",
  })
}

const { category, service } = result
const relatedServices = category.services.filter(
  (relatedService) => relatedService.slug !== service.slug,
)

const route = useRoute()
const canonicalUrl = `https://drchenpardo.co.il${route.path}`

useSeoMeta({
  title: service.seoTitle,
  description: service.seoDescription,
  ogTitle: service.seoTitle,
  ogDescription: service.seoDescription,
  ogImage: 'https://drchenpardo.co.il/og-image.jpg',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: service.seoTitle,
  twitterDescription: service.seoDescription,
  canonicalUrl,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'service-schema',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalProcedure',
        name: service.seoTitle,
        description: service.seoDescription,
        url: canonicalUrl,
        provider: {
          '@type': 'MedicalBusiness',
          '@id': 'https://drchenpardo.co.il/#business',
          name: 'ד"ר חן פרדו',
          url: 'https://drchenpardo.co.il',
        },
      }),
    },
  ],
})
</script>
