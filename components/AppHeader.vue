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
        <NuxtLink to="/treatments" @click="closeMenu">טיפולים</NuxtLink>

        <NuxtLink to="/faq" @click="closeMenu">שאלות נפוצות</NuxtLink>
        <NuxtLink to="/contact" @click="closeMenu">יצירת קשר</NuxtLink>
        <NuxtLink to="/consultation" @click="closeMenu">קביעת ייעוץ</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const isOpen = ref(false);
const isScrolled = ref(false);
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

const closeMenu = () => {
  isOpen.value = false;
};
</script>
