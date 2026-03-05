# Data Model

## Overview

The library system uses a relational data model with 5 entities: Book, Author, User, BookAuthor (join table), and Borrow.

---

## Entities

### Book

Represents a title in the library catalog.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | Yes | Auto-increment primary key |
| `title` | String | Yes | |
| `isbn` | String | Yes | Unique, 10 or 13 digits |
| `publishedYear` | Integer | Yes | 4-digit year |
| `genre` | String | Yes | e.g. Fiction, Mystery, Science |
| `synopsis` | String | No | Short description of the book |
| `totalCopies` | Integer | Yes | Default: 1, min: 1 |
| `availableCopies` | Integer | Yes | Default: equals totalCopies |
| `createdAt` | DateTime | Yes | Auto-set on create |
| `updatedAt` | DateTime | Yes | Auto-updated |

**Relationships:**
- Has many `Author` records via `BookAuthor` join table (many-to-many)
- Has many `Borrow` records

---

### Author

Represents a book author.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | Yes | Auto-increment primary key |
| `firstName` | String | Yes | |
| `lastName` | String | Yes | |
| `bio` | String | No | Short biography |
| `birthYear` | Integer | No | 4-digit year |
| `createdAt` | DateTime | Yes | Auto-set on create |
| `updatedAt` | DateTime | Yes | Auto-updated |

**Relationships:**
- Has many `Book` records via `BookAuthor` join table (many-to-many)

---

### User

Represents a library member or librarian.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | Yes | Auto-increment primary key |
| `email` | String | Yes | Unique |
| `password` | String | Yes | bcrypt hashed, never returned in responses |
| `name` | String | Yes | Full name |
| `role` | Enum | Yes | `MEMBER` or `LIBRARIAN`, default: `MEMBER` |
| `createdAt` | DateTime | Yes | Auto-set on create |
| `updatedAt` | DateTime | Yes | Auto-updated |

**Relationships:**
- Has many `Borrow` records

---

### BookAuthor (Join Table)

Resolves the many-to-many relationship between Book and Author.

| Field | Type | Required | Notes |
|---|---|---|---|
| `bookId` | Integer | Yes | Foreign key → Book |
| `authorId` | Integer | Yes | Foreign key → Author |

**Composite primary key:** (`bookId`, `authorId`)

---

### Borrow

Represents a borrowing transaction — one user borrowing one book.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Integer | Yes | Auto-increment primary key |
| `userId` | Integer | Yes | Foreign key → User |
| `bookId` | Integer | Yes | Foreign key → Book |
| `borrowedAt` | DateTime | Yes | Auto-set on create |
| `dueAt` | DateTime | Yes | Set to borrowedAt + 14 days |
| `returnedAt` | DateTime | No | Null until returned |

**Relationships:**
- Belongs to one `User`
- Belongs to one `Book`

---

## Relationships Diagram

```
User ──────< Borrow >────── Book
                             │
                             │ (many-to-many)
                             │
                           Author
                      (via BookAuthor)
```

---

## Business Rules

| Rule | Detail |
|---|---|
| Borrow limit | A user may have at most 3 active (unreturned) borrows at any time |
| Due date | Automatically set to 14 days from `borrowedAt` |
| Copy tracking | `availableCopies` decrements on borrow, increments on return |
| Availability check | If `availableCopies == 0`, borrow attempt returns `409 Conflict` |
| ISBN uniqueness | Each book must have a unique ISBN |
| Email uniqueness | Each user must have a unique email address |

---

## Enums

### Role
```
MEMBER     — Standard library member, can browse and borrow books
LIBRARIAN  — Administrative role, can manage books, authors, and users
```

---

## Seed Data Plan

The seed script (`prisma/seed.ts`) will generate:
- 5 authors (fictional names)
- 15 books across multiple genres, each with 1–3 copies, assigned to 1–2 authors
- 3 users: 1 LIBRARIAN, 2 MEMBERs
- 2–3 sample borrow records in various states (active and returned)
