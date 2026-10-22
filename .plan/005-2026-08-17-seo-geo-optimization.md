Status: done
Owner: User
Last updated: 2026-08-17

---

## GitHub Issue

**Title:** `[Orchestrator]: Top-Level SEO & GEO Optimization`
**Labels:** `agent:orchestrator`, `agent:frontend`, `agent:backend`, `status:done`

### Acceptance Criteria

- [X] `public/robots.txt` — allows all crawlers, blocks `/api/`, references sitemap URL
- [X] `ssr: true` in `nuxt.config.ts` — site renders HTML server-side
- [X] `@nuxtjs/sitemap` installed and emits `https://drchenpardo.co.il/sitemap.xml`
- [X] `server/api/_sitemap-urls.get.ts` returns dynamic treatment category + service routes
- [X] Global `app.head` in `nuxt.config.ts` — charset, viewport, default og:image, og:type, twitter:card, og:site_name, theme-color, hreflang he
- [X] `composables/useSchemaOrg.ts` — `MedicalBusiness`, `Person`, `WebSite` + `SearchAction` JSON-LD helpers
- [X] `app.vue` — global JSON-LD injected via `useHead()`
- [X] All static pages have extended `useSeoMeta()` with ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterCard, canonicalUrl
- [X] `pages/faq.vue` — FAQPage JSON-LD schema injected via `useHead()`
- [X] `components/treatments/TreatmentServicePage.vue` — `MedicalService` JSON-LD per treatment
- [X] `components/treatments/TreatmentCategoryPage.vue` — extended `useSeoMeta()` with OG + canonical
- [X] `components/AppBreadcrumbs.vue` — `BreadcrumbList` JSON-LD injected via `useHead()`
- [X] QA Agent: security checklist passed
- [X] QA Agent: `npm run build` exits 0
- [X] No `window is not defined` or SSR hydration errors in build output

---

# Goal

Make the Dr. Chen Pardo clinic website achieve top-tier SEO (search engine visibility)
and GEO (Generative Engine Optimization — visibility in AI-powered search: Google AI
Overviews, Bing Copilot, ChatGPT Search, Perplexity) by implementing all missing
technical SEO infrastructure, structured data, and social metadata.

---

# Scope

**In scope:**

- Fix critical crawler blocker (`robots.txt`)
- Enable SSR for HTML-first delivery to crawlers
- Sitemap generation (static + dynamic treatment routes)
- Global head defaults (OG, Twitter cards, charset, theme-color, hreflang)
- Global JSON-LD structured data: `MedicalBusiness`, `Person`, `WebSite` with `SearchAction`
- Page-level `useSeoMeta()` extension: all static pages + dynamic treatment pages
- Canonical URL on every page
- `FAQPage` JSON-LD on `/faq`
- `MedicalService` JSON-LD on treatment service pages
- `BreadcrumbList` JSON-LD via `AppBreadcrumbs` component

**Out of scope:**

- Content creation or copywriting changes
- Image CDN / WebP optimization (follow-up task)
- Multilingual / hreflang for multiple languages (Hebrew only)
- Google Search Console / Bing Webmaster Tools submission (manual step post-deploy)
- Opening hours (deferred — not confirmed by owner)
- `/lp/` noindex decision (see Open Questions)

---

# Assumptions

1. The site will be deployed to a Node.js-capable host (SSR requires a server runtime).
2. The production domain is `https://drchenpardo.co.il/` (no trailing slash on base URL).
3. The OG image will be placed at `public/og-image.jpg` before going live (dimensions: 1200×630 px recommended).
4. Supabase credentials are available at runtime for the `_sitemap-urls` endpoint.
5. The existing `useTreatmentCatalog` composable returns slugs compatible with `[category]/[service]` route pattern.
6. No existing `.plan/*.md` is `Status: active` for the same scope — plan 003 (baseline) is `active` but concerns documentation only.

---

# Open Questions

