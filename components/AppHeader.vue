<template>
  <header class="main-header">
    <div class="container">
      <img src="/assets/logo.png" alt="Dr. Chen Pardo Logo" class="logo" />

      <button class="menu-toggle" aria-label="תפריט" @click="isOpen = !isOpen">
        ☰
      </button>

      <nav class="nav-menu" :class="{ open: isOpen }">
        <a href="#about" @click="closeMenu">אודות</a>
        <a href="#treatments" @click="closeMenu">טיפולים</a>
        <a href="#contact" @click="closeMenu">יצירת קשר</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);

const closeMenu = () => {
  isOpen.value = false;
};
</script>
