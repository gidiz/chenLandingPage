# Testing Rules

## Purpose
- Define consistent expectations for test coverage, test design, and release confidence.
- Align validation with this Nuxt 3 landing-page project's real build and deploy flow.

## Scope
- Apply these rules to unit, integration, and end-to-end tests.
- Apply these rules to manual validation when no automated test exists.

## Core Principles
- Test behavior, not implementation details.
- Keep tests deterministic and isolated.
- Prefer fast feedback: unit tests first, integration where needed, end-to-end for critical flows.
- Add tests for every bug fix when feasible.
- Keep checks proportional to risk: visual changes require visual validation, deploy-path changes require static output validation.

## Project Validation Commands
- This repository currently has no dedicated test suite configured in package.json.
- For visual/component/content changes, run: npm run build
- For changes affecting routing, runtime config, deployment output, or public assets, run: npm run generate
- For local smoke checks during development, run: npm run dev

## Required Coverage Areas
- Domain logic and state transitions.
- API request validation and error responses.
- Auth and org boundary enforcement.
- Persistence-critical paths and migration-sensitive queries.
- User-facing failure flows for key features.
- Treatment catalog composition and category/service page data mapping.
- Analytics behavior that depends on NUXT_PUBLIC_* environment values.

## Test Structure Rules
- Arrange tests with clear setup, action, and assertion phases.
- Use descriptive test names that state expected behavior.
- Keep one primary assertion intent per test.
- Avoid shared mutable state between tests.
- For manual checks, document setup, action, and expected result in the PR description.

## Data and Fixtures
- Use minimal fixtures focused on the scenario.
- Prefer factories/builders over large static fixtures.
- Do not embed real secrets, keys, or credentials in test data.

## Reliability Rules
- No flaky tests in mainline branches.
- Mock only unstable external dependencies.
- Freeze/override time and randomness when behavior depends on them.
- Do not rely on test execution order.
- For analytics changes, verify environment-aware behavior and avoid duplicate tracking paths.

## Pull Request Expectations
- New features include happy-path and failure-path tests.
- Bug fixes include a regression test that fails before and passes after the fix.
- Update or remove obsolete tests when behavior changes intentionally.

## Change-Type Checklist
- UI/component/styling changes:
	- Run npm run build.
	- Perform browser validation for desktop and mobile layouts on affected sections.
- Route/runtime/deployment/public asset changes:
	- Run npm run generate.
	- Verify generated output behavior for affected routes and assets.
- Bug fix:
	- Add or document a regression check that reproduces pre-fix behavior and confirms the fix.
