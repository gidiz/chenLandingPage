import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"
import { createConsola } from "consola"

const logger = createConsola({ tag: "chen-migration" })

type Options = {
  file: string
}

const parseOptions = (argv: readonly string[]): Options => {
  const fileArg = argv.find((arg) => arg.startsWith("--file="))

  return {
    file: fileArg?.slice("--file=".length) ?? "server/db/migrations/001_2026-06-29_treatment_catalog_vector.sql",
  }
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

const run = async (): Promise<void> => {
  loadDotEnvIfPresent()

  const options = parseOptions(process.argv.slice(2))
  const migrationPath = resolve(process.cwd(), options.file)

  if (!existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${options.file}`)
  }

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
    const migrationSql = readFileSync(migrationPath, "utf8")
    await sql.unsafe(migrationSql)
    logger.success(`Migration applied: ${options.file}`)
  } finally {
    await sql.end()
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  logger.error("migration_failed", { message })
  process.exit(1)
})
