# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Issue-driven agent workflow

Choose **Orchestrator** in the VS Code agent picker and describe the requested outcome,
or provide an existing GitHub Issue URL. The workspace definitions live in
[.github/agents/](.github/agents/); no additional agent is required.

Example request:

> Coordinate this feature through GitHub Issues: clarify the requirements, create a parent
> issue and independently verifiable sub-issues where needed, dispatch the relevant
> specialists, and report validation evidence. Do not merge or deploy without my approval.

Prerequisites: GitHub CLI (`gh`), authenticated access to `gidiz/chenLandingPage`, enabled
Issues, and permission to create/edit issues and the required labels. Run `gh auth login`
if needed. Allow the Orchestrator's terminal operations when prompted; never paste tokens
into chat or issue bodies.

- **Actual Issues are the source of truth** for requirements, acceptance criteria,
  approvals, dependencies, status and repair counts. Existing [.plan/](.plan/) documents
  remain historical architecture references; new plans are not mandatory.
- The Orchestrator creates/verifies issues, links native sub-issues when supported,
  and posts specialist handoffs centrally. If native sub-issues are unavailable, it
  reports that limitation and uses reciprocal issue links.
- Each specialist receives actual issue context, exclusive writable paths and validation
  requirements. Independent, disjoint work can run concurrently; shared files have one
  writer at a time. Read-only reviewers report evidence rather than posting to GitHub.
- Labels track `status:draft`, `status:in-progress`, `status:in-review`, `status:blocked`
  and `status:done`. Missing labels are created only as needed.
- Applicable reviewers and QA validate the final changes. At most three repair attempts
  are allowed per issue, tracked in issue comments across sessions. Documentation-only
  work uses syntax/contract checks instead of an unrelated application build.
- When authorized, a PR links the actual issues. QA PASS does not imply merge: code
  issues remain in review until integration is verified. Local-only delivery requires
  user acceptance before closure. Merging and production deployment require approval.

This is a **conversation-driven agent workflow**, not a GitHub Actions automation.
An issue owner such as `Frontend Agent` is a routing role, not a GitHub assignee;
creating or assigning an Issue does not automatically start local agents.
For resuming, give the Orchestrator the issue URL so it reads recorded progress first.
See the [shared contract](.github/AGENTS.md) and
[Orchestrator definition](.github/agents/orchestrator.agent.md).

## Deployment (Vercel)

This project is deployed on **Vercel**. There is no GitHub Actions workflow — the previous AWS S3 workflow was removed in commit `cc96bdb` ("remove AWS deployment workflow in favor of Vercel deployment").

Vercel runs `nuxt build`, which Nitro compiles with the Vercel preset into `.vercel/output`. Server routes (`server/api/**`, `server/routes/**`) run as serverless functions, so the Supabase-backed catalog, the sitemap source and the chat endpoint all work in production.

### Environment detection

Vercel injects `VERCEL_ENV` automatically on every build (`production`, `preview` or `development`). `server/routes/robots.txt.ts` reads it, so crawling rules are correct without any manual configuration:

| Deployment | `VERCEL_ENV` | `robots.txt` |
| --- | --- | --- |
| Production | `production` | `Allow: /` plus the sitemap reference |
| Preview (branch or PR) | `preview` | `Disallow: /` |
| Local | unset | `Disallow: /` |

Setting `NUXT_PUBLIC_APP_ENVIRONMENT=production` still forces the production rules if you need to override this.

> Do not add a `public/robots.txt` file. Nitro serves static assets from `public/` before server routes, so it would shadow `server/routes/robots.txt.ts` and ship whatever is hardcoded in it.

## Analytics environment configuration

This app supports loading a GTM environment-specific snippet through Nuxt runtime config and Vercel environment variables.

### Local environment variables

Set these variables in your local `.env` file when you want to test a non-live GTM environment:

```bash
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NUXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
NUXT_PUBLIC_GTM_AUTH=YOUR_GTM_AUTH_TOKEN
NUXT_PUBLIC_GTM_PREVIEW=env-XX
NUXT_PUBLIC_GTM_COOKIES_WIN=x
NUXT_PUBLIC_APP_ENVIRONMENT=development
```

Notes:

- Leave `NUXT_PUBLIC_GTM_AUTH` and `NUXT_PUBLIC_GTM_PREVIEW` empty to load the live GTM container snippet.
- `NUXT_PUBLIC_APP_ENVIRONMENT` is pushed into the dataLayer as `app_environment` for debugging and tag routing.
- In GTM, use the built-in `Environment Name` variable for lookup tables that switch between GA4 Measurement IDs.

### Vercel environment variables

Set these in the Vercel dashboard under **Settings -> Environment Variables**, scoped per environment (Production / Preview / Development):

