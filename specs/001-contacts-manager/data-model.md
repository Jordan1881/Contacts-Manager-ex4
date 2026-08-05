# Data Model: Contacts Manager

**Feature**: `001-contacts-manager`  
**Date**: 2026-08-05  
**Storage**: SQLite via Prisma

## Entity: Contact

Single aggregate root. No relations in v1.

| Field | Prisma type | DB / constraints | API JSON | Notes |
|-------|-------------|------------------|----------|-------|
| `id` | `String` | `@id @default(cuid())` | string | Opaque path param |
| `name` | `String` | required | string | Trimmed; non-empty |
| `phone` | `String` | required, `@unique` | string | Trimmed; non-empty; unique |
| `email` | `String?` | optional | string \| null | Format-checked if set |
| `address` | `String?` | optional | string \| null | |
| `birthday` | `DateTime?` | `@db.Date` optional | `YYYY-MM-DD` \| null | Date-only |
| `notes` | `String?` | optional | string \| null | Text |
| `photoUrl` | `String?` | optional | string \| null | URL if set |
| `isFavorite` | `Boolean` | `@default(false)` | boolean | |
| `createdAt` | `DateTime` | `@default(now())` | ISO-8601 string | Read-only |
| `updatedAt` | `DateTime` | `@updatedAt` | ISO-8601 string | Read-only |

### Indexes

- Unique: `phone`
- Optional: `@@index([name])` for alphabetical list performance

### Default sort

List queries: `orderBy: { name: 'asc' }`

## Validation rules

| Rule | Apply on | Failure |
|------|----------|---------|
| `name` required, non-empty after trim | POST, PUT; PATCH if present | 400 `details` field `name` |
| `phone` required, non-empty after trim | POST, PUT; PATCH if present | 400 `details` field `phone` |
| `phone` unique among contacts | POST, PUT, PATCH (if phone changes) | 409 `{ error }` |
| `email` valid format if non-null | when provided | 400 `details` field `email` |
| `birthday` `YYYY-MM-DD` if non-null | when provided | 400 `details` field `birthday` |
| `photoUrl` valid URL if non-null | when provided | 400 `details` field `photoUrl` |
| `limit` 1–100 | GET list | 400 `details` field `limit` |
| `page` ≥ 1 | GET list | 400 `details` field `page` |

### PUT replace semantics

Given body with required `name` + `phone`:

- Set `email`, `address`, `birthday`, `notes`, `photoUrl` from body or **`null` if omitted**
- Set `isFavorite` from body or **`false` if omitted**

### PATCH partial semantics

Only keys present in JSON are updated. `isFavorite` if present is an explicit boolean set.

### Favorite toggle

Read current `isFavorite`, write `!isFavorite`, return updated row. No body.

## State transitions

```text
[Created] --PATCH favorite--> [Favorite flipped]
[Any] --DELETE--> [Removed permanently]
```

No soft-delete / archived state.

## Prisma sketch (reference)

```prisma
model Contact {
  id         String    @id @default(cuid())
  name       String
  phone      String    @unique
  email      String?
  address    String?
  birthday   DateTime? @db.Date
  notes      String?
  photoUrl   String?
  isFavorite Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([name])
}
```

## Out of scope entities

User, Tag, Group, Attachment — not modeled in v1.
