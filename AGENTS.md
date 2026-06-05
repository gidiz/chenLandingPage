# AGENTS.md

## Project Scope

- This repo is a Nuxt 3 single-page landing site. SSR is disabled in [nuxt.config.ts](nuxt.config.ts), and the page is assembled in [app.vue](app.vue) from section components in [components/](components).
- Prefer small, section-scoped edits. Most UI changes belong in one of the section components or in [assets/css/index.css](assets/css/index.css).

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`
- Static site output for deployment: `npm run generate`
- Preview production build: `npm run preview`

## Validation

- For visual or component changes, run `npm run build`.
- For changes that affect deployment, runtime config, routing, or public assets, run `npm run generate` because AWS deploys `.output/public`.
- There is no dedicated test suite configured in [package.json](package.json). Do not claim test coverage that was not run.

## Architecture Notes

- [app.vue](app.vue) is the top-level composition layer. Keep page order changes there.
- [plugins/analytics.client.ts](plugins/analytics.client.ts) is client-only and owns page-view and custom event tracking through `window.dataLayer`.
- Analytics config is sourced from Nuxt public runtime config in [nuxt.config.ts](nuxt.config.ts). Use `NUXT_PUBLIC_*` variables when changing analytics behavior.
- Deployment is handled by [README.md](README.md) and [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Link to those docs instead of copying deployment steps into code comments or new instruction files.

## Repo-Specific Pitfalls

- Keep analytics changes environment-aware. GTM environment support uses `NUXT_PUBLIC_GTM_AUTH`, `NUXT_PUBLIC_GTM_PREVIEW`, `NUXT_PUBLIC_GTM_COOKIES_WIN`, and `NUXT_PUBLIC_APP_ENVIRONMENT`.
- The analytics plugin currently defaults consent state to granted on mount. If you add consent UI, update the plugin behavior rather than layering duplicate tracking logic elsewhere.
- CSS files exist in both [assets/css/](assets/css) and [public/assets/css/](public/assets/css). Prefer editing the active Nuxt CSS entrypoint in [assets/css/index.css](assets/css/index.css) unless the task is explicitly about static duplicated assets.
- The README notes a current `npm run generate` warning around `assets/cover.png`. Treat that as an existing issue unless the task is specifically to clean it up.

## Working Style

- Preserve the current static-site deployment flow and public runtime config names.
- Prefer npm over other package managers because the repo includes [package-lock.json](package-lock.json) and the workflow uses `npm ci`.
- Keep instructions concise and link back to [README.md](README.md) for setup and environment details when possible.
