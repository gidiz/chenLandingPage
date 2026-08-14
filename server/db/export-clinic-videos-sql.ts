import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { clinicVideoTable } from "../../composables/useClinicVideos"

const escapeSql = (value: string): string => value.replace(/'/g, "''")

const toSqlTextArray = (items: string[]): string => {
  if (!items.length) {
    return "ARRAY[]::text[]"
  }

  const values = items.map((item) => `'${escapeSql(item)}'`).join(", ")
  return `ARRAY[${values}]::text[]`
}

const run = (): void => {
  const rowsSql = clinicVideoTable
    .map((video, index) => {
      const values = [
        `'${escapeSql(video.url)}'`,
        `'${escapeSql(video.title)}'`,
        `'${escapeSql(video.desc)}'`,
        `'${escapeSql(video.shortDesc)}'`,
        toSqlTextArray(video.categoriesBySlug),
        toSqlTextArray(video.categoriesInHebrow),
        `${index}`,
      ].join(",\n      ")

      return `    (\n      ${values}\n    )`
    })
    .join(",\n")

  const sql = `insert into public.clinic_videos (
  url,
  title,
  "desc",
  "shortDesc",
  "categoriesBySlug",
  "categoriesInHebrow",
  display_order
)
values
${rowsSql}
on conflict (url)
do update set
  title = excluded.title,
  "desc" = excluded."desc",
  "shortDesc" = excluded."shortDesc",
  "categoriesBySlug" = excluded."categoriesBySlug",
  "categoriesInHebrow" = excluded."categoriesInHebrow",
  display_order = excluded.display_order,
  updated_at = now();
`

  const outputPath = resolve(process.cwd(), "server/db/migrations/003_2026-08-09_seed_clinic_videos.sql")
  writeFileSync(outputPath, sql, "utf8")

  console.log(`Wrote seed SQL: ${outputPath}`)
}

run()
