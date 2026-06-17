export const INJECTABLES_CATEGORY = "injectables" as const;

export type InjectablesServiceSlug =
  | "botox-expression-lines"
  | "lip-design"
  | "jawline-cheeks"
  | "biostimulators";

export interface InjectablesServiceDefinition {
  slug: InjectablesServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface InjectablesValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { botoxExpressionLinesService } from "./services/injectables.botox-expression-lines.service";
import { lipDesignService } from "./services/injectables.lip-design.service";
import { jawlineCheeksService } from "./services/injectables.jawline-cheeks.service";
import { biostimulatorsService } from "./services/injectables.biostimulators.service";

export const injectablesCategory: TreatmentCategory = {
    slug: "injectables",
    title: "הזרקות ופיסול פנים",
    shortTitle: "הזרקות ופיסול פנים",
    description:
      "טיפולי הזרקה מדויקים לשיפור פרופורציות, ריכוך קמטים ושמירה על מראה טבעי.",
    eyebrow: "טיפולי הזרקה מתקדמים",
    intro:
      "קטגוריה זו מרכזת טיפולי הזרקה ופיסול פנים שמבוססים על אבחון מדויק, היכרות עם האנטומיה ותכנון טבעי שמכבד את מבנה הפנים.",
    seoTitle: 'הזרקות ופיסול פנים | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על הזרקות ופיסול פנים: בוטוקס, שפתיים, קו לסת, לחיים וביו-סטימולטורים בהתאמה רפואית.",
  services: [
    botoxExpressionLinesService,
    lipDesignService,
    jawlineCheeksService,
    biostimulatorsService
  ],
};
