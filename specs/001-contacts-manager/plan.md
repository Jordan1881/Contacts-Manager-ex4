# Implementation Plan: Contacts Manager

**Branch**: `001-contacts-manager` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-contacts-manager/spec.md`

## Summary

Build a single-user Contacts Manager as a TypeScript monorepo: Vite React + Tailwind + shadcn (`client/`) talking to Express + Prisma + SQLite (`server/`) over a documented REST API. Deliver full CRUD, paginated search/favorites filter, PUT replace + PATCH partial + favorite toggle, hard delete with confirm, and optimistic UI only for favorites — matching grilled NFRs and API contracts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on client and server; Node.js 20+

**Primary Dependencies**:
- Server: Express, Prisma, Zod (request validation), cors, dotenv; optional request-duration logging middleware
- Client: React 18+, Vite, Tailwind CSS, shadcn/ui, **React Router**, sonner or shadcn toast

**Storage**: SQLite via Prisma (`file:./dev.db` or path from `DATABASE_URL`)

**Testing**: Manual E2E validation via [quickstart.md](./quickstart.md) (automated tests not a MUST per Spec NFRs)

**Target Platform**: Local macOS/Linux developer machine; Chromium for demo

**Project Type**: Web application (separate SPA + REST API)

**Performance Goals**: Warm Contacts API handlers ≤300ms; list paginated (default 20, max 100)

**Constraints**: No auth; no file uploads; no import/export; secrets only in `.env`; CORS for Vite origin

**Scale/Scope**: Single operator; demo dataset dozens–low hundreds of contacts; one primary entity (Contact)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Spec Before Code | PASS | Spec complete with 7 template sections; this plan is `/speckit-plan`; no app code yet |
| II. TypeScript Everywhere | PASS | Strict TS planned for `client/` and `server/`; mirrored Contact types |
| III. Clear FE/BE Separation | PASS | `client/` + `server/` monorepo; UI only via REST |
| IV. Validated REST, Explicit Errors | PASS | Zod validation; 400+details / 404 / 409 / 500 shapes in contracts |
| V. Small Vertical Slices & YAGNI | PASS | No auth, groups, CSV, uploads; vertical slices in tasks (next command) |
| Stack matches constitution | PASS | Vite React + Tailwind + shadcn; Express + Prisma + SQLite |

**Post–Phase 1 re-check**: PASS — data-model, OpenAPI contract, and quickstart align with constitution; no new scope creep.

## Project Structure

### Documentation (this feature)

```text
specs/001-contacts-manager/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   └── contacts.openapi.yaml
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
client/
├── public/
├── src/
│   ├── components/          # ContactForm, FavoriteToggle, DeleteContactDialog, ContactPhoto, …
│   ├── components/ui/       # shadcn primitives
│   ├── lib/                 # utils, api client, types
│   ├── pages/               # ContactsPage (list), ContactDetailPage (view/edit)
│   ├── App.tsx              # React Router routes
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── components.json          # shadcn

server/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # optional demo contacts
├── src/
│   ├── index.ts             # Express bootstrap
│   ├── app.ts               # middleware + routes mount
│   ├── routes/contacts.ts
│   ├── controllers/contactsController.ts
│   ├── services/contactsService.ts
│   ├── validators/contactSchemas.ts  # Zod
│   ├── lib/prisma.ts
│   └── lib/errors.ts        # map to 400/404/409/500 bodies
├── package.json
├── tsconfig.json
└── .env.example
```

**Structure Decision**: Constitution-mandated monorepo with `client/` and `server/` at repo root (not `frontend/`/`backend/`). Keep packages independent (`npm run dev` in each). No shared npm workspace required for v1; mirror TypeScript types in `client/src/lib/types.ts` from the OpenAPI/Contact model (optional later: `packages/shared`).

## Complexity Tracking

> No constitution violations requiring justification.
