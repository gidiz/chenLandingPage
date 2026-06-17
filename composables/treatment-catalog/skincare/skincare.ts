export const SKINCARE_CATEGORY = "skincare" as const;

export type SkincareServiceSlug =
  | "home-protocol"
  | "clinic-featured-products";

export interface SkincareServiceDefinition {
  slug: SkincareServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface SkincareValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { homeProtocolService } from "./services/skincare.home-protocol.service";
import { clinicFeaturedProductsService } from "./services/skincare.clinic-featured-products.service";

export const skincareCategory: TreatmentCategory = {
    slug: "skincare",
    title: "קוסמטיקה רפואית",
    shortTitle: "קוסמטיקה רפואית",
    description:
      "שגרות ביתיות ומוצרים רפואיים משלימים לתמיכה בתוצאות הקליניקה.",
    eyebrow: "ליווי טיפולי יומיומי",
    intro:
      "קוסמטיקה רפואית אינה רק רשימת מוצרים. זו התאמה של פרוטוקול ביתי שיכול לשמר, לשפר ולהכין את העור לטיפולים בקליניקה.",
    seoTitle: 'קוסמטיקה רפואית | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על קוסמטיקה רפואית: התאמת שגרת בית ומוצרי דגל של המרפאה.",
  services: [
    homeProtocolService,
    clinicFeaturedProductsService
  ],
};
