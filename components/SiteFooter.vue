<template>
  <footer ref="footerElement" class="site-footer" v-reveal>
    <div class="container site-footer__content">
      <div class="site-footer__brand">
        <h2 class="site-footer__title">ד&quot;ר חן פרדו</h2>
        <p class="site-footer__text">
          אסתטיקה רפואית, מראה טבעי וטיפולים מתקדמים בהזעת יתר.
        </p>
      </div>

      <nav class="site-footer__links" aria-label="ניווט תחתון">
        <NuxtLink to="/about">אודות</NuxtLink>
        <NuxtLink to="/treatments">טיפולים</NuxtLink>
        <NuxtLink to="/contact">יצירת קשר</NuxtLink>
        <NuxtLink to="/consultation">קביעת ייעוץ</NuxtLink>
        <NuxtLink to="/accessibility">הצהרת נגישות</NuxtLink>
      </nav>

      <div class="site-footer__categories" aria-label="תחומי טיפול ושירותים">
        <details
          v-for="category in treatmentCategories"
          :key="category.slug"
          class="site-footer__category-disclosure"
        >
          <summary>{{ category.title }}</summary>
          <div class="site-footer__category-links">
            <NuxtLink
              :to="`/${category.slug}`"
              class="site-footer__category-title"
            >
              {{ category.title }}
            </NuxtLink>
            <NuxtLink
              v-for="service in category.services"
              :key="service.slug"
              :to="`/${category.slug}/${service.slug}`"
            >
              {{ service.navTitle }}
            </NuxtLink>
          </div>
        </details>
      </div>

      <div class="site-footer__contact">
        <p class="site-footer__address">התעש 20, כפר סבא</p>
        <a
          href="tel:0547577214"
          @click="trackClick('phone_click', 'footer_phone')"
        >
          <bdi dir="ltr">054-757-7214</bdi>
        </a>
        <a
          href="https://wa.me/972547577214"
          target="_blank"
          rel="noopener noreferrer"
          @click="trackClick('whatsapp_click', 'floating_whatsapp')"
        >
          WhatsApp
        </a>
        <div class="site-footer__socials" aria-label="רשתות חברתיות">
          <a
            href="https://www.instagram.com/dr_chen_pardo/"
            target="_blank"
            rel="noopener noreferrer"
            @click="trackClick('instagram_click', 'floating_instagram')"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61577031445942"
            target="_blank"
            rel="noopener noreferrer"
            @click="trackClick('facebook_click', 'floating_facebook')"
          >
            Facebook
          </a>
        </div>
        <FloatingSocialLinks />
      </div>

      <div class="site-footer__map">
        <iframe
          title="מפת הגעה לקליניקה"
          src="https://www.google.com/maps?q=%D7%94%D7%AA%D7%A2%D7%A9%2020%20%D7%9B%D7%A4%D7%A8%20%D7%A1%D7%91%D7%90&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const { treatmentCategories } = useTreatmentCatalog()
const footerElement = ref<HTMLElement | null>(null)
const nuxtApp = useNuxtApp() as {
  $analytics?: {
    trackEvent?: (eventName: string, payload: Record<string, unknown>) => void
  }
}

let desktopDisclosureQuery: MediaQueryList | null = null

const updateCategoryDisclosures = (): void => {
  const shouldOpen = desktopDisclosureQuery?.matches ?? false
  const disclosures =
    footerElement.value?.querySelectorAll<HTMLDetailsElement>(
      ".site-footer__category-disclosure",
    ) ?? []

  disclosures.forEach((disclosure) => {
    disclosure.open = shouldOpen
  })
}

const trackClick = (eventName: string, clickLocation: string): void => {
  nuxtApp.$analytics?.trackEvent?.(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}

onMounted(() => {
  desktopDisclosureQuery = window.matchMedia("(min-width: 769px)")
  updateCategoryDisclosures()
  desktopDisclosureQuery.addEventListener("change", updateCategoryDisclosures)
})

onBeforeUnmount(() => {
  desktopDisclosureQuery?.removeEventListener(
    "change",
    updateCategoryDisclosures,
  )
})
</script>

<style scoped>
.site-footer {
  position: relative;
  isolation: isolate;
  background-color: var(--color-primary-dark);
  background-image: url("~/assets/footer-background.jpg");
  background-position: center 38%;
  background-repeat: no-repeat;
  background-size: cover;
  color: var(--color-on-primary);
  padding-block: 2rem;
  direction: rtl;
  text-align: start;
}

.site-footer::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: rgba(38, 63, 62, 0.8);
}

.site-footer__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.site-footer__brand {
  min-width: 0;
}

.site-footer__title {
  margin: 0 0 0.75rem;
  color: var(--color-on-primary);
  font-size: 1.5rem;
}

.site-footer__text {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.8;
}

.site-footer__address {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
}

.site-footer__links,
.site-footer__contact,
.site-footer__socials {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
}

.site-footer__categories {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.4rem;
}

.site-footer__category-disclosure {
  min-width: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.24);
}

.site-footer__category-disclosure summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-block: 0.4rem;
  cursor: pointer;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.site-footer__category-disclosure summary::marker {
  content: "";
}

.site-footer__category-disclosure summary::after {
  content: "⌄";
  flex: 0 0 auto;
  transition: transform var(--duration-fast) var(--ease-out);
}

.site-footer__category-disclosure[open] summary::after {
  transform: rotate(180deg);
}

.site-footer__category-links {
  display: flex;
  flex-direction: column;
  padding-block-end: 0.4rem;
  padding-inline-start: 0.65rem;
}

.site-footer__category-title {
  font-weight: 700;
}

.site-footer__map {
  width: 100%;
  max-height: 22rem;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}

.site-footer__map iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 0;
}

.site-footer a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  color: var(--color-on-primary);
  text-decoration: none;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.site-footer a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.site-footer__socials {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0 0.75rem;
}

@media (min-width: 1024px) {
  .site-footer__content {
    grid-template-columns:
      minmax(0, 0.9fr)
      minmax(0, 1.1fr)
      minmax(0, 1.2fr);
    grid-template-areas:
      "brand categories map"
      "links categories map"
      "contact categories map";
    gap: 1.25rem;
  }

  .site-footer__brand {
    grid-area: brand;
  }

  .site-footer__links {
    grid-area: links;
  }

  .site-footer__contact {
    grid-area: contact;
  }

  .site-footer__categories {
    grid-area: categories;
  }

  .site-footer__map {
    grid-area: map;
    align-self: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-footer__category-disclosure summary::after {
    transition: none;
  }
}
</style>
