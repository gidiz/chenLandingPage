<template>
  <section class="page-section page-section--soft treatment-faq-section">
    <div class="container faq-preview">
      <h2 class="section-title">שאלות נפוצות סביב {{ shortTitle }}</h2>
      <div class="faq-preview__items treatment-faq-section__items">
        <article v-for="question in questions" :key="question.title" class="page-card">
          <h3>{{ question.title }}</h3>
          <p>{{ question.answer }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  shortTitle: {
    type: String,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.treatment-faq-section__items {
  align-items: stretch;
}

/* .treatment-faq-section__items .page-card {
  height: 100%;
} */
</style>
