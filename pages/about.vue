<template>
  <div>
    <PageHero
      eyebrow="אודות הקליניקה"
      title='ד"ר חן פרדו'
      subtitle="גישה רפואית, מראה טבעי וליווי אישי משלב הייעוץ ועד לתוצאה."
    />
    <AboutSection />
    <section class="page-section">
      <div class="container page-card">
        <h2 class="section-title">למה מטופלות מגיעות אליי</h2>
        <p>
          השילוב בין רקע רפואי, אבחון מדויק וגישה שמרנית מאפשר לבנות תוכנית
          טיפול שמתאימה לאדם ולא רק לטרנד. המטרה היא תוצאה טבעית, בטוחה,
          כזו שנראית טוב גם ברגע שאחרי וגם חודשים קדימה.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "אודות ד\"ר חן פרדו | אסתטיקה רפואית בכפר סבא",
  description:
    "הכירו את ד\"ר חן פרדו, הגישה הטיפולית בקליניקה והדגש על טיפולים אסתטיים במראה טבעי.",
  ogTitle: "אודות ד\"ר חן פרדו | אסתטיקה רפואית בכפר סבא",
  ogDescription: "הכירו את ד\"ר חן פרדו, הגישה הטיפולית בקליניקה ואת הפילוסופיה של טיפול אסתטי רפואי בכפר סבא.",
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/about",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "אודות ד\"ר חן פרדו | אסתטיקה רפואית בכפר סבא",
  twitterDescription: "הכירו את ד\"ר חן פרדו, הגישה הטיפולית בקליניקה ואת הפילוסופיה של טיפול אסתטי רפואי בכפר סבא.",
  canonicalUrl: "https://drchenpardo.co.il/about",
})
</script>