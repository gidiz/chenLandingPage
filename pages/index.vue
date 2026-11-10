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
const clinicVideoUrls = [
  "https://www.youtube.com/watch?v=UTAWXOtyfa0",
  "https://www.youtube.com/watch?v=RcBWFggZImU",
  "https://www.youtube.com/watch?v=U5uEPOUf16A",
]

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
})
</script>