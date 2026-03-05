# Library System API

A REST API for a fictional book library system built with Node.js, TypeScript, Express, Prisma, and SQLite. Built using spec-driven development — all documentation was written before any implementation code.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime and type safety |
| Express | HTTP server framework |
| SQLite + Prisma | Database and ORM |
| Zod | Request validation |
| JWT + bcrypt | Authentication and password hashing |
| Jest + Supertest | Unit and integration testing |

---

## Prerequisites

- Node.js v18 or higher
- npm

---

## Setup

> Run these steps once after cloning the repository.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set a value for `JWT_SECRET`:

```
JWT_SECRET=any-long-random-string-you-choose
```

### 3. Run the database migration

```bash
npx prisma migrate dev
```

### 4. Seed the database

Populates the database with 5 authors, 15 books, and 3 users.

```bash
npm run seed
```

**Seed credentials (all passwords: `password123`)**

| Email | Role |
|---|---|
| `librarian@library.com` | LIBRARIAN |
| `jane@example.com` | MEMBER |
| `sam@example.com` | MEMBER |

---

## Running the Server

```bash
npm run dev
```

The server starts at `http://localhost:3000` with hot reload enabled.

---

## Generating a JWT Token

All API endpoints (except `/auth/register` and `/auth/login`) require a Bearer token.

### Step 1 — Get a user account

You have two options:

**Use a seeded account** (already in the database after `npm run seed`):

| Email | Password | Role |
|---|---|---|
| `librarian@library.com` | `password123` | LIBRARIAN |
| `jane@example.com` | `password123` | MEMBER |
| `sam@example.com` | `password123` | MEMBER |

**Or register a new account** (new users are always created as MEMBER):

```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword","name":"Your Name"}'
```

The response includes a token immediately — no need to log in separately after registering.

### Step 2 — Log in to get a token

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"librarian@library.com","password":"password123"}'
```

Copy the `token` value from the response.

### Step 3 — Use the token

```bash
curl http://localhost:3000/books \
  -H "Authorization: Bearer <paste-token-here>"
```

Tokens expire after **24 hours**. Re-run the login call to get a fresh one.

---

### Via Swagger UI

1. Open `http://localhost:3000/docs`
2. Expand `POST /auth/register` or `POST /auth/login` → click **Try it out**
3. Fill in the fields, click **Execute**
4. Copy the `token` from the response body
5. Click **Authorize** (🔒) at the top of the page, paste the token, click **Authorize**
6. All subsequent requests made from Swagger UI will include it automatically

---

## API Documentation (Swagger UI)

With the server running, open your browser to:

```
http://localhost:3000/docs
```

You will see the full interactive Swagger UI with all 20 endpoints organized by tag (Auth, Books, Authors, Users). Scroll to the bottom to browse all data model schemas.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run seed` | Populate database with sample data |
| `npm run db:reset` | Wipe database, re-run migrations, re-seed |
| `npm test` | Run all 57 tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npx prisma migrate dev` | Apply schema changes as a new migration |
| `npx prisma studio` | Open Prisma's visual database browser |

---

## Project Structure

```
library-system/
├── docs/                        # Spec artifacts (written before code)
│   ├── implementation-plan.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── auth-spec.md
│   ├── openapi.yaml
│   └── phases/                  # Per-phase work logs
│       ├── phase-1-specify.md
│       ├── phase-2-setup.md
│       ├── phase-3-data-model.md
│       ├── phase-4-api.md
│       ├── phase-5-middleware.md
│       ├── phase-6-tests.md
│       └── phase-7-docs.md
├── prisma/
│   ├── schema.prisma            # Data model source of truth
│   └── seed.ts                  # Sample data script
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── types/                   # Shared TypeScript types
│   ├── validators/              # Zod schemas
│   ├── middleware/              # auth, rbac, errorHandler, logger
│   ├── services/                # Business logic + Prisma queries
│   ├── controllers/             # Request handling
│   └── routes/                  # Route registration
└── tests/
    ├── unit/                    # Service-level tests
    └── integration/             # Full HTTP endpoint tests
```

---

## RBAC Summary

| Action | MEMBER | LIBRARIAN |
|---|---|---|
| Browse books and authors | ✅ | ✅ |
| Borrow / return books | ✅ | ✅ |
| Create / edit / delete books | ❌ | ✅ |
| Create / edit / delete authors | ❌ | ✅ |
| View / manage users | ❌ | ✅ |
| View own profile and borrows | ✅ | ✅ |

---

## Business Rules

- Maximum **3 active borrows** per user
- Books are due back in **14 days**
- Borrowing a book with 0 available copies returns `409 Conflict`
- Exceeding the borrow limit returns `422 Unprocessable Entity`
- Passwords are never returned in any API response

---

## Project Statistics

| Metric | Count |
|---|---|
| Source files (`src/`) | 22 |
| Test files | 5 |
| Tests | 57 (all passing) |
| API endpoints | 20 |
| Prisma models | 5 |
| Spec / documentation files | 12 |

---

## Acknowledgements

This repository was developed using Spec-Driven Development (SDD) — specifications, architecture, and data model were written and reviewed before any implementation code. AI coding tools assisted with planning, implementation, and documentation refinement.

