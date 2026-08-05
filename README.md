# Contacts Manager (ex4)

Single-user phone book: **React (Vite) + Tailwind** frontend and **Express + Prisma + SQLite** backend. Spec-driven via Spec Kit (`specs/001-contacts-manager/`).

## Stack

| Layer | Tech |
|-------|------|
| Client | React, TypeScript, Vite, Tailwind, React Router, Sonner |
| Server | Express, TypeScript, Zod, Prisma, SQLite |
| Spec | Spec Kit — constitution → specify → plan → tasks → implement |

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
# Server
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed

# Client
cd ../client
cp .env.example .env
npm install
```

### Environment

**`server/.env`**

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:./dev.db` | SQLite path |
| `PORT` | `3001` | API port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS for Vite |

**`client/.env`**

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:3001` | API base URL |

## Run

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — UI
cd client && npm run dev
```

Open http://localhost:5173

## Features

- Full CRUD (create waits for API; edit uses **PATCH**; delete with confirm)
- Paginated list (`page`/`limit`, default 20, max 100)
- Search (`q`) + favorites filter
- Favorite **toggle** with optimistic UI + rollback
- Optional photo URL
- Request duration logs on the server (NFR-P1 smoke check)

### API (summary)

See `specs/001-contacts-manager/contracts/contacts.openapi.yaml`.

- `GET/POST /api/contacts`
- `GET/PUT/PATCH/DELETE /api/contacts/:id`
- `PATCH /api/contacts/:id/favorite` (empty body toggle)

### Performance spot-check

With a warm server:

```bash
curl -s -o /dev/null -w "%{time_total}\n" "http://localhost:3001/api/contacts?page=1&limit=20"
```

Also watch server logs: `GET /api/contacts … 12ms`.

## E2E tests (Playwright)

From repo root (with **server and client already running** on 3001 / 5173):

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Or use the webServer-assisted config (starts apps automatically if not up):

```bash
npm run test:e2e
```

## Spec artifacts

- [spec.md](specs/001-contacts-manager/spec.md)
- [plan.md](specs/001-contacts-manager/plan.md)
- [tasks.md](specs/001-contacts-manager/tasks.md)
- [quickstart.md](specs/001-contacts-manager/quickstart.md)

## License

Bootcamp exercise.
