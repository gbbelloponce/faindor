# API Code Review

## What's Good

### Architecture & Organization
- Clean module-based structure with clear separation of concerns. Each module has `router.ts`, `service.ts`, and `types/request.ts`.
- Shared utilities, constants, and database access properly centralized under `src/shared/`.
- Clean router composition in `src/router.ts`.

### Type Safety
- End-to-end type safety via tRPC + Zod schemas + TypeScript strict mode.
- Frontend gets typed API clients for free through `AppRouter` export.
- Environment variables properly typed in `type.ts`.

### Authentication
- Separate access/refresh tokens with proper expiration (15 min / 30 days).
- Bun's native `Bun.password.hash()` and `Bun.password.verify()` for secure hashing.
- Middleware-based JWT validation in `src/shared/trpc/index.ts`.

### Business Logic
- Smart email domain detection in `src/shared/utils/mail.ts` — automatically identifies company domains vs common providers and creates orgs.
- Organization-based access control in post/group services.
- CORS properly locked down to `CLIENT_URL`.

### Other
- Centralized error handling with `handleError()`.
- Soft delete support in the schema via `deletedAt` timestamps.

---

## Resolved Issues

### 1. ~~User ID Injection in Comments~~ (FIXED)
Removed `userId` from `createCommentSchema`; comments now use `ctx.user.id`.

### 2. ~~Soft Delete Queries Are Broken~~ (FIXED)
Added `deletedAt: null` filters to all queries.

### 3. ~~Weak Password Validation~~ (FIXED)
Password now requires minimum 8 characters.

### 4. ~~N+1 Query Problem~~ (FIXED)
Post list queries now use `_count` instead of full includes.

### 5. ~~`findFirst()` Where `findUnique()` Should Be Used~~ (FIXED)
Switched to `findUnique()` for email and domain lookups.

### 6. ~~Duplicated Pagination Logic~~ (FIXED)
Extracted `getPaginationArgs()` helper in `src/shared/utils/pagination.ts`.

### 8. ~~Context Errors Silently Swallowed~~ (FIXED)
Context now distinguishes expected vs unexpected errors.

### 10. ~~No `.trim()` on Zod String Schemas~~ (FIXED)
Added `.trim()` to all user-facing string inputs.

### 11. ~~No Input Sanitization~~ (FIXED)
Added `.max()` length constraints to all string inputs (names: 100, domains: 255, posts: 5000, comments: 2000).

### 12. ~~No Cascading Deletes~~ (FIXED)
Added `onDelete: Cascade` to all parent-child relations. Comment replies use `onDelete: SetNull` to preserve threads.

### 13. ~~Optional `Group.organizationId`~~ (FIXED)
Made `organizationId` required on `Group`. Fixed `createGroup` service to pass `organizationId`.

### 14. ~~No Env Var Validation on Startup~~ (FIXED)
Added `validateEnv()` in `src/shared/utils/env.ts`, called at startup.

### 17. ~~Redundant Authorization Check in Groups~~ (FIXED)
Removed redundant `organizationId` check in `joinGroup()` — the query already filters by it.

---

## Open Issues

### 7. No Rate Limiting
Login, registration, token refresh, and content creation are all unprotected against brute force or spam.

### 9. Missing Admin Enforcement
`UserRole.APP_ADMIN` exists in the schema but is never checked anywhere. No admin-only routes exist.

### 15. Offset-Based Pagination
Works fine now but cursor-based would be more reliable and performant as data grows. Deferred — offset-based pagination helper was just extracted.

### 16. Weak Domain Validation
**File:** `src/modules/organizations/types/request.ts`

`domain: z.string()` has no format constraints. Could accept any arbitrary string.
