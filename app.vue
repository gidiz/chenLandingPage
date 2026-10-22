<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { getMedicalBusinessSchema, getPersonSchema, getWebSiteSchema } from '~/composables/useSchemaOrg'

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'global-schema',
      innerHTML: JSON.stringify([
        getMedicalBusinessSchema(),
        getPersonSchema(),
        getWebSiteSchema(),
      ]),
    },
  ],
})
</script>
