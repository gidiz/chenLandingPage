<template>
  <span class="icon-technion" aria-hidden="true" />
</template>

<style scoped>
/* The PNG is only an alpha mask; it is painted in the original logo blue unless --logo-mono is set */
.icon-technion {
  display: inline-block;
  aspect-ratio: 362 / 339;
  background-color: var(--logo-mono, #001b54);
  transition: background-color var(--duration-base, 0.28s) ease;
  -webkit-mask: url('~/assets/technion-logo.png') center / contain no-repeat;
  mask: url('~/assets/technion-logo.png') center / contain no-repeat;
}
</style>
