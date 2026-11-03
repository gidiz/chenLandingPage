Status: done
Owner: User
Last updated: 2026-11-03

## GitHub Issue

**Title:** `[Orchestrator]: Expand multi-agent team — security, content, SEO, analytics, RAG, compliance, ops agents`
**Labels:** `agent:orchestrator`, `status:done`
**Epic:** #14 — children #6 Frontend Security, #7 Backend Security, #8 Content, #9 Compliance & Accessibility, #10 SEO/GEO, #11 Analytics & Campaign, #12 RAG Quality, #13 Release/Ops

### Acceptance Criteria

- [x] This plan created in `.plan/006-2026-11-03-agent-team-expansion.md`
- [x] 8 agent files created in `.github/agents/`:
  - [x] `frontend-security-agent.agent.md` (#6)
  - [x] `backend-security-agent.agent.md` (#7)
  - [x] `content-agent.agent.md` (#8)
  - [x] `compliance-accessibility-agent.agent.md` (#9)
  - [x] `seo-geo-agent.agent.md` (#10)
  - [x] `analytics-campaign-agent.agent.md` (#11)
  - [x] `rag-quality-agent.agent.md` (#12)
  - [x] `release-ops-agent.agent.md` (#13)
- [x] `.github/agents/orchestrator.agent.md` updated: `agents` frontmatter list, Team table, Step 3 invocation order, Security section
- [x] `.github/AGENTS.md` lists all 13 agents with one-line roles
- [x] `docs-agents-recommendation.html` updated to reflect the implemented team
- [x] Every new agent starts with `Hopa!`, prefixes `[Agent Name]`, and emits the GitHub Issue block
- [x] `[QA Agent]` verdict: PASS on the agent-file set (frontmatter valid, tool restrictions match role, rule references resolve)
- [x] Plan marked `Status: done`

---

# Goal

Grow the 5-agent team from `.plan/004-2026-08-17-multi-agent-setup.md` (Orchestrator, DB, Backend,
Frontend, QA) into a 13-agent team by adding eight specialist agents recommended in
`docs-agents-recommendation.html`: two read-only security reviewers that gate the loopback before
QA, plus six domain agents (content, compliance & accessibility, SEO/GEO, analytics & campaign,
RAG quality, release/ops) that the Orchestrator invokes on demand by task type. Every agent keeps
the established conventions: scoped tools, `.rule/` references, `Hopa!` greeting, `[Name]` prefix,
and the GitHub Issue output block.

This plan **extends** `.plan/004-2026-08-17-multi-agent-setup.md` (which stays `Status: done`) and
**follows** the structure proposed in `docs-agents-recommendation.html`.

# Scope

**In scope:**

- `.github/agents/frontend-security-agent.agent.md` — read-only client-side security review (`[read, search]`)
- `.github/agents/backend-security-agent.agent.md` — read-only server-side security review (`[read, search, execute]`, execute limited to `npm audit --omit=dev`, `npm run mcp:typecheck`, `npm run build`)
- `.github/agents/content-agent.agent.md` — Hebrew medical copy, treatment catalog text, FAQ content
- `.github/agents/compliance-accessibility-agent.agent.md` — Israeli medical-advertising compliance, IS 5568 / WCAG 2.0 AA, RTL a11y
- `.github/agents/seo-geo-agent.agent.md` — meta/JSON-LD/sitemap, local SEO, generative-engine optimisation
- `.github/agents/analytics-campaign-agent.agent.md` — GTM/GA4 events, `plugins/analytics.client.ts`, campaign landing variants
- `.github/agents/rag-quality-agent.agent.md` — retrieval rule tuning, answer quality evals, disclaimer wording checks
- `.github/agents/release-ops-agent.agent.md` — build/deploy checklist per `.rule/deployment-rules.md`, env var inventory, rollback steps
- `.github/agents/orchestrator.agent.md` — frontmatter `agents` list, Team table, Step 3 order, Security section
- `.github/AGENTS.md` — 13-agent roster
- `docs-agents-recommendation.html` — mark recommendations as implemented, link to this plan
- This plan file

**Out of scope:**

- Any change to application code under `server/`, `components/`, `pages/`, `composables/`, `plugins/`, `assets/`
- Fixing the open security findings the new agents will report (CSRF, zod on chat route, RLS on RPC, MCP write tools, security headers) — each gets its own follow-up plan
- Real GitHub API automation (issues remain formatted text; issue numbers #6–#14 are referenced manually)
- Adding a Vitest suite (deferred from plan 004, Open Question 3)

# Assumptions

- VS Code agent customization continues to load `.github/agents/*.agent.md` at workspace scope with `tools`, `user-invocable`, `name`, `description` frontmatter.
- The Orchestrator's `agent` tool can invoke any `user-invocable: true` agent by its `name`.
- Security agents are reviewers only; the `[Frontend Agent]`, `[Backend Agent]`, and `[DB Agent]` remain the sole editors in their domains.
- GitHub issues #6–#14 already exist in the repository with the titles listed in the Epic line above.
- `docs-agents-recommendation.html` at the repository root is the design source for agent names, scopes, and tool lists.
- The loopback budget stays fixed at 3 retries per issue (plan 004, Open Question 4).

# Open Questions

1. **Do Low-severity security findings block the loopback?**
   Recommended: no — Low findings are advisories listed under the PASS verdict; only Medium and
   above trigger `❌ Security Loopback Triggered`. This keeps review fatigue down and matches the
   QA Agent's binary PASS/FAIL model.
   → Applied as recommended

2. **May the Backend Security Agent run `npm audit`?**
   Recommended: yes — grant `execute` but restrict it in the agent body to exactly
   `npm audit --omit=dev`, `npm run mcp:typecheck`, and `npm run build`. No network-touching
   scripts (`mcp:start`, `mcp:smoke`, migrations, seeds).
   → Applied as recommended

3. **How are the existing MCP write tools (`gtm_create_*`, `gtm_update_tag`, `gtm_deploy_version_to_environment`) treated given the "MCP is read-only" rule?**
   Recommended: flag as a standing **Medium** finding (not Critical) until a follow-up plan either
   documents them as intentional and updates `.github/agents/backend-agent.agent.md`, or gates them
   behind an env flag that defaults off.
   → Applied as recommended

4. **Orchestrator invocation order with the new agents?**
   Recommended: DB → Backend → Frontend → Backend Security → Frontend Security →
   Compliance & Accessibility → QA. Security reviewers run after implementation and before QA so
   that QA sees a hardened change set. Content, SEO/GEO, Analytics & Campaign, RAG Quality, and
   Release/Ops are invoked **on demand by task type** (not in the default chain): Content/SEO for
   copy and page tasks, Analytics for tracking tasks, RAG Quality for chat/retrieval tasks,
   Release/Ops before any deploy.
   → Applied as recommended

# Steps

> Execution approved per the answers above.

## 1. Author the security reviewer agents (#6, #7)

- Create `.github/agents/frontend-security-agent.agent.md` using `.github/agents/qa-agent.agent.md`
  as the structural template: read-only, severity table, 8-item checklist (v-html sinks, JSON-LD
  break-out, `NUXT_PUBLIC_*` only, `noopener`, dataLayer/PII, third-party origins, security headers
  advisory, `/api/*`-only composables), `### ✅ Security Verdict: PASS` / `### ❌ Security Loopback
  Triggered` with Target `[Frontend Agent]`.
- Create `.github/agents/backend-security-agent.agent.md`: read-only plus restricted `execute`,
  13-item checklist (zod boundary + limits, CSRF, rate limit store, secrets, error shape, logging,
  disclaimer, prompt injection, outbound timeouts, migrations/RLS, MCP write tools, `npm audit`,
  build), Target `[Backend Agent]` / `[DB Agent]`.
- Both cite `Tracking issue: #N (child of Epic #14)` and use labels `agent:security`, `status:in-review`.

## 2. Author the domain agents (#8–#13)

- `content-agent.agent.md` — tools `[read, edit, search]`; owns Hebrew copy in `components/`, `pages/`, treatment catalog text and `server/db/content/chen-treatment-notes.json`; forbidden-phrase list for medical claims; hands off to DB Agent for `rag:chunks:backfill`.
- `compliance-accessibility-agent.agent.md` — tools `[read, search]` (reviewer); IS 5568 / WCAG 2.0 AA, RTL, contrast, alt text, medical-advertising claims, accessibility statement page; verdict format mirrors the security agents.
- `seo-geo-agent.agent.md` — tools `[read, edit, search, execute]`; `useSeoMeta`, JSON-LD, `server/api/_sitemap-urls.get.ts`, `server/routes/robots.txt.ts`, Hebrew keywords, GEO snippets; coordinates with Frontend Security on JSON-LD escaping.
- `analytics-campaign-agent.agent.md` — tools `[read, edit, search, execute]`; sole owner of `plugins/analytics.client.ts`, `useAnalytics` event dictionary, `pages/lp/*`, GTM/GA4 via MCP; never pushes PII; GTM deploys dev-first.
- `rag-quality-agent.agent.md` — tools `[read, edit, search, execute]`; owns `server/rag/chat-retrieval-rules.ts` coverage and `server/rag/golden-set.json`; pipeline changes go to `[Backend Agent]`.
- `release-ops-agent.agent.md` — tools `[read, edit, search, execute]`; edits README / `.env.example` / `.plan` only; env matrix, migration order, release checklist, rollback runbook.

## 3. Update the Orchestrator

- `.github/agents/orchestrator.agent.md`:
  - Add all 8 new agent names to the `agents` frontmatter list.
  - Extend the Team table with role, tools, and tracking issue per agent.
  - Rewrite Step 3 invocation order to: DB → Backend → Frontend → Backend Security → Frontend Security → Compliance & Accessibility → QA, plus the on-demand rule for Content / SEO-GEO / Analytics & Campaign / RAG Quality / Release-Ops.
  - Add a **Security** section: Medium+ security findings trigger loopback to the owning implementation agent and count toward the same 3-retry budget; Low findings are recorded as advisories in the plan.

## 4. Update rosters and docs

- `.github/AGENTS.md`: list the 13 agents with one-line roles and `.agent.md` paths; keep the `Hopa!` rule.
- `docs-agents-recommendation.html`: mark each recommended agent as implemented, link to this plan and to the agent files.

## 5. QA pass

- Invoke `[QA Agent]` on the agent-file set: frontmatter parses, every `tools` list matches the role (reviewers have no `edit`), every `.rule/` path referenced exists, all bodies contain `Hopa!`, prefix, and Issue block.
- Fix any FAIL via the Orchestrator loopback (max 3).

## 6. Close out

- Tick all acceptance criteria, set `Status: done`, `Last updated` to the completion date.

# Validation

- Each new `.agent.md` opens in the VS Code agent picker under its `name` and responds with `Hopa!` + `[Name]` prefix + GitHub Issue block when invoked directly.
- Orchestrator dry run on a sample task (e.g. "add a new FAQ entry") produces an issue checklist that assigns Content → Frontend → Backend Security → Frontend Security → Compliance & Accessibility → QA in that order.
- `[Frontend Security Agent]` dry run on the current tree reports the security-headers item as a non-blocking Medium advisory and PASSes.
- `[Backend Security Agent]` dry run on the current tree reports the known open findings (chat route zod, CSRF, RLS, MCP write tools) as Medium with correct Target Agents, and `npm audit --omit=dev` output is summarised without secrets.
- `grep -L "Hopa!" .github/agents/*.agent.md` returns nothing.
- No agent file contains a secret, token, or absolute machine path.

# Risks

- **Review fatigue** — three reviewers (two security + compliance) before QA lengthen every loop. Mitigation: Low findings never block; reviewers review the diff, not the whole tree; Orchestrator may skip a reviewer when the diff does not touch its domain.
- **`v-html` false positives** — the Frontend Security Agent could repeatedly flag the two accepted sinks (`components/PageHero.vue`, `components/treatments/TreatmentInfoSection.vue`). Mitigation: known-accepted list is explicit in the agent file and only changed bindings are flagged.
- **Conflicting verdicts** — e.g. SEO/GEO wants inline JSON-LD while Frontend Security demands escaping, or Content wants claims that Compliance rejects. Mitigation: security and compliance verdicts take precedence; the Orchestrator records the conflict in the plan and the human owner arbitrates after one loop.
- **Known open findings block every change** — Medium findings for CSRF / zod / RLS / MCP write tools exist on the current tree. Mitigation: these are reported as *pre-existing* in the verdict and only block when the diff touches the affected file; each has its own follow-up plan.
- **Tool alias drift** — `execute` policy relies on agent discipline, not enforcement. Mitigation: the allowed-commands list is explicit in the agent body; QA checks for it.

# Rollout Order

1. Create this plan (`.plan/006-2026-11-03-agent-team-expansion.md`).
2. Create `frontend-security-agent.agent.md` and `backend-security-agent.agent.md` (#6, #7).
3. Create `content-agent`, `compliance-accessibility-agent`, `seo-geo-agent` (#8, #9, #10).
4. Create `analytics-campaign-agent`, `rag-quality-agent`, `release-ops-agent` (#11, #12, #13).
5. Update `orchestrator.agent.md`.
6. Update `.github/AGENTS.md` and `docs-agents-recommendation.html`.
7. QA pass → mark plan done.

# Rollback

- Delete the eight new files under `.github/agents/` and revert `orchestrator.agent.md`, `.github/AGENTS.md`, and `docs-agents-recommendation.html` via `git checkout -- <path>`; the 5-agent system from plan 004 resumes unchanged.
- No application code, migrations, or environment variables are touched, so no runtime rollback is required.
- If only the security gate causes friction, remove Backend Security / Frontend Security from the Orchestrator's Step 3 order and keep them as on-demand agents; mark this plan `Status: superseded` with a link to the replacement plan.
