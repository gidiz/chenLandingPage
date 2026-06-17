export const HYPERHIDROSIS_CATEGORY = "hyperhidrosis" as const;

export type HyperhidrosisServiceSlug = "botox-treatment" | "miradry";

export interface HyperhidrosisServiceDefinition {
  slug: HyperhidrosisServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface HyperhidrosisValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { botoxTreatmentService } from "./services/hyperhidrosis.botox-treatment.service";
import { miradryService } from "./services/hyperhidrosis.miradry.service";

export const hyperhidrosisCategory: TreatmentCategory = {
    slug: "hyperhidrosis",
    title: "טיפול בהזעת יתר",
    shortTitle: "הזעת יתר",
    description:
      "עמוד מרכזי לנושא הזעת יתר עם תתי-טיפולים לפי אזור וטכנולוגיה.",
    eyebrow: "תחום ליבה בקליניקה",
    intro:
      "זהו אחד מתחומי החיפוש החזקים ביותר באתר, ולכן נבנה כקטגוריה עצמאית עם דפי עומק ממוקדים לכל פתרון ולכל אזור טיפול.",
    seoTitle: 'טיפול בהזעת יתר | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על טיפול בהזעת יתר: בוטוקס לבית שחי וכפות ידיים, וטכנולוגיית MiraDry לפי התאמה.",
  services: [
    botoxTreatmentService,
    miradryService
  ],
};
