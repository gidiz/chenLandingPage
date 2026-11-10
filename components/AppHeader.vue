<template>
  <header
    ref="headerElement"
    class="main-header"
    :class="{ scrolled: isScrolled }"
  >
    <div class="container">
      <NuxtLink to="/" class="logo-link" @click="closeMenu">
        <img
          src="/assets/logo.png"
          alt="ד&quot;ר חן פרדו - אסתטיקה רפואית"
          class="logo"
        />
      </NuxtLink>

      <button
        ref="menuToggleElement"
        class="menu-toggle"
        type="button"
        :aria-label="isOpen ? 'סגירת התפריט' : 'פתיחת התפריט'"
        aria-controls="primary-navigation"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span aria-hidden="true">{{ isOpen ? "×" : "☰" }}</span>
      </button>

      <button
        v-if="isOpen"
        class="nav-backdrop"
        type="button"
        aria-label="סגירת התפריט"
        @click="closeMenu"
      />

      <nav
        id="primary-navigation"
        class="nav-menu"
        :class="{ open: isOpen }"
        aria-label="ניווט ראשי"
        :aria-hidden="isMobileViewport && !isOpen"
        :inert="isMobileViewport && !isOpen"
      >
        <NuxtLink to="/" @click="closeMenu">דף הבית</NuxtLink>
        <NuxtLink to="/about" @click="closeMenu">אודות</NuxtLink>

        <div class="nav-dropdown">
          <button
            ref="treatmentsTriggerElement"
            id="treatments-menu-trigger"
            class="nav-dropdown__trigger"
            type="button"
            aria-controls="treatments-menu"
            :aria-expanded="isTreatmentsOpen"
            @click="toggleTreatmentsMenu"
          >
            טיפולים
            <svg
              class="nav-dropdown__chevron"
              :class="{ 'is-open': isTreatmentsOpen }"
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="m3.5 6 4.5 4 4.5-4" />
            </svg>
          </button>

          <div
            v-show="isTreatmentsOpen"
            id="treatments-menu"
            class="nav-dropdown__menu"
            aria-labelledby="treatments-menu-trigger"
          >
            <NuxtLink
              to="/treatments"
              class="nav-dropdown__overview"
              @click="closeMenu"
            >
              <span>כל תחומי הטיפול</span>
              <span class="nav-dropdown__overview-note">
                מידע על הטיפולים והתאמה אישית
              </span>
            </NuxtLink>

            <div class="nav-dropdown__categories">
              <section
                v-for="category in treatmentCategories"
                :key="category.slug"
                class="nav-category"
                :class="{
                  'is-expanded': activeMobileCategory === category.slug,
                }"
              >
                <div class="nav-category__heading">
                  <NuxtLink
                    :to="`/${category.slug}`"
                    @click="closeMenu"
                  >
                    {{ category.title }}
                  </NuxtLink>
                  <button
                    class="nav-category__toggle"
                    type="button"
                    :aria-label="getCategoryToggleLabel(category.slug, category.title)"
                    :aria-controls="`treatments-${category.slug}-services`"
                    :aria-expanded="activeMobileCategory === category.slug"
                    @click="toggleMobileCategory(category.slug)"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="m3.5 6 4.5 4 4.5-4" />
                    </svg>
                  </button>
                </div>
                <div
                  :id="`treatments-${category.slug}-services`"
                  class="nav-category__services"
                >
                  <NuxtLink
                    v-for="service in category.services"
                    :key="service.slug"
                    :to="`/${category.slug}/${service.slug}`"
                    @click="closeMenu"
                  >
                    {{ service.navTitle }}
                  </NuxtLink>
                </div>
              </section>
            </div>
          </div>
        </div>

        <NuxtLink
          v-if="getCategoryBySlug('hyperhidrosis')"
          to="/hyperhidrosis"
          @click="closeMenu"
        >
          טיפול בהזעת יתר
        </NuxtLink>
        <NuxtLink to="/videos" @click="closeMenu">סרטונים</NuxtLink>
        <NuxtLink to="/faq" @click="closeMenu">שאלות נפוצות</NuxtLink>
        <NuxtLink to="/contact" @click="closeMenu">יצירת קשר</NuxtLink>
        <NuxtLink
          to="/consultation"
          class="nav-menu__consultation"
          @click="closeMenu"
        >
          קביעת ייעוץ
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"

const isOpen = ref(false)
const isTreatmentsOpen = ref(false)
const activeMobileCategory = ref<string | null>(null)
const headerElement = ref<HTMLElement | null>(null)
const menuToggleElement = ref<HTMLButtonElement | null>(null)
const treatmentsTriggerElement = ref<HTMLButtonElement | null>(null)
const isMobileViewport = ref(false)
const { treatmentCategories, getCategoryBySlug } = useTreatmentCatalog()
const isScrolled = ref(false)
const SCROLL_ENTER_THRESHOLD = 48
const SCROLL_EXIT_THRESHOLD = 12
const mobileMediaQuery = "(max-width: 900px)"
let mobileMediaQueryList: MediaQueryList | null = null

