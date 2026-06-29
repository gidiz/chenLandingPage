import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { treatmentCategories as staticCategories } from "../../composables/treatment-catalog"

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

const fail = (message: string): never => {
  throw new Error(message)
}

const loadDotEnvIfPresent = (): void => {
  const envPath = resolve(process.cwd(), ".env")

  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue
    }

    const index = trimmed.indexOf("=")
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const loadFromDb = async () => {
  loadDotEnvIfPresent()

  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ""
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  if (!url || !key) {
    fail("Missing Supabase env vars for parity validation")
  }

  const supabase = createClient(url, key)

  const [{ data: categories, error: categoriesError }, { data: services, error: servicesError }, { data: questions, error: questionsError }] = await Promise.all([
    supabase
      .from("treatment_categories")
      .select("id, slug, title, short_title, description, eyebrow, intro, seo_title, seo_description, display_order"),
    supabase
      .from("treatment_services")
      .select("id, category_id, slug, title, short_title, nav_title, description, short_description, summary, suitability, process, expectations, cta_label, seo_title, seo_description, display_order"),
    supabase
      .from("treatment_questions")
      .select("id, service_id, title, answer, display_order"),
  ])

  if (categoriesError) {
    fail(`Failed loading treatment_categories: ${categoriesError.message}`)
  }

  if (servicesError) {
    fail(`Failed loading treatment_services: ${servicesError.message}`)
  }

  if (questionsError) {
    fail(`Failed loading treatment_questions: ${questionsError.message}`)
  }

  return {
    categories: (categories ?? []) as CategoryRow[],
    services: (services ?? []) as ServiceRow[],
    questions: (questions ?? []) as QuestionRow[],
  }
}

const main = async () => {
  const db = await loadFromDb()

  const staticCategoryBySlug = new Map(staticCategories.map((c) => [c.slug, c]))
  const dbCategoryBySlug = new Map(db.categories.map((c) => [c.slug, c]))

  const staticServiceKeys = new Set(
    staticCategories.flatMap((c) => c.services.map((s) => `${c.slug}/${s.slug}`)),
  )

  const categorySlugById = new Map(db.categories.map((c) => [c.id, c.slug]))
  const dbServiceKeys = new Set(
    db.services.map((s) => `${categorySlugById.get(s.category_id) ?? "unknown"}/${s.slug}`),
  )

  const staticQuestionCount = staticCategories.reduce(
    (sum, category) =>
      sum + category.services.reduce((inner, service) => inner + service.questions.length, 0),
    0,
  )

  const dbQuestionCount = db.questions.length

  const missingInDbCategories = [...staticCategoryBySlug.keys()].filter((slug) => !dbCategoryBySlug.has(slug))
  const extraInDbCategories = [...dbCategoryBySlug.keys()].filter((slug) => !staticCategoryBySlug.has(slug))

  const missingInDbServices = [...staticServiceKeys].filter((key) => !dbServiceKeys.has(key))
  const extraInDbServices = [...dbServiceKeys].filter((key) => !staticServiceKeys.has(key))

  const textDiffs: string[] = []

  for (const [slug, staticCategory] of staticCategoryBySlug) {
    const dbCategory = dbCategoryBySlug.get(slug)

    if (!dbCategory) {
      continue
    }

    if (dbCategory.title !== staticCategory.title) {
      textDiffs.push(`category title mismatch: ${slug}`)
    }

    if (dbCategory.short_title !== staticCategory.shortTitle) {
      textDiffs.push(`category shortTitle mismatch: ${slug}`)
    }

    const dbServicesForCategory = db.services
      .filter((s) => s.category_id === dbCategory.id)
      .sort((a, b) => a.display_order - b.display_order)

    const staticServiceBySlug = new Map(staticCategory.services.map((s) => [s.slug, s]))

    for (const dbService of dbServicesForCategory) {
      const staticService = staticServiceBySlug.get(dbService.slug)

      if (!staticService) {
        continue
      }

      if (dbService.title !== staticService.title) {
        textDiffs.push(`service title mismatch: ${slug}/${dbService.slug}`)
      }

      if (dbService.short_description !== staticService.shortDescription) {
        textDiffs.push(`service shortDescription mismatch: ${slug}/${dbService.slug}`)
      }
    }
  }

  console.log(`static_categories=${staticCategories.length}`)
  console.log(`db_categories=${db.categories.length}`)
  console.log(`static_services=${staticServiceKeys.size}`)
  console.log(`db_services=${dbServiceKeys.size}`)
  console.log(`static_questions=${staticQuestionCount}`)
  console.log(`db_questions=${dbQuestionCount}`)
  console.log(`missing_db_categories=${missingInDbCategories.length}`)
  console.log(`extra_db_categories=${extraInDbCategories.length}`)
  console.log(`missing_db_services=${missingInDbServices.length}`)
  console.log(`extra_db_services=${extraInDbServices.length}`)
  console.log(`text_field_diffs=${textDiffs.length}`)

  if (missingInDbCategories.length > 0) {
    console.log(`missing_db_categories_list=${missingInDbCategories.join(",")}`)
  }

  if (extraInDbCategories.length > 0) {
    console.log(`extra_db_categories_list=${extraInDbCategories.join(",")}`)
  }

  if (missingInDbServices.length > 0) {
    console.log(`missing_db_services_list=${missingInDbServices.join(",")}`)
  }

  if (extraInDbServices.length > 0) {
    console.log(`extra_db_services_list=${extraInDbServices.join(",")}`)
  }

  if (textDiffs.length > 0) {
    console.log(`text_field_diffs_list=${textDiffs.slice(0, 20).join(";")}`)
  }

  if (
    missingInDbCategories.length > 0 ||
    extraInDbCategories.length > 0 ||
    missingInDbServices.length > 0 ||
    extraInDbServices.length > 0 ||
    staticQuestionCount !== dbQuestionCount
  ) {
    process.exitCode = 2
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`Parity check failed: ${message}`)
  process.exit(1)
})
