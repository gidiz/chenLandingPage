Status: done
Owner: User
Last updated: 2026-08-17

## GitHub Issue

**Title:** `[Orchestrator]: Set up 5-Agent Collaborative System (Phase 3)`
**Labels:** `agent:orchestrator`, `status:done`

### Acceptance Criteria

- [x] `orchestrator.agent.md` created in `.github/agents/`
- [x] `db-agent.agent.md` created in `.github/agents/`
- [x] `backend-agent.agent.md` created in `.github/agents/`
- [x] `frontend-agent.agent.md` created in `.github/agents/`
- [x] `qa-agent.agent.md` created in `.github/agents/`
- [x] Each agent has correct tool restrictions per its role
- [x] Each agent references the relevant `.rule/` files for its domain
- [x] Orchestrator can invoke the other 4 as subagents
- [x] All agents start responses with `Hopa!` (AGENTS.md rule)
- [x] All agents output in the GitHub Issue format from gemini-code-1786962089385.md
- [x] Backend Agent owns MCP rules (`server/mcp/` constraints documented)
- [x] RAG ownership split: DB Agent owns vector schema, Backend Agent owns pipeline + retrieval rules
- [x] Security ownership table mapped to agents with required actions per finding
- [x] QA Agent security checklist covers secrets, logging, validation, disclaimer, build
- [x] Open Questions answered before execution

---

# Goal

Create 5 VS Code custom agent files (`.agent.md`) implementing the multi-agent software
engineering team described in `gemini-code-1786962089385.md` Phase 3. Each agent is a
specialist persona with scoped tools, domain instructions, and a consistent output format
(GitHub Issue context + checklist). The Orchestrator coordinates the other four as
subagents via the loopback mechanism.

# Scope

**In scope:**

- `.github/agents/orchestrator.agent.md`
- `.github/agents/db-agent.agent.md`
- `.github/agents/backend-agent.agent.md`
- `.github/agents/frontend-agent.agent.md`
- `.github/agents/qa-agent.agent.md`
- Tool restrictions per agent role (read-only QA, edit access for DB/Backend/Frontend)
- Domain rule references per agent (e.g. DB agent reads `.rule/database-rules.md`)
- Loopback PASS/FAIL verdict format embedded in QA agent
- GitHub Issue output format embedded in all agents

**Out of scope:**

- Actual GitHub API integration (issues live as formatted text, not real GitHub Issues)
- MCP server changes
- New features or bug fixes (covered by future plans)

# Assumptions

- VS Code Copilot agent customization supports `.github/agents/*.agent.md` (workspace scope).
- The `agent` tool alias allows the Orchestrator to invoke the other agents as subagents.
- Each agent will read the relevant `.rule/` and `.doc/` files referenced in `AGENTS.md`.
- The `execute` tool alias maps to `run_in_terminal` (needed by DB, Backend, QA agents).
- All agents inherit the `Hopa!` greeting rule from `.github/AGENTS.md` automatically,
  but it will also be re-stated in each agent body as a safeguard.

# Open Questions

1. **Subagent visibility**: Should DB/Backend/Frontend/QA agents appear in the VS Code
   agent picker (user-invocable), or only be accessible when called by the Orchestrator?
   Recommended: `user-invocable: true` for all — lets you test each agent directly during
   development, and invoke them directly for focused tasks.
   ➜ `user-invocable: true`
2. **Terminal access for Frontend agent**: The Frontend agent edits Vue/CSS files. Does it
   also need terminal access (e.g. to run `npm run build` for validation)?
   Recommended: yes — so it can self-validate changes with a build check.
   ➜ yes
3. **QA execution strategy**: The project currently has no test suite (only `npm run build`
   and `npm run generate` per `.rule/testing-rules.md`). Should the QA agent validate by:
   a) Running `npm run build` and checking for errors (current state), or
   b) Also writing Vitest unit tests as part of its QA pass?
   Recommended: (a) for now — add (b) in a follow-up plan when a test suite is added.
   ➜ a
4. **Max loopback retries**: The loopback protocol allows max 3 loops per issue before
   tagging `status:blocked`. Should this be configurable per agent or fixed at 3?
   Recommended: fixed at 3 (matches the spec in gemini-code-1786962089385.md).
   ➜ fixed at 3

# Steps

> Execution requires approval. Answer Open Questions, then approve.

## 1. Create `.github/agents/` directory structure

- Verify `.github/agents/` exists (create if not).

## 2. Create `orchestrator.agent.md`

**Role:** Ingests user goals → creates GitHub Issue checklists → assigns tasks to subagents →
reviews QA verdicts → manages loopback retry budget.

