# System Architecture

## Purpose
- Provide a concise architecture reference for service boundaries, ownership, and major flows.

## System Overview
- This document should describe the primary runtime components and how they interact.

## Context
- This is a static Nuxt 3 marketing site for a medical aesthetics clinic.
- The app is client-side rendered only, with SSR disabled.
- The UI is Hebrew and RTL, and the site is organized as a landing page plus treatment detail pages.

## Primary Components
- `app.vue` is the top-level composition layer that wraps the active page in the default layout.
- `pages/` defines routes and page-level entry points.
- `components/` contains reusable page sections and treatment-specific UI.
- `composables/useTreatmentCatalog.ts` and `composables/treatment-catalog/` provide treatment catalog data and lookup helpers.
- `plugins/analytics.client.ts` handles client-side analytics, page views, and custom event tracking.
- `assets/css/index.css` is the main stylesheet entry point.

## Data Flow
- A user enters the site through a Nuxt route.
- Page components compose section components and pass route parameters into treatment pages.
- Treatment routes resolve `category` and `service` slugs from the catalog, then render the matching content through the treatment page shell and supporting sections.
- Analytics events are pushed into `window.dataLayer` on the client after the app mounts and on route changes.

## Auth and Org Boundaries
- There is no authentication layer in this project.
- There is no organization scoping or tenant isolation.
- The site is public and does not expose active application API routes.
- See `.rule/deployment-rules.md` for hosting and operational details.

## Change Log
- 2026-06-27: Initial architecture note for the Nuxt landing site and treatment catalog structure.
- Add future entries here for major route changes, treatment catalog expansion, analytics flow changes, or major component ownership changes.

