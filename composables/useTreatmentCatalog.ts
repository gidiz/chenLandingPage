import type { TreatmentCategory } from "./treatment-catalog";

export const useTreatmentCatalog = () => {
  // Populated by plugins/treatment-catalog.ts before component setup runs.
  const categories = useState<TreatmentCategory[]>(
    "treatment-catalog:categories",
    () => [],
  );

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
