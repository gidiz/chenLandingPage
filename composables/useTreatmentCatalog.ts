import type { TreatmentCategory } from "./treatment-catalog";
import { treatmentCategories as staticTreatmentCategories } from "./treatment-catalog";

type CatalogApiResponse = {
  source: "db" | "static";
  categories: TreatmentCategory[];
};

const useCatalogState = () => {
  const categories = useState<TreatmentCategory[]>(
    "treatment-catalog:categories",
    () => staticTreatmentCategories,
  );

  const initialized = useState<boolean>("treatment-catalog:initialized", () => false);

  return {
    categories,
    initialized,
  };
};

export const useTreatmentCatalog = () => {
  const config = useRuntimeConfig();
  const { categories, initialized } = useCatalogState();

  if (!initialized.value) {
    initialized.value = true;

    const sourceSetting = String(config.public.treatmentCatalogSource || "db").toLowerCase();

    if (sourceSetting !== "static") {
      void $fetch<CatalogApiResponse>("/api/rag/treatment-catalog")
        .then((payload) => {
          if (Array.isArray(payload?.categories) && payload.categories.length > 0) {
            categories.value = payload.categories;
          }
        })
        .catch(() => {
          categories.value = staticTreatmentCategories;
        });
    }
  }

  const treatmentCategoryMap = computed(
    () => new Map(categories.value.map((category) => [category.slug, category])),
  );

  const treatmentServiceMap = computed(
    () =>
      new Map(
        categories.value.flatMap((category) =>
          category.services.map((service) => [
            `${category.slug}/${service.slug}`,
            {
              category,
              service,
            },
          ]),
        ),
      ),
  );

  const getCategoryBySlug = (slug: string) =>
    treatmentCategoryMap.value.get(slug) ?? null;

  const getServiceBySlugs = (categorySlug: string, serviceSlug: string) =>
    treatmentServiceMap.value.get(`${categorySlug}/${serviceSlug}`) ?? null;

  return {
    treatmentCategories: categories,
    getCategoryBySlug,
    getServiceBySlugs,
  };
};

export type { TreatmentCategory, TreatmentQuestion, TreatmentService } from "./treatment-catalog";
