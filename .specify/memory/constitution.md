<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: N/A (initial ratification from template placeholders)
- Added sections: Core Principles (I–V), Technology Stack, Spec-Driven Workflow, Governance
- Removed sections: N/A
- Follow-up TODOs: none
-->
# Contacts Manager Constitution

## Core Principles

### I. Spec Before Code
No application feature work MAY begin until a Spec covering Project Overview,
Requirements, Technical Decisions, API Design, Data Models, Tasks Breakdown,
and Done + Agent Log has been written and reviewed. Implementation MUST follow
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement` in order.
Rationale: Prevents scope drift and keeps the bootcamp demo traceable to
agreed decisions.

### II. TypeScript Everywhere
Client and server MUST be written in TypeScript. Shared contracts (request/
response shapes) SHOULD stay typed end-to-end. Untyped `any` escapes MUST be
justified in review.
Rationale: Fault tolerance through compile-time checks and clearer API
boundaries between `client/` and `server/`.

### III. Clear FE/BE Separation
The repo MUST be a monorepo with `client/` (Vite React UI) and `server/`
(Express API + Prisma). The UI MUST talk to the backend only via documented
REST endpoints. Business rules and persistence MUST live on the server.
Rationale: Matches the course learning goals (Frontend + Backend + Database)
and keeps Spec API Design honest.

### IV. Validated REST, Explicit Errors
All mutating endpoints MUST validate input. Phone numbers MUST be unique.
APIs MUST return clear HTTP errors (400 validation, 404 not found, 409
duplicate phone). Silent failures are forbidden.
Rationale: Demo reliability and a Spec that documents error behavior.

### V. Small Vertical Slices & YAGNI
Deliver features as small end-to-end slices (schema → API → UI). v1 MUST NOT
include auth, groups/tags, CSV import/export, or file uploads. Prefer the
simplest design that meets the Spec.
Rationale: Ship a working CRUD demo without overbuilding.

## Technology Stack

- **Client**: React (Vite) + TypeScript + Tailwind CSS + shadcn/ui; English UI
- **Server**: Express + TypeScript + Prisma + SQLite
- **Layout**: `client/` and `server/` at repository root
- **Product constraints (v1)**: Single user (no auth); contact fields name,
  phone (required + unique), email, address, birthday, notes, photoUrl
  (optional URL only), isFavorite; free-text search + favorites filter;
  hard delete with UI confirm

## Spec-Driven Workflow

1. `/speckit-constitution` — project principles (this file)
2. `/speckit-specify` — full feature Spec (7 template sections)
3. Review Spec against checklist (instructor approval if required)
4. `/speckit-plan` — technical plan
5. `/speckit-tasks` — granular tasks
6. `/speckit-implement` — execute tasks; update Done + Agent Log
Optional quality gates: `/speckit-clarify`, `/speckit-checklist`,
`/speckit-analyze`. Agents MUST read this constitution and the active Spec
before writing code.

## Governance

This constitution supersedes informal practice when they conflict. Amendments
MUST update this file, bump **Version** (MAJOR for incompatible principle
removals/redefinitions; MINOR for new principles/material expansions; PATCH
for clarifications), and set **Last Amended** to the change date. Spec Kit
artifacts under `.specify/` and agent guidance files installed by `specify
init` MUST NOT be deleted. Compliance is checked during Spec review and before
`/speckit-implement`.

**Version**: 1.0.0 | **Ratified**: 2026-08-05 | **Last Amended**: 2026-08-05
