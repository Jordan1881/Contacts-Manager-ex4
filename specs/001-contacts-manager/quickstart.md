# Quickstart: Contacts Manager

**Feature**: `001-contacts-manager`  
**Purpose**: Validate the feature end-to-end after implementation (manual demo checklist).

Related: [spec.md](./spec.md) · [data-model.md](./data-model.md) · [contracts/contacts.openapi.yaml](./contracts/contacts.openapi.yaml)

## Prerequisites

- Node.js 20+
- npm
- Chromium (Chrome/Edge) for UI demo

## Setup (after `/speckit-implement` scaffolds the apps)

```bash
# From repo root
cd server
cp .env.example .env   # DATABASE_URL, PORT, CLIENT_ORIGIN
npm install
npx prisma migrate dev
npx prisma db seed     # if seed script exists (2–3 demo contacts)

cd ../client
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3001
npm install
```

## Run

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open the Vite URL (typically `http://localhost:5173`).

## API smoke checks (optional)

Base URL from server (example `http://localhost:3001`). Contract: [contacts.openapi.yaml](./contracts/contacts.openapi.yaml).

```bash
# Create
curl -s -X POST "$API/api/contacts" -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","phone":"+1-555-0100","email":"ada@example.com"}'

# List page 1
curl -s "$API/api/contacts?page=1&limit=20"

# Duplicate phone → expect 409
curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/contacts" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Other","phone":"+1-555-0100"}'
```

## UI validation scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Add contact with name + phone | Appears in list; survives refresh |
| 2 | Omit phone on create | Inline validation; not created |
| 3 | Duplicate phone | Clear conflict / error toast |
| 4 | Edit fields via form | Wait for success; values persist after refresh |
| 5 | Toggle favorite (star) | Optimistic flip; rollback + toast if API fails |
| 6 | Favorites filter + search `q` | Combined filter correct; pagination controls work |
| 7 | Delete with cancel | Contact remains |
| 8 | Delete with confirm | Removed; gone after refresh |
| 9 | Photo URL set | Image renders; empty URL shows fallback |
| 10 | PUT semantics (if exposed in UI or via curl) | Omitting optional fields clears them |

## Performance spot-check (NFR-P1)

With server already warm:

1. Watch server logs for request duration middleware (`method path status Xms`).
2. Also:

```bash
curl -s -o /dev/null -w "%{time_total}\n" "$API/api/contacts?page=1&limit=20"
```

Expect wall time well under 0.3s on a local machine for small datasets (informal check; not a CI gate).

## Done when

All items in Spec §7 Definition of Done are checked, and the table above passes.
