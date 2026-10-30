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
  canonicalUrl,
})
</script>
