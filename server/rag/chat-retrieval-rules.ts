export type ChatRetrievalRule = {
  name: string
  matches: readonly string[]
  sourceIds?: readonly string[]
  categorySlug?: string
  promptHint: string
  similarityBase: number
  maxCategoryChunks?: number
}

export const chatRetrievalRules: readonly ChatRetrievalRule[] = [
  {
    name: "profile",
    matches: ["חן פרדו", 'ד"ר חן', "מי זאת", "מי זה", "אודות"],
    sourceIds: ["home-about-section", "about-page-hero", "about-page-why"],
    promptHint:
      "אם השאלה היא מי זאת ד\"ר חן פרדו או שאלה ביוגרפית עליה, תני עדיפות מפורשת לחלקי אודות, רקע רפואי, לימודים, התמחות וגישה טיפולית שמופיעים ב-CONTEXT.",
    similarityBase: 1,
  },
  {
    name: "location",
    matches: ["איפה", "כתובת", "נמצאת", "נמצא", "נמאת", "מיקום", "קליניקה", "טלפון", "יצירת קשר"],
    sourceIds: ["home-contact-section", "contact-page-hero", "site-footer-contact"],
    promptHint:
      "אם השאלה היא על מיקום הקליניקה, כתובת, טלפון או יצירת קשר, תני עדיפות מפורשת לפרטי הקשר והכתובת שמופיעים ב-CONTEXT.",
    similarityBase: 0.99,
  },
  {
    name: "consultation",
    matches: ["ייעוץ", "יעוץ", "פגישת ייעוץ", "פגישה", "לקבוע", "קביעת", "לתאם", "תיאום"],
    sourceIds: [
      "consultation-page-hero",
      "consultation-page-benefits",
      "consultation-page-lead-copy",
      "home-contact-section",
      "site-footer-contact",
    ],
    promptHint:
      "אם השאלה היא על פגישת ייעוץ, קביעת תור או תיאום, תני עדיפות מפורשת לתכני consultation ו-contact מתוך CONTEXT.",
    similarityBase: 0.98,
  },
  {
    name: "hyperhidrosis",
    matches: ["הזעת", "זיעה", "זעת יתר", "בית שחי", "כפות ידיים", "מיראדרי", "miradry", "בוטוקס להזעת"],
    categorySlug: "hyperhidrosis",
    maxCategoryChunks: 8,
    promptHint:
      "אם השאלה היא על הזעת יתר, בוטוקס להזעת יתר, MiraDry או אזורי הזעה, תני עדיפות מפורשת לתכנים של hyperhidrosis מתוך CONTEXT.",
    similarityBase: 0.97,
  },
]

export const basePromptHints: readonly string[] = [
  "השתמשי קודם כל במידע שסופק מהאתר תחת CONTEXT.",
  "אם השאלה מתייחסת לד\"ר חן פרדו, לקליניקה, לטיפולים, לעמודים באתר או לפרטי קשר, אל תמציאי מידע שלא מופיע ב-CONTEXT.",
  "אם המידע לא מופיע ב-CONTEXT, אמרי במפורש שהמידע לא מופיע באתר כרגע.",
  "אם יש סימפטומים רפואיים חריגים או דחופים, המליצי לפנות לבדיקה רפואית.",
]
