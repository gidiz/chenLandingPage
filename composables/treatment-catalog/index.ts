import type { TreatmentCategory } from "./types";
import { injectablesCategory } from "./injectables/injectables";
import { hyperhidrosisCategory } from "./hyperhidrosis/hyperhidrosis";
import { technologyCategory } from "./technology/technology";
import { skinQualityCategory } from "./skin-quality/skin-quality";
import { proceduresCategory } from "./procedures/procedures";
import { skincareCategory } from "./skincare/skincare";

export const treatmentCategories: TreatmentCategory[] = [
  injectablesCategory,
  hyperhidrosisCategory,
  technologyCategory,
  skinQualityCategory,
  proceduresCategory,
  skincareCategory
];

const treatmentCategoryMap = new Map(
  treatmentCategories.map((category) => [category.slug, category]),
);

const treatmentServiceMap = new Map(
  treatmentCategories.flatMap((category) =>
    category.services.map((service) => [
      `${category.slug}/${service.slug}`,
      {
        category,
        service,
      },
    ]),
  ),
);

export const getCategoryBySlug = (slug: string) =>
  treatmentCategoryMap.get(slug) ?? null;

export const getServiceBySlugs = (categorySlug: string, serviceSlug: string) =>
  treatmentServiceMap.get(`${categorySlug}/${serviceSlug}`) ?? null;

export type { TreatmentCategory, TreatmentQuestion, TreatmentService } from "./types";
