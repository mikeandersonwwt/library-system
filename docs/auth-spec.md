# Authentication & Authorization Spec

## Overview

The API uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC) to restrict endpoint access based on user role.

---

## Authentication: JWT

### Token Format

Tokens are signed using the `HS256` algorithm. The JWT payload contains:

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "MEMBER",
  "iat": 1700000000,
  "exp": 1700086400
}
```

| Claim | Description |
|---|---|
| `sub` | User ID (integer) |
| `email` | User's email address |
| `role` | User's role (`MEMBER` or `LIBRARIAN`) |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expiry (Unix timestamp, 24h after issue) |

### Token Transmission

The client must include the token in every authenticated request via the `Authorization` header:

```
Authorization: Bearer <token>
```

### Token Expiry

- Tokens expire **24 hours** after issuance
- There is no refresh token mechanism in this version
- Expired tokens return `401 Unauthorized`

---

## Auth Endpoints

### POST /auth/register

Register a new user account. New accounts default to the `MEMBER` role.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123",
  "name": "Jane Doe"
}
```

**Rules:**
- Email must be unique
- Password minimum 8 characters
- Name required

**Success response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "MEMBER"
  },
  "token": "<jwt>"
}
```

**Error responses:**
- `400` — validation failure (missing fields, invalid email format)
- `409` — email already registered

---

### POST /auth/login

Authenticate an existing user and receive a JWT.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "MEMBER"
  },
  "token": "<jwt>"
}
```

**Error responses:**
- `400` — missing fields
- `401` — invalid email or password

---

## Authorization: RBAC

Two roles exist in the system:

| Role | Description |
|---|---|
| `MEMBER` | Standard library user. Can browse books, borrow/return, view own history. |
| `LIBRARIAN` | Administrative user. Full access including managing books, authors, and users. |

### Permissions Matrix

| Endpoint | Method | Auth Required | Required Role |
|---|---|---|---|
| `/auth/register` | POST | No | — |
| `/auth/login` | POST | No | — |
| `/books` | GET | Yes | MEMBER, LIBRARIAN |
| `/books/:id` | GET | Yes | MEMBER, LIBRARIAN |
| `/books` | POST | Yes | LIBRARIAN |
| `/books/:id` | PUT | Yes | LIBRARIAN |
| `/books/:id` | DELETE | Yes | LIBRARIAN |
| `/books/:id/borrow` | POST | Yes | MEMBER, LIBRARIAN |
| `/books/:id/return` | POST | Yes | MEMBER, LIBRARIAN |
| `/authors` | GET | Yes | MEMBER, LIBRARIAN |
| `/authors/:id` | GET | Yes | MEMBER, LIBRARIAN |
| `/authors` | POST | Yes | LIBRARIAN |
| `/authors/:id` | PUT | Yes | LIBRARIAN |
| `/authors/:id` | DELETE | Yes | LIBRARIAN |
| `/users` | GET | Yes | LIBRARIAN |
| `/users/:id` | GET | Yes | LIBRARIAN |
| `/users/:id` | PUT | Yes | LIBRARIAN |
| `/users/:id` | DELETE | Yes | LIBRARIAN |
| `/users/me` | GET | Yes | MEMBER, LIBRARIAN |
| `/users/me/borrows` | GET | Yes | MEMBER, LIBRARIAN |

---

## Middleware Implementation

### auth.ts

Applies to all protected routes. Behavior:

1. Extract `Authorization` header
2. If missing or malformed → `401 Unauthorized`
3. Verify JWT signature using `JWT_SECRET`
4. If expired or invalid → `401 Unauthorized`
5. Decode payload, attach `req.user = { id, email, role }` to request
6. Call `next()`

### rbac.ts

A middleware factory that accepts a list of allowed roles:

```typescript
requireRole('LIBRARIAN')
requireRole('MEMBER', 'LIBRARIAN')
```

Behavior:
1. Read `req.user.role` (set by `auth` middleware)
2. If role is not in the allowed list → `403 Forbidden`
3. Otherwise call `next()`

---

## Password Security

- Passwords are hashed using `bcrypt` with a salt rounds value of **10**
- Plain text passwords are **never** stored or returned in any response
- The `password` field is explicitly excluded from all User query responses

---

## Error Response Format

All auth/authz errors follow the standard error format. `500 Internal Server Error` is handled globally by `errorHandler.ts` and is not specific to auth — see `architecture.md` for the full error handling strategy.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid.",
    "status": 401
  }
}
```

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "status": 403
  }
}
```
