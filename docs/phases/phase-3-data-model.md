# Phase 3 — Data Model

## Summary
Prisma schema written from `data-model.md` spec, initial migration applied creating the SQLite database, and seed script populated with 15 books, 5 authors, 3 users, and 3 borrow records.

**Date completed:** 2026-03-04

---

## Files Created / Modified

| File | Action | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modified | Full data model — all 5 entities and relationships |
| `prisma/seed.ts` | Created | Generates sample books, authors, users, and borrow records |
| `prisma/migrations/..._init/migration.sql` | Auto-generated | SQL migration applied to create all tables |
| `prisma/dev.db` | Auto-generated | SQLite database file |

---

## Schema Overview

### Models
- **Book** — title, isbn (unique), publishedYear, genre, synopsis?, totalCopies, availableCopies
- **Author** — firstName, lastName, bio?, birthYear?
- **User** — email (unique), password, name, role (enum: MEMBER | LIBRARIAN)
- **BookAuthor** — composite PK (bookId, authorId), many-to-many join table
- **Borrow** — userId, bookId, borrowedAt, dueAt, returnedAt?

### Relationships
- Book ↔ Author: many-to-many via BookAuthor (cascade delete)
- User → Borrow: one-to-many (cascade delete)
- Book → Borrow: one-to-many (cascade delete)

---

## Seed Data

| Entity | Count | Notes |
|---|---|---|
| Authors | 5 | Eleanor Voss, Marcus Thorn, Priya Anand, Daniel Okafor, Sasha Merritt |
| Books | 15 | Multiple genres; 2 books co-authored; copies range 1–3 |
| Users | 3 | 1 LIBRARIAN (`librarian@library.com`), 2 MEMBERs |
| Borrows | 3 | 2 active, 1 returned |

**All seed passwords:** `password123`

| Email | Role |
|---|---|
| `librarian@library.com` | LIBRARIAN |
| `jane@example.com` | MEMBER |
| `sam@example.com` | MEMBER |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| `prisma-client-js` provider | Reverted from Prisma 6 experimental `prisma-client` to stable `prisma-client-js` for compatibility |
| `onDelete: Cascade` on relations | Prevents orphaned borrow/join records when a book, author, or user is deleted |
| Seed borrow records reflect availableCopies | Null Island seeded with 1 available (1 borrowed); Ash Continent updated to 2 available (1 borrowed) |
| Prisma seed key in package.json | Allows `prisma migrate reset` to auto-run the seed after reset |

---

## Commands Run

```bash
npx prisma migrate dev --name init
npm run seed
```

---

## Next Phase
**Phase 4 — Core API Implementation**: Create Express app, auth routes, books/authors/users routes, controllers, services, and Zod validators.
