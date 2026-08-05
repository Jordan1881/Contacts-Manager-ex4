# Research: Contacts Manager

**Feature**: `001-contacts-manager`  
**Date**: 2026-08-05

All Technical Context items were resolved from the grilled Spec + constitution. No open `NEEDS CLARIFICATION` markers remain.

---

## Decision: Monorepo `client/` + `server/` (independent packages)

- **Rationale**: Constitution requires clear FE/BE split; course demo story is explicit REST. Independent `package.json`s avoid workspace tooling overhead for a bootcamp.
- **Alternatives considered**: Next.js full-stack (blurs API boundary); npm workspaces / Turborepo (extra setup); single Express-serves-static package (harder to teach CORS/API).

## Decision: Prisma + SQLite with `cuid` string ids

- **Rationale**: Real DB, zero Docker, Spec locks cuid. Prisma maps cleanly to TypeScript types and unique `phone`.
- **Alternatives considered**: better-sqlite3 raw SQL (more boilerplate); PostgreSQL (infra friction); autoincrement ints (rejected in API grilling).

## Decision: Zod for server validation

- **Rationale**: Aligns with TypeScript strict + explicit 400 `details[]`. One schema can drive create / PUT / PATCH (PATCH via `.partial()`).
- **Alternatives considered**: express-validator (more verbose); manual ifs (error-prone); class-validator (heavier with decorators).

## Decision: Birthday stored as Prisma `DateTime` `@db.Date`

- **Rationale**: Date-only semantics without timezone drift; API still exchanges `YYYY-MM-DD` strings (serialize/deserialize at boundary).
- **Alternatives considered**: plain `String` (weaker validation); full `DateTime` with time (unnecessary for birthday).

## Decision: Offset pagination with Prisma `skip`/`take` + `count`

- **Rationale**: Spec requires `page`/`limit`/`total`. Simple and teachable.
- **Alternatives considered**: cursor pagination (overkill); load-all client-side (fails NFR-P2).

## Decision: PUT clears omitted optionals; PATCH is partial; favorite is toggle route

- **Rationale**: Locked in API grilling. Implement PUT by building a full update object with defaults for missing optionals.
- **Alternatives considered**: PATCH-only (simpler, rejected by user); toggle-in-PATCH-only (rejected).

## Decision: Optimistic UI only for favorite toggle

- **Rationale**: User asked to avoid overly optimistic UX; star is the natural optimistic case.
- **Alternatives considered**: optimistic all mutations (earlier NFR, revised); no optimistic UI.

## Decision: Mirrored types (no shared package in v1)

- **Rationale**: YAGNI — copy Contact / list envelope / error types into client from OpenAPI. Add `packages/shared` only if duplication hurts.
- **Alternatives considered**: shared workspace package (good later); code generation from OpenAPI (nice-to-have).

## Decision: Manual quickstart validation; no mandatory automated tests

- **Rationale**: Spec NFR explicitly excludes automated test gates as MUST.
- **Alternatives considered**: Vitest + Supertest contract tests (stretch after demo).

## Decision: shadcn/ui + Tailwind for polish

- **Rationale**: User/tech Spec requirement; Dialog, Button, Input, Form patterns fit confirm + forms + toasts.
- **Alternatives considered**: plain CSS; MUI (heavier); custom components only.

## Decision: CORS allow Vite origin via env

- **Rationale**: Spec requires CORS for local Vite. Use `CLIENT_ORIGIN=http://localhost:5173` in server `.env`.
- **Alternatives considered**: `*` in all environments (too loose even for local teaching — prefer explicit origin).
