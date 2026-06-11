<template>
  <TreatmentServicePage
    :category-slug="categorySlug"
    :service-slug="serviceSlug"
  />
</template>

<script setup lang="ts">
import TreatmentServicePage from '@/components/treatments/TreatmentServicePage.vue';

const route = useRoute();

const categorySlug = computed(() => {
  const param = route.params.category;
  return Array.isArray(param) ? (param[0] ?? "") : (param ?? "");
});

const serviceSlug = computed(() => {
  const param = route.params.service;
  return Array.isArray(param) ? (param[0] ?? "") : (param ?? "");
});
</script>