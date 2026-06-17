<template>
  <aside class="page-card page-card--accent treatment-consultation-cta">
    <h2>פגישת ייעוץ אישית</h2>
    <p>
      לפני כל טיפול חשוב לבצע התאמה מדויקת לפי מבנה הפנים, מצב העור והמטרה
      שלך.
    </p>
    <NuxtLink to="/consultation" class="cta-button">
      {{ ctaLabel }}
    </NuxtLink>
  </aside>
</template>

<script setup>
defineProps({
  ctaLabel: {
    type: String,
    default: "לקביעת פגישת ייעוץ",
  },
});
</script>

<style scoped>
.treatment-consultation-cta {
  display: grid;
  align-content: start;
  gap: 1rem;
}

@media (max-width: 920px) {
  .treatment-consultation-cta {
    gap: 0.75rem;
  }
}
</style>
