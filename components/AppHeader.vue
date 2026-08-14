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
        <NuxtLink to="/videos" @click="closeMenu">סרטונים</NuxtLink>

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

<style scoped>
.main-header {
  background-color: #ffffff;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 999;
  transition:
    padding 0.3s ease,
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.main-header.scrolled {
  padding: 0.45rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.main-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  display: inline-flex;
  align-items: center;
}

.logo {
  height: 100px;
  max-height: 100px;
  object-fit: contain;
  background-color: #ffffff;
  padding: 0.3rem;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  transition:
    height 0.3s ease,
    max-height 0.3s ease;
}

.main-header.scrolled .logo {
  height: 72px;
  max-height: 72px;
}

.menu-toggle {
  display: none;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #5a7c7a;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
  direction: rtl;
  align-items: center;
}

.nav-menu a {
  margin-right: 1.5rem;
  text-decoration: none;
  font-size: 1rem;
  color: #5a7c7a;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #a2836e;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    left: -100%;
    height: 100%;
    width: 70%;
    max-width: 260px;
    background-color: #fff;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem 1.5rem;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease-in-out;
    z-index: 1000;
    gap: 0;
  }

  .nav-menu.open {
    left: 0;
  }

  .nav-menu a {
    margin: 1rem 0;
    font-size: 1.2rem;
    color: #5a7c7a;
  }

  .main-header .container {
    justify-content: space-between;
  }
}
</style>
