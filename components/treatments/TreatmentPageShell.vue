<template>
  <div>
    <PageHero :eyebrow="eyebrow" :title="title" :subtitle="subtitle" />

    <TreatmentInfoSection
      :summary="summary"
      :suitability-lead="suitabilityLead"
      :suitability="suitability"
      :process-lead="processLead"
      :process="process"
      :expectations-lead="expectationsLead"
      :expectations="expectations"
    >
      <template #cta>
        <TreatmentConsultationCta :cta-label="ctaLabel" />
      </template>
    </TreatmentInfoSection>

    <TreatmentFaqSection :short-title="shortTitle" :questions="questions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import TreatmentInfoSection from "./TreatmentInfoSection.vue";
import TreatmentFaqSection from "./TreatmentFaqSection.vue";
import TreatmentConsultationCta from "./TreatmentConsultationCta.vue";

const props = defineProps({
  eyebrow: {
    type: String,
    default: "טיפולים בקליניקה",
  },
  title: {
    type: String,
    required: true,
  },
  shortTitle: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  suitability: {
    type: String,
    required: true,
  },
  process: {
    type: String,
    required: true,
  },
  expectations: {
    type: String,
    required: true,
  },
  ctaLabel: {
    type: String,
    default: "לקביעת פגישת ייעוץ",
  },
  questions: {
    type: Array,
    required: true,
  },
});

const treatmentLabel = computed(() => props.shortTitle || props.title);

const suitabilityLead = computed(
  () =>
    `הערכת התאמה אישית ל${treatmentLabel.value} לפי מצב רפואי, אזור הטיפול והמטרות שלך.`,
);

const processLead = computed(
  () =>
    `שלבי ${treatmentLabel.value} בקליניקה, משך המפגש והנחיות חשובות לפני ואחרי.`,
);

const expectationsLead = computed(
  () =>
    `מתי רואים שינוי אחרי ${treatmentLabel.value}, כמה זמן נשמר האפקט ומה נחשב לתוצאה ריאלית.`,
);
</script>
