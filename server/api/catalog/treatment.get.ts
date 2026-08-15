import { createClient } from "@supabase/supabase-js"

import { logger } from "../../lib/logger"
import type {
  TreatmentCategory,
  TreatmentQuestion,
  TreatmentService,
} from "../../../composables/treatment-catalog"

type CategoryRow = {
  id: string
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
  id: string
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
  id: string
  service_id: string
  title: string
  answer: string
  display_order: number
}

type CatalogResponse = {
  source: "db"
  categories: TreatmentCategory[]
}

const byDisplayOrder = <T extends { display_order: number }>(a: T, b: T): number =>
  a.display_order - b.display_order

const toCategory = (
  categoryRow: CategoryRow,
  serviceRows: ServiceRow[],
  questionsByServiceId: Map<string, QuestionRow[]>,
): TreatmentCategory => {
  const services: TreatmentService[] = serviceRows.sort(byDisplayOrder).map((serviceRow) => {
    const questions: TreatmentQuestion[] = (questionsByServiceId.get(serviceRow.id) ?? [])
      .sort(byDisplayOrder)
      .map((questionRow) => ({
        title: questionRow.title,
        answer: questionRow.answer,
      }))

    return {
      slug: serviceRow.slug,
      title: serviceRow.title,
      shortTitle: serviceRow.short_title,
      navTitle: serviceRow.nav_title,
      description: serviceRow.description,
      shortDescription: serviceRow.short_description,
      summary: serviceRow.summary,
      suitability: serviceRow.suitability,
      process: serviceRow.process,
      expectations: serviceRow.expectations,
      ctaLabel: serviceRow.cta_label,
      seoTitle: serviceRow.seo_title,
      seoDescription: serviceRow.seo_description,
      questions,
    }
  })

  return {
    slug: categoryRow.slug,
    title: categoryRow.title,
    shortTitle: categoryRow.short_title,
    description: categoryRow.description,
    eyebrow: categoryRow.eyebrow,
    intro: categoryRow.intro,
    seoTitle: categoryRow.seo_title,
    seoDescription: categoryRow.seo_description,
    services,
  }
}

export default defineEventHandler(async (): Promise<CatalogResponse> => {
  const config = useRuntimeConfig()

  const supabaseUrl =
    config.public.supabaseUrl || process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ""

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    config.public.supabasePublishableKey ||
    process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  if (!supabaseUrl || !supabaseKey) {
    const message = "Missing Supabase config for treatment catalog"
    logger.error("catalog_config_missing", { message })
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }

  try {
    logger.info("catalog_source", { source: "db" })
    const client = createClient(supabaseUrl, supabaseKey)

    const [{ data: categories, error: categoriesError }, { data: services, error: servicesError }, { data: questions, error: questionsError }] = await Promise.all([
      client
        .from("treatment_categories")
        .select("id, slug, title, short_title, description, eyebrow, intro, seo_title, seo_description, display_order")
        .order("display_order", { ascending: true }),
      client
        .from("treatment_services")
        .select("id, category_id, slug, title, short_title, nav_title, description, short_description, summary, suitability, process, expectations, cta_label, seo_title, seo_description, display_order")
        .order("display_order", { ascending: true }),
      client
        .from("treatment_questions")
        .select("id, service_id, title, answer, display_order")
        .order("display_order", { ascending: true }),
    ])

    if (categoriesError || servicesError || questionsError) {
      const errorMessage = categoriesError?.message || servicesError?.message || questionsError?.message || "unknown error"
      logger.error("catalog_query_failed", { message: errorMessage })
      throw createError({
        statusCode: 500,
        statusMessage: `Catalog query failed: ${errorMessage}`,
      })
    }

    const categoryRows = (categories ?? []) as CategoryRow[]
    const serviceRows = (services ?? []) as ServiceRow[]
    const questionRows = (questions ?? []) as QuestionRow[]

    const serviceRowsByCategoryId = new Map<string, ServiceRow[]>()
    for (const serviceRow of serviceRows) {
      const list = serviceRowsByCategoryId.get(serviceRow.category_id) ?? []
      list.push(serviceRow)
      serviceRowsByCategoryId.set(serviceRow.category_id, list)
    }

    const questionRowsByServiceId = new Map<string, QuestionRow[]>()
    for (const questionRow of questionRows) {
      const list = questionRowsByServiceId.get(questionRow.service_id) ?? []
      list.push(questionRow)
      questionRowsByServiceId.set(questionRow.service_id, list)
    }

    const categoriesOut: TreatmentCategory[] = categoryRows
      .sort(byDisplayOrder)
      .map((categoryRow) =>
        toCategory(
          categoryRow,
          serviceRowsByCategoryId.get(categoryRow.id) ?? [],
          questionRowsByServiceId,
        ),
      )

    return {
      source: "db",
      categories: categoriesOut,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    logger.error("catalog_query_failed", { message })
    throw createError({
      statusCode: 500,
      statusMessage: `Catalog query failed: ${message}`,
    })
  }
})
