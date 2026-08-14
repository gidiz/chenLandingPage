import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const loadDotEnvIfPresent = (): void => {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const delimiterIndex = trimmed.indexOf("=");
    if (delimiterIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, delimiterIndex).trim();
    let value = trimmed.slice(delimiterIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const envFirst = (...names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value;
    }
  }
  return undefined;
};

const maskConnectionString = (value: string): string => {
  try {
    const url = new URL(value);
    const host = url.host;
    const dbName = url.pathname.replace(/^\//, "") || "(none)";
    const user = decodeURIComponent(url.username || "(none)");
    return `${url.protocol}//${user}:***@${host}/${dbName}`;
  } catch {
    return "(unparseable connection string)";
  }
};

const run = async (): Promise<void> => {
  loadDotEnvIfPresent();
  const connectionString = envFirst("RAG_POSTGRES_URL", "SUPABASE_DB_URL", "DATABASE_URL");

  if (!connectionString) {
    throw new Error("Missing DB URL (RAG_POSTGRES_URL, SUPABASE_DB_URL, DATABASE_URL)");
  }

  console.log("Using:", maskConnectionString(connectionString));

  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: /sslmode=require/i.test(connectionString) ? "require" : false,
  });

  try {
    const dbInfo = await sql<{
      current_database: string;
      current_user: string;
      server_addr: string | null;
      server_port: number | null;
    }[]>`
      select
        current_database() as current_database,
        current_user as current_user,
        inet_server_addr()::text as server_addr,
        inet_server_port() as server_port
    `;

    const tables = await sql<{ table_schema: string; table_name: string }[]>`
      select table_schema, table_name
      from information_schema.tables
      where table_schema not in ('pg_catalog', 'information_schema')
      order by table_schema, table_name
    `;

    const clinicRows = await sql<{ count: number }[]>`
      select count(*)::int as count from public.clinic_videos
    `;

    console.log("DB Info:", dbInfo[0]);
    console.log("clinic_videos rows:", clinicRows[0]?.count ?? 0);
    console.log("Tables:");
    for (const row of tables) {
      console.log(` - ${row.table_schema}.${row.table_name}`);
    }
  } finally {
    await sql.end();
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
