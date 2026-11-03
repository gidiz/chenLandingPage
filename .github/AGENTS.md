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

## Planning
- Follow as defined in `.rule/planning-rules.md`.

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

## Multi-Agent Team
Thirteen agents are defined in `.github/agents/`. Invoke via the VS Code agent picker or as subagents.
Plans: `.plan/004-2026-08-17-multi-agent-setup.md` (core five), `.plan/006-2026-11-03-agent-team-expansion.md` (expansion).

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
| `.github/agents/backend-security-agent.agent.md` | Backend Security Agent | Server-side security audit, npm audit, PASS/FAIL |
| `.github/agents/frontend-security-agent.agent.md` | Frontend Security Agent | Client-side security audit (XSS, secrets, headers), PASS/FAIL |
| `.github/agents/compliance-accessibility-agent.agent.md` | Compliance & Accessibility Reviewer | Medical wording, IS 5568 / WCAG 2.0 AA, PASS/FAIL |
| `.github/agents/qa-agent.agent.md` | QA Agent | Build validation, coding standards, PASS/FAIL verdicts |
