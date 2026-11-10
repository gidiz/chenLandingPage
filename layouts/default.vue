<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">מעבר לתוכן הראשי</a>
    <AppHeader />
    <AppBreadcrumbs />
    <main id="main-content" class="site-main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
    <MobileContactBar />
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  z-index: 1200;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding-block: 0.5rem;
  padding-inline: 1rem;
  transform: translateY(-160%);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  font-weight: 700;
}

.skip-link:focus {
  transform: translateY(0);
}

.site-main {
  min-height: calc(100vh - 220px);
}
</style>