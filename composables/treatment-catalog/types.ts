export type TreatmentQuestion = {
  title: string;
  answer: string;
};

export type TreatmentService = {
  slug: string;
  title: string;
  shortTitle: string;
  navTitle: string;
  description: string;
  summary: string;
  suitability: string;
  process: string;
  expectations: string;
  ctaLabel: string;
  seoTitle: string;
  seoDescription: string;
  questions: TreatmentQuestion[];
};

export type TreatmentCategory = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  services: TreatmentService[];
};
