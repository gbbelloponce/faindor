# API - Context for Claude Code

## Module Structure
Each feature lives in `src/modules/<feature>/` with:
- `router.ts` — tRPC router with procedures
- `service.ts` — business logic and database queries
- `types/request.ts` — Zod input schemas

Shared code lives in `src/shared/`:
- `trpc/` — tRPC setup, context creation, procedure definitions
- `db/` — Prisma client and schema files
- `utils/` — error handling, JWT tokens, email/domain utilities
- `constants/` — shared constants (e.g. PAGE_SIZE)
- `types/` — shared Zod schemas (e.g. positiveNumberSchema)

## Key Patterns

### Procedures
- `publicProcedure` — no auth required (login, register)
- `authenticatedProcedure` — requires valid JWT; provides `ctx.user` with `id`, `email`, `organizationId`, `userRole`

### Auth
- Always use `ctx.user.id` for the current user's ID in authenticated procedures. Never accept userId from client input for ownership/authorship.
- Access tokens expire in 15 minutes, refresh tokens in 30 days.
- Tokens are signed with `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` env vars.

### Error Handling
- Wrap service logic in try/catch and use `handleError(error, { message, code })` from `src/shared/utils/errors.ts`.
- Use specific `TRPCError` codes: `NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`.

### Database
- Prisma 7 with config in `prisma.config.ts` (schema path, migrations, datasource URL).
- Prisma schema is split across `src/shared/db/schema/`: `schema.prisma` (generator + datasource), `user.prisma`, `organization.prisma`, `post.prisma`, `group.prisma`.
- Generated client lives at `src/generated/prisma/` — use relative imports to `generated/prisma/client` (not `@/` alias or `@prisma/client`), so API type declarations are resolvable by the web-ui.
- Use `findUnique()` for fields with unique constraints (email, domain), not `findFirst()`.
- Soft deletes use `deletedAt` — always filter with `deletedAt: null` in queries.
- Pagination uses offset-based: `take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE`.

### Validation
- All inputs validated with Zod schemas in `types/request.ts`.
- Use `positiveNumberSchema` from `src/shared/types/schemas.ts` for ID fields.
- Apply `.trim()` to string inputs to avoid whitespace issues.

## Commands
- **Dev server:** `bun run dev` (runs with `--hot`)
- **Prisma generate:** `bun run db:generate` (outputs to `src/generated/prisma/`)
- **Prisma migrate:** `bun run db:migrate` (reads config from `prisma.config.ts`)
- **Install packages:** `cd apps/api && bun add <package>` (not `--filter`)

## Known Issues
See `CODE_REVIEW.md` for a full list. Key ones:
- Comment creation accepts userId from client (should use ctx.user.id)
- Soft delete filters (`deletedAt: null`) are missing from all queries
- Password validation is too weak (min 1 char)
- Post list queries load full likes/comments instead of counts
