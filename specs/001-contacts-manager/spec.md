# Feature Specification: Contacts Manager

**Feature Branch**: `001-contacts-manager`

**Created**: 2026-08-05

**Status**: Ready for implementation

**Input**: User description: "Build a single-user Contacts Manager with full CRUD. Fields: name, phone (unique, required with name), email, address, birthday, notes, photoUrl (optional URL), isFavorite. Search q on name/phone/email + favorites filter. Hard delete with UI confirm. Stack: TypeScript; client=Vite React + Tailwind + shadcn; server=Express + Prisma + SQLite; layout client/ + server/. No auth, no file upload, no import/export. Spec must include Project Overview, Requirements, Technical Decisions, API Design, Data Models, Tasks Breakdown, and Done+Agent Log."

---

## 1. Project Overview

Contacts Manager is an end-to-end phone-book application for a **single local user** (no registration or login). The user can create, view, search, favorite, update, and delete contacts. Data persists in a real database so a page refresh does not lose contacts.

**In scope (v1)**
- Full CRUD for contacts
- Rich contact fields including optional photo URL and favorites
- Free-text search and favorites filter
- English UI; polished client UI
- Separate frontend and backend in a monorepo

**Out of scope (v1)**
- Multi-user accounts / authentication / authorization
- Groups, tags, or categories
- File upload for photos (URL only)
- CSV / vCard import or export
- Soft delete / recycle bin
- Mobile-native apps

---

## 2. Requirements

### Functional Requirements

- **FR-001**: System MUST allow creating a contact with at least name and phone.
- **FR-002**: System MUST allow listing all contacts.
- **FR-003**: System MUST allow viewing a single contact’s full details.
- **FR-004**: System MUST allow updating any contact field (subject to validation).
- **FR-005**: System MUST allow hard-deleting a contact after UI confirmation.
- **FR-006**: System MUST support optional fields: email, address, birthday, notes, photo URL.
- **FR-007**: System MUST support marking a contact as favorite and filtering the list to favorites only.
- **FR-008**: System MUST support free-text search matching name, phone, and/or email.
- **FR-009**: System MUST reject create/update when phone is missing, name is missing, or phone already exists on another contact.
- **FR-010**: System MUST persist all contacts so they remain after refresh/restart.
- **FR-011**: UI MUST be in English and present clear validation and error messages.
- **FR-012**: Photo MUST be an optional URL string rendered as an image when present; no file upload.
- **FR-013**: Contact list MUST support pagination (page/limit) and expose total matching count to the UI.

### Key Entities

- **Contact**: A person in the phone book with identity fields (name, phone), optional profile fields (email, address, birthday, notes, photo URL), and organization flag (favorite).

### Non-Functional Requirements

#### Performance

- **NFR-P1**: On a local machine with a warm server process (exclude cold start / first DB connect), each successful Contacts API handler (list, get, create, update, favorite, delete) MUST complete in **≤300ms**.
- **NFR-P2**: Contact list MUST be **paginated** using offset/limit style query params (`page`, `limit`). Default `limit=20`, maximum `limit=100`. List responses MUST include **total** matching count for UI paging.

#### Reliability

- **NFR-R1**: Every successful create/update/favorite/delete MUST be **persisted in SQLite before** the API returns success. Failures MUST return an error response (no silent success).
- **NFR-R2**: The client MUST use **optimistic UI only for favorite toggle** (star/unstar) and **roll back** if the API fails. Create, edit, and delete MUST wait for API success before updating persisted UI state (loading indicators + toasts still apply).

#### Usability

- **NFR-U1**: Required fields MUST be marked; validation errors MUST show inline; delete MUST require confirm; list and search MUST have empty states.
- **NFR-U2**: Mutating actions MUST show loading indicators; success and failure (including rollback) MUST surface via toast/banner.
- **NFR-U3**: Primary demo flows (add → list → edit → delete) MUST be completable without developer tools.
- **NFR-U4**: API/client errors for validation, not found, and duplicate phone MUST be understandable to the user.

#### Maintainability

- **NFR-M1**: TypeScript **strict** mode on client and server; Contact types shared or mirrored between FE/BE; no unexplained `any`.
- **NFR-M2**: README MUST document how to run `client/` and `server/` and which env vars are required.

#### Security

- **NFR-S1**: No authentication/authorization. Trust model: **single trusted local user**. Public hardening (HTTPS, rate limiting, CSRF) is **out of scope** for v1.
- **NFR-S2**: No secrets in git; configuration via `.env`; all inputs MUST be validated server-side.

#### Explicitly out of scope as NFRs

- Browser matrix / mobile-first layout (demo on Chromium is enough — see Assumptions).
- WCAG 2.1 AA, automated test gates, production observability — not MUST for v1.

