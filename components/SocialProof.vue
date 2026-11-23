<script setup lang="ts">
import IconTechnion from '~/components/icons/IconTechnion.vue'
import IconBGU from '~/components/icons/IconBGU.vue'
import IconIMA from '~/components/icons/IconIMA.vue'

const logos = [
  { name: 'הטכניון – מכון טכנולוגי לישראל', component: IconTechnion, tall: true },
  { name: 'אוניברסיטת בן־גוריון בנגב', component: IconBGU },
  { name: 'ההסתדרות הרפואית בישראל', component: IconIMA },
]
</script>

<template>
  <section class="social-proof" aria-labelledby="social-proof-title">
    <div class="container">
      <h2 id="social-proof-title" class="section-title">
        הכשרה והסמכות רפואיות
      </h2>
      <ul class="social-proof__logos">
        <li
          v-for="logo in logos"
          :key="logo.name"
          class="social-proof__logo"
          role="img"
          :aria-label="logo.name"
          :title="logo.name"
        >
          <component
            :is="logo.component"
            class="social-proof__icon"
            :class="{ 'social-proof__icon--tall': logo.tall }"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.social-proof {
  background: var(--color-surface-soft);
  border-block: 1px solid var(--color-border);
  padding: var(--space-section-sm) 1.5rem;
  direction: rtl;
  text-align: center;
}

.social-proof__logos {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;
  gap: 2rem;
  max-width: 900px;
  margin: 0.5rem auto 0;
  padding: 0;
  list-style: none;
}

.social-proof__logo {
  --logo-mono: #a39d96;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Reveal the official brand colours on hover / tap */
.social-proof__logo:hover,
.social-proof__logo:active {
  --logo-mono: initial;
}

.social-proof__icon {
  display: block;
  height: clamp(64px, 5rem + 2vw, 112px);
  width: auto;
}

/* The vertical Technion lockup stacks three text lines, so it needs more height to match visually */
.social-proof__icon--tall {
  height: clamp(88px, 6.5rem + 3vw, 148px);
}

@media (max-width: 480px) {
  .social-proof {
    padding-inline: 0;
  }

  .social-proof__logos {
    gap: 1rem;
    justify-content: space-evenly;
  }

  .social-proof__icon {
    height: 48px;
  }

  .social-proof__icon--tall {
    height: 66px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .social-proof__logo :deep(*) {
    transition: none !important;
  }
}
</style>