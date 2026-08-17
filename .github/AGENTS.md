# Agent Instructions

## Communication with Me
- Please start all your responses with Hopa!

## Security
- Never commit or expose secrets (tokens, API keys, passwords, cluster credentials, secret values).

## Coding Style
- Follow the repository coding style defined in `.rule/coding-rules.md`.

## Naming Conventions
- Follow as defined in `.rule/naming-rules.md`.

## Glossary and Terms
- Use canonical domain terms from `.doc/glossary.md`.
- Keep new shared terms documented there before broad usage.

## Architecture and Deployment Docs
- Architecture overview and component design: `.doc/architecture.md`.
- Deployment architecture, tech stack, and operational concerns: `.rule/deployment-rules.md`.
- Keep these docs updated when major component ownership, data flows, deployment strategy, or environment variables change.

## Planning
- Follow as defined in `.rule/planning-rules.md`.

## Versioning
- Follow as defined in `.rule/versioning-rules.md`.

## Product Definition
- Follow as defined in `.doc/product-definition.md`.

## Error Handling
- Follow as defined in `.rule/error-handling-rules.md`.

## Testing
- Follow as defined in `.rule/testing-rules.md`.

## UI and Styling
- UI-specific guidance: `.rule/ui-rules.md`.
- CSS and styling guidance: `.rule/style-rules.md`.
- Design tokens, branding, and color palette: defined in `.rule/style-rules.md`.

## Multi-Agent Team
Five specialist agents are defined in `.github/agents/`. Invoke via the VS Code agent picker or as subagents.

| File | Agent | Role |
|---|---|---|
| `.github/agents/orchestrator.agent.md` | Orchestrator | Task planning, GitHub Issue checklists, loopback coordination |
| `.github/agents/db-agent.agent.md` | DB Agent | Schema, SQL migrations, pgvector, Supabase RPCs |
| `.github/agents/backend-agent.agent.md` | Backend Agent | Nitro API routes, RAG pipeline, MCP server |
| `.github/agents/frontend-agent.agent.md` | Frontend Agent | Vue components, pages, composables, CSS |
| `.github/agents/qa-agent.agent.md` | QA Agent | Build validation, security audit, PASS/FAIL verdicts |
