import { createClient } from "@supabase/supabase-js"
import postgres from "postgres"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { treatmentCategories } from "../../composables/treatment-catalog"
import { siteContentChunkSeeds } from "./site-content"

type ScriptOptions = {
  dryRun: boolean
  skipEmbeddings: boolean
  batchSize: number
}

type CategoryRow = {
  slug: string
  title: string
  short_title: string
  description: string
  eyebrow: string
  intro: string
  seo_title: string
  seo_description: string
  display_order: number
}

type ServiceRow = {
  category_id: string
  slug: string
  title: string
  short_title: string
  nav_title: string
  description: string
  short_description: string
  summary: string
  suitability: string
  process: string
  expectations: string
  cta_label: string
  seo_title: string
  seo_description: string
  display_order: number
}

type QuestionRow = {
  service_id: string
  title: string
  answer: string
  display_order: number
}

type ChunkDraft = {
  categorySlug: string
  serviceSlug: string
  sectionType: string
  sectionKey: string
  displayOrder: number
  sourceTable: "treatment_services" | "treatment_questions"
  sourceDisplayOrder?: number
  text: string
  html?: string
}

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
  content_html: string | null
  display_order: number
}

type CategoryRef = { id: string; slug: string }
type ServiceRef = { id: string; category_id: string; slug: string }
type QuestionRef = { id: string; service_id: string; display_order: number }
type ChunkRecord = { id: string; content_text: string }

type EmbeddingResponse = {
  data?: Array<{
    embedding?: number[]
  }>
}

type CatalogDb = {
  upsertCategories: (rows: CategoryRow[]) => Promise<CategoryRef[]>
  upsertServices: (rows: ServiceRow[]) => Promise<ServiceRef[]>
  upsertQuestions: (rows: QuestionRow[]) => Promise<QuestionRef[]>
  upsertChunks: (rows: ChunkRow[]) => Promise<void>
  listChunksForEmbedding: () => Promise<ChunkRecord[]>
  updateChunkEmbedding: (id: string, embedding: readonly number[]) => Promise<void>
  close: () => Promise<void>
}

const loadDotEnvIfPresent = (): void => {
  const envPath = resolve(process.cwd(), ".env")

  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, "utf8")
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
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

const envFirst = (...names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name]

    if (value && value.trim()) {
      return value
    }
  }

  return undefined
}

const parseOptions = (argv: readonly string[]): ScriptOptions => {
  const batchArg = argv.find((arg) => arg.startsWith("--batch-size="))
  const parsedBatch = batchArg ? Number(batchArg.split("=")[1]) : Number.NaN

  return {
    dryRun: argv.includes("--dry-run"),
    skipEmbeddings: argv.includes("--skip-embeddings"),
    batchSize: Number.isFinite(parsedBatch) && parsedBatch > 0 ? parsedBatch : 20,
  }
}

const normalizeText = (value: string): string => {
  const withoutHtml = value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")

  return withoutHtml
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

const getChunkDrafts = (): ChunkDraft[] => {
  const chunks: ChunkDraft[] = []

  treatmentCategories.forEach((category) => {
    category.services.forEach((service, serviceIndex) => {
      const baseOrder = serviceIndex * 100

      chunks.push(
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "description",
          displayOrder: baseOrder + 1,
          sourceTable: "treatment_services",
          text: normalizeText(service.description),
          html: service.description,
        },
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "short_description",
          displayOrder: baseOrder + 2,
          sourceTable: "treatment_services",
          text: normalizeText(service.shortDescription),
          html: service.shortDescription,
        },
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "summary",
          displayOrder: baseOrder + 3,
          sourceTable: "treatment_services",
          text: normalizeText(service.summary),
          html: service.summary,
        },
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "suitability",
          displayOrder: baseOrder + 4,
          sourceTable: "treatment_services",
          text: normalizeText(service.suitability),
          html: service.suitability,
        },
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "process",
          displayOrder: baseOrder + 5,
          sourceTable: "treatment_services",
          text: normalizeText(service.process),
          html: service.process,
        },
        {
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "service",
          sectionKey: "expectations",
          displayOrder: baseOrder + 6,
          sourceTable: "treatment_services",
          text: normalizeText(service.expectations),
          html: service.expectations,
        }
      )

      service.questions.forEach((question, questionIndex) => {
        chunks.push({
          categorySlug: category.slug,
          serviceSlug: service.slug,
          sectionType: "faq",
          sectionKey: `faq_${questionIndex + 1}`,
          displayOrder: baseOrder + 50 + questionIndex,
          sourceTable: "treatment_questions",
          sourceDisplayOrder: questionIndex,
          text: normalizeText(`${question.title}\n${question.answer}`),
        })
      })
    })
  })

  return chunks.filter((chunk) => chunk.text.length > 0)
}

