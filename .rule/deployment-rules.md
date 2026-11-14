# Deployment Rules

## Purpose
- Document deployment architecture, operational concerns, and external dependencies for the Nuxt landing site.

## Technology Stack

- **Runtime**: Node.js with Nuxt 3 and Vue 3
- **Rendering**: SSR enabled in current Nuxt config; static prerendering remains available
- **Styling**: CSS with custom properties, responsive mobile-first
- **Package Manager**: npm (with package-lock.json)
- **Build Output**: `npm run build` produces Nitro/serverless output; `npm run generate` produces static assets that cannot alone serve the contact POST

## External Dependencies

- **Nuxt and Vue** – Application framework and reactive UI library
- **Google Tag Manager (GTM)** and **Google Analytics** – Client-side analytics through `plugins/analytics.client.ts`
- **Enable** – Third-party accessibility toolbar loaded by `plugins/enable.client.ts` only on the exact HTTPS test origin `https://test.drchenpardo.co.il`; production and other preview domains do not load it.
- **Google Analytics Admin/Data APIs** – Read-only MCP access through `server/mcp/index.ts`
- **Google Tag Manager API** – Read-only MCP access through `server/mcp/index.ts`
- **AWS S3** – Static site hosting for `.output/public` content
- **CloudFront** (optional) – CDN for caching and content distribution
- **AWS SDK** – Read-only MCP inspection of S3 and CloudFront through `server/mcp/index.ts`
- **GitHub API** – Read-only MCP access to repository metadata and issues through `server/mcp/index.ts`
- **GitHub Actions** – CI/CD pipeline for builds and deployments (see `.github/workflows/deploy.yml`)
- **Environment Configuration** – Nuxt runtime config with `NUXT_PUBLIC_*` prefix for environment-specific values

## Hosting and Deployment

### Enable accessibility toolbar

The public, site-specific Enable script is loaded once after the app mounts on
the test origin, independently of client-side navigation. Loading failures are
reported in the browser console. The trigger offsets depend on Enable's current
trigger ID and closed-state body class; check viewport edges and the fixed mobile
contact bar if the provider changes its widget. Test with the licensed test domain:
Vercel's other preview hostnames intentionally do not load the widget.

Production activation requires a separate approved change and a license valid
for the production domain. Enable's statement button opens its own statement,
not the site's `/accessibility` page. The provider's dashboard has separate
Hebrew and English custom statements, configured per licensed domain and
potentially shared across environments. Verify the displayed statements after
the provider's cache updates and have the site owner review them before
deployment. On 2026-11-14, the test-domain license displayed the provider's
generic statement dated 2021 without the custom wording saved on the primary
domain. Review the provider's privacy/data practices and browser behavior before
rollout. The toolbar assists visitors but does not by itself establish accessibility
compliance.

### Contact API requirement

The contact form now requires a running Nitro server for same-origin
`POST /api/contact`. A static S3 deployment alone cannot handle submissions:
route `/api/contact` through the same public origin to a Nitro deployment,
without wildcard CORS. This fix does not change or deploy infrastructure.
Set required private **server runtime** `CONTACT_CANONICAL_ORIGIN` to the exact
approved HTTPS browser origin (no trailing slash, path, query or credentials).
Missing/invalid origin configuration fails closed with 503; it is never inferred
from request Host, forwarded host/protocol, or a public runtime property.
Set `CONTACT_MAKE_WEBHOOK_URL` (a newly
rotated Make URL, never the exposed legacy value) and `CONTACT_LAMBDA_URL`
(the existing clinic AWS contact destination). At least one is required; each
configured destination must be HTTPS without URL credentials/fragments; redirects
are refused. Every configured destination is attempted concurrently, and any 2xx
reports acceptance. If neither
is configured, an explicit 503 is returned without forwarding PII. Do not put these
in `NUXT_PUBLIC_*`, client assets, or build-only static hosting configuration.

The optional `CONTACT_TRUSTED_PROXY_IPS` is a comma-separated list of at most 32
exact socket IPs (IPv4 or IPv6, including IPv4-mapped IPv6 as actually observed);
empty disables trust. Wildcards, CIDRs and hostnames are invalid configuration.
For allowlisted peers only, `X-Forwarded-For` must contain exactly one valid client
IP; missing, malformed or appended chains return 400. All other peers' forwarded
IP headers are ignored. Forwarded host/protocol headers are always ignored.
Before enabling trust, verify the final ingress strips caller-supplied headers
and overwrites `X-Forwarded-For` with one validated client IP, and that callers
cannot reach Nitro with an allowlisted socket identity. Document the actual peer
IPs and verify spoofing/chain rejection in the target environment. Do not guess
provider proxy ranges or enable trust based solely on a header. If a serverless
adapter lacks a verifiable socket identity, leave this list empty and implement
reviewed ingress abuse enforcement instead.

