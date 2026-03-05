# Architecture

## Overview

This is a RESTful API for a fictional book library system. It follows a layered architecture with clear separation of concerns across routes, controllers, services, and data access.

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js | JavaScript runtime, large ecosystem |
| Language | TypeScript | Type safety, aligns with spec-driven approach |
| Framework | Express | Minimal, explicit, widely used |
| Database | SQLite | File-based, zero setup, open source |
| ORM | Prisma | Schema-first, generates TypeScript types |
| Validation | Zod | Runtime schema validation with TS inference |
| Auth | JWT (jsonwebtoken) | Stateless, standard REST auth pattern |
| Password hashing | bcrypt | Industry standard, open source |
| Testing | Jest + Supertest | Unit and integration testing |
| Dev server | ts-node-dev | TypeScript hot reload for development |

---

## Layered Architecture

```
Request → Routes → Middleware → Controllers → Services → Prisma → SQLite
                                                               ↑
                                                          Validators (Zod)
```

### Layer Responsibilities

**Routes** (`src/routes/`)
- Register HTTP method + path combinations
- Apply middleware (auth, RBAC) per route
- Delegate to controllers
- No business logic

**Controllers** (`src/controllers/`)
- Parse and validate request input (using Zod validators)
- Call the appropriate service method
- Format and return HTTP responses
- Handle request/response lifecycle only

**Services** (`src/services/`)
- Contain all business logic
- Enforce business rules (borrow limits, availability checks)
- Call Prisma for database operations
- Throw typed errors that the global error handler catches

**Validators** (`src/validators/`)
- Zod schemas defining valid input shapes
- Used by controllers to validate request bodies and params
- Serve as runtime enforcement of the API contract

**Middleware** (`src/middleware/`)
- `auth.ts` — verifies JWT token on protected routes
- `rbac.ts` — checks user role against required role for a route
- `errorHandler.ts` — catches all thrown errors, formats consistent JSON error responses
- `logger.ts` — logs each incoming request (method, path, status, duration) — see `src/middleware/logger.ts`

**Prisma** (`prisma/`)
- `schema.prisma` — single source of truth for data model
- Auto-generates TypeScript client types
- Manages migrations and database state

---

## Request Flow Example

```
POST /books/:id/borrow
  → auth middleware (verify JWT)
  → rbac middleware (require MEMBER or LIBRARIAN)
  → BooksController.borrowBook()
    → validate params (bookId)
    → BooksService.borrowBook(userId, bookId)
      → check availableCopies > 0 (else throw 409)
      → check user active borrows < 3 (else throw 422)
      → create Borrow record
      → decrement availableCopies
      → return Borrow record
  → 201 response with borrow details
```

---

## Error Handling Strategy

All errors are caught by the global `errorHandler` middleware and returned as consistent JSON:

```json
{
  "error": {
    "code": "BOOK_UNAVAILABLE",
    "message": "No copies of this book are currently available.",
    "status": 409
  }
}
```

| Scenario | HTTP Status |
|---|---|
| Validation failure | 400 Bad Request |
| Unauthenticated | 401 Unauthorized |
| Insufficient role | 403 Forbidden |
| Resource not found | 404 Not Found |
| No copies available | 409 Conflict |
| Borrow limit reached | 422 Unprocessable Entity |
| Server error | 500 Internal Server Error |

---

## Authentication Flow

1. User registers via `POST /auth/register` → password hashed with bcrypt → user stored in DB
2. User logs in via `POST /auth/login` → credentials verified → JWT issued (expires in 24h)
3. JWT included in `Authorization: Bearer <token>` header on subsequent requests
4. `auth` middleware verifies token and attaches `req.user` to the request
5. `rbac` middleware checks `req.user.role` against route requirements

---

## Environment Configuration

All sensitive/environment-specific values live in `.env` (never committed). See `.env.example` for required variables:

- `DATABASE_URL` — SQLite file path
- `JWT_SECRET` — secret key for signing JWT tokens
- `JWT_EXPIRES_IN` — token expiry duration (e.g. `24h`)
- `PORT` — server port (default `3000`)
