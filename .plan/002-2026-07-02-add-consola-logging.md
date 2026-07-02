Status: draft
Owner: User
Last updated: 2026-07-02

# Goal

Replace all ad-hoc `console.*` calls across the codebase with structured logging using **consola**, and add missing structured logs at key server-side lifecycle points to make debugging easier in both local dev and Vercel production.

# Scope

**In scope:**

- Replace every `console.log / console.error / console.warn` in:
  - `server/api/chat.post.ts`
  - `server/api/rag/treatment-catalog.get.ts`
  - `server/db/apply-migration.ts`
  - `server/rag/backfill-treatment-catalog.ts`
  - `server/rag/validate-catalog-parity.ts`
  - `server/mcp/index.ts`
- Add new structured logs at lifecycle points that currently have no logging:
  - Rate-limit hit in `chat.post.ts`
  - Supabase query failures in `chat.post.ts`
  - Embedding fetch failures in `chat.post.ts`
  - Catalog source selection (`db` vs `static`) in `treatment-catalog.get.ts`
  - Chat request received (requestId, clientKey) in `chat.post.ts`
- Client-side console.warn/console.error in `components/ContactSection.vue` — replace with a light `consola` instance scoped to the client.
- Install `consola` as a project dependency.
- Create a shared server logger helper at `server/lib/logger.ts` that wraps consola with a project tag.

**Out of scope:**

- Centralized log shipping to a third-party service (e.g. Datadog, Logtail).
- Structured logging on the Vue client beyond the contact form.
- Changing log levels per environment via runtime config (can be done in a follow-up).

# Assumptions

- `consola` works fine in Nuxt 3 server routes and Node.js scripts.
- No log shipper is in use today; logs go to stdout/stderr only.
- Vercel captures stdout/stderr in Runtime Logs, so consola output will appear there without extra config.
- The MCP server (`server/mcp/index.ts`) uses `stderr` intentionally for stdio safety — consola must be configured to write to `stderr` in that file only.

# Open Questions

1. **Log level per environment**: Should the log level differ between `development`, `preview`, and `production`?
   Recommended: yes — `debug` in dev, `info` in production. Configure via `NUXT_PUBLIC_APP_ENVIRONMENT`.
   ➜ yes
2. **Client-side scope**: Should `components/ContactSection.vue` use consola, or keep browser-native console for client code?
   Recommended: use consola on client too — it respects NODE_ENV and suppresses debug logs in production builds.
   ➜ ok
3. **MCP stderr constraint**: The MCP server must only write to `stderr` (not `stdout`) because it communicates over stdio. Should consola be configured to write to `stderr` there, or keep the existing `console.error` calls unchanged?
   Recommended: configure a dedicated consola instance with `stderr` transport for the MCP file.
   ➜ ok

# Steps

## 1. Install consola

- Add `consola` to `package.json` dependencies.
- Run `npm install`.

## 2. Create shared server logger

- Create `server/lib/logger.ts`:
  ```ts
  import { createConsola } from "consola"
  export const logger = createConsola({ tag: "chen-api" })
  ```
- This single instance is imported by all server API routes.

## 3. Replace console.* in server/api/chat.post.ts

Current calls:

- `console.error("chat_api_error", ...)` → `logger.error("chat_api_error", { requestId, message })`

New calls to add:

- On request received: `logger.info("chat_request", { requestId, clientKey })`
- On rate limit hit: `logger.warn("chat_rate_limited", { clientKey, retryAfterSec })`
- On missing apiKey: `logger.error("chat_api_key_missing", { requestId })`
- On Supabase retrieval failure: `logger.warn("chat_retrieval_skipped", { requestId, reason })`
- On OpenAI empty response: `logger.warn("chat_empty_reply", { requestId })`

## 4. Replace console.* in server/api/rag/treatment-catalog.get.ts

New calls to add:

- On source selection: `logger.info("catalog_source", { source: "db" | "static" })`
- On Supabase query error: `logger.error("catalog_query_failed", { message: error.message })`
- On static fallback used: `logger.warn("catalog_fallback_static", { reason })`

