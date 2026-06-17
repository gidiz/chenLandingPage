export const TECHNOLOGY_CATEGORY = "technology" as const;

export type TechnologyServiceSlug =
  | "laser-hair-removal"
  | "rf-microneedling"
  | "pigmentation-sun-spots";

export interface TechnologyServiceDefinition {
  slug: TechnologyServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface TechnologyValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { laserHairRemovalService } from "./services/technology.laser-hair-removal.service";
import { rfMicroneedlingService } from "./services/technology.rf-microneedling.service";
import { pigmentationSunSpotsService } from "./services/technology.pigmentation-sun-spots.service";

export const technologyCategory: TreatmentCategory = {
    slug: "technology",
    title: "מכשור טכנולוגי ואנרגיה",
    shortTitle: "טכנולוגיה ואנרגיה",
    description: "טיפולים מבוססי אנרגיה לשיפור עור, שיער, מרקם ופיגמנטציה.",
    eyebrow: "טיפולים מבוססי מכשור",
    intro:
      "טיפולים מבוססי אנרגיה ומכשור מתקדמים יכולים לתת מענה ממוקד למיצוק, מרקם, פיגמנטציה והסרת שיער, כחלק מתוכנית טיפול מסודרת.",
    seoTitle: 'מכשור טכנולוגי ואנרגיה | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על טיפולי מכשור ואנרגיה: הסרת שיער בלייזר, מיקרונידלינג RF וטיפולי פיגמנטציה.",
  services: [
    laserHairRemovalService,
    rfMicroneedlingService,
    pigmentationSunSpotsService
  ],
};
