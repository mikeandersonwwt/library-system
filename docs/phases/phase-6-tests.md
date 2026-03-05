# Phase 6 — Tests

## Summary
57 tests written and passing across 5 test suites — unit tests for borrow business logic and integration tests for all API endpoints.

**Date completed:** 2026-03-04

---

## Files Created

| File | Purpose |
|---|---|
| `tests/unit/books.service.test.ts` | Unit tests for borrow/return logic and book CRUD |
| `tests/integration/auth.test.ts` | Integration tests for register and login endpoints |
| `tests/integration/books.test.ts` | Integration tests for all book endpoints including borrow/return |
| `tests/integration/authors.test.ts` | Integration tests for all author endpoints |
| `tests/integration/users.test.ts` | Integration tests for all user endpoints including /me |

---

## Test Results

```
Test Suites: 5 passed, 5 total
Tests:       57 passed, 57 total
Time:        3.256s
```

---

## Coverage by Area

### Unit Tests — `books.service.test.ts` (borrow logic)
| Test | Scenario |
|---|---|
| ✅ | Creates borrow with correct 14-day dueAt |
| ✅ | Decrements availableCopies on borrow |
| ✅ | Throws 409 when no copies available |
| ✅ | Throws 422 when borrow limit of 3 reached |
| ✅ | Returns book and increments availableCopies |
| ✅ | Throws 404 when returning a book not borrowed |
| ✅ | Creates book with availableCopies = totalCopies |
| ✅ | Throws 409 on duplicate ISBN |
| ✅ | Throws 404 for non-existent book get |
| ✅ | Throws 404 for non-existent book delete |

### Integration Tests — Auth
| Test | Scenario |
|---|---|
| ✅ | Register returns 201 + token, no password in response |
| ✅ | Register returns 409 on duplicate email |
| ✅ | Register returns 400 on short password |
| ✅ | Register returns 400 on invalid email format |
| ✅ | Login returns 200 + token |
| ✅ | Login returns 401 on wrong password |
| ✅ | Login returns 401 on unknown email |

### Integration Tests — Books
| Test | Scenario |
|---|---|
| ✅ | GET /books returns 401 without token |
| ✅ | GET /books returns list with token |
| ✅ | POST /books returns 403 for MEMBER |
| ✅ | POST /books creates book as LIBRARIAN |
| ✅ | POST /books returns 409 on duplicate ISBN |
| ✅ | POST /books returns 400 on missing fields |
| ✅ | GET /books/:id returns book |
| ✅ | GET /books/:id returns 404 |
| ✅ | PUT /books/:id updates as LIBRARIAN |
| ✅ | PUT /books/:id returns 403 for MEMBER |
| ✅ | POST /books/:id/borrow returns 201 |
| ✅ | POST /books/:id/return returns 200 |
| ✅ | POST /books/:id/return returns 404 if not borrowed |
| ✅ | POST /books/:id/borrow returns 409 if unavailable |
| ✅ | DELETE /books/:id returns 403 for MEMBER |
| ✅ | DELETE /books/:id deletes as LIBRARIAN |
| ✅ | GET /books/:id returns 404 after deletion |

### Integration Tests — Authors
| Test | Scenario |
|---|---|
| ✅ | POST /authors creates as LIBRARIAN |
| ✅ | POST /authors returns 403 for MEMBER |
| ✅ | POST /authors returns 400 on missing fields |
| ✅ | GET /authors returns list |
| ✅ | GET /authors returns 401 without token |
| ✅ | GET /authors/:id returns author |
| ✅ | GET /authors/:id returns 404 |
| ✅ | PUT /authors/:id updates as LIBRARIAN |
| ✅ | DELETE /authors/:id deletes as LIBRARIAN |
| ✅ | GET /authors/:id returns 404 after deletion |

### Integration Tests — Users
| Test | Scenario |
|---|---|
| ✅ | GET /users/me returns profile, no password |
| ✅ | GET /users/me returns 401 without token |
| ✅ | GET /users/me/borrows returns empty list |
| ✅ | GET /users returns all users for LIBRARIAN |
| ✅ | GET /users returns 403 for MEMBER |
| ✅ | GET /users/:id returns user for LIBRARIAN |
| ✅ | GET /users/:id returns 403 for MEMBER |
| ✅ | GET /users/:id returns 404 |
| ✅ | PUT /users/:id updates as LIBRARIAN |
| ✅ | PUT /users/:id returns 403 for MEMBER |
| ✅ | DELETE /users/:id returns 403 for MEMBER |
| ✅ | DELETE /users/:id deletes as LIBRARIAN |
| ✅ | GET /users/:id returns 404 after deletion |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| `--runInBand` flag | Tests run serially to avoid SQLite write conflicts between test suites |
| Clean DB in `beforeAll` | Each test suite resets to a known state — prevents order-dependent failures |
| `afterEach` in unit tests | Clears borrow records between tests for clean borrow limit assertions |
| `process.env.JWT_SECRET` in tests | Set inline so tests don't depend on `.env` file being present |
| Integration tests promote to LIBRARIAN via Prisma | Register always creates MEMBER; promotion needed for librarian token |

---

## Commands Run

```bash
npm test
```

---

## Next Phase
**Phase 7 — Documentation**: Verify `openapi.yaml` matches the final implementation and write the phase log.