---

## 3. Technical Decisions

| Area | Decision |
|------|----------|
| Language | TypeScript on client and server |
| Client | React (Vite) + Tailwind CSS + shadcn/ui |
| Server | Express |
| ORM / DB | Prisma + SQLite |
| Repo layout | Monorepo: `client/` + `server/` at root |
| Auth | None (single user) |
| Photos | Optional `photoUrl` string only |
| Delete | Hard delete + confirm dialog |
| UI language | English |
| List API | Paginated (`page`/`limit`, default 20, max 100) + `{ data, total, page, limit }` |
| IDs | String `cuid` |
| Updates | `PUT` replace (name+phone required; omitted optionals → null) + `PATCH` partial; dedicated favorite **toggle** |
| Client UX | Optimistic UI **only** for favorite toggle; create/edit/delete wait for API |
| Edit UI | Dedicated `ContactDetailPage` + React Router; edit saves via **PATCH only** (PUT = API/curl) |
| Create form | name, phone + email, address, birthday, notes (photo in US5) |
| Spec tooling | Spec-Kit (`specify`) with Cursor agent skills |

**Rationale (summary)**
- TypeScript improves fault tolerance and FE/BE contract clarity.
- Separate Express API makes REST endpoints explicit for teaching/demo.
- SQLite provides a real DB with zero external infra.
- Tailwind + shadcn delivers a polished UI without a large custom design system.

**Folder structure (target)**

```text
Contacts-Manager-ex4/
├── client/                 # Vite React + TS + Tailwind + shadcn
├── server/                 # Express + TS + Prisma + SQLite
├── specs/001-contacts-manager/
├── .specify/
└── ...
```

---

## 4. API Design

Base path: `/api/contacts`  
Resource id: **string cuid** (`:id`)

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `GET` | `/api/contacts` | List contacts (paginated). Query: `q`, `favorite`, `page`, `limit` | `200` + list envelope |
| `GET` | `/api/contacts/:id` | Get one contact by id | `200` + Contact |
| `POST` | `/api/contacts` | Create contact | `201` + Contact |
| `PUT` | `/api/contacts/:id` | Full replace (see PUT rules below) | `200` + Contact |
| `PATCH` | `/api/contacts/:id` | Partial update; omitted fields unchanged; may include `isFavorite` | `200` + Contact |
| `PATCH` | `/api/contacts/:id/favorite` | **Toggle** `isFavorite` (empty body) | `200` + Contact |
| `DELETE` | `/api/contacts/:id` | Hard delete | `204` empty body |

### Request / response notes

**Contact JSON (response shape)**

Same fields as the data model: `id`, `name`, `phone`, `email`, `address`, `birthday`, `notes`, `photoUrl`, `isFavorite`, `createdAt`, `updatedAt`.

**Create (`POST`) body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Non-empty after trim |
| `phone` | string | yes | Non-empty; unique across contacts |
| `email` | string \| null | no | Basic format check if present |
| `address` | string \| null | no | |
| `birthday` | string \| null | no | ISO date `YYYY-MM-DD` if present |
| `notes` | string \| null | no | |
| `photoUrl` | string \| null | no | URL if present |
| `isFavorite` | boolean | no | Default `false` |

**PUT (`PUT /:id`) — replace rules**

- Body MUST include **`name`** and **`phone`** (non-empty after trim).
- Any **omitted optional** field (`email`, `address`, `birthday`, `notes`, `photoUrl`, `isFavorite`) is treated as **clear / default**: optionals → `null`, `isFavorite` → `false` if omitted.
- Phone uniqueness still enforced (409 if another contact owns that phone).

**PATCH (`PATCH /:id`) — partial rules**

- Only provided fields change; omitted fields stay as-is.
- May include `isFavorite` as an explicit boolean set (not a toggle).

**Favorite toggle (`PATCH /:id/favorite`)**

- **Empty body**.
- Flips current `isFavorite` value on the server.
- Returns the full updated Contact.

**UI mapping (remediation lock)**

- **List**: `ContactsPage` at `/`
- **View/Edit**: `ContactDetailPage` at `/contacts/:id` (React Router) — **not** a modal
- **Edit save**: client calls **`PATCH /api/contacts/:id` only**
- **`PUT /api/contacts/:id`**: supported by API for full replace semantics; not used by the primary edit form (curl/OpenAPI demos OK)
- **Create form fields**: `name`, `phone`, `email`, `address`, `birthday`, `notes` (required marked); `photoUrl` added in US5

**List query**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `q` | string | — | Case-insensitive substring match on name, phone, email |
| `favorite` | `true` / `false` | — | `true` = favorites only; omit/`false` = no favorites-only filter |
| `page` | integer ≥ 1 | `1` | Page number (offset = `(page - 1) * limit`) |
| `limit` | integer | `20` | Page size; values above **100** MUST return **400** |

