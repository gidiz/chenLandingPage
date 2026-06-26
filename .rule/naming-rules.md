# Naming Rules

## Purpose
- Keep naming predictable across API routes, domain entities, services, and data fields.

## Core Conventions
- Prefer singular entity names by default.
  - Examples: `site.service`, `/api/site`
- Use consistent short terms across the codebase:
  - Always use `org` (not `organization`).
  - Always use `geo` (not `geolocation`, `localization`, etc.).
  - Use `lat` and `lng` for coordinates.

## API and File Naming
- Keep route and resource naming aligned with domain names.
- Avoid introducing synonyms for existing concepts.

## Vue Components
- Use **PascalCase** for component file names.
- Section components: `*Section.vue` (e.g., `HeroSection.vue`, `AboutSection.vue`)
- App-level components: `App*.vue` prefix (e.g., `AppHeader.vue`, `AppBreadcrumbs.vue`)
- Feature components: Organized in subfolders with domain names (e.g., `treatments/`, `skin-quality/`)
- Example: `components/treatments/TreatmentServicePage.vue`

## Services and Domain Logic
- Use **kebab-case** with `.service.ts` suffix for service files.
- Pattern: `entity.service-name.service.ts`
- Examples:
  - `hyperhidrosis.botox-treatment.service.ts`
  - `injectables.biostimulators.service.ts`
  - `skin-quality.medical-peeling.service.ts`

## Composables
- Use **camelCase** with `use` prefix.
- Pattern: `use*` (e.g., `useTreatmentCatalog`)
- Export catalog structure from `composables/treatment-catalog/`

## Pages and Routes
- Use **kebab-case** for page file names.
- Dynamic segments: `[bracket-notation]` (e.g., `[category]/[service].vue`)
- Nested routes: Create subfolders matching domain names (e.g., `pages/hyperhidrosis/`, `pages/injectables/`)
- Special pages: `index.vue` for category listing, route-specific names otherwise

## Type Definitions
- Centralized types in `types.ts` within domain folders
- Pattern: `domain/types.ts` or `domain/services/types.ts`
- Import types consistently across the catalog

## Index Files
- Use `index.ts` to export catalog modules and re-exports
- Pattern: Each category folder has `index.ts` for public API

## Folders and Organization
- Organize by **domain or feature** (e.g., `treatments/`, `skin-quality/`)
- Group related services under domain folder: `domain/services/`
- Keep asset folders flat: `assets/css/`, `assets/heroes/`
- Keep plugin files in `plugins/` root (not nested)
