import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"
import { createConsola } from "consola"

import { clinicVideoTable } from "../../composables/useClinicVideos"

const logger = createConsola({ tag: "chen-video-seed" })

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

const run = async (): Promise<void> => {
  loadDotEnvIfPresent()

  const connectionString = envFirst("RAG_POSTGRES_URL", "SUPABASE_DB_URL", "DATABASE_URL")

  if (!connectionString) {
    throw new Error("Missing DB connection URL. Set one of RAG_POSTGRES_URL, SUPABASE_DB_URL, or DATABASE_URL")
  }

  const useSsl = /sslmode=require/i.test(connectionString)
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: useSsl ? "require" : false,
  })

  try {
    for (const [index, video] of clinicVideoTable.entries()) {
      await sql`
        insert into clinic_videos (
          url,
          title,
          "desc",
          "shortDesc",
          "categoriesBySlug",
          "categoriesInHebrow",
          display_order
        )
        values (
          ${video.url},
          ${video.title},
          ${video.desc},
          ${video.shortDesc},
          ${video.categoriesBySlug},
          ${video.categoriesInHebrow},
          ${index}
        )
        on conflict (url)
        do update set
          title = excluded.title,
          "desc" = excluded."desc",
          "shortDesc" = excluded."shortDesc",
          "categoriesBySlug" = excluded."categoriesBySlug",
          "categoriesInHebrow" = excluded."categoriesInHebrow",
          display_order = excluded.display_order,
          updated_at = now()
      `
    }

    logger.success("clinic_videos_seeded", { rows: clinicVideoTable.length })
  } finally {
    await sql.end()
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  logger.error("seed_clinic_videos_failed", { message })
  process.exit(1)
})