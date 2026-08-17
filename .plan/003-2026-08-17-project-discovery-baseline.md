Status: active
Owner: User
Last updated: 2026-08-17

## GitHub Issue

**Title:** `[Orchestrator]: Project Discovery & Baseline Assessment`
**Labels:** `agent:orchestrator`, `status:in-review`

### Acceptance Criteria

- [X] Project structure and entry points documented
- [X] All dependencies inventoried
- [X] External integrations documented with credential names
- [X] Security findings captured with severity
- [X] Business domain summarized
- [ ] GTM/GA4 integration detail complete
- [ ] All future implementation plans reference this document

# Goal

Establish a verified baseline of the chenLandingPage project before implementing any new
features or fixes. This plan captures the multi-agent system context (architecture,
integrations, security posture, business domain) and serves as the reference document
for all subsequent plans.

# Scope

**In scope:**

- Project structure and entry points
- All installed dependencies and their roles
- External API integrations (Supabase, OpenAI, GTM/GA4, AWS, GitHub)
- Database schema overview (migrations 001–005)
- Security assessment of server-side API routes
- Business domain summary (clinic, services, audience)

**Out of scope:**

- Implementation of any feature or fix
- Content edits (Hebrew copy, SEO)
- Infrastructure provisioning

# Assumptions

- The workspace at `chenLandingPage/` reflects the current production state.
- All secrets are stored in environment variables; none are committed to git.
- Supabase RLS is intentionally disabled on treatment catalog tables (internal read-only app).
- The app runs as a Nuxt 3 SPA (SSR disabled); Nitro only powers the `server/api/` routes.

# Open Questions

1. **Next task**: What feature, bug, or improvement should be addressed next?
   Recommended: Review the security concerns (message history signing, RLS on RPC) as highest priority.

# Steps

This is a discovery plan — no implementation steps.
Findings are captured in the sections below as reference for future plans.

## Architecture Summary

- Framework: Nuxt 3.17.4, SPA mode, Vue 3.5, TypeScript
- Backend: Nitro server routes at `server/api/` (chat, videos, catalog)
- Database: Supabase Postgres + pgvector (5 migrations applied)
- Entry point: `app.vue` → `layouts/default.vue` → `pages/`
- Dynamic routes: `/[category]/[service].vue` for treatment pages

## Dependencies

| Package                    | Version  | Purpose                |
| -------------------------- | -------- | ---------------------- |
| nuxt                       | ^3.17.4  | Framework              |
| @supabase/supabase-js      | ^2.57.0  | DB client              |
| @modelcontextprotocol/sdk  | ^1.18.1  | MCP admin server       |
| googleapis                 | ^154.1.0 | GA4 + GTM read access  |
| @octokit/rest              | ^22.0.0  | GitHub API             |
| @aws-sdk/client-s3         | ^3.883.0 | S3 access              |
| @aws-sdk/client-cloudfront | ^3.883.0 | CloudFront             |
| postgres                   | ^3.4.5   | Direct Postgres client |
| zod                        | ^4.1.5   | Schema validation      |
| consola                    | ^3.4.2   | Structured logging     |

## External Integrations

| Service           | Endpoint / Table                                                                                       | Credentials                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Supabase          | treatment_categories, treatment_services, treatment_questions, treatment_content_chunks, clinic_videos | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY                                                        |
| OpenAI            | text-embedding-3-small (embeddings), gpt-4o-mini (chat)                                                | OPENAI_API_KEY                                                                                 |
| GTM               | `plugins/analytics.client.ts` — dynamic `<script>` injection, supports preview/draft environments | `NUXT_PUBLIC_GTM_CONTAINER_ID`, `NUXT_PUBLIC_GTM_AUTH`, `NUXT_PUBLIC_GTM_PREVIEW`        |
| GA4               | `window.dataLayer` push via GTM data layer; measurement ID passed to GTM config                      | `NUXT_PUBLIC_GA_MEASUREMENT_ID`                                                              |
| GA4 Admin (MCP)   | Read-only analytics via`googleapis` — properties, goals, audiences                                  | Google service account (`GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_SERVICE_ACCOUNT_JSON`) |
| GTM Admin (MCP)   | Read-only GTM container/tags/triggers inspection via`googleapis`                                     | Same Google service account                                                                    |
| AWS S3/CloudFront | Asset delivery (MCP read-only)                                                                         | AWS SDK env vars                                                                               |
| GitHub            | Repo admin (MCP read-only)                                                                             | GITHUB_TOKEN                                                                                   |

## Security Assessment

| Severity    | Finding                                                                |
| ----------- | ---------------------------------------------------------------------- |
| ⚠️ Medium | Client-submitted chat history not signed — history injection possible |
| ⚠️ Medium | `match_treatment_content()` RPC publicly callable, no RLS guard      |
| ℹ️ Low    | No embedding response caching — OpenAI cost exposure at scale         |
| ℹ️ Low    | No CSRF token on POST /api/chat                                        |
| ✅ OK       | All secrets via env vars only                                          |
| ✅ OK       | IP-based rate limiting on chat (8 req/60s default)                     |
| ✅ OK       | Medical disclaimer appended to all AI chat responses                   |
| ✅ OK       | AbortController timeout on all external API calls                      |

## Business Domain

- **Clinic**: Dr. Chen Fredo (חן פרדו), Kfar Saba, Israel
- **Services**: Botox, Fillers, Morpheus8, IPL/Lumecca, MiraDry, Biotech Stimulators
- **Audience**: Israeli women 28–70+, Hebrew-first content
- **Chatbot**: Hebrew RAG assistant, professional+warm tone, no medical guarantees

# Validation

- [X] All future plans reference this document as the baseline.
- [X] Security findings addressed in dedicated follow-up plans.

# Risks

- No active monitoring or alerting on the chat endpoint — abuse may go undetected.
- Single OpenAI API key — no fallback if key is revoked.
- Static video fallback may diverge from DB over time if not kept in sync.

# Rollout Order

N/A — discovery plan only.

# Rollback

N/A — discovery plan only.
