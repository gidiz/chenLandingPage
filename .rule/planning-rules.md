# Planning Rules

## Purpose and Authority
- GitHub Issues are authoritative for current task requirements, acceptance criteria, dependencies, approval, status, and retry counts.
- `.plan/` contains historical architecture and reference documents, not the current task source of truth.
- Follow the Shared GitHub Issue Workflow Contract in `.github/AGENTS.md`.

## Plan Location and Use
- Existing plans are retained as historical architecture/reference material and may inform work when relevant.
- Do not treat a plan as current task requirements, approval, dependency, status, or retry authority.
- Do not create or update plans automatically. Create or update one only when explicitly requested; doing so does not replace the authoritative GitHub Issue.

## File Naming
- Use this filename format for explicitly requested new plans: `001-YYYY-MM-DD-<topic>.md`.
- Use sequential numeric prefixes: `001`, `002`, `003`, and so on.

## Collaboration and Approval
- Put task questions, approval, dependency, and status decisions on the relevant GitHub Issue; the Orchestrator is the sole GitHub writer.
- Do not require plan-file approval before work. Proceed only when the authoritative issue and its approval requirements permit it.

## Content Rules
- Use repository-relative paths in plan content.
- Do not use machine-specific absolute paths.

## Explicitly Requested Plan Metadata
- When a plan is explicitly requested, include these fields near the top:
	- `Status:` `draft|active|done|superseded`
	- `Owner:`
	- `Last updated:` `YYYY-MM-DD`

## Explicitly Requested Plan Sections
- For an explicitly requested plan, include:
	- `Goal`
	- `Scope`
	- `Assumptions`
	- `Open Questions`
	- `Steps`
	- `Validation`
	- `Risks`
	- `Rollout Order`
	- `Rollback`

## Historical Plan Maintenance
- If an explicitly requested plan replaces another, mark the old plan `Status: superseded` and link to its replacement.