**Tools:** `[read, search, agent, todo]` — no direct file editing or terminal access;
delegates all implementation to specialist agents.

**Key instructions:**

- Always output a GitHub Issue block (`## GitHub Issue`, title with `[Orchestrator]:`,
  labels, acceptance criteria checklist) before assigning any work.
- Invoke subagents in this order: DB Agent (if schema change) → Backend Agent → Frontend Agent → QA Agent.
- Track retry count per issue; after 3 FAIL verdicts tag `status:blocked`.
- Reference `.plan/` for existing context before planning new work.

## 3. Create `db-agent.agent.md`

**Role:** Schema design, SQL migrations, Supabase queries, pgvector, indices.

**Tools:** `[read, edit, search, execute]`

**Key instructions:**

- Prefix all responses with `[DB Agent]`.
- Follow `.rule/database-rules.md` (if exists) and Supabase schema conventions from
  `.plan/003-2026-08-17-project-discovery-baseline.md`.
- Place all migrations in `server/db/migrations/` with sequential naming
  (`NNN_YYYY-MM-DD_<topic>.sql`).
- Never expose credentials; use env var references only.
- After writing a migration, run it via `npm run rag:catalog:migrate` and report exit code.

## 4. Create `backend-agent.agent.md`

**Role:** Nitro server routes (`server/api/`), business logic, RAG pipeline, error handling.

**Tools:** `[read, edit, search, execute]`

**Key instructions:**

- Prefix all responses with `[Backend Agent]`.
- Follow `.rule/coding-rules.md` (no semicolons, typed returns, no `any`).
- Follow `.rule/error-handling-rules.md`.
- All server routes must use `consola` from `server/lib/logger.ts` (not `console.*`).
- Validate all external inputs at route boundary; use `zod` for schema validation.
- After editing server files, run `npm run build` and confirm exit code 0.

## 5. Create `frontend-agent.agent.md`

**Role:** Vue components (`components/`), pages (`pages/`), composables, RTL/Hebrew UI.

**Tools:** `[read, edit, search, execute]` (execute for build validation)

**Key instructions:**

- Prefix all responses with `[Frontend Agent]`.
- Follow `.rule/coding-rules.md`, `.rule/ui-rules.md`, `.rule/style-rules.md`.
- All Vue files use `<script setup lang="ts">`.
- Hebrew (RTL) language: do not change `dir="rtl"` or language attributes.
- Do not install new UI frameworks — project uses custom CSS only.
- After editing, run `npm run build` and confirm exit code 0.

## 6. Create `qa-agent.agent.md`

**Role:** Validates implementation against issue acceptance criteria; emits PASS/FAIL verdict.

**Tools:** `[read, search, execute]` — no file editing (read-only auditor).

**Key instructions:**

- Prefix all responses with `[QA Agent]`.
- Follow `.rule/testing-rules.md`.
- Validate by running `npm run build`; check for TypeScript errors and build failures.
- Emit a structured verdict after every review:
  - **PASS:** Check off all acceptance criteria and present the solution.
  - **FAIL:** Emit the loopback comment format (target agent, failing criteria, root cause,
    required fix).
- Never edit code — only report findings.

## 7. Cross-cutting domain ownership: MCP, RAG, Security

### MCP (`server/mcp/`)

**Owner: `[Backend Agent]`**

The MCP server is a standalone admin tool — not part of the Nuxt app runtime. It connects
to GA4, GTM, AWS S3/CloudFront, and GitHub via read-only APIs.

Rules baked into Backend Agent:

- MCP lives in `server/mcp/`; it runs separately via `npm run mcp:start` (stdio transport).
- MCP must write **only to `stderr`** (not `stdout`) to keep the stdio channel clean —
  use the dedicated `createConsola({ stderr: true })` instance in `server/mcp/index.ts`.
- Never add write/mutate API tools to the MCP server — it is read-only by design.
- Google credentials come from `GOOGLE_APPLICATION_CREDENTIALS` (file path) or
  `GOOGLE_SERVICE_ACCOUNT_JSON` (inline JSON) — never from hardcoded values.
- After any MCP change run `npm run mcp:typecheck` and `npm run mcp:smoke`.

---

### RAG Pipeline (`server/api/chat.post.ts`, `server/rag/`)

**Split ownership: `[DB Agent]` + `[Backend Agent]`**

The RAG pipeline has two clearly separate layers:

| Layer                           | Owner         | Files                                                                 |
| ------------------------------- | ------------- | --------------------------------------------------------------------- |
| Vector schema + retrieval RPC   | DB Agent      | `server/db/migrations/001_*.sql`, `match_treatment_content()` RPC |
| Embedding generation + chunking | Backend Agent | `server/api/chat.post.ts`                                           |
| Keyword retrieval rules         | Backend Agent | `server/rag/chat-retrieval-rules.ts`                                |
| System prompt + disclaimer      | Backend Agent | `server/api/chat.post.ts`                                           |