## 5. Replace console.* in server/db/apply-migration.ts

- `console.log(Migration applied: ...)` → `logger.success("migration_applied", { file })`
- `console.error(Migration failed: ...)` → `logger.error("migration_failed", { message })`

## 6. Replace console.* in server/rag/backfill-treatment-catalog.ts

- All `console.log("Backfill plan ...")` → `logger.info("backfill_plan", { ... })`
- `console.log("Data upsert completed")` → `logger.success("backfill_upsert_done")`
- `console.log("Embedded N / total")` → `logger.info("backfill_embed_progress", { done, total })`
- `console.log("Embedding backfill completed")` → `logger.success("backfill_embed_done")`
- `console.error("Backfill failed: ...")` → `logger.error("backfill_failed", { message })`

## 7. Replace console.* in server/rag/validate-catalog-parity.ts

- All `console.log(...)` → `logger.info("parity_check", { key: value })` (batched into a single structured object)
- `console.error(...)` → `logger.error("parity_check_failed", { message })`

## 8. Handle server/mcp/index.ts (stderr constraint)

- Create a separate consola instance pointing to stderr:
  ```ts
  import { createConsola } from "consola"
  const mcpLogger = createConsola({ tag: "chen-mcp" }).withDefaults({ stderr: true })
  ```
- Replace:
  - `console.error("chen-integrations MCP server running on stdio")` → `mcpLogger.info("mcp_server_started")`
  - `console.error("Fatal error while starting the MCP server", error)` → `mcpLogger.fatal("mcp_server_fatal", { error })`

## 9. Replace console.* in components/ContactSection.vue (client-side)

- Import `consola` directly or use the Nuxt auto-import.
- Replace:
  - `console.warn(...)` calls → `consola.warn(...)`
  - `console.error(...)` calls → `consola.error(...)`

# Validation

- [ ] `npm install` succeeds with `consola` in `package.json`.
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] Local dev: send a chat message, confirm `[chen-api] chat_request` appears in Nuxt dev terminal.
- [ ] Local dev: remove OPENAI_API_KEY temporarily, confirm `[chen-api] chat_api_key_missing` appears.
- [ ] Run `npm run rag:catalog:dry-run`, confirm structured backfill plan log appears.
- [ ] Run `npm run rag:catalog:validate:parity`, confirm structured parity output appears.
- [ ] MCP: run `npm run mcp:smoke`, confirm MCP startup log appears in stderr.
- [ ] Vercel Preview: deploy and trigger chat, verify logs appear in Vercel Runtime Logs.

# Risks

- **consola version mismatch with Nuxt**: Nuxt 3 already bundles consola internally; using a different version could cause subtle issues. Pin the same version that Nuxt uses or import from `nuxt/app` utilities.
- **MCP stdio corruption**: If consola's stderr transport is not correctly isolated, writing to stdout in `server/mcp/index.ts` will corrupt the stdio MCP channel.
- **Script log output format change**: `backfill-treatment-catalog.ts` and `validate-catalog-parity.ts` are CI/operational scripts. Any change to their output format could break downstream parsing (e.g. log grep scripts). Verify there are none before merging.

# Rollout Order

1. Install consola and create `server/lib/logger.ts`.
2. Migrate `server/api/chat.post.ts` (highest impact for Vercel debugging).
3. Migrate `server/api/rag/treatment-catalog.get.ts`.
4. Migrate `server/db/apply-migration.ts`.
5. Migrate `server/rag/backfill-treatment-catalog.ts` and `validate-catalog-parity.ts`.
6. Migrate `server/mcp/index.ts` (most sensitive — do last, test stdio carefully).
7. Migrate `components/ContactSection.vue`.

# Rollback

- Revert `package.json` consola dependency and delete `server/lib/logger.ts`.
- Restore original `console.*` calls in each file.
- All changes are confined to logging calls with no logic changes, so rollback has zero functional risk.
