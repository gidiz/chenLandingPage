# Agent Instructions

## Communication with Me
- Please start all your responses with Hopa!

## Security
- Never commit or expose secrets (tokens, API keys, passwords, cluster credentials, secret values).

## Coding Style
- Follow the repository coding style defined in `.rule/coding-rules.md`.

## Naming Conventions
- Follow as defined in `.rule/naming-rules.md`.

## Glossary and Terms
- Use canonical domain terms from `.doc/glossary.md`.
- Keep new shared terms documented there before broad usage.

## Architecture and Deployment Docs
- Architecture overview and component design: `.doc/architecture.md`.
- Deployment architecture, tech stack, and operational concerns: `.rule/deployment-rules.md`.
- Keep these docs updated when major component ownership, data flows, deployment strategy, or environment variables change.

## Issue Workflow and Planning
- Follow `.rule/planning-rules.md` and the **Shared GitHub Issue Workflow Contract** below.
- GitHub Issues are authoritative for task requirements, acceptance criteria, dependencies, approval, status, and retry counts.
- `.plan/` files are historical architecture/reference material. Do not treat them as current task requirements or create/update plans automatically.

## Versioning
- Follow as defined in `.rule/versioning-rules.md`.

## Product Definition
- Follow as defined in `.doc/product-definition.md`.

## Error Handling
- Follow as defined in `.rule/error-handling-rules.md`.

## Testing
- Follow as defined in `.rule/testing-rules.md`.

## UI and Styling
- UI-specific guidance: `.rule/ui-rules.md`.
- CSS and styling guidance: `.rule/style-rules.md`.
- Design tokens, branding, and color palette: defined in `.rule/style-rules.md`.

## Feature-Scoped Work and Validation
- All implementers, reviewers, and the Orchestrator work on the requested feature and its directly affected behavior only. Follow dependencies only as needed to implement or verify that behavior.
- A full-site review, repository-wide bug search, or general dependency audit requires an explicit user request. Specialist ownership lists describe eligible areas, not a requirement to inspect every file in those areas.
- Delegate only the relevant paths and criteria, with a clear stopping point. Do not recruit extra reviewers or expand the task merely because an unrelated issue is discovered.
- Run the smallest meaningful tests and inspect only affected routes and interactions. A project build may validate compilation when needed; it is not permission to review the rest of the site.
- Record unrelated pre-existing findings as separate follow-up tasks. Do not repair them or make them feature blockers unless they demonstrate a directly affected unsafe behavior or regression.
- Report scoped verdicts and actual checks honestly; do not imply that unreviewed areas or explicitly deferred criteria passed.
- This scope rule applies to every specialist checklist and takes precedence over broad domain lists below or in agent definitions.

## Multi-Agent Team
Thirteen agents are defined in `.github/agents/`. Invoke via the VS Code agent picker or as subagents.
Historical architecture references: `.plan/004-2026-08-17-multi-agent-setup.md` (core five), `.plan/006-2026-11-03-agent-team-expansion.md` (expansion).

### Coordination
| File | Agent | Role |
|---|---|---|
| `.github/agents/orchestrator.agent.md` | Orchestrator | Task planning, GitHub Issue checklists, loopback coordination |

### Implementers
| File | Agent | Role |
|---|---|---|
| `.github/agents/db-agent.agent.md` | DB Agent | Schema, SQL migrations, pgvector, Supabase RPCs |
| `.github/agents/backend-agent.agent.md` | Backend Agent | Nitro API routes, RAG pipeline, MCP server |
| `.github/agents/frontend-agent.agent.md` | Frontend Agent | Vue components, pages, composables, CSS |
| `.github/agents/content-agent.agent.md` | Content Agent | Hebrew medical copy, catalog text, treatment notes JSON |
| `.github/agents/seo-geo-agent.agent.md` | SEO / GEO Agent | Meta tags, JSON-LD, sitemap, robots, keyword strategy |
| `.github/agents/analytics-campaign-agent.agent.md` | Analytics & Campaign Agent | dataLayer events, GTM/GA4 via MCP, campaign landing pages |
| `.github/agents/rag-quality-agent.agent.md` | RAG Quality Agent | Retrieval rules, golden set, hallucination audits |
| `.github/agents/release-ops-agent.agent.md` | Release / Ops Agent | Vercel env matrix, migration order, release checklist |

