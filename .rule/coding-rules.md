# Coding Rules

## Purpose
- Define core coding rules for JavaScript, TypeScript, Vue, and Nuxt in this repository
- Keep code consistent across human and AI contributors
- Prefer clear, maintainable code over clever shortcuts

## Required

### Semicolons
- Do not use trailing semicolons in JavaScript or TypeScript files
- If a semicolon is required for syntax safety, place it at the beginning of the line

### TypeScript
- Avoid any unless there is no practical typed alternative
- Prefer unknown over any when the type is not known yet
- Add explicit return types for exported functions and composables
- Keep shared domain types in dedicated type files
- Use readonly for values that should not be mutated

### Imports
- Group imports in this order:
- Vue and Nuxt imports
- Third-party package imports
- Internal alias and local imports
- Use type-only imports when possible
- Remove unused imports

### Vue and Nuxt
- Use script setup with TypeScript in Vue single-file components
- Keep components focused on UI and presentation
- Move reusable logic and shared state to composables
- Keep page composition in app.vue and route pages
- Use Nuxt runtime config for environment-based behavior

### Naming
- Components: PascalCase
- Composables: useXxx
- Variables and functions: camelCase
- True constants only: UPPER_SNAKE_CASE
- File names should be descriptive and match their responsibility

## Services
- Services handle external integrations and data access
- Services must not manage UI state directly
- Services should return typed results and predictable error shapes
- Keep service functions small and single-purpose
- Shared service contracts should be defined as reusable types

## State Management
- Keep local UI state inside components when not shared
- Use composables for shared state and cross-component logic
- Avoid global mutable state unless there is a clear requirement
- Expose state through:
- Readable state
- Explicit mutation functions
- Isolated side effects
- Reset long-lived state explicitly when leaving flows if needed

## Formatting
- Keep functions short and easy to read
- Prefer early returns to reduce nesting
- Avoid deeply nested logic
- Add comments only when intent is not obvious from code

## Examples
- Preferred:
  - `const value = getValue()`
- Allowed when needed for syntax safety:
  - `;(() => init())()`

## Enforcement
- These rules apply to all JavaScript and TypeScript code in the repository
- If a formatter or linter conflicts with these rules, update tool config to match this file
- Pull requests should follow these rules before merge

