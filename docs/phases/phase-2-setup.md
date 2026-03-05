# Phase 2 — Project Setup

## Summary
Node.js project initialized with all dependencies installed, TypeScript and Prisma configured, and project scaffolding in place.

**Date completed:** 2026-03-04

---

## Files Created

| File | Purpose |
|---|---|
| `package.json` | Project manifest — scripts, dependencies |
| `tsconfig.json` | TypeScript compiler configuration |
| `.env.example` | Environment variable template |
| `jest.config.js` | Jest test runner configuration (uses ts-jest) |
| `prisma/schema.prisma` | Prisma schema file (models added in Phase 3) |
| `prisma.config.ts` | Prisma CLI configuration (datasource, migrations path) |

---

## Dependencies Installed

### Production
| Package | Purpose |
|---|---|
| `express` | HTTP server framework |
| `@prisma/client` | Generated Prisma database client |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT creation and verification |
| `zod` | Runtime input validation |
| `dotenv` | Load environment variables from `.env` |

### Development
| Package | Purpose |
|---|---|
| `typescript` | TypeScript compiler |
| `ts-node` | Run TypeScript directly (used by seed script) |
| `ts-node-dev` | Dev server with hot reload |
| `prisma` | Prisma CLI for migrations and codegen |
| `jest` | Test runner |
| `ts-jest` | TypeScript preprocessor for Jest |
| `supertest` | HTTP integration testing utility |
| `@types/*` | TypeScript type definitions |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| `ts-node-dev` for dev server | Hot reload without rebuilding; simpler than nodemon + tsc watch |
| `ts-jest` preset | Compiles TypeScript tests on the fly without a separate build step |
| `jest --runInBand` flag | Runs tests serially — important for integration tests that share a SQLite DB |
| Prisma output to `src/generated/prisma` | Prisma 6+ default; keeps generated types co-located with source |
| `dotenv` as production dep | Required by `prisma.config.ts` at runtime |

---

## Notes

- Node.js engine warning from Jest packages (prefer 18/20/22, running 23.6.1) — warnings only, no functional impact
- `tsconfig.json` lint warning ("no inputs found") is expected until `src/` files are created in Phase 4
- `.env` file was auto-created by Prisma init and is gitignored — copy `.env.example` to `.env` to configure locally

---

## Commands Run

```bash
npm install express @prisma/client bcryptjs jsonwebtoken zod
npm install --save-dev typescript ts-node ts-node-dev @types/node @types/express @types/bcryptjs @types/jsonwebtoken prisma jest ts-jest supertest @types/supertest @types/jest
npm install dotenv
npx prisma init --datasource-provider sqlite
```

---

## Next Phase
**Phase 3 — Data Model**: Write `prisma/schema.prisma` with all entities and relationships, run migration, and create seed script.
