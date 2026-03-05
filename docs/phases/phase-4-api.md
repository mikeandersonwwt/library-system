# Phase 4 — Core API Implementation

## Summary
Full Express API implemented across all layers: app setup, validators, middleware, services, controllers, and routes. Server verified running with smoke tests passing.

**Date completed:** 2026-03-04

---

## Files Created

| File | Purpose |
|---|---|
| `src/index.ts` | Entry point — loads env, starts Express server on PORT |
| `src/app.ts` | Express app setup — registers middleware and all route groups |
| `src/types/index.ts` | Shared TypeScript types: `Role`, `AuthPayload`, `AuthRequest`, `ApiError` |
| `src/validators/book.validator.ts` | Zod schema for create/update book input |
| `src/validators/author.validator.ts` | Zod schema for create/update author input |
| `src/validators/user.validator.ts` | Zod schemas for register, login, update user |
| `src/middleware/errorHandler.ts` | `AppError` class + global error handler middleware |
| `src/middleware/auth.ts` | JWT verification middleware — attaches `req.user` |
| `src/middleware/rbac.ts` | `requireRole()` factory — enforces MEMBER/LIBRARIAN access |
| `src/middleware/logger.ts` | Request logger — logs method, path, status, duration |
| `src/services/auth.service.ts` | Register + login logic, bcrypt hashing, JWT signing |
| `src/services/books.service.ts` | Full CRUD + borrow/return with business rule enforcement |
| `src/services/authors.service.ts` | Full CRUD for authors |
| `src/services/users.service.ts` | Full CRUD for users + borrow history |
| `src/controllers/auth.controller.ts` | Handles POST /auth/register, POST /auth/login |
| `src/controllers/books.controller.ts` | Handles all /books endpoints including borrow/return |
| `src/controllers/authors.controller.ts` | Handles all /authors endpoints |
| `src/controllers/users.controller.ts` | Handles all /users endpoints including /me |
| `src/routes/auth.routes.ts` | Route registration for auth endpoints |
| `src/routes/books.routes.ts` | Route registration with auth + RBAC middleware applied |
| `src/routes/authors.routes.ts` | Route registration with auth + RBAC middleware applied |
| `src/routes/users.routes.ts` | Route registration with auth + RBAC middleware applied |

---

## Smoke Tests Verified

| Test | Expected | Result |
|---|---|---|
| `POST /auth/login` with valid credentials | `200` + JWT token | ✅ |
| `GET /books` without token | `401 UNAUTHORIZED` | ✅ |
| `POST /books` as MEMBER | `403 FORBIDDEN` | ✅ |
| `POST /books/:id/borrow` as MEMBER | `201` + borrow record with 14-day dueAt | ✅ |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| Zod `.issues` not `.errors` | Zod v4 renamed the property; `.issues` is correct |
| `String(req.params.id)` cast | Silences false-positive TypeScript lint from Express param types |
| `prisma.$transaction` for borrow/return | Ensures borrow record creation and copy count update are atomic |
| `safeSelect` in users service | Explicitly excludes `password` from all user query results |
| `/me` and `/me/borrows` routes registered before `/:id` | Express matches routes in order; specific paths must come before params |

---

## Notes

- `JWT_SECRET` was missing from Prisma-generated `.env` — added manually; `.env.example` already has the correct template
- TypeScript compiles clean (`tsc --noEmit` exits 0)

---

## Commands Run

```bash
npx tsc --noEmit
npx ts-node src/index.ts
```

---

## Next Phase
**Phase 5 — Middleware** is already complete (implemented as part of Phase 4). Proceeding directly to **Phase 6 — Tests**.
