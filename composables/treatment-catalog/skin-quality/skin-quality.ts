export const SKIN_QUALITY_CATEGORY = "skin-quality" as const;

export type SkinQualityServiceSlug =
  | "skinboosters"
  | "prp-exosomes"
  | "medical-peeling";

export interface SkinQualityServiceDefinition {
  slug: SkinQualityServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface SkinQualityValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { skinboostersService } from "./services/skin-quality.skinboosters.service";
import { prpExosomesService } from "./services/skin-quality.prp-exosomes.service";
import { medicalPeelingService } from "./services/skin-quality.medical-peeling.service";

export const skinQualityCategory: TreatmentCategory = {
    slug: "skin-quality",
    title: "איכות העור והתחדשות",
    shortTitle: "איכות העור",
    description: "טיפולים לשיפור לחות, זוהר, מרקם והתחדשות ביולוגית של העור.",
    eyebrow: "חיזוק איכות העור",
    intro:
      "קטגוריה זו מיועדת למטופלות שמחפשות לשפר איכות עור, לחות, מרקם וחיוניות, לעיתים כחלק מתוכנית שיקום כוללת ולא כטיפול נקודתי בלבד.",
    seoTitle: 'איכות העור והתחדשות | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על טיפולים לשיפור איכות העור: סקינבוסטרס, PRP או אקסוזומים ופילינג רפואי.",
  services: [
    skinboostersService,
    prpExosomesService,
    medicalPeelingService
  ],
};
