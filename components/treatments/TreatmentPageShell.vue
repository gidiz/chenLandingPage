<template>
  <div>
    <PageHero :eyebrow="eyebrow" :title="title" :subtitle="subtitle" />

    <TreatmentInfoSection
      :suitability="suitability"
      :process="process"
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
import TreatmentInfoSection from "./TreatmentInfoSection.vue";
import TreatmentFaqSection from "./TreatmentFaqSection.vue";
import TreatmentConsultationCta from "./TreatmentConsultationCta.vue";

defineProps({
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
</script>