const updateMobileViewport = (): void => {
  isMobileViewport.value = mobileMediaQueryList?.matches ?? false

  if (!isMobileViewport.value) {
    isOpen.value = false
  }
}

const updateScrollState = (): void => {
  const scrollY = window.scrollY

  if (!isScrolled.value && scrollY > SCROLL_ENTER_THRESHOLD) {
    isScrolled.value = true
    return
  }

  if (isScrolled.value && scrollY < SCROLL_EXIT_THRESHOLD) {
    isScrolled.value = false
  }
}

onMounted(() => {
  updateScrollState()
  mobileMediaQueryList = window.matchMedia(mobileMediaQuery)
  updateMobileViewport()
  document.documentElement.classList.toggle("mobile-menu-open", isOpen.value)
  window.addEventListener("scroll", updateScrollState, { passive: true })
  document.addEventListener("click", closeOnOutsideClick)
  window.addEventListener("keydown", handleGlobalKeydown)
  mobileMediaQueryList.addEventListener("change", updateMobileViewport)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove("mobile-menu-open")
  window.removeEventListener("scroll", updateScrollState)
  document.removeEventListener("click", closeOnOutsideClick)
  window.removeEventListener("keydown", handleGlobalKeydown)
  mobileMediaQueryList?.removeEventListener("change", updateMobileViewport)
})

watch(isOpen, (isMenuOpen) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle("mobile-menu-open", isMenuOpen)
  }
})

const closeMenu = (): void => {
  isOpen.value = false
  isTreatmentsOpen.value = false
  activeMobileCategory.value = null
}

const toggleTreatmentsMenu = (): void => {
  isTreatmentsOpen.value = !isTreatmentsOpen.value
  activeMobileCategory.value = null
}

const toggleMobileCategory = (categorySlug: string): void => {
  activeMobileCategory.value =
    activeMobileCategory.value === categorySlug ? null : categorySlug
}

const getCategoryToggleLabel = (categorySlug: string, title: string): string =>
  `${activeMobileCategory.value === categorySlug ? "הסתרת" : "הצגת"} טיפולים בתחום ${title}`

const closeOnOutsideClick = (event: MouseEvent): void => {
  if (
    event.target instanceof Node &&
    !headerElement.value?.contains(event.target)
  ) {
    closeMenu()
  }
}

const handleGlobalKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    const focusTarget = isOpen.value
      ? menuToggleElement.value
      : isTreatmentsOpen.value
        ? treatmentsTriggerElement.value
        : null

    if (!focusTarget) {
      return
    }

    closeMenu()
    void nextTick(() => focusTarget.focus())
  }
}
</script>

<style scoped>
.main-header {
  background-color: rgba(255, 255, 255, 0.96);
  padding: 0.65rem 1.5rem;
  border-bottom: 1px solid rgba(90, 124, 122, 0.12);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  backdrop-filter: blur(14px);
  transition:
    padding var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.main-header.scrolled {
  padding: 0.35rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.main-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.logo-link {
  display: inline-flex;
  align-items: center;
}

.logo {
  height: 76px;
  max-height: 76px;
  object-fit: contain;
  background-color: var(--color-surface);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition:
    height var(--duration-base) var(--ease-out),
    max-height var(--duration-base) var(--ease-out);
}

.main-header.scrolled .logo {
  height: 60px;
  max-height: 60px;
}

.menu-toggle {
  display: none;
  font-size: 1.8rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary-deep);
  z-index: calc(var(--z-nav) + 1);
}

.nav-backdrop {
  display: none;
}

.nav-menu {
  display: flex;
  gap: clamp(0.7rem, 1.4vw, 1.35rem);
  direction: rtl;
  align-items: center;
}

.nav-menu > a,
.nav-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.15rem;
  border: 0;
  background: transparent;
  text-decoration: none;
  font: inherit;
  font-size: 0.98rem;
  color: var(--color-primary-deep);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.nav-menu > a:hover,
.nav-menu > a:focus-visible,
.nav-dropdown__trigger:hover,
.nav-dropdown__trigger:focus-visible {
  color: #856b5a;
}

.main-header :focus-visible {
  outline-color: var(--color-primary-deep);
}

.nav-menu__consultation {
  padding: 0.7rem 1rem !important;
  border-radius: var(--radius-pill);
  background: var(--gradient-primary) !important;
  color: var(--color-on-primary) !important;
  box-shadow: var(--shadow-sm);
}

.nav-menu__consultation:hover {
  background: var(--gradient-primary) !important;
  color: var(--color-on-primary) !important;
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown__chevron,
.nav-category__toggle svg {
  width: 0.9rem;
  height: 0.9rem;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform var(--duration-fast) var(--ease-out);
}

.nav-dropdown__chevron.is-open,
.nav-category.is-expanded .nav-category__toggle svg {
  transform: rotate(180deg);
}

.nav-dropdown__menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  inset-inline-end: auto;
  inset-inline-start: 50%;
  translate: 50% 0;
  width: min(780px, calc(100vw - 2rem));
  max-height: min(78vh, 640px);
  overflow: auto;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  text-align: start;
  animation: menu-enter var(--duration-base) var(--ease-out) both;
}

.nav-dropdown__overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  background: var(--gradient-soft);
  color: var(--color-primary-deep);
  font-weight: 700;
  text-decoration: none;
}

