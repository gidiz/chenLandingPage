<template>
  <div>
    <PageHero
      eyebrow="שאלות נפוצות"
      title="תשובות ברורות לפני שמתחילים טיפול"
      subtitle="עמוד מרכזי לשאלות על טיפולים אסתטיים, הזעת יתר, החלמה ותיאום ציפיות."
    />

    <section class="page-section">
      <div class="container faq-preview__items">
        <article v-for="item in faqItems" :key="item.question" class="page-card">
          <h2>{{ item.question }}</h2>
          <p>{{ item.answer }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const faqItems = [
  {
    question: "איך יודעים איזה טיפול מתאים לי?",
    answer:
      "מתחילים באבחון מסודר של מבנה הפנים, איכות העור, אזור הטיפול והמטרה שלך. רק אחר כך בוחרים טיפול.",
  },
  {
    question: "האם כל טיפול דורש זמן החלמה?",
    answer:
      "לא. יש טיפולים עם חזרה מהירה לשגרה ויש כאלה שדורשים מספר ימי התאוששות קלים. לכן חשוב לקבל התאמה אישית מראש.",
  },
  {
    question: "אפשר לשלב כמה טיפולים יחד?",
    answer:
      "במקרים רבים כן, אבל השילוב צריך להיקבע לפי מצב רפואי, מטרה וסדר טיפולים נכון.",
  },
  {
    question: "האם התוצאה תמיד מיידית?",
    answer:
      "תלוי בטיפול. יש טיפולים עם תוצאה מהירה ויש כאלה שהתוצאה נבנית בהדרגה לאורך שבועות.",
  },
];

useSeoMeta({
  title: "שאלות נפוצות על טיפולים אסתטיים והזעת יתר",
  description:
    "FAQ מרכזי על טיפולים אסתטיים, תהליך הטיפול, החלמה והתאמה אישית בקליניקה.",
  ogTitle: "שאלות נפוצות על טיפולים אסתטיים והזעת יתר",
  ogDescription: "FAQ מרכזי על טיפולים אסתטיים, תהליך הטיפול, החלמה והתאמה אישית בקליניקה.",
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/faq",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "שאלות נפוצות על טיפולים אסתטיים והזעת יתר",
  twitterDescription: "FAQ מרכזי על טיפולים אסתטיים, תהליך הטיפול, החלמה והתאמה אישית בקליניקה.",
  canonicalUrl: "https://drchenpardo.co.il/faq",
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'faq-schema',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }),
    },
  ],
})
</script>