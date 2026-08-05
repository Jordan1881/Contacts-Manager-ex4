# Tasks: Contacts Manager

**Input**: Design documents from `/specs/001-contacts-manager/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Not included (Spec NFRs — automated tests are not a MUST)

**Organization**: Phases follow Spec user stories US1–US5 so each slice is independently demoable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: `[US1]`…`[US5]` for story phases only
- Paths use monorepo roots `server/` and `client/` from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold monorepo packages and tooling

- [x] T001 Create monorepo directories `server/src/{routes,controllers,services,validators,lib}/`, `server/prisma/`, `client/src/{components,components/ui,lib,pages}/` per plan.md
- [x] T002 Initialize Express + TypeScript project in `server/package.json` with dependencies express, cors, dotenv, zod, @prisma/client and devDependencies typescript, tsx, prisma, @types/express, @types/cors, @types/node
- [x] T003 [P] Initialize Vite React TypeScript app in `client/` with **React Router** (`react-router-dom`)
- [x] T004 [P] Configure TypeScript strict mode in `server/tsconfig.json` and `client/tsconfig.json` (NFR-M1)
- [x] T005 [P] Add Tailwind CSS + shadcn/ui to `client/` (`components.json`, `client/src/index.css`, base ui primitives)
- [x] T006 [P] Add root `.gitignore` covering `node_modules/`, `dist/`, `.env`, `*.db`, `.DS_Store`
- [x] T007 [P] Create `server/.env.example` (`DATABASE_URL`, `PORT`, `CLIENT_ORIGIN`) and `client/.env.example` (`VITE_API_BASE_URL`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB, Express shell, shared error/types, API client scaffold — blocks all user stories

**CRITICAL**: No user story work until this phase is complete

- [x] T008 Define Prisma `Contact` model in `server/prisma/schema.prisma` per data-model.md (cuid, unique phone, `@db.Date` birthday, indexes)
- [x] T009 Run initial migration and generate client (`npx prisma migrate dev`) producing `server/prisma/migrations/`
- [x] T010 [P] Create Prisma singleton in `server/src/lib/prisma.ts`
- [x] T011 [P] Implement error helpers mapping to 400+details / 404 / 409 / 500 in `server/src/lib/errors.ts`
- [x] T012 [P] Implement Zod base contact field schemas in `server/src/validators/contactSchemas.ts`
- [x] T013 Create Express app with JSON, cors(`CLIENT_ORIGIN`), request-duration logging middleware (log method/path/status/ms for NFR-P1), and mount point in `server/src/app.ts` and `server/src/index.ts`
- [x] T014 [P] Add empty contacts router stub mounted at `/api/contacts` in `server/src/routes/contacts.ts`
- [x] T015 [P] Define mirrored `Contact`, `ContactListResponse`, and API error types in `client/src/lib/types.ts`
- [x] T016 [P] Create fetch helper with base URL from `VITE_API_BASE_URL` in `client/src/lib/api.ts`
- [x] T017 [P] Wire App shell, toast provider (shadcn/sonner), and React Router routes (`/` → ContactsPage, `/contacts/:id` → ContactDetailPage) in `client/src/App.tsx` and `client/src/main.tsx`
- [x] T018 Add Prisma seed script with 2–3 demo contacts in `server/prisma/seed.ts` and wire in `server/package.json`

**Checkpoint**: `server` boots; `client` boots; DB migrated; no business endpoints required yet beyond health/stub

---

## Phase 3: User Story 1 — Create and list contacts (Priority: P1) 🎯 MVP

**Goal**: Create contacts (name+phone required) and see a paginated list that persists

**Independent Test**: Create two contacts via UI; both appear on page 1; survive refresh; duplicate phone returns clear error

### Implementation for User Story 1

- [x] T019 [US1] Implement list (page/limit/total, sort by name) and create in `server/src/services/contactsService.ts`
- [x] T020 [US1] Add Zod `contactCreateSchema` + list query schema (`page`, `limit`, optional `q`/`favorite` accepted for forward-compat) in `server/src/validators/contactSchemas.ts`
- [x] T021 [US1] Implement `GET /` and `POST /` handlers in `server/src/controllers/contactsController.ts` (201 create; 400 details; 409 duplicate phone)
- [x] T022 [US1] Wire GET/POST on `server/src/routes/contacts.ts`
- [x] T023 [P] [US1] Add `listContacts` and `createContact` client functions in `client/src/lib/api.ts`
- [x] T024 [US1] Build list page with pagination controls in `client/src/pages/ContactsPage.tsx`
- [x] T025 [US1] Build create form with **required fields marked** (name, phone) plus optional email, address, birthday, notes; wait for API; inline `details`; loading + toast in `client/src/components/ContactForm.tsx` (no photoUrl yet)
- [x] T026 [US1] Connect create success to refresh list / navigate as needed in `client/src/pages/ContactsPage.tsx`
- [x] T027 [US1] Add empty state when `total === 0` in `client/src/components/ContactListEmpty.tsx`

**Checkpoint**: MVP — add + list + pagination works without edit/delete/search/favorites

---

## Phase 4: User Story 2 — View and edit a contact (Priority: P1)

**Goal**: Open a contact on a dedicated detail page; edit via **PATCH**; persist after refresh

**Independent Test**: Navigate to `/contacts/:id`, edit email/notes, save; values remain after refresh

### Implementation for User Story 2

- [x] T028 [US2] Extend `contactsService.ts` with `getById`, `replace` (PUT semantics for API), and `updatePartial` (PATCH) in `server/src/services/contactsService.ts`
- [x] T029 [US2] Add Zod `contactPutSchema` and `contactPatchSchema` in `server/src/validators/contactSchemas.ts`
- [x] T030 [US2] Implement `GET /:id`, `PUT /:id`, `PATCH /:id` in `server/src/controllers/contactsController.ts` + routes in `server/src/routes/contacts.ts`
- [x] T031 [P] [US2] Add `getContact`, `putContact` (API helper for curl/demos), `patchContact` in `client/src/lib/api.ts`
- [x] T032 [US2] Extend `ContactForm.tsx` for edit mode: required fields marked; all optionals except photo; **save via `patchContact` only**; map field `details`
- [x] T033 [US2] Implement dedicated detail/edit page (load by id, link from list) in `client/src/pages/ContactDetailPage.tsx` — **no modal**
- [x] T034 [US2] Document in form/UI copy or README snippet that primary edit uses PATCH; PUT full-replace is API-only (see OpenAPI)

**Checkpoint**: Create, list, view, edit (PATCH) all work on routed pages

---

## Phase 5: User Story 3 — Delete a contact (Priority: P1)

**Goal**: Hard delete with confirm dialog; cancel keeps contact

**Independent Test**: Delete one of three contacts with confirm; only two remain after refresh; cancel leaves all three

### Implementation for User Story 3

- [x] T035 [US3] Implement `remove` in `server/src/services/contactsService.ts` and `DELETE /:id` → 204 in controller + `server/src/routes/contacts.ts`
- [x] T036 [P] [US3] Add `deleteContact` in `client/src/lib/api.ts`
- [x] T037 [US3] Add confirm dialog component in `client/src/components/DeleteContactDialog.tsx` (shadcn Dialog)
- [x] T038 [US3] Wire delete (wait for API, loading, success/error toasts, no optimistic remove) from list/detail in `client/src/pages/ContactsPage.tsx` and/or `ContactDetailPage.tsx`

**Checkpoint**: Full CRUD complete

---

## Phase 6: User Story 4 — Search and favorites (Priority: P2)

**Goal**: Free-text `q` on name/phone/email; favorites filter; optimistic favorite toggle via dedicated endpoint

**Independent Test**: Star one contact; favorites filter shows only it; search narrows; combined filter works; failed toggle rolls back star

### Implementation for User Story 4

- [x] T039 [US4] Extend list query in `server/src/services/contactsService.ts` with case-insensitive `q` (name/phone/email) and `favorite=true` filter
- [x] T040 [US4] Implement `toggleFavorite` in `server/src/services/contactsService.ts` and `PATCH /:id/favorite` (empty body) in controller + `server/src/routes/contacts.ts`
- [x] T041 [P] [US4] Add `toggleFavorite` client API in `client/src/lib/api.ts`
- [x] T042 [US4] Add search input + favorites filter controls wired to list query in `client/src/pages/ContactsPage.tsx`
- [x] T043 [US4] Add star control with optimistic flip + rollback toast in `client/src/components/FavoriteToggle.tsx`
- [x] T044 [US4] Ensure empty states for “no search results” in `client/src/components/ContactListEmpty.tsx`

**Checkpoint**: Search + favorites + toggle meet Spec US4 / NFR-R2

---

## Phase 7: User Story 5 — Photo URL (Priority: P3)

**Goal**: Optional photo URL on create/edit; render image or fallback

**Independent Test**: Set valid image URL → image shows; clear URL → fallback; invalid URL → 400 details on save

### Implementation for User Story 5

- [x] T045 [US5] Confirm `photoUrl` URL validation in Zod schemas in `server/src/validators/contactSchemas.ts` (already field-capable; tighten messages)
- [x] T046 [P] [US5] Add photo URL input + preview/fallback avatar in `client/src/components/ContactPhoto.tsx`
- [x] T047 [US5] Integrate `ContactPhoto` into `ContactForm.tsx` and list/detail views in `client/src/pages/ContactsPage.tsx` / `ContactDetailPage.tsx`

**Checkpoint**: All five user stories independently demoable

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, seed, README, Spec Done checklist

- [x] T048 [P] Write root `README.md` with run steps for `client/` + `server/`, env vars (NFR-M2), and NFR-P1 timing check (`curl -w "%{time_total}"` + note duration logs)
- [x] T049 [P] Align `server/prisma/seed.ts` with quickstart demo contacts and document `npx prisma db seed`
- [x] T050 Verify CORS + ports against `server/.env.example` and `client/.env.example`
- [x] T051 Run through [quickstart.md](./quickstart.md) UI validation table; fix gaps
- [x] T052 Update Spec §7 Done + Agent Log checkboxes and log `/speckit-implement` completion in `specs/001-contacts-manager/spec.md`
- [x] T053 [P] Confirm request-duration middleware logs warm-handler times under ~300ms for list/get during quickstart smoke in `server/src/app.ts` (tune only if grossly over; no CI gate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → no deps
- **Phase 2 Foundational** → after Setup; **blocks** all stories
- **US1 (Phase 3)** → after Foundational — **MVP**
- **US2 (Phase 4)** → after US1 recommended (needs list/create data); can reuse service file sequentially
- **US3 (Phase 5)** → after US1 (needs contacts to delete); ideally after US2
- **US4 (Phase 6)** → after US1 list exists; favorite toggle can follow US2 UI
- **US5 (Phase 7)** → after US2 form exists (photo on create/edit)
- **Polish (Phase 8)** → after desired stories complete

### User Story Dependencies

| Story | Depends on | Independently testable? |
|-------|------------|-------------------------|
| US1 Create+List | Foundation | Yes — MVP |
| US2 View+Edit | US1 data + GET/PUT/PATCH | Yes with existing contacts |
| US3 Delete | US1 | Yes |
| US4 Search+Favorites | US1 list API | Yes |
| US5 Photo URL | US2 form | Yes |

### Parallel Opportunities

- T003–T007 setup tooling in parallel after T001–T002 start
- T010–T012, T014–T017 foundational files in parallel after schema migrate (T008–T009)
- Within US1: T023 client API while T019–T022 server land
- US4 server (T039–T040) parallel with preparing FavoriteToggle UI shell
- Polish T048–T049 parallel

### Parallel Example: User Story 1

```bash
# After foundational complete:
# Dev A — server create/list
Task: T019–T022 server service/controller/routes

# Dev B — client types already done; API + UI
Task: T023 listContacts/createContact in client/src/lib/api.ts
Task: T024–T027 ContactsPage + ContactForm + empty state
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundational  
3. Phase 3 US1  
4. **STOP** — validate create + list + pagination + persistence  

### Incremental Delivery

1. US1 → demo MVP  
2. US2 → edit  
3. US3 → delete (full CRUD)  
4. US4 → search/favorites  
5. US5 → photos  
6. Polish → README + quickstart sign-off  

### Suggested MVP scope

**Phases 1–3 only (T001–T027)** — create (optionals except photo) + paginated list.

---

## Notes

- No automated test tasks (per Spec); validate via quickstart.md  
- Commit after each story checkpoint when git is initialized  
- Do not implement auth, uploads, CSV, or soft delete  
- Favorite optimistic UI only (T043); create/edit/delete wait for API  
- **Remediation locks**: detail **page** (not modal); edit **PATCH-only**; create includes optionals except photo; duration middleware + docs (T013, T048, T053)  
