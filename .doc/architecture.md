# System Architecture

## Purpose
- Provide a concise architecture reference for service boundaries, ownership, and major flows.

## System Overview
- This document should describe the primary runtime components and how they interact.

## Context
- This is a Nuxt 3 marketing site for a medical aesthetics clinic, with static hosting history.
- The current configuration enables SSR; contact submission requires a running Nitro API, not static assets alone.
- The UI is Hebrew and RTL, and the site is organized as a landing page plus treatment detail pages.

## Primary Components
- `app.vue` is the top-level composition layer that wraps the active page in the default layout.
- `pages/` defines routes and page-level entry points.
- `components/` contains reusable page sections and treatment-specific UI.
- `composables/useTreatmentCatalog.ts` and `composables/treatment-catalog/` provide treatment catalog data and lookup helpers.
- `plugins/analytics.client.ts` handles client-side analytics, page views, and custom event tracking.
- `server/mcp/index.ts` exposes a local MCP server with read-only tools for GA4 Admin, GA4 Data, GTM, AWS, and GitHub.
- `assets/css/index.css` is the main stylesheet entry point.

## Data Flow
- A user enters the site through a Nuxt route.
- Page components compose section components and pass route parameters into treatment pages.
- Treatment routes resolve `category` and `service` slugs from the catalog, then render the matching content through the treatment page shell and supporting sections.
- Analytics events are pushed into `window.dataLayer` on the client after the app mounts and on route changes.
- When started from VS Code MCP configuration, the local MCP server reads credentials from environment variables and proxies read-only requests to Google APIs, AWS APIs, and GitHub APIs.

## Auth and Org Boundaries
- There is no authentication layer in this project.
- There is no organization scoping or tenant isolation.
- The site is public; the contact API is unauthenticated and enforces the boundary described below.
- See `.rule/deployment-rules.md` for hosting and operational details.

## Change Log
- 2026-06-27: Initial architecture note for the Nuxt landing site and treatment catalog structure.
- 2026-06-28: Added a local MCP integrations server for read-only GA4, GTM, AWS, and GitHub access.
- Add future entries here for major route changes, treatment catalog expansion, analytics flow changes, or major component ownership changes.

## Contact form security boundary

`components/ContactSection.vue` submits only to same-origin `POST /api/contact`.
`server/api/contact.post.ts` resolves private runtime configuration from
`CONTACT_CANONICAL_ORIGIN`, `CONTACT_TRUSTED_PROXY_IPS`,
`CONTACT_MAKE_WEBHOOK_URL` and `CONTACT_LAMBDA_URL` (Nuxt private runtime aliases
are also supported; explicit `CONTACT_*` values take precedence).
No public runtime property or parent UX change is required.

`server/lib/contact.ts` accepts only JSON with required `name` (1–100 chars),
`email` (valid, at most 254 chars), `phone` (at most 32 chars, 7–15 digits,
optional leading `+`, spaces/parentheses/hyphens), and `message` (1–2000 chars).
Values are trimmed; unknown fields and disallowed control characters are rejected.
Message newlines/tabs are supported. Bodies are limited to 16 KiB / five seconds,
including streamed requests; compressed bodies are rejected.

Origin must exactly match the configured HTTPS origin. Only when Origin is absent
may an HTTP(S) Referer without credentials establish that same origin. Empty,
malformed, `null`, missing or cross-origin evidence fails closed; `Sec-Fetch-Site:
cross-site` also rejects. No forwarded host/protocol header or request Host
determines the expected origin. This is a browser CSRF boundary, not authentication;
non-browser callers can supply Origin, so abuse controls remain necessary.

Proxy trust defaults to empty. Only exact allowlisted socket peers may supply one
IP in `X-Forwarded-For` for rate limiting; missing/invalid/multi-hop values from
those peers fail closed. Ingress must strip/overwrite that header and exclude
untrusted traffic from those peers. All other peers' forwarded headers are ignored.
The bounded in-memory limiter is five attempts/minute per client IP; shared
enforcement is required before scale-out/serverless rollout.

Only fixed private-config HTTPS destinations receive the validated four-field
JSON. Redirects, URL credentials and fragments are rejected. Each delivery has an
eight-second abort timeout; provider bodies are discarded without reading/logging.
Any provider 2xx counts as acceptance, not proof of downstream processing.
HTTP 200 includes `success`, `delivery: { lambda, make }`, `deliveryStatus` and
`requestId`: `complete` means every configured destination accepted (including
single-destination mode); `partial` means one accepted and another configured
destination failed. An absent destination's boolean is false, not a failed attempt.
No automatic retry or durable queue exists. Partial acceptance must not trigger
client retry, which could duplicate the successful delivery.

Errors use `{ error: { code, message }, requestId }`: 400 malformed/body/proxy
metadata, 422 invalid fields, 403 rejected origin, 429 quota, 503 missing/invalid
configuration, 502 no successful delivery, 500 unexpected error. Neither missing
destinations nor invalid configured URLs cause forwarding. Structured logs contain
only request IDs, operation, destination role/config name, safe status/error codes;
no contact PII, URL values, request bodies, raw errors or upstream payloads.
The clinic owner must revoke/rotate the exposed Make capability URL and configure
only the replacement. There is no legacy endpoint fallback.
Runtime enablement, isolated Preview validation, rollout and rollback gates are
documented in `.rule/deployment-rules.md`; implementation is not security signoff.
