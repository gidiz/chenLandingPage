<template>
  <section id="about" class="about-section">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">אודות</h2>
          <p>
            נעים מאוד, שמי ד"ר חן פרדו, בוגרת לימודי רפואה בטכניון שבחיפה.<br />
            לאחר מספר שנים של התמחות בכירורגיה כללית בבי"ח במרכז הארץ, פתחתי
            בעיר ילדותי את הקליניקה שלי המתמחה בטיפולים אסתטיים בדגש על מראה
            טבעי ובטיפולים כנגד הזעת יתר בכל הגוף.<br /><br />
            ה"אני המאמין" שלי תומך בשמירה על מראה טבעי, כזה שמדגיש את היופי של
            כל אחד מאיתנו, מבלי לייצר מראה מזויף.<br />
            בקליניקה שלי אני מציעה כנות, אמינות, שירות מקצועי, הסבר בגובה
            העיניים והכל עם חיוך על הפנים. כמובן שכל זאת תוך כדי שימוש בחומרי
            גלם איכותיים המשלימים את התמונה למלאה.<br /><br />
            בקליניקה תוכלו גם למצוא טיפולים כנגד הזעה בכל הגוף, לרבות בית שחי,
            פנים, מפשעות, כפות ידיים ועוד...<br />
            מוזמנים להגיע לפגישת ייעוץ עמי.
          </p>
        </div>
        <div class="about-image">
          <img src="/assets/about-doctor.jpeg" alt="Dr. Chen Pardo" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background-color: #f9f8f6;
  padding: 4rem 1rem;
  direction: rtl;
  text-align: right;
}

.about-content {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
}

.about-text {
  flex: 1 1 500px;
  font-size: 1.125rem;
  line-height: 2;
  color: #444;
}

.about-image {
  flex: 1 1 400px;
  text-align: center;
}

.about-image img {
  max-width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
</style>
