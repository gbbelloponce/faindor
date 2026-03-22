# API - Context for Claude Code

## Module Structure
Each feature lives in `src/modules/<feature>/` with:
- `router.ts` — tRPC router with procedures
- `service.ts` — business logic and database queries
- `types/request.ts` — Zod input schemas

Shared code lives in `src/shared/`:
- `trpc/` — tRPC setup, context creation, procedure definitions
- `db/` — Prisma client and schema files
- `utils/` — error handling, JWT tokens, email/domain utilities, pagination, env validation
- `constants/` — shared constants (e.g. PAGE_SIZE)
- `types/` — shared Zod schemas (e.g. positiveNumberSchema)

## Key Patterns

### Procedures
- `publicProcedure` — no auth required (login, register)
- `authenticatedProcedure` — requires valid JWT; provides `ctx.user` with `id`, `role`, `organizationId`, `tokenVersion`
- `adminProcedure` — extends `authenticatedProcedure`; additionally requires `ctx.user.role === APP_ADMIN`, throws `FORBIDDEN` otherwise

### Auth
- Always use `ctx.user.id` for the current user's ID in authenticated procedures. Never accept userId from client input for ownership/authorship.
- Access tokens expire in 15 minutes, refresh tokens in 30 days.
- Tokens are signed with `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` env vars.
- `tokenVersion` is stored on `User` and embedded in the access token. On every authenticated request, `createContext` fetches the user's current `tokenVersion` from DB and rejects the token if it doesn't match. Incrementing `tokenVersion` (via `auth.logOut` or future deactivation logic) immediately invalidates all existing tokens for that user.
- Rate limiting is applied in `src/index.ts` via `hono-rate-limiter`: 15 login attempts / 15 min, 10 register attempts / hour, 30 refresh attempts / 15 min (all per IP).

### Error Handling
- Wrap service logic in try/catch and use `handleError(error, { message, code })` from `src/shared/utils/errors.ts`.
- Use specific `TRPCError` codes: `NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`.

### Database
- Prisma 7 with config in `prisma.config.ts` (schema path, migrations, datasource URL).
- Prisma schema is split across `src/shared/db/`: `schema.prisma` (generator + datasource), `user.prisma`, `organization.prisma`, `post.prisma`, `group.prisma`.
- Generated client lives at `src/shared/db/generated/prisma/` — use relative imports to `shared/db/generated/prisma/client` (not `@/` alias or `@prisma/client`), so API type declarations are resolvable by the web-ui.
- Use `findUnique()` for fields with unique constraints (email, domain), not `findFirst()`.
- Soft deletes use `deletedAt` — always filter with `deletedAt: null` in queries.
- Pagination uses offset-based via `getPaginationArgs(page)` from `src/shared/utils/pagination.ts`.

### Validation
- All inputs validated with Zod schemas in `types/request.ts`.
- Use `positiveNumberSchema` from `src/shared/types/schemas.ts` for ID fields.
- Apply `.trim()` and `.max()` to string inputs to avoid whitespace issues and limit input size.

### Startup
- Required env vars are validated at startup via `validateEnv()` in `src/shared/utils/env.ts`.

## Commands
- **Dev server:** `bun run dev` (runs with `--hot`)
- **Prisma generate:** `bun run db:generate` (outputs to `src/generated/prisma/`)
- **Prisma migrate:** `bun run db:migrate` (reads config from `prisma.config.ts`)
- **Install packages:** `cd apps/api && bun add <package>` (not `--filter`)

## Known Issues
- Offset-based pagination — works fine now; cursor-based would be more reliable at scale