### Reviewers (read-only)
| File | Agent | Role |
|---|---|---|
| `.github/agents/ui-ux-agent.agent.md` | UI/UX Agent | UX audit, visual hierarchy, conversion path, design specs, PASS/FAIL |
| `.github/agents/backend-security-agent.agent.md` | Backend Security Agent | Server-side security audit, npm audit, PASS/FAIL |
| `.github/agents/frontend-security-agent.agent.md` | Frontend Security Agent | Client-side security audit (XSS, secrets, headers), PASS/FAIL |
| `.github/agents/compliance-accessibility-agent.agent.md` | Compliance & Accessibility Reviewer | Medical wording, IS 5568 / WCAG 2.0 AA, PASS/FAIL |
| `.github/agents/qa-agent.agent.md` | QA Agent | Build validation, coding standards, PASS/FAIL verdicts |

### Shared GitHub Issue Workflow Contract

- **The Orchestrator is the sole GitHub writer.** Only the Orchestrator creates or edits issues, comments, labels, status, dependency links, or retry records. Specialists report findings and results for the Orchestrator to post.
- **The Orchestrator owns Issue finalization.** A merged PR is not proof that every linked Issue is complete. After merge, verify each Issue's actual acceptance criteria and required reviews independently; synchronize its checklist and workflow status, post the PR/merge/validation evidence, close it only when all criteria and any user-acceptance gates are satisfied, then read it back to verify `CLOSED` and `status:done`. Keep partial, blocked, or awaiting-acceptance Issues open and document what remains. Parent Issues close only after all parent criteria and child Issues are complete.
- The repository's default branch is `main`, while feature PRs normally target `develop`. Do not assume GitHub closing keywords will close an Issue when a PR is merged into `develop`; explicitly perform and verify the completion transition after merge. Use `Fixes #<number>` only for Issues fully addressed by that PR and `Refs #<number>` for partial work.
- GitHub Issues are the source of truth for requirements, acceptance criteria, dependencies, approval, status, and retry counts. `.plan/` files remain historical architecture/reference material; do not make a new plan automatically or use one as task authority or an approval gate.
- Before work, every specialist reads this file and the actual assigned GitHub issue context. The Orchestrator supplies the real repository, issue number and URL, parent/child issue numbers and URLs when applicable, current scope and non-goals, criteria and dependencies, assigned role, exclusive writable paths, validation, and required reviews. Specialists must not infer missing task details from unrelated historical issues or plans.
- Work only within the assigned issue and exclusive writable paths. Do not edit shared files in parallel with another specialist. Preserve each role's domain, read-only, security, and medical-compliance restrictions.
- Use only real issue identity supplied by the Orchestrator. A response title block, labels, or proposed issue text does not create an issue. Do not bind a task to an unrelated permanent/historical issue. If launched without a real issue and sufficient context, ask for the issue or return proposed issue requirements; never claim an issue was created.
- Return a structured report identifying the supplied repository and actual issue number/URL (plus parent/child issue numbers/URLs when provided), changed paths (or none), evidence for every acceptance criterion, validation commands and results, and risks. Reviewers additionally give an explicit PASS/FAIL verdict; every failure identifies the exact criterion, target agent, and required fix. Do not post to GitHub.
- The Orchestrator records retry counts in comments on the authoritative issue. Allow at most three failed repair attempts per issue; the count persists across sessions and must never be silently reset. At the limit, mark the task blocked through the Orchestrator and request human intervention.
