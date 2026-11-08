<template>
  <section class="hero-section">
    <div class="hero-content" v-reveal>
      <p class="hero-eyebrow">אסתטיקה רפואית בכפר סבא</p>
      <h1>ד"ר חן פרדו</h1>
      <p class="subtitle">
        טיפולים מותאמים אישית, עם גישה רפואית ומראה טבעי
      </p>
      <div class="hero-actions">
        <NuxtLink
          to="/consultation"
          class="cta-button cta-button--light"
          @click="trackHeroClick('home_hero_consultation')"
        >
          קביעת פגישת ייעוץ
        </NuxtLink>
        <NuxtLink
          to="/treatments"
          class="hero-secondary-link"
          @click="trackHeroClick('home_hero_treatments')"
        >
          להיכרות עם הטיפולים
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { $analytics } = useNuxtApp()

const trackHeroClick = (clickLocation: string): void => {
  $analytics.trackEvent("cta_click", {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}
</script>

<style scoped>
.hero-section {
  display: grid;
  place-items: center;
  min-height: clamp(440px, 62vh, 680px);
  background-image: url("/assets/cover.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: clamp(4rem, 9vw, 7rem) 1.5rem;
  position: relative;
  text-align: center;
  color: var(--color-on-primary);
  overflow: hidden;
  isolation: isolate;
}

.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--gradient-hero-overlay);
  z-index: -1;
}

.hero-content {
  max-width: 760px;
  margin: 0 auto;
  padding: clamp(1.75rem, 4vw, 3rem);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-lg);
  background: rgba(38, 63, 62, 0.22);
  box-shadow: 0 20px 55px rgba(20, 35, 34, 0.2);
  backdrop-filter: blur(4px);
}

.hero-eyebrow {
  margin: 0 0 0.75rem;
  color: #f3eadb;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hero-section h1 {
  margin: 0;
  color: var(--color-on-primary);
  font-size: var(--text-h1);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.28);
}

.subtitle {
  max-width: 620px;
  margin: 1rem auto 0;
  color: rgba(255, 255, 255, 0.96);
  font-size: clamp(1.1rem, 0.95rem + 0.7vw, 1.4rem);
  font-weight: 400;
  line-height: 1.7;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 2rem;
}

.hero-secondary-link {
  color: var(--color-on-primary);
  font-weight: 600;
  text-decoration-color: rgba(255, 255, 255, 0.7);
  text-underline-offset: 0.25em;
  transition: color var(--duration-fast) var(--ease-out);
}

.hero-secondary-link:hover {
  color: #f3eadb;
}

@media (max-width: 600px) {
  .hero-section {
    min-height: 500px;
    background-position: 58% center;
  }

  .hero-content {
    width: 100%;
    padding: 1.5rem 1.15rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-actions .cta-button {
    width: min(100%, 320px);
  }
}
</style>
