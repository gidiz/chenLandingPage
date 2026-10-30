import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { createConsola } from "consola"

const logger = createConsola({ tag: "chen-chunks" })

const EMBEDDING_BATCH_SIZE = 64

type ChunkRow = {
  category_id: string | null
  service_id: string | null
  question_id: string | null
  category_slug: string | null
  service_slug: string | null
  section_type: string
  section_key: string
  source_table: string
  source_id: string
  page_path: string | null
  content_text: string
  display_order: number
  embedding?: string
}

// `.env.local` first so values pulled with `vercel env pull` win over `.env`.
const loadDotEnvFiles = (): void => {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = resolve(process.cwd(), fileName)

    if (!existsSync(envPath)) {
      continue
    }

    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const delimiterIndex = trimmed.indexOf("=")

      if (delimiterIndex <= 0) {
        continue
      }

      const key = trimmed.slice(0, delimiterIndex).trim()
      let value = trimmed.slice(delimiterIndex + 1).trim()

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

const envFirst = (...names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name]

    if (value && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

// Static page copy that the retrieval rules in server/rag/chat-retrieval-rules.ts expect by source_id.
const siteContentChunks: readonly Omit<ChunkRow, "embedding">[] = [
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "about",
    section_key: "body",
    source_table: "site_content",
    source_id: "home-about-section",
    page_path: "/",
    content_text:
      'נעים מאוד, שמי ד"ר חן פרדו, בוגרת לימודי רפואה בטכניון שבחיפה. לאחר מספר שנים של התמחות בכירורגיה כללית בבית חולים במרכז הארץ, פתחתי בעיר ילדותי את הקליניקה שלי המתמחה בטיפולים אסתטיים בדגש על מראה טבעי ובטיפולים כנגד הזעת יתר בכל הגוף. האני מאמין שלי תומך בשמירה על מראה טבעי, כזה שמדגיש את היופי של כל אחד מאיתנו, מבלי לייצר מראה מזויף. בקליניקה שלי אני מציעה כנות, אמינות, שירות מקצועי והסבר בגובה העיניים, תוך שימוש בחומרי גלם איכותיים. בקליניקה תוכלו גם למצוא טיפולים כנגד הזעה בכל הגוף, לרבות בית שחי, פנים, מפשעות וכפות ידיים.',
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "about",
    section_key: "hero",
    source_table: "site_content",
    source_id: "about-page-hero",
    page_path: "/about",
    content_text:
      'אודות הקליניקה: ד"ר חן פרדו. גישה רפואית, מראה טבעי וליווי אישי משלב הייעוץ ועד לתוצאה. הקליניקה נמצאת בכפר סבא ומתמחה באסתטיקה רפואית ובטיפולי הזעת יתר.',
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "about",
    section_key: "why",
    source_table: "site_content",
    source_id: "about-page-why",
    page_path: "/about",
    content_text:
      "למה מטופלות מגיעות אליי: השילוב בין רקע רפואי, אבחון מדויק וגישה שמרנית מאפשר לבנות תוכנית טיפול שמתאימה לאדם ולא רק לטרנד. המטרה היא תוצאה טבעית ובטוחה, כזו שנראית טוב גם ברגע שאחרי וגם חודשים קדימה.",
    display_order: 1,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "contact",
    section_key: "details",
    source_table: "site_content",
    source_id: "home-contact-section",
    page_path: "/",
    content_text:
      'יצירת קשר עם הקליניקה של ד"ר חן פרדו. כתובת: התע"ש 20, כפר סבא. טלפון: 054-757-7214. אפשר גם להשאיר פרטים בטופס יצירת הקשר באתר ונחזור אליכם.',
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "contact",
    section_key: "hero",
    source_table: "site_content",
    source_id: "contact-page-hero",
    page_path: "/contact",
    content_text:
      'יצירת קשר: תיאום ייעוץ או קבלת פרטים. אפשר להשאיר פרטים בטופס, להתקשר לטלפון 054-757-7214 או לעבור לוואטסאפ. הקליניקה בכתובת התע"ש 20, כפר סבא.',
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "contact",
    section_key: "footer",
    source_table: "site_content",
    source_id: "site-footer-contact",
    page_path: "/",
    content_text:
      'ד"ר חן פרדו - אסתטיקה רפואית, מראה טבעי וטיפולים מתקדמים בהזעת יתר. כתובת הקליניקה: התע"ש 20, כפר סבא. טלפון: 054-757-7214. WhatsApp: https://wa.me/972547577214',
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "consultation",
    section_key: "hero",
    source_table: "site_content",
    source_id: "consultation-page-hero",
    page_path: "/consultation",
    content_text:
      "פגישת ייעוץ: בואי נבנה יחד את הטיפול המתאים. בפגישת הייעוץ בונים תוכנית טיפול אישית לפי המטרה שלך, ואפשר לתאם אותה דרך הטופס באתר או בטלפון.",
    display_order: 0,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "consultation",
    section_key: "benefits",
    source_table: "site_content",
    source_id: "consultation-page-benefits",
    page_path: "/consultation",
    content_text:
      "מה מקבלים בפגישת הייעוץ: אבחון ראשוני והבנת המטרה האסתטית או הרפואית; הסבר ברור על אפשרויות הטיפול והתאמה אישית; ציפיות ריאליות, הסבר על תהליך ההחלמה ותכנון המשך.",
    display_order: 1,
  },
  {
    category_id: null,
    service_id: null,
    question_id: null,
    category_slug: null,
    service_slug: null,
    section_type: "consultation",
    section_key: "lead-copy",
    source_table: "site_content",
    source_id: "consultation-page-lead-copy",
    page_path: "/consultation",
    content_text:
      "השאירי פרטים ונחזור אלייך. אפשר לתאם פגישת ייעוץ בקליניקה בכפר סבא דרך הטופס באתר, בטלפון 054-757-7214 או בוואטסאפ.",
    display_order: 2,
  },
]

const buildCatalogChunks = (
  categories: readonly Record<string, string>[],
  services: readonly Record<string, string>[],
  questions: readonly Record<string, string>[],
): ChunkRow[] => {
  const categoryById = new Map(categories.map((row) => [row.id, row]))
  const serviceById = new Map(services.map((row) => [row.id, row]))
  const chunks: ChunkRow[] = []

  for (const category of categories) {
    const sections: readonly [string, string][] = [
      ["description", category.description],
      ["intro", category.intro],
    ]

    sections.forEach(([key, text], index) => {
      if (!text?.trim()) return

      chunks.push({
        category_id: category.id,
        service_id: null,
        question_id: null,
        category_slug: category.slug,
        service_slug: null,
        section_type: "category",
        section_key: key,
        source_table: "treatment_categories",
        source_id: category.id,
        page_path: `/${category.slug}`,
        content_text: `${category.title}: ${text}`,
        display_order: index,
      })
    })
  }

  for (const service of services) {
    const category = categoryById.get(service.category_id)

    if (!category) continue

    const sections: readonly [string, string, string][] = [
      ["description", "תיאור", service.description],
      ["suitability", "למי הטיפול מתאים", service.suitability],
      ["process", "מהלך הטיפול", service.process],
      ["expectations", "למה לצפות אחרי הטיפול", service.expectations],
    ]

    sections.forEach(([key, label, text], index) => {
      if (!text?.trim()) return

      chunks.push({
        category_id: category.id,
        service_id: service.id,
        question_id: null,
        category_slug: category.slug,
        service_slug: service.slug,
        section_type: "service",
        section_key: key,
        source_table: "treatment_services",
        source_id: service.id,
        page_path: `/${category.slug}/${service.slug}`,
        content_text: `${service.title} (${category.title}) - ${label}: ${text}`,
        display_order: index,
      })
    })
  }

  for (const question of questions) {
    const service = serviceById.get(question.service_id)
    const category = service ? categoryById.get(service.category_id) : undefined

    if (!service || !category || !question.answer?.trim()) continue

    chunks.push({
      category_id: category.id,
      service_id: service.id,
      question_id: question.id,
      category_slug: category.slug,
      service_slug: service.slug,
      section_type: "faq",
      section_key: `question-${question.display_order}`,
      source_table: "treatment_questions",
      source_id: question.id,
      page_path: `/${category.slug}/${service.slug}`,
      content_text: `${service.title} - ${question.title} ${question.answer}`,
      display_order: Number(question.display_order) || 0,
    })
  }

  return chunks
}

const embedBatch = async (
  apiKey: string,
  model: string,
  inputs: readonly string[],
): Promise<number[][]> => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: inputs }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI embeddings failed: ${response.status} ${await response.text()}`)
  }

  const payload = (await response.json()) as { data?: { embedding?: number[] }[] }
  const vectors = payload.data?.map((item) => item.embedding ?? [])

  if (!vectors || vectors.length !== inputs.length) {
    throw new Error("OpenAI embeddings returned an unexpected payload")
  }

  return vectors
}

const run = async (): Promise<void> => {
  loadDotEnvFiles()

  const supabaseUrl = envFirst("SUPABASE_URL", "NUXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = envFirst(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
    "NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  )
  const openAiKey = envFirst("RAG_OPENAI_API_KEY", "OPENAI_API_KEY")
  const embeddingModel = envFirst("RAG_OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small"

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase config. Set SUPABASE_URL and a Supabase key in .env")
  }

  if (!openAiKey) {
    throw new Error("Missing OpenAI key. Set RAG_OPENAI_API_KEY in .env")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const [categoriesResult, servicesResult, questionsResult] = await Promise.all([
    supabase.from("treatment_categories").select("*").order("display_order"),
    supabase.from("treatment_services").select("*").order("display_order"),
    supabase.from("treatment_questions").select("*").order("display_order"),
  ])

  for (const result of [categoriesResult, servicesResult, questionsResult]) {
    if (result.error) {
      throw new Error(`Supabase read failed: ${result.error.message}`)
    }
  }

  const chunks: ChunkRow[] = [
    ...buildCatalogChunks(
      (categoriesResult.data ?? []) as Record<string, string>[],
      (servicesResult.data ?? []) as Record<string, string>[],
      (questionsResult.data ?? []) as Record<string, string>[],
    ),
    ...siteContentChunks.map((chunk): ChunkRow => ({ ...chunk })),
  ]

  if (!chunks.length) {
    logger.warn("no_chunks_built", { hint: "Seed the treatment catalog first" })
    return
  }

  logger.info("embedding_chunks", { count: chunks.length, model: embeddingModel })

  for (let index = 0; index < chunks.length; index += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(index, index + EMBEDDING_BATCH_SIZE)
    const vectors = await embedBatch(
      openAiKey,
      embeddingModel,
      batch.map((chunk) => chunk.content_text),
    )

    batch.forEach((chunk, batchIndex) => {
      chunk.embedding = `[${vectors[batchIndex].join(",")}]`
    })
  }

  const { error } = await supabase
    .from("treatment_content_chunks")
    .upsert(chunks, { onConflict: "source_table,source_id,section_key" })

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`)
  }

  logger.success(`Backfilled ${chunks.length} content chunks`)
}

run().catch((error: unknown) => {
  logger.error("backfill_failed", { message: error instanceof Error ? error.message : "Unknown error" })
  process.exit(1)
})
