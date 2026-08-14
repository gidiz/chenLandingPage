<template>
  <div>
    <HeroSection />
    <AboutSection />
    <VideoSection :youtube-urls="clinicVideoUrls" />
    <TreatmentsSection />
    <ContactSection />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { clinicVideoTable } from "../composables/useClinicVideos";

const { data: videoCatalog } = await useFetch("/api/videos", {
  default: () => ({
    source: "static",
    videos: clinicVideoTable,
  }),
});

const clinicVideoUrls = computed(() =>
  (videoCatalog.value?.videos || clinicVideoTable).map((video) => video.url),
);

useSeoMeta({
  title: "ד\"ר חן פרדו | אסתטיקה רפואית וטיפולים בהזעת יתר",
  description:
    "קליניקה לאסתטיקה רפואית בכפר סבא עם דגש על מראה טבעי, טיפולי פנים מתקדמים וטיפולים בהזעת יתר.",
});
</script>