.nav-dropdown__overview:hover {
  color: var(--color-primary-dark);
}

.nav-dropdown__overview-note {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 400;
}

.nav-dropdown__categories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.25rem;
}

.nav-category {
  min-width: 0;
  padding: 0.7rem;
  border-radius: var(--radius-md);
}

.nav-category__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.nav-category__heading > a {
  display: flex;
  color: var(--color-primary-deep);
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  text-align: start;
}

.nav-category__heading > a:hover {
  color: var(--color-primary-dark);
}

.nav-category__toggle {
  display: none;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary-deep);
  cursor: pointer;
}

.nav-category__services {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.nav-category__services a {
  padding: 0.25rem 0;
  color: var(--color-text-muted);
  font-size: 0.94rem;
  line-height: 1.5;
  text-decoration: none;
}

.nav-category__services a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

@keyframes menu-enter {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: var(--color-primary-tint);
  }

  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 0;
    border: 0;
    background: rgba(38, 63, 62, 0.34);
    opacity: 0;
    animation: backdrop-enter var(--duration-base) ease forwards;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    inset-inline-start: 0;
    height: 100vh;
    height: 100dvh;
    width: min(88vw, 370px);
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--color-surface);
    flex-direction: column;
    align-items: stretch;
    padding: 5.5rem 1.25rem 2rem;
    box-shadow: var(--shadow-lg);
    transform: translateX(105%);
    transition: transform var(--duration-base) var(--ease-out);
    z-index: 1;
    gap: 0.25rem;
  }

  .nav-menu.open {
    transform: translateX(0);
  }

  .nav-menu > a,
  .nav-dropdown__trigger {
    width: 100%;
    min-height: 3rem;
    justify-content: space-between;
    padding: 0.65rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 1.05rem;
    text-align: start;
  }

  .nav-menu > a:hover,
  .nav-dropdown__trigger:hover {
    background: var(--color-surface-soft);
  }

  .nav-menu__consultation {
    justify-content: center !important;
    margin-top: 0.5rem;
    text-align: center !important;
  }

  .nav-dropdown__menu {
    position: static;
    width: auto;
    max-height: none;
    overflow: visible;
    margin: 0.2rem 0 0.5rem;
    padding: 0.75rem;
    border: 0;
    border-radius: var(--radius-md);
    background: var(--color-surface-soft);
    box-shadow: none;
    animation: none;
  }

  .nav-dropdown__overview {
    display: block;
    margin-bottom: 0.4rem;
    padding: 0.75rem;
  }

  .nav-dropdown__overview-note {
    display: block;
    margin-top: 0.15rem;
  }

  .nav-dropdown__categories {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .nav-category {
    padding: 0;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
  }

  .nav-category__heading {
    align-items: stretch;
    gap: 0.25rem;
  }

  .nav-category__heading > a {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    align-items: center;
    padding-block: 0.4rem;
    padding-inline: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .nav-category__toggle {
    display: inline-flex;
    width: 44px;
    min-width: 44px;
    height: 44px;
    align-self: center;
    border-radius: var(--radius-sm);
  }

  .nav-category__services {
    display: none;
    margin: 0;
    padding-block: 0.15rem 0.4rem;
    padding-inline: 0.35rem;
  }

  .nav-category.is-expanded .nav-category__services {
    display: grid;
  }

  .nav-category__services a {
    display: flex;
    min-height: 44px;
    align-items: center;
    padding-block: 0.45rem;
    padding-inline: 0.35rem;
    font-size: 1rem;
    line-height: 1.45;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .main-header .container {
    justify-content: space-between;
  }
}

@keyframes backdrop-enter {
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .main-header,
  .logo,
  .nav-menu,
  .nav-dropdown__chevron,
  .nav-category__toggle svg {
    transition: none;
  }

  .nav-dropdown__menu,
  .nav-backdrop {
    animation: none;
  }
}
</style>
