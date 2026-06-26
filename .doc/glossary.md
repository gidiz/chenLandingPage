# Glossary

## Purpose
- Define canonical domain terms and approved short forms used across code, API routes, docs, and plans.

## Core Terms
- `org`
    - Canonical meaning: organization tenant/account boundary.
    - Use: always use `org`, not `organization`.
- `site`
    - Canonical meaning: singular site entity/resource.
    - Use: prefer singular in routes and service names.
- `geo`
    - Canonical meaning: geospatial/location context.
    - Use: use `geo`, not `geolocation` or `localization`.
- `lat` and `lng`
    - Canonical meaning: latitude and longitude values.
    - Use: use short forms only.

## Treatment Domain Terms
- `treatment`
    - Canonical meaning: a cosmetic or medical procedure offering.
    - Use: use in entity names and catalog references (e.g., `treatmentCategories`, `TreatmentService`).
- `category`
    - Canonical meaning: a grouping of related treatments (e.g., injectables, procedures, skincare).
    - Use: always singular in code and routes. Reference: `TreatmentCategory`, `/[category]/`.
- `service`
    - Canonical meaning: a specific treatment offering within a category.
    - Use: always singular. Example: Botox, Threads, PRP. Maps to `TreatmentService` type.
- `procedure`
    - Canonical meaning: a category that represents surgical or invasive treatments.
    - Use: use as a category name, not as a generic term for all treatments.
- `slug`
    - Canonical meaning: URL-friendly identifier for treatments and categories.
    - Use: use in routes (e.g., `/[category]/[service].vue` routes use slugs as params).

## Naming Alignment
- Keep this glossary aligned with naming decisions in `../.rule/naming-rules.md`.
- If a new domain term is introduced, add it here before broad usage.

## Update Rules
- Add new terms when introducing a new bounded context, entity, or shared API concept.
- Avoid synonyms for existing terms unless explicitly approved and documented here.