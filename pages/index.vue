<template>
  <div>
    <HeroSection />
    <AboutSection />
    <VideoSection :youtube-urls="clinicVideoUrls" />
    <TreatmentsSection />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
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
  ogTitle: "ד\"ר חן פרדו | אסתטיקה רפואית וטיפולים בהזעת יתר",
  ogDescription: "קליניקה לאסתטיקה רפואית בכפר סבא עם דגש על מראה טבעי, טיפולי פנים מתקדמים וטיפולים בהזעת יתר.",
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "ד\"ר חן פרדו | אסתטיקה רפואית וטיפולים בהזעת יתר",
  twitterDescription: "קליניקה לאסתטיקה רפואית בכפר סבא עם דגש על מראה טבעי, טיפולי פנים מתקדמים וטיפולים בהזעת יתר.",
  canonicalUrl: "https://drchenpardo.co.il/",
})
</script>