import { createClient } from "@supabase/supabase-js"

import { logger } from "../lib/logger"
import { clinicVideoTable, type ClinicVideoRow } from "../../composables/useClinicVideos"

type ClinicVideoDbRow = {
  url: string
  title: string
  desc: string
  shortDesc: string
  categoriesBySlug: string[]
  categoriesInHebrow: string[]
  display_order: number
}

type VideoCatalogResponse = {
  source: "db" | "static"
  videos: ClinicVideoRow[]
}

const toVideoRow = (row: ClinicVideoDbRow): ClinicVideoRow => ({
  url: row.url,
  title: row.title,
  desc: row.desc,
  shortDesc: row.shortDesc,
  categoriesBySlug: Array.isArray(row.categoriesBySlug) ? row.categoriesBySlug : [],
  categoriesInHebrow: Array.isArray(row.categoriesInHebrow) ? row.categoriesInHebrow : [],
})

export default defineEventHandler(async (): Promise<VideoCatalogResponse> => {
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
    logger.warn("videos_fallback_static", { reason: "missing_supabase_config" })
    return {
      source: "static",
      videos: clinicVideoTable,
    }
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await client
      .from("clinic_videos")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      logger.warn("videos_fallback_static", { reason: "db_error", message: error.message })
      return {
        source: "static",
        videos: clinicVideoTable,
      }
    }

    const rows = (data ?? []) as ClinicVideoDbRow[]
    return {
      source: "db",
      videos: rows.map(toVideoRow),
    }
  } catch (error) {
    logger.warn("videos_fallback_static", {
      reason: "unexpected_error",
      message: error instanceof Error ? error.message : "unknown",
    })

    return {
      source: "static",
      videos: clinicVideoTable,
    }
  }
})