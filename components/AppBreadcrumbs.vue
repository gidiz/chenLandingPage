<template>
  <nav
    v-if="breadcrumbItems.length > 0"
    class="breadcrumbs"
    aria-label="Breadcrumb"
  >
    <div class="container breadcrumbs__inner">
      <ol class="breadcrumbs__list">
        <li
          v-for="(item, index) in breadcrumbItems"
          :key="item.key"
          class="breadcrumbs__item"
        >
          <NuxtLink v-if="item.to" :to="item.to" class="breadcrumbs__link">
            {{ item.label }}
          </NuxtLink>
          <span v-else class="breadcrumbs__current">{{ item.label }}</span>

          <span
            v-if="index < breadcrumbItems.length - 1"
            class="breadcrumbs__separator"
            aria-hidden="true"
          >
            /
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
type BreadcrumbItem = {
  key: string;
  label: string;
  to: string | null;
};

const route = useRoute();
const { getCategoryBySlug, getServiceBySlugs } = useTreatmentCatalog();

const segmentLabelMap: Record<string, string> = {
  about: "אודות",
  consultation: "קביעת ייעוץ",
  contact: "יצירת קשר",
  faq: "שאלות נפוצות",
  hyperhidrosis: "הזעת יתר",
  injectables: "הזרקות ופיסול פנים",
  lp: "דפי קמפיין",
  procedures: "פרוצדורות",
  "skin-quality": "איכות העור",
  skincare: "קוסמטיקה רפואית",
  technology: "מכשור טכנולוגי",
  treatments: "טיפולים",
};

const pathLabelMap: Record<string, string> = {
  "/lp/instagram-botox": "בוטוקס מאינסטגרם",
};

const toReadableLabel = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveLabel = (segments: string[], index: number, fullPath: string) => {
  const segment = segments[index] ?? "";

  if (pathLabelMap[fullPath]) {
    return pathLabelMap[fullPath];
  }

  if (segmentLabelMap[segment]) {
    return segmentLabelMap[segment];
  }

  if (index === 0) {
    const category = getCategoryBySlug(segment);
    if (category) {
      return category.shortTitle || category.title;
    }
  }

  if (index === 1) {
    const categorySlug = segments[0] ?? "";
    const serviceResult = getServiceBySlugs(categorySlug, segment);
    if (serviceResult) {
      return serviceResult.service.shortTitle || serviceResult.service.title;
    }
  }

  return toReadableLabel(segment);
};

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const path = route.path.split("?")[0]?.split("#")[0] ?? "/";

  if (path === "/") {
    return [];
  }

  const segments = path.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [
    {
      key: "home",
      label: "דף הבית",
      to: "/",
    },
  ];

  let fullPath = "";

  for (let index = 0; index < segments.length; index += 1) {
    fullPath += `/${segments[index]}`;
    const isLast = index === segments.length - 1;

    items.push({
      key: fullPath,
      label: resolveLabel(segments, index, fullPath),
      to: isLast ? null : fullPath,
    });
  }

  return items;
});
</script>

<style scoped>
.breadcrumbs {
  background-color: #f7f3ee;
  border-bottom: 1px solid rgba(90, 124, 122, 0.14);
}

.breadcrumbs__inner {
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}

.breadcrumbs__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.45rem;
  direction: rtl;
  color: #567472;
  font-size: 0.94rem;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.breadcrumbs__link {
  color: #567472;
  text-decoration: none;
}

.breadcrumbs__link:hover {
  color: #3d5c5a;
  text-decoration: underline;
}

.breadcrumbs__current {
  color: #3a3a3a;
  font-weight: 600;
}

.breadcrumbs__separator {
  color: rgba(86, 116, 114, 0.62);
}

@media (max-width: 768px) {
  .breadcrumbs__inner {
    padding-top: 0.65rem;
    padding-bottom: 0.65rem;
  }

  .breadcrumbs__list {
    font-size: 0.86rem;
    gap: 0.35rem;
  }

  .breadcrumbs__item {
    gap: 0.35rem;
  }
}
</style>
