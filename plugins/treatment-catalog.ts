import type { TreatmentCategory } from "~/composables/treatment-catalog";

type CatalogApiResponse = {
  source: "db";
  categories: TreatmentCategory[];
};

// Loaded in a plugin so the catalog is resolved before any component setup runs,
// letting SSR render treatment content and 404 checks see real data.
export default defineNuxtPlugin(async () => {
  const categories = useState<TreatmentCategory[]>(
    "treatment-catalog:categories",
    () => [],
  );

  if (categories.value.length > 0) {
    return;
  }

  try {
    const payload = await $fetch<CatalogApiResponse>("/api/catalog/treatment");
    if (Array.isArray(payload?.categories)) {
      categories.value = payload.categories;
    }
  } catch (error) {
    console.error("Failed loading treatment catalog from DB", error);
  }
});
