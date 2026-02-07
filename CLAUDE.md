# Faindor - Project Context for Claude Code

## Project Overview
Faindor is a workplace social media platform where users log in with work emails to connect with colleagues in organization-specific environments. This is a learning project and portfolio showcase.

## Tech Stack
- **Frontend**: Next.js, TypeScript, TailwindCSS, shadcn/ui (monorepo)
- **Backend**: Hono with TypeScript (monorepo)
- **Database**: Prisma ORM with Prisma Postgres (serverless)
- **Authentication**: Custom JWT (access + refresh tokens)
- **Package Manager**: Bun
- **Linter/Formatter**: Biome

## Core Features
- **Email-based Organizations**: Users assigned to orgs based on email domain
- **Social Features**: Posts, likes, comments, communities, events
- **Kudos System**: Peer recognition with AI-generated images and NFTs (planned)
- **Admin System**: First user becomes admin, can manage organization

## Business Logic
- Custom email domains → Company-specific organization
- Standard emails (@gmail, @yahoo, etc.) → General public organization
- Admin controls: user permissions, blacklists, content moderation
- Real-time features and Web3 integration planned for future phases

## Architecture Overview

### Monorepo Structure
- **apps/api**: Backend API service (Hono + tRPC)
- **apps/web-ui**: Frontend Next.js application
- **packages/**: Shared packages (currently empty)
- Uses Bun workspaces for dependency management
- Husky for git hooks

### API (apps/api)
- **Framework**: Hono with tRPC integration (@hono/trpc-server)
- **Database**: 
  - Prisma ORM with PostgreSQL
  - Prisma Accelerate for edge performance
  - Schema split across multiple files (user.prisma, organization.prisma, post.prisma, group.prisma)
- **Authentication**: 
  - Custom JWT implementation (access + refresh tokens)
  - Token utilities in `src/shared/utils/token.ts`
- **Module Structure**:
  - Each feature has its own module: auth, users, organizations, posts, comments, likes, groups
  - Modules contain: router.ts, service.ts (optional), types/request.ts
- **Key Patterns**:
  - tRPC procedures: `publicProcedure` and `authenticatedProcedure`
  - Centralized error handling via `handleError()`
  - Type exports for frontend consumption via `AppRouter`

### Web UI (apps/web-ui)
- **Framework**: Next.js 16 with App Router (Turbopack is now the default bundler)
- **Styling**:
  - Tailwind CSS v4
  - shadcn/ui components (New York style)
  - CSS variables for theming
- **State Management**:
  - Zustand for auth state
  - TanStack Query (via tRPC) for server state
- **Internationalization**:
  - Multi-language support (en, es)
  - Server-side locale detection via proxy (`src/proxy.ts`)
  - Dictionary-based translations
- **Authentication Flow**:
  - Proxy-based route protection (`src/proxy.ts`)
  - Cookie-based token storage (js-cookie)
  - Auto-refresh mechanism for access tokens
- **Key Features**:
  - Dark mode support (next-themes)
  - Form handling with react-hook-form + zod (Zod v4)
  - Toast notifications (sonner)

## Database Schema
- **Users**: Email-based authentication, role system (USER, APP_ADMIN)
- **Organizations**: Domain-based grouping (e.g., @company.com)
- **Posts, Comments, Likes**: Social features
- **Groups**: Organization-specific groups with membership
- **Soft deletes**: Using `deletedAt` timestamps

## Development Patterns
- **Type Safety**: End-to-end type safety via tRPC
- **Validation**: Zod v4 schemas for request/response validation (use `{ error: "msg" }` instead of string shorthand for error messages; use `z.enum()` instead of `z.nativeEnum()` for native enums)
- **Error Handling**: Standardized error responses with specific error codes
- **Code Style**: 
  - Tab indentation (enforced by Biome)
  - Double quotes for strings
  - Organized imports

## Environment Variables
- `CLIENT_URL`: Frontend URL for CORS
- `API_PORT`: API server port
- `DATABASE_URL`: PostgreSQL connection string

## Build & Type Generation
- API builds types that are imported by frontend
- Special configuration for tRPC type sharing
- API exports types via package.json exports field

## Development Notes
- API runs with hot reload: `bun run --hot`
- Frontend uses Next.js Turbopack (default in Next.js 16, no `--turbopack` flag needed)
- Database migrations: `bun run --filter api db:migrate`
- Type generation: `bun run --filter api db:generate`

## Monorepo Commands
- **Running commands in specific apps**: `bun run --filter '<app>' run <command>`
- **Installing packages**: 
  - ⚠️ DO NOT use `bun run --filter` for package installation (adds to root package.json)
  - Instead: `cd apps/<app>` then `bun add <package>`

## Commit Convention
This project uses [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<scope>): <description>`

**Types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`, `ci`, `build`

**Scopes:**
- `api` — backend changes
- `web-ui` — frontend changes
- `api|web-ui` — changes spanning both apps
- Omit scope for global/root changes (e.g. `docs: ...`)

**Examples:**
- `feat(web-ui): add event creation page`
- `fix(api): prevent duplicate likes on same post`
- `chore(api|web-ui): update build configuration`
- `refactor(api): extract pagination helper`
- `docs: add claude context and code review files`

**Rules:**
- Use lowercase for description
- No period at the end
- Use imperative mood ("add", not "added" or "adds")