-- Apply the clinic's revised copy for six botox services.
-- Source: clinic notes, 2026-11-03. Empty incoming values mean "keep the existing column value".
-- Note: suitability is overwritten in full, which intentionally drops the merged intro paragraph
-- for bruxism-jaw, botox-neck and gummy-smile.

update treatment_services s
set
  suitability  = coalesce(nullif(v.suitability, ''), s.suitability),
  process      = coalesce(nullif(v.process, ''), s.process),
  expectations = coalesce(nullif(v.expectations, ''), s.expectations)
from (
  values
    (
      'bruxism-jaw',
      '<p>מתאים למי שחורקת שיניים בלילה, מתעוררת עם לסת תפוסה או עם כאב ראש, שוחקת סתימות, או מעוניינת בעידון של לסת רחבה. מומלץ בתיאום עם רופא השיניים המטפל.</p>',
      '',
      '<p>ההקלה על הכאב מורגשת לרוב תוך חודש. משך ההשפעה ארוך יחסית ומגיע לארבעה עד שישה חודשים. בימים הראשונים ייתכנה תחושת עייפות קלה בלעיסה.</p>'
    ),
    (
      'botox-upper-face',
      '',
      '<p>הפגישה נפתחת באבחון של דפוסי ההבעה: תתבקשי להרים גבות, לכווץ ולחייך כדי למפות את השרירים הדומיננטיים. לאחר מכן מתבצעת הזרקה בכמה נקודות קטנות עם מחט דקה במיוחד (לרגישים - ניתן לבצע אלחוש מקומי טרם הטיפול). הטיפול עצמו נמשך כעשר עד חמש עשרה דקות וניתן לחזור מיד לשגרה.</p>',
      '<p>ההשפעה מתחילה להיות מורגשת לאחר שלושה עד חמישה ימים ומגיעה לשיאה בתוך כשבועיים. מומלץ להימנע מספורט ב-24 שעות לאחר הטיפול ומעיסוי איזור ההזרקה בימים שלאחריה. בפגישת מעקב אפשר לכוון את המינון בהתאם לתגובה.</p>'
    ),
    (
      'glowtox',
      '',
      '<p>לאחר ניקוי והרדמה מקומית במשחה מתבצעת הזרקה של עשרות נקודות זעירות בשכבה השטחית של העור. משך הפגישה עד חצי שעה.</p>',
      ''
    ),
    (
      'botox-neck',
      '<p>מתאים למי שרואה רצועות בולטות בצוואר במיוחד בזמן דיבור, ולמי שמוטרדת מהמעבר בין קו הלסת לצוואר. פחות יעיל כשיש עודף עור משמעותי, ואז מומלץ לשלב טיפול מיצוק.</p>',
      '',
      ''
    ),
    (
      'botox-full-face',
      '',
      '<p>הפגישה מתחילה במיפוי מלא של הפנים ובצילום מצב פתיחה. בהמשך מתבצעת הזרקה מדורגת לפי אזורים, עם התאמת מינון לכל שריר. משך הפגישה כחצי שעה.</p>',
      '<p>התוצאה המלאה מתגבשת תוך כשבועיים ומחזיקה בממוצע ארבעה חודשים. פגישת מעקב כשבועיים לאחר הטיפול היא חלק בלתי נפרד מהתהליך.</p>'
    ),
    (
      'gummy-smile',
      '<p>גאמי סמייל הוא מצב בו החניכיים נחשפות ביתר בזמן החיוך. הטיפול מתאים למטופלים שחשים פגיעה באסתטיקה ובביטחון העצמי סביב פעולות החיוך בחברה.</p>',
      '<p>בבדיקה מאותרות נקודות ההזרקה בבסיס האף. ההזרקה אורכת דקות ספורות.</p>',
      '<p>השינוי מורגש תוך שלושה עד שבעה ימים ונמשך כשלושה עד ארבעה חודשים. דיוק המינון קריטי, ולכן מתחילים תמיד בכמות שמרנית.</p>'
    )
) as v(service_slug, suitability, process, expectations)
join treatment_categories c on c.slug = 'botox'
where s.category_id = c.id
  and s.slug = v.service_slug;

-- Normalize the remaining plain-text fields so every service renders as HTML paragraphs.
update treatment_services
set process = '<p>' || trim(process) || '</p>'
where trim(coalesce(process, '')) <> ''
  and process not like '<p>%';

update treatment_services
set expectations = '<p>' || trim(expectations) || '</p>'
where trim(coalesce(expectations, '')) <> ''
  and expectations not like '<p>%';
