<template>
  <div class="site-shell">
    <AppHeader />
    <FloatingSocialLinks />
    <main class="site-main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.site-main {
  min-height: calc(100vh - 220px);
}
</style>