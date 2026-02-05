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

## Critical Issues

### 1. User ID Injection in Comments
**Files:** `src/modules/comments/types/request.ts`, `src/modules/comments/service.ts`

The `createCommentSchema` accepts `userId` from the client and uses it directly as `authorId`. A malicious client can post comments as any user. Posts and likes correctly use `ctx.user.id` from JWT context, but comments don't.

**Fix:** Remove `userId` from the schema and use `ctx.user.id` like the posts module does.

### 2. Soft Delete Queries Are Broken
**Files:** All service files with queries

`deletedAt` exists in the schema but **no queries filter by `deletedAt: null`**. Deleted posts, comments, and users are still returned. This defeats the purpose of soft deletes.

**Fix:** Either add `deletedAt: null` to all `where` clauses, or set up Prisma middleware to apply it globally.

### 3. Weak Password Validation
**File:** `src/modules/auth/types/request.ts`

`password: z.string().min(1)` allows single-character passwords.

**Fix:** Enforce at least 8 characters: `z.string().min(8)`.

---

## Medium Issues

### 4. N+1 Query Problem
**File:** `src/modules/posts/service.ts`

Post queries use `include: { author: true, likes: true, comments: true }` which loads **all** likes and comments for every post. For list views, use `_count` instead. The comment `replies: true` include could even recurse without depth limits.

### 5. `findFirst()` Where `findUnique()` Should Be Used
**Files:** `src/modules/organizations/service.ts`, `src/modules/users/service.ts`

Email and domain lookups use `findFirst()` even though those fields have unique constraints. `findUnique()` is more efficient and semantically correct.

### 6. Duplicated Pagination Logic
**File:** `src/modules/posts/service.ts`

`getLatestsPostsByOrganizationId`, `getLatestsPostsByUserId`, and `getLatestsPostsByGroupId` share nearly identical code (include, orderBy, take, skip). Same pattern across comments and likes. Could extract a shared pagination helper.

### 7. No Rate Limiting
Login, registration, token refresh, and content creation are all unprotected against brute force or spam.

### 8. Context Errors Silently Swallowed
**File:** `src/shared/trpc/context.ts`

All errors in context creation return `{ user: null }`. Malformed tokens look identical to unauthenticated requests, making debugging harder and hiding potentially malicious requests.

### 9. Missing Admin Enforcement
`UserRole.APP_ADMIN` exists in the schema but is never checked anywhere. No admin-only routes exist.

---

## Minor Issues

### 10. No `.trim()` on Zod String Schemas
`"  admin  "` and `"admin"` could create separate records.

### 11. No Input Sanitization
Post/comment content has no sanitization. Potential XSS if frontend doesn't escape properly.

### 12. No Cascading Deletes
Deleting a user orphans their posts, comments, likes, and group memberships. Consider `onDelete: Cascade` in the schema.

### 13. Optional `Group.organizationId`
**File:** `src/shared/db/schema/group.prisma`

Allows groups without organizations, which seems unintentional. Should probably be required.

### 14. No Env Var Validation on Startup
If `ACCESS_TOKEN_SECRET` is missing, it only fails when someone tries to log in. Validate required env vars at startup.

### 15. Offset-Based Pagination
Works fine now but cursor-based would be more reliable and performant as data grows.

### 16. Weak Domain Validation
**File:** `src/modules/organizations/types/request.ts`

`domain: z.string()` has no format constraints. Could accept any arbitrary string.

### 17. Redundant Authorization Check in Groups
**File:** `src/modules/groups/service.ts`

The organization check on the fetched group is redundant because the query already filters by `organizationId`.

---

## Suggested Priority

1. Fix comment userId injection (security)
2. Add `deletedAt: null` filters globally (correctness)
3. Strengthen password validation (security)
4. Replace `include` with `_count` for list queries (performance)
5. Switch `findFirst()` to `findUnique()` (correctness)
6. Extract pagination helper (maintainability)
7. Add rate limiting (security)
8. Validate env vars on startup (reliability)
