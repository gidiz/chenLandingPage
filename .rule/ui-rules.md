# UI Rules

## Purpose
- Keep UI changes consistent across the Nuxt 3 landing page.
- Prefer small, section-scoped edits with minimal side effects.

## Stack And Component Rules
- Use Nuxt 3 and Vue components only.
- Do not introduce React-only libraries (for example: sonner, lucide-react).
- Reuse existing section components in components/ before creating new shared abstractions.

## Styling Source Of Truth
- Edit active styles in assets/css/index.css.
- Do not update public/assets/css unless the task is explicitly about static duplicated assets.
- Keep design tokens centralized with CSS variables when adding new theme values.

## Visual Language
- Default to RTL layout and right-aligned content where relevant.
- Preserve current brand direction: soft neutral backgrounds and teal accents.
- Keep spacing, border radius, and shadow scale consistent with existing cards and sections.
- Avoid one-off colors and ad-hoc font overrides.

## Responsiveness
- Mobile-first behavior is required for all new UI blocks.
- Ensure layouts remain readable and tappable at common widths (360px, 768px, 1024px+).
- Avoid fixed widths that break narrow viewports.

## Accessibility And Content
- Maintain semantic heading order and meaningful section labels.
- Ensure sufficient text/background contrast.
- Provide alt text for informative images.
- Keep CTA copy concise and action-oriented.

## Motion And Interaction
- Use subtle transitions only; avoid heavy or distracting animations.
- Keep motion durations short and consistent with existing page transitions.
- Ensure hover effects have equivalent non-hover usability on touch devices.

## Validation
- For visual or component changes, run npm run build.
- For changes affecting deployment output, runtime config, routing, or public assets, run npm run generate.