- `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase project credentials.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only. Used by the sitemap source route. Never expose it to the client.
- `NUXT_PUBLIC_GA_MEASUREMENT_ID`: The GA4 Measurement ID for that environment.
- `NUXT_PUBLIC_GTM_CONTAINER_ID`: Your GTM container ID.
- `NUXT_PUBLIC_GTM_AUTH`, `NUXT_PUBLIC_GTM_PREVIEW`, `NUXT_PUBLIC_GTM_COOKIES_WIN`: Optional GTM environment values.
- `NUXT_PUBLIC_APP_ENVIRONMENT`: A readable environment label such as `development` or `production`.
- `OPENAI_API_KEY` and the `RAG_*` variables: Server-only configuration for the chat endpoint. See `.env.example`.

Recommended analytics values:

- Preview: the dev GA4 Measurement ID, dev GTM auth/preview values, and `NUXT_PUBLIC_APP_ENVIRONMENT=development`
- Production: the prod GA4 Measurement ID, empty GTM auth/preview to use the Live environment, and `NUXT_PUBLIC_APP_ENVIRONMENT=production`

## Medical hyperhidrosis catalog

The standalone category `/hyperhidrosis` uses the existing dynamic catalog routes.
The seven service paths are `/hyperhidrosis/armpits`, `/hyperhidrosis/face`,
`/hyperhidrosis/hands`, `/hyperhidrosis/chest`, `/hyperhidrosis/intimate-areas`,
`/hyperhidrosis/scalp` and `/hyperhidrosis/nape`. The legacy
`/treatments/hyperhidrosis` URL continues redirecting to the category.

After medical-content approval, back up any existing `hyperhidrosis` records and
confirm the migration runner's `RAG_POSTGRES_URL` (or `SUPABASE_DB_URL` / `DATABASE_URL`)
points to the same Supabase project as the site's catalog, not an unrelated local database.
Apply only the new data migration; do not replay older content migrations:

```powershell
npm run rag:catalog:migrate -- --file=server\db\migrations\012_2026-11-06_hyperhidrosis_catalog.sql
npm run rag:chunks:backfill -- --category=hyperhidrosis
```

The migration upserts only this category, the seven named services and their first
three FAQs, preserving unrelated records. Existing target content requires a before-image
backup for lossless rollback; deletion is appropriate only for verified clean inserts.
Verify the catalog API contains all seven services, three FAQs each, and that the sitemap
source includes the eight routes. The optional `--category` backfill flag updates only
that category's retrieval chunks; omitting it preserves the existing whole-site backfill.
The chunk command requires Supabase write access and an embeddings API key. Neither
command deploys the application. Content remains subject to clinician confirmation
of regional suitability and the applicable product indications.

## Treatment FAQs

The prepared FAQ source for issue #17 is
[`server/db/content/treatment-faqs.json`](./server/db/content/treatment-faqs.json):
it adds 8 questions per treatment, preserving the existing hyperhidrosis questions.
Treatment pages render `treatment_questions` from the catalog API, and the RAG chunk
backfill indexes the same rows. Apply migration 013 only to the verified site Supabase
project; it is transactional, insert-only, idempotent, and aborts if the live catalog
or FAQ baseline differs from its preconditions. After applying it, run the full
`npm run rag:chunks:backfill` command to refresh all treatment and site-content chunks.

## MCP Integrations

This repository now includes a local MCP server for operational and analytics read access.

### What it exposes

- GA4 Admin API tools
- GA4 Data API tools
- Google Tag Manager API tools
- AWS S3 and CloudFront tools
- GitHub repository and issue tools

### Workspace setup

The shared VS Code workspace configuration lives at `.vscode/mcp.json` and starts the local server with:

```bash
npm run mcp:start
```

The workspace config loads environment variables from `.env`. Keep `.env.example` as the tracked template for required keys, and keep real credentials only in your local `.env` or shell environment.

### Required environment variables

Google authentication options:

- `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON file
- `GOOGLE_SERVICE_ACCOUNT_JSON` containing the JSON payload directly
- or Application Default Credentials if you already have them configured locally

For Google Tag Manager access, prefer a service account. Grant that service account access in the GTM account or container UI, then point the MCP server at the service-account JSON through one of the variables above.

User ADC with the default gcloud client can be blocked for GTM scopes in this workspace, so service-account auth is the reliable path here.

If your organization blocks service-account key creation, use a custom OAuth client instead of the default gcloud client:

```bash
gcloud auth application-default login --client-id-file=/path/to/oauth-client.json --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/tagmanager.readonly
gcloud auth application-default set-quota-project chen-web-500809
```

Use the OAuth client JSON you created in Google Cloud Console, not the default gcloud OAuth client.

AWS variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` when you use temporary credentials

GitHub variables:

- `GITHUB_TOKEN` for higher rate limits or private repositories
- `GITHUB_REPOSITORY` to override the default `gidiz/chenLandingPage`

### Validation

Use these commands locally:

```bash
npm run mcp:smoke
npm run mcp:typecheck
```

Then start the MCP server in VS Code and confirm these read-only tools work:

1. `ga4_list_accounts`
2. `ga4_run_report`
3. `gtm_list_accounts`
4. `aws_list_s3_buckets`
5. `github_get_repository`

Detailed setup notes and provider-specific permissions are documented in `server/mcp/README.md`.
