# Deployment Rules

## Purpose
- Document deployment architecture, operational concerns, and external dependencies for the Nuxt landing site.

## Technology Stack

- **Runtime**: Node.js with Nuxt 3 and Vue 3
- **Rendering**: Client-side only (SSR disabled)
- **Styling**: CSS with custom properties, responsive mobile-first
- **Package Manager**: npm (with package-lock.json)
- **Build Output**: Static site served from `.output/public`

## External Dependencies

- **Nuxt and Vue** – Application framework and reactive UI library
- **Google Tag Manager (GTM)** and **Google Analytics** – Client-side analytics through `plugins/analytics.client.ts`
- **Google Analytics Admin/Data APIs** – Read-only MCP access through `server/mcp/index.ts`
- **Google Tag Manager API** – Read-only MCP access through `server/mcp/index.ts`
- **AWS S3** – Static site hosting for `.output/public` content
- **CloudFront** (optional) – CDN for caching and content distribution
- **AWS SDK** – Read-only MCP inspection of S3 and CloudFront through `server/mcp/index.ts`
- **GitHub API** – Read-only MCP access to repository metadata and issues through `server/mcp/index.ts`
- **GitHub Actions** – CI/CD pipeline for builds and deployments (see `.github/workflows/deploy.yml`)
- **Environment Configuration** – Nuxt runtime config with `NUXT_PUBLIC_*` prefix for environment-specific values

## Hosting and Deployment

- The site is deployed as a **static build** to AWS S3.
- Build artifacts are generated via `npm run generate`, which outputs to `.output/public`.
- GitHub Actions workflow handles automated builds and S3 deployment.
- CloudFront may cache static assets; clear cache if needed after deployment.

## Environment Variables

- All runtime environment variables use the `NUXT_PUBLIC_*` prefix (Nuxt convention).
- **Analytics environment variables**:
  - `NUXT_PUBLIC_GTM_AUTH` – GTM container auth code
  - `NUXT_PUBLIC_GTM_PREVIEW` – GTM preview environment ID
  - `NUXT_PUBLIC_GTM_COOKIES_WIN` – Cookie consent window settings
  - `NUXT_PUBLIC_APP_ENVIRONMENT` – Current deployment environment (e.g., staging, production)
- **MCP integration variables**:
  - `AWS_REGION` – Default AWS SDK region for MCP inspection tools
  - `AWS_ACCESS_KEY_ID` – Optional AWS access key for local MCP usage
  - `AWS_SECRET_ACCESS_KEY` – Optional AWS secret key for local MCP usage
  - `AWS_SESSION_TOKEN` – Optional AWS session token for temporary credentials
  - `GOOGLE_APPLICATION_CREDENTIALS` – Optional path to a Google service-account JSON file
  - `GOOGLE_SERVICE_ACCOUNT_JSON` – Optional inline Google service-account JSON payload
  - `GITHUB_TOKEN` – Optional GitHub token for higher rate limits or private repos
  - `GITHUB_REPOSITORY` – Optional owner/repo override for GitHub MCP tools
- See `.github/workflows/deploy.yml` and `nuxt.config.ts` for how variables are injected.
- See `.vscode/mcp.json` and `server/mcp/README.md` for MCP startup and credential expectations.

## Auth and Org Boundaries

- There is **no authentication layer** in this project.
- There is **no organization scoping or tenant isolation**.
- The site is **public** with no protected routes or user sessions.
- No user data is stored or persisted on the backend.

## Analytics and Consent

- Analytics is **client-only** through `plugins/analytics.client.ts`.
- Events are pushed into `window.dataLayer` on mount and route changes.
- Consent state is stored in local storage and defaults to granted on app mount.
- If consent UI is added, update the plugin behavior to coordinate with consent state rather than layering duplicate tracking logic elsewhere.

## Operational Concerns

- **Build warnings**: The current `npm run generate` may show a warning about `assets/cover.png`. Track this separately if it is not being fixed in the current change.
- **CSS asset duplication**: CSS files exist in both `assets/css/` and `public/assets/css/`. The active entry point is `assets/css/index.css`. Only edit `public/assets/css/` if the task is explicitly about static duplicated assets.
- **Validation before deployment**:
  - For visual or component changes, run `npm run build`.
  - For changes affecting deployment output, runtime config, routing, or public assets, run `npm run generate`.
- **SEO**: Each page defines metadata for search engines and social sharing.
- **RTL and Hebrew**: The site defaults to RTL layout with logical CSS properties (no hard-coded left/right rules unless necessary and documented).

## Change Triggers

- Update this file when deployment architecture, hosting provider, build process, or environment variable strategy changes.
- See `.doc/architecture.md` for changes to system components or data flow.
