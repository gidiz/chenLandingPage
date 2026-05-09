<template>
  <section id="treatments" class="treatments-section">
    <div class="container">
      <h2 class="section-title">סוגי טיפולים בקליניקה</h2>
      <ul class="treatment-list">
        <li>טיפול בבוטוקס full face וצוואר</li>
        <li>טיפול בחיוך חושף שיניים ובנעילת לסתות</li>
        <li>טיפול בפציאליס (שיתוק עצב הפנים)</li>
        <li>טיפול בהזעת יתר בכל הגוף</li>
        <li>פיסול ועיצוב פנים מלא בדגש על מראה טבעי</li>
        <li>ביוסטימולטורים(רדיאס, סקולפטרה, הרמוניקה ועוד)</li>
        <li>מכשור רפואי מתקדם לפנים ולגוף</li>
        <li>מורפאוס – טיפול מחליף ניתוח להרמת פנים</li>
        <li>טיפולי פיגמנטציה</li>
        <li>טיפול בבוטוקס למיגרנה</li>
        <li>טיפול להזעה בבית השחי, כפות ידיים, פנים ועוד</li>
        <li>טיפול להזעה באיזורים אינטימיים</li>
        <li>טיפול באקסוזומים</li>
        <li>טיפולי מרקם עור מתקדמים</li>
      </ul>

      <div class="cta">
        <a
          href="#contact"
          class="cta-button"
          @click="trackClick('cta_click', 'hero_consultation_button')"
        >
          לתיאום פגישת ייעוץ
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const { $analytics } = useNuxtApp();

const trackClick = (eventName, clickLocation) => {
  $analytics.trackEvent(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  });
};
</script>
