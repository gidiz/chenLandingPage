<template>
  <div>
    <PageHero
      :eyebrow="category.eyebrow"
      :title="category.title"
      :subtitle="`<p>${category.description}</p><p>${category.intro}</p>`"
    />

    

   

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
            <p>{{ service.shortDescription }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
     <TreatmentVideoSection :category-slug="category.slug" />
     <section class="page-section">
      <div class="container page-grid">
        
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
  </div>
</template>

<script setup lang="ts">
import TreatmentVideoSection from './TreatmentVideoSection.vue'

const props = defineProps<{
  categorySlug: string;
}>();

const { getCategoryBySlug } = useTreatmentCatalog()
const category = getCategoryBySlug(props.categorySlug)

if (!category) {
  throw createError({
    statusCode: 404,
    statusMessage: "Treatment category not found",
  })
}

const route = useRoute()
const canonicalUrl = `https://drchenpardo.co.il${route.path}`

useSeoMeta({
  title: category.seoTitle,
  description: category.seoDescription,
  ogTitle: category.seoTitle,
  ogDescription: category.seoDescription,
  ogImage: 'https://drchenpardo.co.il/og-image.jpg',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: category.seoTitle,
  twitterDescription: category.seoDescription,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'category-schema',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: category.title,
        description: category.description,
        url: canonicalUrl,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://drchenpardo.co.il/#website',
        },
        about: {
          '@type': 'MedicalBusiness',
          '@id': 'https://drchenpardo.co.il/#business',
          name: 'ד"ר חן פרדו',
          url: 'https://drchenpardo.co.il',
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: category.services.length,
          itemListElement: category.services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'MedicalProcedure',
              name: service.title,
              description: service.shortDescription,
              url: `https://drchenpardo.co.il/${category.slug}/${service.slug}`,
            },
          })),
        },
      }),
    },
  ],
})
</script>
