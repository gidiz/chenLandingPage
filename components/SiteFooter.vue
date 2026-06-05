<template>
  <footer class="site-footer">
    <div class="container site-footer__content">
      <div class="site-footer__brand">
        <h2 class="site-footer__title">ד&quot;ר חן פרדו</h2>
        <p class="site-footer__text">
          אסתטיקה רפואית, מראה טבעי וטיפולים מתקדמים בהזעת יתר.
        </p>
      </div>

      <div class="site-footer__links">
        <NuxtLink to="/about">אודות</NuxtLink>
        <NuxtLink to="/treatments">טיפולים</NuxtLink>
        <NuxtLink to="/contact">יצירת קשר</NuxtLink>
        <NuxtLink to="/consultation">קביעת ייעוץ</NuxtLink>
      </div>

      <div class="site-footer__categories">
        <div
          v-for="category in treatmentCategories"
          :key="category.slug"
          class="site-footer__category"
        >
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
      </div>

      <div class="site-footer__contact">
        <p class="site-footer__address">התעש 20, כפר סבא</p>
        <a href="tel:0547577214">054-757-7214</a>
        <a href="https://wa.me/972547577214" target="_blank" rel="noopener">
          WhatsApp
        </a>
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

<script setup>
const { treatmentCategories } = useTreatmentCatalog();
</script>
