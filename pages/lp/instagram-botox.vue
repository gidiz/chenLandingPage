<template>
  <div>
    <PageHero
      eyebrow="דף קמפיין"
      title="הגעת מאינסטגרם? בוטוקס במראה טבעי מתחיל באבחון נכון"
      subtitle="שלד ראשון לעמוד לידים ייעודי עם מסר ממוקד, אמון ברור וקריאה לפעולה אחת."
    />

    <section class="page-section">
      <div class="container page-grid">
        <article class="page-card">
          <h2 class="section-title">למה העמוד הזה קיים</h2>
          <p>
            במקום לשלוח קמפיין לדף הבית הכללי, העמוד הזה נועד לחבר בין המסר
            במודעה לבין טופס הלידים, עם תוכן קצר וממוקד יותר.
          </p>
          <ul class="feature-list">
            <li>מסר ישיר שמתאים לתנועה ממומנת</li>
            <li>CTA אחד ברור להשארת פרטים</li>
            <li>אפשרות למדוד ביצועים לפי ערוץ וקמפיין</li>
          </ul>
        </article>

        <article class="page-card page-card--accent">
          <h2>פגישת ייעוץ אישית</h2>
          <p>
            בהמשך אפשר להוסיף לדף הזה לכידת UTM, tracking ייעודי וגרסאות מסר
            שונות לפי קמפיין.
          </p>
          <NuxtLink to="/consultation" class="cta-button">
            להשארת פרטים עכשיו
          </NuxtLink>
        </article>
      </div>
    </section>

    <ContactSection />
  </div>
</template>

<script setup>
useSeoMeta({
  title: "בוטוקס במראה טבעי | דף קמפיין אינסטגרם",
  description:
    "שלד ראשון לדף לידים ממומן בנושא בוטוקס, עם מסר ממוקד ותיאום ייעוץ.",
});
</script>