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

<style scoped>
.site-footer {
  background-color: #3d5c5a;
  color: #fff;
  padding: 2rem 1.5rem;
  direction: rtl;
  text-align: right;
}

.site-footer__content {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  align-items: start;
}

.site-footer__brand {
  min-width: 0;
}

.site-footer__title {
  margin: 0 0 0.75rem;
  color: #fff;
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
.site-footer__contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.site-footer__categories {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}

.site-footer__category {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.site-footer__category-title {
  font-weight: 700;
  margin-bottom: 0.15rem;
}

.site-footer__map {
  aspect-ratio: 4 / 3;
  min-height: 220px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}

.site-footer__map iframe {
  width: 100%;
  height: 100%;
  min-height: 220px;
  border: 0;
  display: block;
}

.site-footer a {
  color: #fff;
  text-decoration: none;
}

@media (max-width: 768px) {
  .site-footer__categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem 0.85rem;
  }

  .site-footer__category {
    gap: 0.4rem;
  }

  .site-footer__category a {
    font-size: 0.87rem;
    line-height: 1.45;
  }

  .site-footer__category-title {
    font-size: 0.96rem;
  }

  .site-footer__map {
    aspect-ratio: 16 / 10;
    height: auto;
    min-height: 0;
  }
}

@media (min-width: 960px) {
  .site-footer__content {
    grid-template-columns: minmax(200px, 0.9fr) minmax(220px, 1.1fr) minmax(
        320px,
        1.2fr
      );
    grid-template-areas:
      "brand categories map"
      "links categories map"
      "contact categories map";
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
    aspect-ratio: auto;
    height: 100%;
    min-height: 100%;
  }
}
</style>
