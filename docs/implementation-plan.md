# Library System REST API — Implementation Plan

This document serves as the overall project summary for the spec-driven development of a fictional book library REST API using Node.js + TypeScript + Express + SQLite + Prisma.

---

## Constraints
- Open source only, no subscriptions or external accounts
- Stack: Node.js + TypeScript + Express + SQLite + Prisma + Jest + Zod

---

## SDD Steps Reference

| Step | What it means | What we did |
|---|---|---|
| **Specify** | Define *what* the system should do | `docs/` folder — `openapi.yaml`, `data-model.md`, `auth-spec.md`, `architecture.md` |
| **Plan** | Define *how* it will be built at a high level | `implementation-plan.md` with 7 phases |
| **Tasks** | Break the plan into discrete, actionable work items | Per-phase checklists in `implementation-plan.md` + phase logs in `docs/phases/` |
| **Implement** | Write code that satisfies the spec | Phase 2 onward |

---

## Data Model Summary

**Book** — `title`, `isbn`, `publishedYear`, `genre`, `synopsis`, `totalCopies`, `availableCopies`
**Author** — `firstName`, `lastName`, `bio`, `birthYear`
**User** — `email`, `password` (hashed), `name`, `role` (MEMBER | LIBRARIAN)
**BookAuthor** — join table (many-to-many between Book and Author)
**Borrow** — `userId`, `bookId`, `borrowedAt`, `dueAt`, `returnedAt`

**Business rules:**
- Max 3 active borrows per user
- Due date = 14 days from borrow date
- `availableCopies` decrements on borrow, increments on return
- Borrow attempt with 0 available copies → `409 Conflict`

---

## Roles & Permissions (RBAC)

| Action | MEMBER | LIBRARIAN |
|---|---|---|
| Browse/search books | ✅ | ✅ |
| Borrow/return books | ✅ | ✅ |
| View own borrow history | ✅ | ✅ |
| View all users/borrows | ❌ | ✅ |
| Create/edit/delete books | ❌ | ✅ |
| Create/edit/delete authors | ❌ | ✅ |
| Manage users | ❌ | ✅ |

---

## Project Structure

```
library-system/
├── docs/
│   ├── implementation-plan.md     # This file — overall project summary
│   ├── architecture.md
│   ├── data-model.md
│   ├── auth-spec.md
│   ├── openapi.yaml
│   └── phases/
│       ├── phase-1-specify.md
│       ├── phase-2-setup.md
│       ├── phase-3-data-model.md
│       ├── phase-4-api.md
│       ├── phase-5-middleware.md
│       ├── phase-6-tests.md
│       └── phase-7-docs.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── books.routes.ts
│   │   ├── authors.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── books.controller.ts
│   │   ├── authors.controller.ts
│   │   └── users.controller.ts
│   ├── services/
│   │   ├── books.service.ts
│   │   ├── authors.service.ts
│   │   └── users.service.ts
│   ├── validators/
│   │   ├── book.validator.ts
│   │   ├── author.validator.ts
│   │   └── user.validator.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Phases

### Phase 1 — Specify (Spec Documents)
Write all spec artifacts before any implementation code.
- `docs/implementation-plan.md` — overall project summary (this file)
- `docs/architecture.md` — system design, layers, tech decisions
- `docs/data-model.md` — entities, fields, types, relationships, constraints
- `docs/auth-spec.md` — JWT flow, RBAC rules per endpoint
- `docs/openapi.yaml` — full API contract (all endpoints, request/response schemas, error codes)

### Phase 2 — Project Setup
- Initialize Node.js project (`package.json`, `tsconfig.json`)
- Install dependencies (Express, Prisma, Zod, JWT, Jest, etc.)
- Configure `.env.example`
- Set up Prisma with SQLite

### Phase 3 — Data Model
- Write `prisma/schema.prisma` (derived from `data-model.md`)
- Run initial migration
- Write and run `prisma/seed.ts` (generated books, authors, users)
- Add `seed` and `reset` npm scripts

### Phase 4 — Core API Implementation
- `src/app.ts` and `src/index.ts` — Express setup
- Auth routes & controller (register, login, JWT issuance)
- Books routes, controller, service (CRUD + borrow/return)
- Authors routes, controller, service (CRUD)
- Users routes, controller, service (CRUD, librarian-only)
- Zod validators for all inputs

### Phase 5 — Middleware
- `auth.ts` — JWT verification middleware
- `rbac.ts` — role-based access control
- `errorHandler.ts` — global error handler (formats all errors consistently)
- Request logging middleware

### Phase 6 — Tests
- Unit tests for services (borrow logic, availability checks, validation)
- Integration tests for all endpoints (happy path + error cases)

### Phase 7 — Documentation
- Finalize `openapi.yaml` to match implementation
- Verify all endpoints are documented with examples

---

## Key npm Scripts

```
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript
npm run seed      # Populate database with sample data
npm run db:reset  # Reset and re-seed database
npm test          # Run all tests
```
