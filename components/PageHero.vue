<template>
  <section class="page-hero">
    <div class="container page-hero__content">
      <p v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #f7f5f2, #efe7dd);
  padding: 4rem 1.5rem 3rem;
  text-align: center;
}

.page-hero__content {
  max-width: 900px;
  margin: 0 auto;
}

.page-hero__eyebrow {
  margin: 0 0 1rem;
  color: #5a7c7a;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.page-hero__subtitle {
  max-width: 760px;
  margin: 1rem auto 0;
  color: #4a4a4a;
  font-size: 1.125rem;
  line-height: 1.9;
}

@media (max-width: 768px) {
  .page-hero {
    padding-top: 3rem;
  }
}
</style>