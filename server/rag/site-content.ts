export type SiteContentChunkSeed = {
  sourceId: string
  pagePath: string
  sectionType: string
  sectionKey: string
  displayOrder: number
  text: string
}

export const siteContentChunkSeeds: SiteContentChunkSeed[] = [
  {
    sourceId: "home-hero",
    pagePath: "/",
    sectionType: "site_page",
    sectionKey: "hero",
    displayOrder: 10,
    text: "ד\"ר חן פרדו. קליניקה לאסתטיקה רפואית וטיפולים כנגד הזעת יתר בכל הגוף.",
  },
  {
    sourceId: "home-about-section",
    pagePath: "/",
    sectionType: "site_page",
    sectionKey: "about_section",
    displayOrder: 20,
    text: "אודות. נעים מאוד, שמי ד\"ר חן פרדו, בוגרת לימודי רפואה בטכניון שבחיפה. לאחר מספר שנים של התמחות בכירורגיה כללית בבי\"ח במרכז הארץ, פתחתי בעיר ילדותי את הקליניקה שלי המתמחה בטיפולים אסתטיים בדגש על מראה טבעי ובטיפולים כנגד הזעת יתר בכל הגוף. האני המאמין שלי תומך בשמירה על מראה טבעי, כזה שמדגיש את היופי של כל אחד מאיתנו, מבלי לייצר מראה מזויף. בקליניקה שלי אני מציעה כנות, אמינות, שירות מקצועי, הסבר בגובה העיניים והכל עם חיוך על הפנים. בקליניקה תוכלו גם למצוא טיפולים כנגד הזעה בכל הגוף, לרבות בית שחי, פנים, מפשעות, כפות ידיים ועוד. מוזמנים להגיע לפגישת ייעוץ עמי.",
  },
  {
    sourceId: "home-contact-section",
    pagePath: "/",
    sectionType: "site_page",
    sectionKey: "contact_section",
    displayOrder: 30,
    text: "יצירת קשר. אפשר להשאיר פרטים בטופס, להתקשר למספר 054-757-7214 או להגיע לכתובת התעש 20, כפר סבא.",
  },
  {
    sourceId: "about-page-hero",
    pagePath: "/about",
    sectionType: "site_page",
    sectionKey: "page_hero",
    displayOrder: 40,
    text: "אודות הקליניקה. ד\"ר חן פרדו. גישה רפואית, מראה טבעי וליווי אישי משלב הייעוץ ועד לתוצאה.",
  },
  {
    sourceId: "about-page-why",
    pagePath: "/about",
    sectionType: "site_page",
    sectionKey: "why_patients_choose_me",
    displayOrder: 50,
    text: "למה מטופלות מגיעות אליי. השילוב בין רקע רפואי, אבחון מדויק וגישה שמרנית מאפשר לבנות תוכנית טיפול שמתאימה לאדם ולא רק לטרנד. המטרה היא תוצאה טבעית, בטוחה, כזו שנראית טוב גם ברגע שאחרי וגם חודשים קדימה.",
  },
  {
    sourceId: "faq-page-hero",
    pagePath: "/faq",
    sectionType: "site_page",
    sectionKey: "page_hero",
    displayOrder: 60,
    text: "שאלות נפוצות. תשובות ברורות לפני שמתחילים טיפול. עמוד מרכזי לשאלות על טיפולים אסתטיים, הזעת יתר, החלמה ותיאום ציפיות.",
  },
  {
    sourceId: "faq-page-items",
    pagePath: "/faq",
    sectionType: "site_page",
    sectionKey: "faq_items",
    displayOrder: 70,
    text: "איך יודעים איזה טיפול מתאים לי? מתחילים באבחון מסודר של מבנה הפנים, איכות העור, אזור הטיפול והמטרה שלך. רק אחר כך בוחרים טיפול. האם כל טיפול דורש זמן החלמה? לא. יש טיפולים עם חזרה מהירה לשגרה ויש כאלה שדורשים מספר ימי התאוששות קלים. אפשר לשלב כמה טיפולים יחד? במקרים רבים כן, אבל השילוב צריך להיקבע לפי מצב רפואי, מטרה וסדר טיפולים נכון. האם התוצאה תמיד מיידית? תלוי בטיפול. יש טיפולים עם תוצאה מהירה ויש כאלה שהתוצאה נבנית בהדרגה לאורך שבועות.",
  },
  {
    sourceId: "contact-page-hero",
    pagePath: "/contact",
    sectionType: "site_page",
    sectionKey: "page_hero",
    displayOrder: 80,
    text: "יצירת קשר. תיאום ייעוץ או קבלת פרטים. אפשר להשאיר פרטים בטופס, להתקשר או לעבור לוואטסאפ.",
  },
  {
    sourceId: "consultation-page-hero",
    pagePath: "/consultation",
    sectionType: "site_page",
    sectionKey: "page_hero",
    displayOrder: 90,
    text: "פגישת ייעוץ. בואי נבנה יחד את הטיפול המתאים. עמוד ייעודי ללידים עם מסר ברור, טופס קצר וקריאה לפעולה אחת.",
  },
  {
    sourceId: "consultation-page-benefits",
    pagePath: "/consultation",
    sectionType: "site_page",
    sectionKey: "consultation_benefits",
    displayOrder: 100,
    text: "מה מקבלים בפגישת הייעוץ. אבחון ראשוני והבנת המטרה האסתטית או הרפואית. הסבר ברור על אפשרויות טיפול והתאמה אישית. ציפיות ריאליות, תהליך החלמה ותכנון המשך.",
  },
  {
    sourceId: "consultation-page-lead-copy",
    pagePath: "/consultation",
    sectionType: "site_page",
    sectionKey: "lead_copy",
    displayOrder: 110,
    text: "השאירי פרטים ונחזור אלייך. הדף הזה נועד לקמפיינים ולתנועה ממוקדת, ולכן הוא שומר על מסלול קצר וברור עד להשארת ליד.",
  },
  {
    sourceId: "treatments-page-hero",
    pagePath: "/treatments",
    sectionType: "site_page",
    sectionKey: "page_hero",
    displayOrder: 120,
    text: "מפת טיפולים. קטגוריות הטיפול בקליניקה. עמוד מרכזי שמרכז את כל תחומי הטיפול ומוביל לדפי קטגוריה ולדפי שירות מדויקים יותר.",
  },
  {
    sourceId: "treatments-page-structure",
    pagePath: "/treatments",
    sectionType: "site_page",
    sectionKey: "content_structure",
    displayOrder: 130,
    text: "למה המבנה החדש חשוב. במקום רשימה שטוחה של טיפולים בודדים, האתר בנוי עכשיו כעץ תוכן: דפי קטגוריה רחבים ודפי שירות ממוקדים. זה מחזק גם את ה-SEO וגם את היכולת של מטופלות להגיע בדיוק למה שהן מחפשות. ניווט ברור יותר. כל תחום טיפול מרוכז תחת קטגוריה אחת עם תתי-טיפולים רלוונטיים. קישורים פנימיים חזקים יותר. דפי הקטגוריה מובילים לדפי השירות, והם חוזרים חזרה למבנה ההיררכי. הזעת יתר כתחום ליבה. נבנה כעמוד מרכזי עצמאי עם תתי-דפים, בהתאם לפוטנציאל החיפוש הגבוה שלו.",
  },
  {
    sourceId: "site-footer-brand",
    pagePath: "/",
    sectionType: "site_shared",
    sectionKey: "footer_brand",
    displayOrder: 140,
    text: "ד\"ר חן פרדו. אסתטיקה רפואית, מראה טבעי וטיפולים מתקדמים בהזעת יתר.",
  },
  {
    sourceId: "site-footer-contact",
    pagePath: "/",
    sectionType: "site_shared",
    sectionKey: "footer_contact",
    displayOrder: 150,
    text: "פרטי קשר. התעש 20, כפר סבא. טלפון 054-757-7214. וואטסאפ למספר 972547577214.",
  },
]