Rules baked into **DB Agent** for RAG:

- Vector column is `embedding vector(1536)` — do not change dimensionality without a
  matching embedding model change in the Backend layer.
- `match_treatment_content()` RPC must remain callable with `(query_embedding, match_threshold, match_count)`.
- New content types require a new `section_type` enum value + migration.

Rules baked into **Backend Agent** for RAG:

- Embedding model is `text-embedding-3-small` (1536-dim); answer model is `gpt-4o-mini`.
  Both are configurable via `NUXT_OPENAI_EMBEDDING_MODEL` / `RAG_OPENAI_ANSWER_MODEL`.
- Keyword rules in `chat-retrieval-rules.ts` are matched before vector search — add new
  rules there when a new topic needs deterministic retrieval priority.
- The medical disclaimer (`CHAT_REPLY_DISCLAIMER`) must always be appended to every
  assistant response — never remove or shorten it.
- Max message: 1200 chars. Max history: 12 items. These limits are security boundaries,
  not UX choices — do not increase without a security review.
- Use `AbortController` with `openAiTimeoutMs` on all OpenAI fetch calls.
- Rate limiting is in-memory (`rateLimitStore` Map). If the app scales to multiple
  instances, this must be replaced with a shared store (e.g. Supabase or Redis).

---

### Security

**Shared responsibility: all agents must enforce their domain's rules.**

Specific ownership per open finding (from baseline plan 003):

| Finding                                             | Severity    | Owner         | Required action                                                      |
| --------------------------------------------------- | ----------- | ------------- | -------------------------------------------------------------------- |
| Client-submitted chat history not signed            | ⚠️ Medium | Backend Agent | When implementing: consider HMAC signature or server-session history |
| `match_treatment_content()` RPC publicly callable | ⚠️ Medium | DB Agent      | Add RLS policy or wrap in an authenticated function                  |
| No CSRF token on`POST /api/chat`                  | ℹ️ Low    | Backend Agent | Add`Origin` / `Referer` header check in route handler            |
| No embedding caching                                | ℹ️ Low    | Backend Agent | Add TTL cache (Map or Supabase) keyed on normalized message text     |
| No monitoring/alerting on chat endpoint             | ℹ️ Low    | Backend Agent | Log anomalous patterns via`consola`; future: Supabase log drain    |

Rules baked into **all agents**:

- Never commit secrets, tokens, API keys, passwords, or service account JSON.
- All credentials referenced by env var name only (e.g. `process.env.OPENAI_API_KEY`).
- Never log credential values — redact with `[REDACTED]` in log output.
- Never include stack traces, SQL text, or raw upstream payloads in API responses
  (per `.rule/error-handling-rules.md`).

Rules baked into **QA Agent** security checklist (runs on every audit):

- [ ] No new `console.*` calls — all logging via `server/lib/logger.ts`.
- [ ] No secrets in source files or plan files.
- [ ] All new API inputs validated with `zod` before use.
- [ ] Medical disclaimer still present on chat responses.
- [ ] `npm run build` exits 0 with no TypeScript errors.

---

## 8. Update `.github/AGENTS.md`

- Add a section listing the 5 agents and their file locations.
- Reference `.github/agents/` as the agent directory.

# Validation

- [ ] All 5 `.agent.md` files appear in VS Code agent picker (or as subagents).
- [ ] Orchestrator successfully invokes DB Agent on a test schema question.
- [ ] QA Agent runs `npm run build` and returns a PASS verdict on unmodified code.
- [ ] Each agent output includes `Hopa!` and the GitHub Issue block.

# Risks

- `agent` tool alias may not support cross-agent invocation in all VS Code Copilot versions.
  Mitigation: test Orchestrator → QA Agent handoff immediately after setup.
- If `.github/agents/` is not automatically discovered, may need to add explicit `#agent:`
  references in AGENTS.md.
  Mitigation: documented in Step 7.

# Rollout Order

1. Create `.github/agents/` directory
2. `qa-agent.agent.md` (simplest — read-only, test immediately with `npm run build`)
3. `backend-agent.agent.md`
4. `db-agent.agent.md`
5. `frontend-agent.agent.md`
6. `orchestrator.agent.md` (last — depends on all others being available as subagents)
7. Update `AGENTS.md`

# Rollback

- Delete all files in `.github/agents/`.
- Remove the agents section added to `.github/AGENTS.md`.
- No code changes are made by this plan — rollback is non-destructive.
