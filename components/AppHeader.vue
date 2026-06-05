<template>
  <header class="main-header" :class="{ scrolled: isScrolled }">
    <div class="container">
      <NuxtLink to="/" class="logo-link" @click="closeMenu">
        <img src="/assets/logo.png" alt="Dr. Chen Pardo Logo" class="logo" />
      </NuxtLink>

      <button class="menu-toggle" aria-label="תפריט" @click="isOpen = !isOpen">
        ☰
      </button>

      <nav class="nav-menu" :class="{ open: isOpen }">
        <NuxtLink to="/" @click="closeMenu">דף הבית</NuxtLink>
        <NuxtLink to="/about" @click="closeMenu">אודות</NuxtLink>

        <div
          class="nav-menu__group"
          @mouseenter="openTreatmentsMenu"
          @mouseleave="closeTreatmentsMenu"
        >
          <button
            class="nav-menu__trigger"
            type="button"
            :aria-expanded="isTreatmentsOpen"
            @click="toggleTreatmentsMenu"
          >
            טיפולים
          </button>

          <div class="nav-dropdown" :class="{ open: isTreatmentsOpen }">
            <div class="nav-dropdown__intro">
              <NuxtLink to="/treatments" @click="closeMenu">
                לכל תחומי הטיפול
              </NuxtLink>
              <p>ניווט היררכי לקטגוריות ולדפי השירות המרכזיים באתר.</p>
            </div>

            <div class="nav-dropdown__grid">
              <div
                v-for="category in treatmentCategories"
                :key="category.slug"
                class="nav-dropdown__column"
              >
                <NuxtLink
                  :to="`/${category.slug}`"
                  class="nav-dropdown__title"
                  @click="closeMenu"
                >
                  {{ category.title }}
                </NuxtLink>
                <NuxtLink
                  v-for="service in category.services"
                  :key="service.slug"
                  :to="`/${category.slug}/${service.slug}`"
                  class="nav-dropdown__link"
                  @click="closeMenu"
                >
                  {{ service.navTitle }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <NuxtLink to="/faq" @click="closeMenu">שאלות נפוצות</NuxtLink>
        <NuxtLink to="/contact" @click="closeMenu">יצירת קשר</NuxtLink>
        <NuxtLink to="/consultation" @click="closeMenu">קביעת ייעוץ</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const { treatmentCategories } = useTreatmentCatalog();
const isOpen = ref(false);
const isScrolled = ref(false);
const isTreatmentsOpen = ref(false);
const SCROLL_ENTER_THRESHOLD = 48;
const SCROLL_EXIT_THRESHOLD = 12;

const updateScrollState = () => {
  const scrollY = window.scrollY;

  if (!isScrolled.value && scrollY > SCROLL_ENTER_THRESHOLD) {
    isScrolled.value = true;
    return;
  }

  if (isScrolled.value && scrollY < SCROLL_EXIT_THRESHOLD) {
    isScrolled.value = false;
  }
};

onMounted(() => {
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScrollState);
});

const openTreatmentsMenu = () => {
  isTreatmentsOpen.value = true;
};

const closeTreatmentsMenu = () => {
  isTreatmentsOpen.value = false;
};

const toggleTreatmentsMenu = () => {
  isTreatmentsOpen.value = !isTreatmentsOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
  isTreatmentsOpen.value = false;
};
</script>
