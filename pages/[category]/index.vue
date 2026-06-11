<template>
  <TreatmentCategoryPage :category-slug="categorySlug" />
</template>

<script setup lang="ts">
import TreatmentCategoryPage from '@/components/treatments/TreatmentCategoryPage.vue';

const route = useRoute();

const categorySlug = computed(() => {
  const param = route.params.category;
  return Array.isArray(param) ? (param[0] ?? "") : (param ?? "");
});
</script>