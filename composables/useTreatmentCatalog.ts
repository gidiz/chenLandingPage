import type { TreatmentCategory } from "./treatment-catalog";

type CatalogApiResponse = {
  source: "db";
  categories: TreatmentCategory[];
};

const useCatalogState = () => {
  const categories = useState<TreatmentCategory[]>(
    "treatment-catalog:categories",
    () => [],
  );

  const initialized = useState<boolean>("treatment-catalog:initialized", () => false);

  return {
    categories,
    initialized,
  };
};

export const useTreatmentCatalog = () => {
  const { categories, initialized } = useCatalogState();

  if (!initialized.value) {
    initialized.value = true;

    void $fetch<CatalogApiResponse>("/api/catalog/treatment")
      .then((payload) => {
        if (Array.isArray(payload?.categories)) {
          categories.value = payload.categories;
        }
      })
      .catch((error) => {
        console.error("Failed loading treatment catalog from DB", error);
        categories.value = [];
      });
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