**List response (JSON)**

```json
{
  "data": [ /* Contact[] */ ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

**Error responses**

| Status | When | Body |
|--------|------|------|
| `400` | Validation failure (missing name/phone, bad email/date/URL, limit > 100, etc.) | `{ "error": string, "details": [ { "field": string, "message": string } ] }` |
| `404` | Contact id not found | `{ "error": string }` |
| `409` | Phone already used by another contact | `{ "error": string }` |
| `500` | Unexpected server error | `{ "error": string }` |

CORS: server MUST allow the Vite dev origin for local development.

---

## 5. Data Models

### Contact (Prisma / SQLite)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | `@id @default(cuid())` |
| `name` | String | Required |
| `phone` | String | Required, `@unique` |
| `email` | String? | Optional |
| `address` | String? | Optional |
| `birthday` | DateTime? / String? | Optional (store as date-only) |
| `notes` | String? | Optional |
| `photoUrl` | String? | Optional |
| `isFavorite` | Boolean | Default `false` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Indexes**: unique on `phone`; consider index on `name` for list sorting if needed.

**Default list order**: alphabetical by `name` ascending (assumption).

---

## 6. Tasks Breakdown

High-level implementation slices — detailed checklist in **[tasks.md](./tasks.md)** (T001–T052):

1. **Scaffold monorepo** — init `server/` (Express + TS + Prisma SQLite) and `client/` (Vite React TS + Tailwind + shadcn).
2. **Prisma Contact model + migrate** — schema per §5; generate client.
3. **Contacts API** — list/search/filter with pagination; get; create (`201`); PUT replace + PATCH partial; favorite **toggle**; delete (`204`); validation + error shapes per §4.
4. **Client API layer** — typed fetch helpers (Contact, list envelope, error/`details`).
5. **Contacts list UI** — list, search, favorites filter, pagination, empty states, loading indicators.
6. **Create / edit form** — wait for API success; inline validation from `details`; photo URL preview; star uses favorite toggle (optimistic).
7. **Delete confirm** — dialog; wait for API; toast on success/failure (no optimistic delete).
8. **Polish & demo seed** — shadcn styling, 2–3 sample contacts, README run + env docs (NFR-M2).
9. **Done + Agent Log update** — mark tasks complete; document agent steps.

---

## 7. Done + Agent Log

### Definition of Done (demo checklist)

- [x] App runs (Frontend + Backend)
- [x] Add a new contact
- [x] See contact list
- [x] Edit an existing contact
- [x] Delete a contact (with confirm)
- [x] Data survives refresh (DB)
- [x] Search and favorites filter work
- [x] Photo URL displays when set

### Agent Log

| Date | Stage | Notes |
|------|-------|-------|
| 2026-08-05 | Grilling | Product/tech decisions locked (single user, rich fields, favorites, search, URL photo, TS, Vite/Express/Prisma SQLite, Tailwind+shadcn, monorepo) |
| 2026-08-05 | `specify init` | Spec-Kit v0.15.2 initialized with `cursor-agent` integration |
| 2026-08-05 | `/speckit-constitution` | Constitution v1.0.0 ratified |
| 2026-08-05 | `/speckit-specify` | This Spec created at `specs/001-contacts-manager/spec.md` |
| 2026-08-05 | NFR grilling | Locked teaching NFRs (perf≤300ms warm API, pagination 20/100, persist-or-error, usability toasts, strict TS+README, security hygiene); list API envelope updated |
| 2026-08-05 | API grilling | PUT+PATCH+favorite toggle; cuid ids; 201/200/204; error `details` on 400; optimistic UI only for favorite; PUT clears omitted optionals |
| 2026-08-05 | `/speckit-plan` | plan.md, research.md, data-model.md, contracts/contacts.openapi.yaml, quickstart.md generated |
| 2026-08-05 | `/speckit-tasks` | tasks.md generated (T001–T052); later +T053 for NFR-P1 |
| 2026-08-05 | `/speckit-analyze` | Cross-artifact review; remediation locks I1/I2/U1/C1 applied |
| 2026-08-05 | `/speckit-implement` | Full app shipped (`client/` + `server/`); Playwright E2E 5/5; README; tasks T001–T053 marked done |
| 2026-08-05 | Git / push | Repo linked to `https://github.com/Jordan1881/Contacts-Manager-ex4.git`; `main` pushed (`bb97b6b` implement, follow-ups `bb95a68`, `503c890`) |
| 2026-08-05 | Spec compliance review | FR 13/13 met; main Spec wording gap = literal shadcn vs Tailwind+custom UI |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and list contacts (Priority: P1)