The in-memory limiter allows five attempts/minute per socket IP or verified
forwarded client IP. Proxied users can share a quota with trust disabled; warm
serverless instances do not share quotas, and restarts reset them. A shared store
or reviewed shared ingress limiter is required before multi-instance/serverless
contact rollout. The implementation is not a distributed abuse-control signoff.
Request bodies are limited to 16 KiB / five seconds; each delivery to eight seconds.
No automatic delivery retries are performed to avoid duplicate contact messages.

#### Status and recovery contract

- `200`: `success: true`, `delivery` booleans, `deliveryStatus` (`complete` when
  all configured providers accepted; `partial` when another configured provider
  failed), and `requestId`. Single-destination acceptance is `complete`.
- `400`: malformed/content-type/encoding/body timeout/size or trusted-proxy metadata;
  `422`: invalid fields; `403`: rejected Origin/Referer; `429`: quota with `Retry-After`.
- `503`: no destination or invalid private configuration; no forwarding.
- `502`: all attempted deliveries failed/timed out. Some may have been accepted
  upstream before a timeout; retries can duplicate messages.
- `500`: unexpected, redacted internal failure.
- All responses carry `X-Request-Id` and `Cache-Control: no-store`. Errors use
  `{ error: { code, message }, requestId }`, never provider payloads or URLs.
  Logs include only IDs, operation, config/destination role and safe status/code.
  Do not enable access-log bodies, fetch tracing, URL capture or PII analytics.
- Partial acceptance is patient-facing success; do not automatically retry.
  Operations should investigate failed roles using safe correlated logs.
  There is no persistent outbox or guarantee of eventual provider processing.

#### Rollout gates (not executed by this implementation)

1. Obtain Backend Security and Frontend Security reviews, applicable UI/UX then
   Compliance/Accessibility review, and QA last on the final combined changes.
2. Owner rotates/revokes the exposed webhook. Approved destinations belong only
   in secret server runtime storage, never client bundles or public env vars.
3. Verify actual hosting serves Nitro POSTs, not static HTML/404s, under the
   same public origin. Route `/api/contact` uncached with no wildcard CORS and
   preserve browser Origin/Referer. Generate/static output is not API evidence.
4. Separately configure Development/Preview/Production runtime values. Nuxt aliases
   `NUXT_CONTACT_CANONICAL_ORIGIN`, `NUXT_CONTACT_TRUSTED_PROXY_IPS`,
   `NUXT_CONTACT_MAKE_WEBHOOK_URL`, `NUXT_CONTACT_LAMBDA_URL` are supported.
   `CONTACT_*` overrides aliases even when explicitly empty; avoid conflicts.
   `.env.example` provides nonfunctional safe syntax examples, not destinations.
5. Automatic Vercel Preview is authorized for #23; Production is not. Preview
   must use its exact approved origin and approved isolated fake/sandbox providers,
   never inherited clinic delivery URLs. Do not infer trust from Vercel headers.
   Local tests mock every provider call and do not send upstream messages.
6. Validate missing/invalid config, Origin/Referer, spoofed forwarding, invalid
   fields, size/quota/timeouts, complete/partial/all-failed delivery, redacted
   logs/client assets, and browser reset/error states without real clinic messages.
   Complete the actual ingress and shared abuse-control gates before live rollout.

#### Rollback

Disable submissions with explicit unavailable UI and/or fail-closed 503 API while
repairing runtime/configuration; never restore direct browser provider calls or
the legacy webhook. Keep same-origin routing and redaction intact. If rolling back
to static hosting, disable the form first—static generation cannot receive POSTs.
Reverting code cannot revoke an exposed capability URL; rotation is independent.
Investigate correlated partial/timeout events before retrying to avoid duplicates.
Production changes require separate approval.

- The site is deployed as a **static build** to AWS S3.
- Build artifacts are generated via `npm run generate`, which outputs to `.output/public`.
- GitHub Actions workflow handles automated builds and S3 deployment.
- CloudFront may cache static assets; clear cache if needed after deployment.

## Environment Variables

- Only browser-safe runtime variables use `NUXT_PUBLIC_*`; contact destinations
  and contact trust configuration are private server runtime variables.
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
