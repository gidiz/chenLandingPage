export const PROCEDURES_CATEGORY = "procedures" as const;

export type ProceduresServiceSlug =
  | "threads-face-lift"
  | "double-chin-fat-dissolving";

export interface ProceduresServiceDefinition {
  slug: ProceduresServiceSlug;
  title: string;
  description: string;
  enabled: boolean;
}

export interface ProceduresValidationResult {
  valid: boolean;
  errors: string[];
}



import type { TreatmentCategory } from "../types";
import { threadsFaceLiftService } from "./services/procedures.threads-face-lift.service";
import { doubleChinFatDissolvingService } from "./services/procedures.double-chin-fat-dissolving.service";

export const proceduresCategory: TreatmentCategory = {
    slug: "procedures",
    title: "פרוצדורות זעיר-פולשניות",
    shortTitle: "פרוצדורות זעיר-פולשניות",
    description: "טיפולים עם אפקט מבני או מתארי, בלי לעבור ניתוח מלא.",
    eyebrow: "פתרונות זעיר-פולשניים",
    intro:
      "כאן מרוכזים טיפולים שמטרתם לייצר שינוי מבני או אסתטי ממוקד באמצעות פרוצדורות זעיר-פולשניות, לאחר בחינת התאמה וציפיות באופן מדויק.",
    seoTitle: 'פרוצדורות זעיר-פולשניות | ד"ר חן פרדו',
    seoDescription:
      "עמוד מרכזי על פרוצדורות זעיר-פולשניות: מתיחת פנים בחוטים והמסת שומן בסנטר.",
  services: [
    threadsFaceLiftService,
    doubleChinFatDissolvingService
  ],
};
