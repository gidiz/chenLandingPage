import { createClient } from "@supabase/supabase-js"

import { logger } from "../lib/logger"

type SitemapUrl = {
  loc: string
}

type CategorySlugRow = {
  slug: string
}

type ServiceSlugRow = {
  slug: string
  category_id: string
}

type CategoryIdRow = {
  id: string
  slug: string
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/" },
  { loc: "/about" },
  { loc: "/contact" },
  { loc: "/faq" },
  { loc: "/videos" },
  { loc: "/treatments" },
  { loc: "/consultation" },
]

export default defineEventHandler(async (): Promise<SitemapUrl[]> => {
  const config = useRuntimeConfig()

  const supabaseUrl =
    config.public.supabaseUrl ||
    process.env.SUPABASE_URL ||
    process.env.NUXT_PUBLIC_SUPABASE_URL ||
    ""

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    config.public.supabasePublishableKey ||
    process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  if (!supabaseUrl || !supabaseKey) {
    logger.warn("sitemap_config_missing", {
      message: "Missing Supabase credentials — returning static routes only",
    })
    return STATIC_ROUTES
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey)

    const [
      { data: categories, error: categoriesError },
      { data: services, error: servicesError },
      { data: categoryIdRows, error: categoryIdError },
    ] = await Promise.all([
      client.from("treatment_categories").select("slug"),
      client.from("treatment_services").select("slug, category_id"),
      client.from("treatment_categories").select("id, slug"),
    ])

    if (categoriesError || servicesError || categoryIdError) {
      const errorMessage =
        categoriesError?.message ||
        servicesError?.message ||
        categoryIdError?.message ||
        "unknown error"
      logger.error("sitemap_query_failed", { message: errorMessage })
      return STATIC_ROUTES
    }

    const categoryRows = (categories ?? []) as CategorySlugRow[]
    const serviceRows = (services ?? []) as ServiceSlugRow[]
    const categoryIdMap = new Map<string, string>(
      ((categoryIdRows ?? []) as CategoryIdRow[]).map((row) => [row.id, row.slug]),
    )

    const categoryUrls: SitemapUrl[] = categoryRows.map((row) => ({
      loc: `/${row.slug}`,
    }))

    const serviceUrls: SitemapUrl[] = serviceRows.flatMap((row) => {
      const categorySlug = categoryIdMap.get(row.category_id)
      if (!categorySlug) return []
      return [{ loc: `/${categorySlug}/${row.slug}` }]
    })

    logger.info("sitemap_urls_built", {
      static: STATIC_ROUTES.length,
      categories: categoryUrls.length,
      services: serviceUrls.length,
    })

    return [...STATIC_ROUTES, ...categoryUrls, ...serviceUrls]
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error("sitemap_unexpected_error", { message })
    return STATIC_ROUTES
  }
})
