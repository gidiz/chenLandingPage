<template>
  <section class="page-section accessibility-page">
    <div class="container">
      <article class="page-card accessibility-page__card">
        <h1 class="accessibility-page__title">הצהרת נגישות</h1>
        <p>
          ליצירת קשר בנושאי נגישות ניתן לפנות אל הקליניקה בטלפון או ב-WhatsApp:
        </p>
        <div class="accessibility-page__links">
          <a href="tel:0547577214">
            <span>טלפון:</span>
            <bdi dir="ltr">054-757-7214</bdi>
          </a>
          <a href="https://wa.me/972547577214">
            WhatsApp
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.accessibility-page__card {
  max-width: 760px;
  margin-inline: auto;
}

.accessibility-page__title {
  margin-block: 0 1rem;
  font-size: var(--text-h2);
}

.accessibility-page__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.accessibility-page__links a {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding-block: 0.55rem;
  padding-inline: 0.9rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  color: var(--color-primary-deep);
  font-weight: 700;
  text-decoration: none;
}

.accessibility-page__links a:hover {
  background-color: var(--color-surface-soft);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
</style>