As a user, I open the app, add a contact with name and phone (and optional details), and see them in the list.

**Why this priority**: Core phone-book value; without create+list there is no product.

**Independent Test**: Create two contacts and confirm both appear in the list after save.

**Acceptance Scenarios**:

1. **Given** an empty list, **When** I submit a valid name and phone, **Then** the contact appears in the list.
2. **Given** a create form, **When** I omit phone, **Then** I see a validation error and no contact is created.
3. **Given** an existing phone, **When** I try to create another contact with the same phone, **Then** I see a clear duplicate error.

---

### User Story 2 - View and edit a contact (Priority: P1)

As a user, I open a contact, change fields (including optional ones), save, and see updates persisted.

**Why this priority**: Required for full CRUD and demo flow.

**Independent Test**: Edit email/notes on an existing contact, refresh, confirm values remain.

**Acceptance Scenarios**:

1. **Given** a contact in the list, **When** I open it, **Then** I see all saved fields.
2. **Given** an open contact, **When** I change address and save, **Then** the list/detail shows the new address after refresh.

---

### User Story 3 - Delete a contact (Priority: P1)

As a user, I delete a contact only after confirming, and it disappears permanently.

**Why this priority**: Completes CRUD; prevents accidental data loss via confirm.

**Independent Test**: Delete one of three contacts; confirm only two remain after refresh.

**Acceptance Scenarios**:

1. **Given** a contact, **When** I choose delete and cancel the confirm, **Then** the contact remains.
2. **Given** a contact, **When** I confirm delete, **Then** it is removed from the list and does not return after refresh.

---

### User Story 4 - Search and favorites (Priority: P2)

As a user, I filter contacts by text and/or favorites to find people quickly.

**Why this priority**: Improves usability; not required for minimal CRUD but locked for v1.

**Independent Test**: Mark one favorite; search by partial name; combine favorites filter with search.

**Acceptance Scenarios**:

1. **Given** contacts with distinct names, **When** I type part of a name in search, **Then** only matching contacts show.
2. **Given** mixed favorites, **When** I enable favorites filter, **Then** only favorited contacts show.
3. **Given** search + favorites filter, **When** both are active, **Then** results match both constraints.

---

### User Story 5 - Photo URL (Priority: P3)

As a user, I optionally paste an image URL and see the photo on the contact.

**Why this priority**: Nice polish; optional field; failure should not block other fields.

**Independent Test**: Set a valid image URL; confirm image renders; clear URL and confirm placeholder/no image.

**Acceptance Scenarios**:

1. **Given** a contact form, **When** I save a valid photo URL, **Then** the contact shows that image.
2. **Given** no photo URL, **When** I view the contact, **Then** the UI still works without an image.

---

### Edge Cases

- Duplicate phone on create or update → **409** with `{ error }`.
- Unknown contact id on get/update/delete/favorite → **404** with `{ error }`.
- Empty search → show first page of full list (subject to favorites filter).
- `limit` > 100 → **400** with `details`.
- Invalid email / birthday / photo URL → **400** with field `details`; create/edit UI stays on form (no optimistic create/edit).
- Favorite toggle API failure after optimistic star → UI rolls back star + failure toast.
- `PUT` omitting optional fields → those fields cleared (`null` / `isFavorite` false).
- Favorite toggle with empty body twice → returns to original favorite state.
- Very long notes → accepted within reasonable text limits (assumption: DB text field).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can add a contact and see it in the list in under 2 minutes.
- **SC-002**: Full demo path add → view → edit → delete completes successfully in one continuous session.
- **SC-003**: After refresh/restart, previously saved contacts are still visible (100% of saved records).
- **SC-004**: Search returns only contacts whose name, phone, or email contains the query string.
- **SC-005**: Favorites filter shows only favorited contacts; combining with search narrows correctly.
- **SC-006**: Attempting a duplicate phone never creates a second contact with that phone.
- **SC-007**: List shows at most one page of contacts at a time (default 20) with correct total/paging when more exist.
- **SC-008**: If favorite toggle fails after the UI already flipped the star, the star returns to the prior state and the user sees a failure message.

---

## Assumptions

- Single operator on one machine; no concurrent multi-user conflicts beyond unique phone.
- Phone uniqueness is exact string match (no advanced normalization beyond trim).
- Birthday displayed/stored as calendar date without timezone complexity.
- Broken external photo URLs show a broken-image/fallback state; they do not block save if URL format is valid.
- List sorted by name ascending unless user asks otherwise later.
- Development uses local Vite and Express processes; production deploy is out of scope for v1.
- Demo browser: latest Chromium (Chrome/Edge); other browsers / mobile-first are best-effort only.
- “Warm server” for NFR-P1 means process already running and Prisma already connected at least once.
