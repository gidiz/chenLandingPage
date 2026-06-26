# Style Rules

## Purpose
- Keep styling consistent, maintainable, and predictable across the Nuxt landing site.
- Make it easy for contributors to know where styles belong and how to name them.

## Source of Truth
- Global stylesheet entry point is `assets/css/index.css`.
- This project does not use `main.css` as the Nuxt CSS entry.
- If a duplicate CSS file exists under `public/assets/css`, treat `assets/css/index.css` as the canonical source unless a deployment-specific exception is documented.

## CSS Organization
- Keep global CSS layered in a stable order: tokens -> base -> layout -> components -> utilities.
- Put design tokens (colors, spacing, radii, typography scale, shadows, z-index) in `:root` custom properties.
- Keep section/component-specific styles inside the related Vue component whenever possible.
- Use global CSS only for app-wide primitives, resets, utility classes, and shared layout helpers.

## Design Tokens – Branding and Colors

### Color Palette

- **Warm Taupe** – HEX: `#8B6F61` _(to confirm)_
- **Soft Sand** – HEX: `#E5D8C5` _(to confirm)_
- **Ivory Whisper** – HEX: `#F5F3EA` _(to confirm)_
- **Cool Mist** – HEX: `#DDE7E9` _(to confirm)_

### Logo

- Use the existing logo from the current site.

## Naming Conventions
- Use clear, semantic class names tied to purpose, not visual appearance.
- Prefer a BEM-like pattern for shared classes: `.block`, `.block__element`, `.block--modifier`.
- Avoid overly generic names such as `.box`, `.title`, `.left`, `.blue`.

## Authoring Rules
- Prefer CSS variables over hard-coded values for reusable tokens.
- Keep nesting shallow (ideally 2 levels max) to avoid specificity issues.
- Keep selectors lightweight and local; avoid long descendant chains.
- Avoid `!important` except for explicit utility overrides.
- Group related properties and keep rule blocks readable.

## Responsive Rules
- Use mobile-first styling by default.
- Use consistent breakpoints across the project.
- Prefer fluid sizing (`clamp`, `%`, `rem`, `vw`) before adding extra breakpoints.

## RTL and Hebrew Support
- Assume RTL is the default app direction (`dir="rtl"` in Nuxt head config).
- Prefer logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start/end`) over left/right-specific properties.
- If left/right is required for a component behavior, document the reason inline.

## Performance and Maintainability
- Avoid duplicated style rules; extract repeated values into variables or shared utility classes.
- Avoid heavy selectors that can hurt rendering and make overrides difficult.
- Remove dead CSS when refactoring sections/components.

## Change Safety
- For visual updates, verify with a production build (`npm run build`).
- For changes affecting deployment output, validate static generation (`npm run generate`).