const getSiteChunkRows = (): ChunkRow[] => {
  return siteContentChunkSeeds
    .map((chunk) => ({
      category_id: null,
      service_id: null,
      question_id: null,
      category_slug: null,
      service_slug: null,
      section_type: chunk.sectionType,
      section_key: chunk.sectionKey,
      source_table: "site_content",
      source_id: chunk.sourceId,
      page_path: chunk.pagePath,
      content_text: normalizeText(chunk.text),
      content_html: null,
      display_order: chunk.displayOrder,
    }))
    .filter((chunk) => chunk.content_text.length > 0)
}

const failIfMissing = (name: string, value: string | undefined): string => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const toVectorLiteral = (embedding: readonly number[]): string => {
  return `[${embedding.join(",")}]`
}

const createEmbeddings = async (
  apiKey: string,
  input: readonly string[]
): Promise<number[][]> => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI embedding request failed (${response.status}): ${errorText.slice(0, 240)}`)
  }

  const payload = (await response.json()) as EmbeddingResponse

  if (!payload.data || payload.data.length !== input.length) {
    throw new Error("OpenAI embedding response size mismatch")
  }

  return payload.data.map((item, index) => {
    if (!item.embedding || item.embedding.length === 0) {
      throw new Error(`Missing embedding vector at index: ${index}`)
    }

    return item.embedding
  })
}

const createSupabaseCatalogDb = (): CatalogDb => {
  const supabaseUrl = failIfMissing(
    "SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL",
    envFirst("SUPABASE_URL", "NUXT_PUBLIC_SUPABASE_URL")
  )
  const supabaseKey = failIfMissing(
    "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    envFirst("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  )
  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    upsertCategories: async (rows) => {
      const { data, error } = await supabase
        .from("treatment_categories")
        .upsert(rows, { onConflict: "slug" })
        .select("id, slug")

      if (error || !data) {
        throw new Error(`Failed upserting treatment_categories: ${error?.message ?? "unknown error"}`)
      }

      return data as CategoryRef[]
    },
    upsertServices: async (rows) => {
      const { data, error } = await supabase
        .from("treatment_services")
        .upsert(rows, { onConflict: "category_id,slug" })
        .select("id, category_id, slug")

      if (error || !data) {
        throw new Error(`Failed upserting treatment_services: ${error?.message ?? "unknown error"}`)
      }

      return data as ServiceRef[]
    },
    upsertQuestions: async (rows) => {
      const { data, error } = await supabase
        .from("treatment_questions")
        .upsert(rows, { onConflict: "service_id,display_order" })
        .select("id, service_id, display_order")

      if (error || !data) {
        throw new Error(`Failed upserting treatment_questions: ${error?.message ?? "unknown error"}`)
      }

      return data as QuestionRef[]
    },
    upsertChunks: async (rows) => {
      const { error } = await supabase
        .from("treatment_content_chunks")
        .upsert(rows, { onConflict: "source_table,source_id,section_key" })

      if (error) {
        throw new Error(`Failed upserting treatment_content_chunks: ${error.message}`)
      }
    },
    listChunksForEmbedding: async () => {
      const { data, error } = await supabase
        .from("treatment_content_chunks")
        .select("id, content_text")
        .order("category_slug")
        .order("service_slug")
        .order("display_order")

      if (error || !data) {
        throw new Error(`Failed selecting chunk rows for embedding: ${error?.message ?? "unknown error"}`)
      }

      return data as ChunkRecord[]
    },
    updateChunkEmbedding: async (id, embedding) => {
      const { error } = await supabase
        .from("treatment_content_chunks")
        .update({ embedding: toVectorLiteral(embedding) })
        .eq("id", id)

      if (error) {
        throw new Error(`Failed updating embedding for chunk ${id}: ${error.message}`)
      }
    },
    close: async () => {
      return
    },
  }
}

const createPostgresCatalogDb = (): CatalogDb => {
  const connectionString = failIfMissing("RAG_POSTGRES_URL", process.env.RAG_POSTGRES_URL)
  const shouldUseSsl = /sslmode=require/i.test(connectionString)

  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: shouldUseSsl ? "require" : false,
  })

  return {
    upsertCategories: async (rows) => {
      if (rows.length === 0) {
        return []
      }

      const result = await sql<CategoryRef[]>`
        insert into treatment_categories
          ${sql(rows, "slug", "title", "short_title", "description", "eyebrow", "intro", "seo_title", "seo_description", "display_order")}
        on conflict (slug) do update set
          title = excluded.title,
          short_title = excluded.short_title,
          description = excluded.description,
          eyebrow = excluded.eyebrow,
          intro = excluded.intro,
          seo_title = excluded.seo_title,
          seo_description = excluded.seo_description,
          display_order = excluded.display_order,
          updated_at = now()
        returning id, slug
      `

      return result
    },
    upsertServices: async (rows) => {
      if (rows.length === 0) {
        return []
      }

      const result = await sql<ServiceRef[]>`
        insert into treatment_services
          ${sql(rows, "category_id", "slug", "title", "short_title", "nav_title", "description", "short_description", "summary", "suitability", "process", "expectations", "cta_label", "seo_title", "seo_description", "display_order")}
        on conflict (category_id, slug) do update set
          title = excluded.title,
          short_title = excluded.short_title,
          nav_title = excluded.nav_title,
          description = excluded.description,
          short_description = excluded.short_description,
          summary = excluded.summary,
          suitability = excluded.suitability,
          process = excluded.process,
          expectations = excluded.expectations,
          cta_label = excluded.cta_label,
          seo_title = excluded.seo_title,
          seo_description = excluded.seo_description,
          display_order = excluded.display_order,
          updated_at = now()
        returning id, category_id, slug
      `

      return result
    },
    upsertQuestions: async (rows) => {
      if (rows.length === 0) {
        return []
      }

      const result = await sql<QuestionRef[]>`
        insert into treatment_questions
          ${sql(rows, "service_id", "title", "answer", "display_order")}
        on conflict (service_id, display_order) do update set
          title = excluded.title,
          answer = excluded.answer,
          updated_at = now()
        returning id, service_id, display_order
      `

      return result
    },
    upsertChunks: async (rows) => {
      if (rows.length === 0) {
        return
      }

      await sql`
        insert into treatment_content_chunks
          ${sql(rows, "category_id", "service_id", "question_id", "category_slug", "service_slug", "section_type", "section_key", "source_table", "source_id", "page_path", "content_text", "content_html", "display_order")}
        on conflict (source_table, source_id, section_key) do update set
          category_id = excluded.category_id,
          service_id = excluded.service_id,
          question_id = excluded.question_id,
          category_slug = excluded.category_slug,
          service_slug = excluded.service_slug,
          source_table = excluded.source_table,
          source_id = excluded.source_id,
          page_path = excluded.page_path,
          content_text = excluded.content_text,
          content_html = excluded.content_html,
          display_order = excluded.display_order,
          updated_at = now()
      `
    },
    listChunksForEmbedding: async () => {
      const result = await sql<ChunkRecord[]>`
        select id, content_text
        from treatment_content_chunks
        order by category_slug, service_slug, display_order
      `

      return result
    },
    updateChunkEmbedding: async (id, embedding) => {
      await sql`
        update treatment_content_chunks
        set embedding = ${toVectorLiteral(embedding)}::vector,
            updated_at = now()
        where id = ${id}::uuid
      `
    },
    close: async () => {
      await sql.end()
    },
  }
}

const selectDbMode = (): { db: CatalogDb; mode: "supabase" | "postgres" } => {
  const hasSupabaseUrl = Boolean(envFirst("SUPABASE_URL", "NUXT_PUBLIC_SUPABASE_URL")?.trim())
  const hasSupabaseKey = Boolean(
    envFirst("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")?.trim()
  )
  const hasSupabaseConfig = hasSupabaseUrl && hasSupabaseKey

  if (hasSupabaseConfig) {
    return {
      db: createSupabaseCatalogDb(),
      mode: "supabase",
    }
  }

  if (process.env.RAG_POSTGRES_URL?.trim()) {
    return {
      db: createPostgresCatalogDb(),
      mode: "postgres",
    }
  }

  throw new Error(
    "Missing DB configuration. Provide (SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL) + (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), or provide RAG_POSTGRES_URL"
  )
}

const run = async (): Promise<void> => {
  loadDotEnvIfPresent()

  const options = parseOptions(process.argv.slice(2))

  const serviceCount = treatmentCategories.reduce((sum, category) => sum + category.services.length, 0)
  const questionCount = treatmentCategories.reduce(
    (sum, category) => sum + category.services.reduce((inner, service) => inner + service.questions.length, 0),
    0
  )
  const chunkDrafts = getChunkDrafts()
  const siteChunkRows = getSiteChunkRows()

  console.log("Backfill plan")
  console.log(`- categories: ${treatmentCategories.length}`)
  console.log(`- services: ${serviceCount}`)
  console.log(`- questions: ${questionCount}`)
  console.log(`- treatmentChunks: ${chunkDrafts.length}`)
  console.log(`- siteChunks: ${siteChunkRows.length}`)
  console.log(`- chunks: ${chunkDrafts.length + siteChunkRows.length}`)
  console.log(`- dryRun: ${options.dryRun}`)
  console.log(`- skipEmbeddings: ${options.skipEmbeddings}`)

  if (options.dryRun) {
    return
  }

  const openAiApiKey = options.skipEmbeddings
    ? envFirst("OPENAI_API_KEY", "RAG_OPENAI_API_KEY")
    : failIfMissing("OPENAI_API_KEY or RAG_OPENAI_API_KEY", envFirst("OPENAI_API_KEY", "RAG_OPENAI_API_KEY"))

  const { db, mode } = selectDbMode()
  console.log(`- dbMode: ${mode}`)

  try {
    const categoryRows: CategoryRow[] = treatmentCategories.map((category, index) => ({
      slug: category.slug,
      title: category.title,
      short_title: category.shortTitle,
      description: category.description,
      eyebrow: category.eyebrow,
      intro: category.intro,
      seo_title: category.seoTitle,
      seo_description: category.seoDescription,
      display_order: index,
    }))

    const upsertedCategories = await db.upsertCategories(categoryRows)
    const categoryIdBySlug = new Map(upsertedCategories.map((row) => [row.slug, row.id]))

    const serviceRows: ServiceRow[] = []

    treatmentCategories.forEach((category) => {
      const categoryId = categoryIdBySlug.get(category.slug)

      if (!categoryId) {
        throw new Error(`Missing category id for slug: ${category.slug}`)
      }

      category.services.forEach((service, index) => {
        serviceRows.push({
          category_id: categoryId,
          slug: service.slug,
          title: service.title,
          short_title: service.shortTitle,
          nav_title: service.navTitle,
          description: service.description,
          short_description: service.shortDescription,
          summary: service.summary,
          suitability: service.suitability,
          process: service.process,
          expectations: service.expectations,
          cta_label: service.ctaLabel,
          seo_title: service.seoTitle,
          seo_description: service.seoDescription,
          display_order: index,
        })
      })
    })

    const upsertedServices = await db.upsertServices(serviceRows)
    const serviceIdByKey = new Map(upsertedServices.map((row) => [`${row.category_id}/${row.slug}`, row.id]))

    const questionRows: QuestionRow[] = []

    treatmentCategories.forEach((category) => {
      const categoryId = categoryIdBySlug.get(category.slug)

      if (!categoryId) {
        return
      }

      category.services.forEach((service) => {
        const serviceId = serviceIdByKey.get(`${categoryId}/${service.slug}`)

        if (!serviceId) {
          return
        }

        service.questions.forEach((question, index) => {
          questionRows.push({
            service_id: serviceId,
            title: question.title,
            answer: question.answer,
            display_order: index,
          })
        })
      })
    })

    const upsertedQuestions = await db.upsertQuestions(questionRows)
    const questionIdByKey = new Map(upsertedQuestions.map((row) => [`${row.service_id}/${row.display_order}`, row.id]))

    const treatmentChunkRows: ChunkRow[] = []

    chunkDrafts.forEach((chunk) => {
      const categoryId = categoryIdBySlug.get(chunk.categorySlug)

      if (!categoryId) {
        return
      }

      const serviceId = serviceIdByKey.get(`${categoryId}/${chunk.serviceSlug}`)

      if (!serviceId) {
        return
      }

      const questionId =
        chunk.sourceTable === "treatment_questions" && chunk.sourceDisplayOrder !== undefined
          ? questionIdByKey.get(`${serviceId}/${chunk.sourceDisplayOrder}`) ?? null
          : null

      treatmentChunkRows.push({
        category_id: categoryId,
        service_id: serviceId,
        question_id: questionId,
        category_slug: chunk.categorySlug,
        service_slug: chunk.serviceSlug,
        section_type: chunk.sectionType,
        section_key: chunk.sectionKey,
        source_table: chunk.sourceTable,
        source_id: questionId ?? serviceId,
        page_path: `/${chunk.categorySlug}/${chunk.serviceSlug}`,
        content_text: chunk.text,
        content_html: chunk.html ?? null,
        display_order: chunk.displayOrder,
      })
    })

    await db.upsertChunks([...treatmentChunkRows, ...siteChunkRows])

    console.log("Data upsert completed")

    if (options.skipEmbeddings || !openAiApiKey) {
      return
    }

    const records = await db.listChunksForEmbedding()

    for (let i = 0; i < records.length; i += options.batchSize) {
      const batch = records.slice(i, i + options.batchSize)
      const input = batch.map((record) => record.content_text)
      const embeddings = await createEmbeddings(openAiApiKey, input)

      const updates = batch.map((record, index) => {
        const embedding = embeddings[index]

        if (!embedding) {
          throw new Error(`Embedding response missing vector for chunk: ${record.id}`)
        }

        return db.updateChunkEmbedding(record.id, embedding)
      })

      await Promise.all(updates)
      console.log(`Embedded ${Math.min(i + batch.length, records.length)} / ${records.length}`)
    }

    console.log("Embedding backfill completed")
  } finally {
    await db.close()
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`Backfill failed: ${message}`)
  process.exit(1)
})
