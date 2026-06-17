import { getCategoryBySlug, getServiceBySlugs, treatmentCategories } from "./treatment-catalog";

export const useTreatmentCatalog = () => {
  return {
    treatmentCategories,
    getCategoryBySlug,
    getServiceBySlugs,
  };
};

export type { TreatmentCategory, TreatmentQuestion, TreatmentService } from "./treatment-catalog";