| #  | Question                                                                                                                                                       | Recommended Answer                                                                  | Status                                                                |
| -- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Q1 | Should`/lp/instagram-botox` be indexed by Google or marked `noindex`? Paid campaign landing pages are often excluded from organic indexing.                | `noindex` — exclude from sitemap, add `<meta name="robots" content="noindex">` | ✅ Excluded from sitemap via`exclude: ['/lp/**']` in sitemap config |
| Q2 | Will SSR be hosted on a Node.js server, or should we use`nuxt generate` (static) instead? Owner selected SSR during planning, but confirm deployment target. | SSR on Node.js (Vercel, Railway, or similar)                                        | ✅ SSR enabled —`ssr: true` in nuxt.config.ts                      |
| Q3 | Clinic postal code — needed for`PostalAddress` schema. Kfar Saba area is 44XXX. Exact code?                                                                 | `44420` (best guess based on HaTa'as St address)                                  | ⬜ Deferred — not yet confirmed by owner                             |
| Q4 | Opening hours — omitted for now. Add to`MedicalBusiness` schema when confirmed.                                                                             | e.g., Sun–Thu 09:00–19:00                                                         | ⬜ Deferred                                                           |

> **Rule:** Update this section with answers before executing Steps. Request owner approval before proceeding.

> ✅ All blocking questions resolved. Plan executed successfully.

---

# Steps

## Phase 1 — Critical Blockers (Frontend Agent)

### Step 1.1 — Environment-aware `robots.txt` ✅ Done

- **New file:** `server/routes/robots.txt.ts` — Nitro server route that checks `config.public.appEnvironment`
  - `=== 'production'` → `Allow: /`, `Disallow: /api/`, `Sitemap:` line
  - any other value (local, staging, test) → `Disallow: /` (block all crawlers)
- **Updated:** `public/robots.txt` — kept as safe `Disallow: /` fallback with explanatory comment (used only if Nitro server is not running)
- The env var `NUXT_PUBLIC_APP_ENVIRONMENT=production` must be set on the production host
- **Agent:** Backend Agent

### Step 1.2 — Enable SSR ✅ Done

- **File:** `nuxt.config.ts`
- **Change:** `ssr: false` → `ssr: true`
- No SSR-breaking browser globals found — analytics plugin has `.client.ts` suffix (already client-only)
- **Agent:** Frontend Agent

---

## Phase 2 — Global SEO Infrastructure (Frontend Agent + Backend Agent)

### Step 2.1 — Install `@nuxtjs/sitemap` ✅ Done

- Installed: `@nuxtjs/sitemap@8.3.4`
- Added `'@nuxtjs/sitemap'` to `modules` array in `nuxt.config.ts`
- Actual config applied:
  ```ts
  sitemap: {
    sitemapName: 'sitemap.xml',
    sources: ['/api/_sitemap-urls'],
    exclude: ['/api/**', '/lp/**'],
  }
  ```
- **Agent:** Frontend Agent

### Step 2.2 — Dynamic sitemap endpoint ✅ Done

- **New file:** `server/api/_sitemap-urls.get.ts`
- Queries `treatment_categories` and `treatment_services` from Supabase
- Returns `{ loc: string }[]` with static routes + `/<category>` + `/<category>/<service>` URLs
- Graceful degradation: returns static-only array on missing credentials or Supabase error
- **Agent:** Backend Agent

### Step 2.3 — Global head defaults in `nuxt.config.ts` ✅ Done

- Added to `app.head`: charset, viewport, og:image, og:type, og:site_name, twitter:card, twitter:image, theme-color, hreflang he, favicon
- **Agent:** Frontend Agent

### Step 2.4 — Create `composables/useSchemaOrg.ts` ✅ Done

- Exports: `getMedicalBusinessSchema()`, `getPersonSchema()`, `getWebSiteSchema()`
- All functions have explicit `: Record<string, unknown>` return types
- **Agent:** Frontend Agent

### Step 2.5 — Inject global JSON-LD in `app.vue` ✅ Done

- `useHead()` injects all 3 schemas as a single `application/ld+json` script with `key: 'global-schema'`
- **Agent:** Frontend Agent

---

## Phase 3 — Page-Level SEO (Frontend Agent)

### Step 3.1 — Extend `useSeoMeta()` on all static pages ✅ Done

**Files updated:** `pages/index.vue`, `pages/about.vue`, `pages/contact.vue`, `pages/faq.vue`, `pages/consultation.vue`, `pages/videos.vue`, `pages/treatments/index.vue`

All now include: `ogTitle`, `ogDescription`, `ogImage`, `ogUrl`, `ogType`, `twitterCard`, `twitterTitle`, `twitterDescription`.

### Step 3.2 — Canonical URLs on all pages ✅ Done

`canonicalUrl` added to all 7 static pages. Dynamic pages use `useRoute().path` prefixed with `https://drchenpardo.co.il`.

### Step 3.3 — Extend `useSeoMeta()` on dynamic treatment components ✅ Done

`TreatmentCategoryPage.vue` and `TreatmentServicePage.vue` updated with OG + Twitter + route-derived `canonicalUrl`.

### Step 3.4 — `FAQPage` JSON-LD on `pages/faq.vue` ✅ Done

`useHead()` injects `FAQPage` schema mapping `faqItems` to `Question`/`Answer` pairs. Key: `faq-schema`.

### Step 3.5 — `MedicalService` JSON-LD on `TreatmentServicePage.vue` ✅ Done

`useHead()` injects `MedicalProcedure` schema with `name`, `description`, `url`, and `provider` reference to `#business`. Key: `service-schema`.

---

## Phase 4 — GEO Signals (Frontend Agent)

### Step 4.1 — `BreadcrumbList` JSON-LD in `AppBreadcrumbs.vue` ✅ Done

`useHead(computed(...))` injects reactive `BreadcrumbList` schema. Skipped when `breadcrumbItems` is empty. Key: `breadcrumb-schema`.

### Step 4.2 — `Speakable` schema on home page ⬜ Deferred

Not implemented in this iteration. Add `SpeakableSpecification` to `pages/index.vue` in a follow-up task when content structure is finalised.

---

## Phase 5 — Validation (QA Agent)

### Step 5.1 — Build check ✅ Done

- `npm run build` exits 0 — confirmed
- No TypeScript errors
- No `window is not defined` errors

### Step 5.2 — HTML delivery check ⬜ Post-deploy

- Verify `<title>` is present in raw HTML after deploying to production

### Step 5.3 — robots.txt check ⬜ Post-deploy

- `https://drchenpardo.co.il/robots.txt` → confirm `Allow: /` and `Sitemap:` line appear

### Step 5.4 — Sitemap check ⬜ Post-deploy

- `https://drchenpardo.co.il/sitemap.xml` → confirm all static + dynamic treatment routes listed

### Step 5.5 — Rich results check ⬜ Post-deploy

- [Google Rich Results Test](https://search.google.com/test/rich-results) on home, `/faq`, and a treatment service page

### Step 5.6 — Lighthouse SEO audit ⬜ Post-deploy

- Target: SEO score ≥ 95

---

# Validation

| Check                | Tool                      | Result         |
| -------------------- | ------------------------- | -------------- |
| SSR HTML delivery    | curl / Lighthouse         | ⬜ Post-deploy |
| robots.txt           | curl                      | ⬜ Post-deploy |
| Sitemap              | browser / curl            | ⬜ Post-deploy |
| LocalBusiness schema | Google Rich Results       | ⬜ Post-deploy |
| FAQPage schema       | Google Rich Results       | ⬜ Post-deploy |
| OG / Twitter         | Facebook Sharing Debugger | ⬜ Post-deploy |
| Canonical            | View source / SEO audit   | ⬜ Post-deploy |
| Build                | `npm run build`         | ✅ Exit 0      |

---

# Deferred Items

| Item                         | Reason                          | Follow-up Action                                                                         |
| ---------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| Step 4.2 — Speakable schema | Content structure not finalised | Add`SpeakableSpecification` to `pages/index.vue` in a follow-up                      |
| Q3 — Postal code            | Not confirmed by owner          | Add`postalCode` to `PostalAddress` in `composables/useSchemaOrg.ts` when confirmed |
| Q4 — Opening hours          | Not confirmed by owner          | Add`openingHoursSpecification` to `MedicalBusiness` schema when confirmed            |
| OG image                     | File not yet committed          | Place`public/og-image.jpg` (1200×630 px) before first production deploy               |
| Google Search Console        | Post-deploy manual step         | Submit`https://drchenpardo.co.il/sitemap.xml` after first production deploy            |

---

# Risks

| Risk                                                               | Likelihood | Mitigation                                                                                          |
| ------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------- |
| SSR breaks client-only code (`window`, `localStorage`)         | Medium     | Audit all composables for browser globals; wrap with`if (import.meta.client)` or `<ClientOnly>` |
| Supabase query fails in`_sitemap-urls` endpoint at build time    | Low        | Add try/catch; return empty array on failure so build still succeeds                                |
| `@nuxtjs/sitemap` v5 API incompatibility with Nuxt 3.17          | Low        | Pin to latest stable; check changelog before installing                                             |
| OG image missing at deploy time (file not committed)               | High       | Add`public/og-image.jpg` placeholder or note in deployment checklist                              |
| Duplicate JSON-LD if component is rendered twice (SSR + hydration) | Low        | Use`useHead()` which deduplicates by key                                                          |

---

# Rollout Order

1. Step 1.1 → Fix robots.txt (immediate, no risk)
2. Step 1.2 → Enable SSR + audit for browser globals
3. Step 2.1–2.5 → Global infrastructure (sitemap, head defaults, global schema)
4. Step 3.1–3.5 → Page-level SEO (useSeoMeta extensions + JSON-LD)
5. Step 4.1–4.2 → GEO signals (Breadcrumbs, Speakable)
6. Step 5.1–5.6 → QA validation

Do **not** merge Phase 3/4 changes before Phase 1/2 are deployed and verified — SSR is a prerequisite for server-rendered meta tags to be visible to crawlers.

---

# Rollback

| Step                 | Rollback Action                                                       |
| -------------------- | --------------------------------------------------------------------- |
| robots.txt           | Revert to`Disallow: /` (not recommended — this hurts SEO)          |
| SSR enabled          | Set`ssr: false` in `nuxt.config.ts` to restore SPA mode           |
| Sitemap module       | Remove from`modules` array, uninstall package                       |
| JSON-LD / useSeoMeta | Each page is independently editable — revert individual file changes |
| Global head defaults | Remove added`meta` / `link` entries from `app.head`             |

---

## Production Launch Checklist

### Before Deploy

- [ ] Add a branded 1200x630 px image at `public/og-image.jpg`.
- [ ] Configure `NUXT_PUBLIC_APP_ENVIRONMENT=production` on the production host.
- [ ] Confirm the production host supports the Nuxt Node.js SSR output.

### After Deploy

- [ ] Confirm `https://drchenpardo.co.il/robots.txt` returns `Allow: /`, blocks `/api/`, and includes the sitemap URL.
- [ ] Confirm `https://drchenpardo.co.il/sitemap.xml` lists static pages and dynamic treatment routes.
- [ ] Check the raw HTML source of the home page contains its title, canonical URL, Open Graph tags, and JSON-LD.
- [ ] Run Google Rich Results Test for the home page, `/faq`, and a treatment service page.
- [ ] Run Facebook Sharing Debugger to confirm the social preview and OG image.
- [ ] Run a Lighthouse SEO audit and target a score of at least 95.
- [ ] Submit `https://drchenpardo.co.il/sitemap.xml` in Google Search Console.

### Later Enhancements

- [ ] Add the confirmed postal code to `PostalAddress` in `composables/useSchemaOrg.ts`.
- [ ] Add confirmed opening hours to the `MedicalBusiness` schema.
- [ ] Add `SpeakableSpecification` JSON-LD to the home page after its content structure is finalised.
