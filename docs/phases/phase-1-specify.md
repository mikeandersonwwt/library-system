# Phase 1 — Specify

## Summary
All spec artifacts were created before any implementation code. These documents serve as the source of truth for the entire project.

**Date completed:** 2026-03-04

---

## Files Created

| File | Purpose |
|---|---|
| `docs/implementation-plan.md` | Overall project summary — phases, structure, business rules, RBAC matrix |
| `docs/architecture.md` | System design, layered architecture, tech stack decisions, error handling strategy |
| `docs/data-model.md` | All entities with field definitions, types, relationships, business rules, seed plan |
| `docs/auth-spec.md` | JWT format, auth endpoints, RBAC permissions matrix, middleware behavior |
| `docs/openapi.yaml` | Full OpenAPI 3.0 API contract — all endpoints, request/response schemas, error codes |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| Node.js + TypeScript + Express | Familiar to the developer, explicit/transparent framework, strong TS ecosystem |
| SQLite + Prisma | Zero setup, file-based DB; Prisma schema acts as a spec artifact and generates TS types |
| JWT (24h expiry, no refresh) | Standard stateless REST auth; refresh token adds complexity without learning value here |
| RBAC: MEMBER vs LIBRARIAN | Realistic access control pattern without excessive complexity |
| Borrow limit: 3 active, 14-day due | Reasonable library rules that make the borrow system meaningful |
| Copy tracking: totalCopies / availableCopies | Two integer fields on Book — minimal complexity, logically necessary |
| 409 on unavailable book | Clear error over waitlist complexity; demonstrates proper HTTP status code usage |
| Zod for validation | Runtime schema validation with TypeScript inference; validators act as runtime spec enforcement |

---

## Spec Artifacts Overview

### Entities
- **Book** — title, isbn, publishedYear, genre, synopsis, totalCopies, availableCopies
- **Author** — firstName, lastName, bio, birthYear
- **User** — email, password (hashed), name, role (MEMBER | LIBRARIAN)
- **BookAuthor** — join table (many-to-many)
- **Borrow** — userId, bookId, borrowedAt, dueAt, returnedAt

### Endpoints Defined (openapi.yaml)
- `POST /auth/register`, `POST /auth/login`
- `GET /books`, `POST /books`, `GET /books/:id`, `PUT /books/:id`, `DELETE /books/:id`
- `POST /books/:id/borrow`, `POST /books/:id/return`
- `GET /authors`, `POST /authors`, `GET /authors/:id`, `PUT /authors/:id`, `DELETE /authors/:id`
- `GET /users`, `GET /users/me`, `GET /users/me/borrows`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`

### Error Codes Defined
| Status | Scenario |
|---|---|
| 400 | Validation failure |
| 401 | Unauthenticated |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Conflict (no copies available, duplicate ISBN/email) |
| 422 | Borrow limit reached |
| 500 | Server error |

---

## Next Phase
**Phase 2 — Project Setup**: Initialize Node.js project, install dependencies, configure TypeScript and Prisma.
