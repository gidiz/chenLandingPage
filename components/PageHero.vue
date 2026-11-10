<template>
  <section class="page-hero">
    <div class="container page-hero__content" v-reveal>
      <p v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <div v-if="subtitle" class="page-hero__subtitle" v-html="subtitle" />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    subtitle?: string
  }>(),
  {
    eyebrow: "",
    subtitle: "",
  },
)
</script>

<style scoped>
.page-hero {
  position: relative;
  overflow: hidden;
  background: var(--gradient-soft);
  padding: clamp(3rem, 7vw, 5rem) 1.5rem;
  text-align: center;
}

.page-hero::after {
  content: "";
  position: absolute;
  inset-inline-start: -4rem;
  bottom: -6rem;
  width: 14rem;
  height: 14rem;
  border: 1px solid rgba(90, 124, 122, 0.14);
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5rem rgba(90, 124, 122, 0.035),
    0 0 0 3rem rgba(200, 169, 110, 0.035);
  pointer-events: none;
}

.page-hero__content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.page-hero__eyebrow {
  margin: 0 0 1rem;
  color: var(--color-primary-deep);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.page-hero__subtitle {
  max-width: 760px;
  margin: 1rem auto 0;
  color: var(--color-text);
  font-size: var(--text-lg);
  line-height: 1.9;
}

.page-hero__subtitle :deep(p) {
  margin: 0 0 0.8rem;
}

.page-hero__subtitle :deep(p:last-child) {
  margin-bottom: 0;
}

.page-hero__subtitle :deep(strong) {
  font-weight: 700;
}

@media (max-width: 768px) {
  .page-hero {
    padding-top: 3rem;
  }
}
</style>