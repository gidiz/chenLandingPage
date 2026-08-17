import { createClient } from "@supabase/supabase-js"

import { logger } from "../lib/logger"
import { clinicVideoTable, type ClinicVideoRow } from "../../composables/useClinicVideos"

type ClinicVideoDbRow = {
  id: string
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

function filterStaticVideos(
  videos: ClinicVideoRow[],
  categorySlug: string | undefined,
  serviceSlug: string | undefined,
): ClinicVideoRow[] {
  // Static fallback has no service-level data
  if (serviceSlug) return []
  if (categorySlug) return videos.filter((v) => v.categoriesBySlug.includes(categorySlug))
  return videos
}

async function fetchByCategory(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  categorySlug: string,
): Promise<VideoCatalogResponse> {
  // Preferred path: normalized junction table (migration 005+)
  const { data: catData } = await client
    .from("treatment_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single()

  if (catData) {
    const { data: links, error: linksError } = await client
      .from("video_categories")
      .select("video_id")
      .eq("category_id", (catData as { id: string }).id)

    if (!linksError && links && links.length > 0) {
      const videoIds = links.map((r: { video_id: string }) => r.video_id)
      const { data, error } = await client
        .from("clinic_videos")
        .select("*")
        .in("id", videoIds)
        .order("display_order", { ascending: true })

      if (!error) {
        return { source: "db", videos: (data ?? []).map(toVideoRow) }
      }
    }
  }

  // Fallback: filter by the existing categoriesBySlug array column
  const { data: allData, error: allError } = await client
    .from("clinic_videos")
    .select("*")
    .order("display_order", { ascending: true })

  if (allError) {
    return { source: "static", videos: filterStaticVideos(clinicVideoTable, categorySlug, undefined) }
  }

  const rows = (allData ?? []) as ClinicVideoDbRow[]
  return {
    source: "db",
    videos: rows
      .filter((v) => Array.isArray(v.categoriesBySlug) && v.categoriesBySlug.includes(categorySlug))
      .map(toVideoRow),
  }
}

export default defineEventHandler(async (event): Promise<VideoCatalogResponse> => {
  const query = getQuery(event)
  const categorySlug = typeof query.categorySlug === "string" ? query.categorySlug : undefined
  const serviceSlug = typeof query.serviceSlug === "string" ? query.serviceSlug : undefined

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
      videos: filterStaticVideos(clinicVideoTable, categorySlug, serviceSlug),
    }
  }

  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon"
  logger.info("videos_supabase_key_type", { keyType })

  try {
    const client = createClient(supabaseUrl, supabaseKey)

    if (serviceSlug) {
      const { data: serviceData } = await client
        .from("treatment_services")
        .select("id")
        .eq("slug", serviceSlug)
        .single()

      if (!serviceData) return { source: "db", videos: [] }

      const { data: links, error: linksError } = await client
        .from("video_services")
        .select("video_id")
        .eq("service_id", (serviceData as { id: string }).id)

      if (linksError) {
        logger.warn("video_services_query_error", {
          code: linksError.code,
          message: linksError.message,
          details: linksError.details,
          hint: linksError.hint,
          service_id: (serviceData as { id: string }).id,
        })
        // Fall back to category-level if the table is missing or inaccessible
        if (categorySlug) {
          return fetchByCategory(client, categorySlug)
        }
        return { source: "db", videos: [] }
      }

      if (!links || !links.length) {
        
        return { source: "db", videos: [] }
      }

      const videoIds = links.map((r: { video_id: string }) => r.video_id)
      const { data, error } = await client
        .from("clinic_videos")
        .select("*")
        .in("id", videoIds)
        .order("display_order", { ascending: true })

      if (error) {
        logger.warn("videos_fallback_static", { reason: "db_error", message: error.message })
        if (categorySlug) {
          return fetchByCategory(client, categorySlug)
        }
        return { source: "static", videos: [] }
      }

      return { source: "db", videos: (data ?? []).map(toVideoRow) }
    }

    if (categorySlug) {
      return fetchByCategory(client, categorySlug)
    }

    // No filter — return all videos (existing behavior)
    const { data, error } = await client
      .from("clinic_videos")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      logger.warn("videos_fallback_static", { reason: "db_error", message: error.message })
      return { source: "static", videos: clinicVideoTable }
    }

    return { source: "db", videos: (data ?? []).map(toVideoRow) }
  } catch (error) {
    logger.warn("videos_fallback_static", {
      reason: "unexpected_error",
      message: error instanceof Error ? error.message : "unknown",
    })

    return {
      source: "static",
      videos: filterStaticVideos(clinicVideoTable, categorySlug, serviceSlug),
    }
  }
})