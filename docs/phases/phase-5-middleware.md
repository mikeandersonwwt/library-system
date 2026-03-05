# Phase 5 — Middleware

## Summary
All middleware was implemented as part of Phase 4 since it was a prerequisite for the route layer. This log documents what was built and why.

**Date completed:** 2026-03-04

---

## Files Created

| File | Purpose |
|---|---|
| `src/middleware/auth.ts` | JWT verification — extracts Bearer token, verifies signature, attaches `req.user` |
| `src/middleware/rbac.ts` | Role-based access control — `requireRole()` factory middleware |
| `src/middleware/errorHandler.ts` | Global error handler + `AppError` class |
| `src/middleware/logger.ts` | Request logger — logs method, path, status, duration on response finish |

---

## Middleware Details

### auth.ts
- Reads `Authorization: Bearer <token>` header
- Returns `401` if header missing, malformed, expired, or invalid signature
- Verifies against `JWT_SECRET` from environment
- Attaches decoded `{ sub, email, role }` to `req.user`

### rbac.ts
- Factory: `requireRole('LIBRARIAN')` or `requireRole('MEMBER', 'LIBRARIAN')`
- Returns `401` if `req.user` not set (auth middleware must run first)
- Returns `403` if user's role not in allowed list
- Must be chained after `authenticate` in route definitions

### errorHandler.ts
- `AppError` class: structured error with `code`, `message`, `status`
- All services throw `AppError` for known error conditions
- Handler formats all `AppError` instances into consistent JSON
- Unknown errors logged to console and returned as generic `500`

### logger.ts
- Hooks into `res.on('finish')` to log after response is sent
- Format: `METHOD /path STATUS DURATIONms`
- Registered globally on all routes in `app.ts`

---

## Error Code Reference

| Code | Status | Thrown by |
|---|---|---|
| `UNAUTHORIZED` | 401 | auth.ts, rbac.ts |
| `FORBIDDEN` | 403 | rbac.ts |
| `NOT_FOUND` | 404 | all services |
| `VALIDATION_ERROR` | 400 | all controllers |
| `EMAIL_TAKEN` | 409 | auth.service.ts |
| `ISBN_TAKEN` | 409 | books.service.ts |
| `BOOK_UNAVAILABLE` | 409 | books.service.ts |
| `BORROW_LIMIT_REACHED` | 422 | books.service.ts |
| `INVALID_CREDENTIALS` | 401 | auth.service.ts |
| `INTERNAL_SERVER_ERROR` | 500 | errorHandler.ts (catch-all) |

---

## Next Phase
**Phase 6 — Tests**: Write unit tests for service business logic and integration tests for all endpoints.
