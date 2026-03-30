# Web-UI - Context for Claude Code

## Routing Structure
Next.js App Router with dynamic `[lang]` locale prefix:
- `src/app/[lang]/` — root layout (fonts, ThemeProvider, AppTRPCProvider, Toaster)
- `src/app/[lang]/(auth)/` — public auth pages (login, register, verify-email). Layout has locale switcher + theme toggler.
- `src/app/[lang]/(app)/` — protected app pages. Layout wraps with `RequireAuthProvider`, `SidebarProvider`, `AppHeader`, `AppSidebar`. Has an `error.tsx` error boundary.

**Implemented pages:**
| Route | Description |
|---|---|
| `home` | Post feed with post creation form |
| `posts/[id]` | Single post with comments |
| `events` | Org events list with RSVP |
| `groups` | Org groups list and detail (`groups/[id]`) |
| `messages` | Real-time direct messages (Supabase Realtime + polling fallback) |
| `profile/[id]` | User profile with post history and saved-posts tab |
| `notifications` | Full notifications list with "Mark all as read" button; also exposed as bell dropdown in `AppHeader` |
| `saved` | Saved posts feed; reuses `PostCard` from home |
| `admin` | Admin panel (users, org settings, events, content moderation) |

**Sidebar links without pages yet:** `marketplace` (link exists in sidebar, no route implemented)

## Key Patterns

### Authentication
- Tokens stored in cookies via `js-cookie`. Config in `src/auth/constants.ts`.
- `useAuth()` hook (Zustand store) in `src/auth/useAuth.tsx` provides: `logInWithCredentials`, `logInWithAccessToken`, `refreshAccessToken`, `register`, `logOut`, `currentUser`.
- `RequireAuthProvider` (`src/auth/require-auth-provider.tsx`) validates auth on page load for protected routes. Tries access token first, falls back to refresh token, then logs out.
- tRPC provider intercepts 401 responses and auto-refreshes tokens (`src/trpc/app-trpc-provider.tsx`).
- Proxy (`src/proxy.ts`) handles route protection and locale detection server-side (migrated from `middleware.ts` for Next.js 16).

### tRPC
- Client setup in `src/trpc/trpc.ts` — exports `useTRPC`, `useTRPCClient`, `TRPCProvider`.
- Provider in `src/trpc/app-trpc-provider.tsx` — configures httpBatchLink with auth headers and token refresh.
- Types imported from the `api` package: `import type { AppRouter } from "api"`.
- TanStack Query staleTime is 60 seconds.

### Internationalization
- Supported locales: `en`, `es` (configured in `src/dictionaries/i18n-config.ts`).
- Dictionaries in `src/dictionaries/en.ts` and `src/dictionaries/es.ts`.
- Type-safe dictionary structure defined in `src/dictionaries/types.ts`.
- `useLocale()` hook in `src/dictionaries/useLocale.ts` — uses `useParams()` to get `[lang]` param. Returns dictionary, locale, and `changeLocale()`.
- Locale detected in proxy via Accept-Language header, persisted in cookie.

### Forms
- react-hook-form + zod v4 + `@hookform/resolvers`.
- Zod v4 uses `{ error: "msg" }` instead of string shorthand for validation messages (e.g., `.min(8, { error: "Too short" })`).
- Use shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from `src/components/ui/form.tsx`.
- Error messages are localized via dictionary error code mappings.

### Styling
- Tailwind CSS v4 with CSS variables (oklch color space) in `src/styles/globals.css`.
- shadcn/ui with New York style, Radix UI primitives.
- `cn()` utility in `src/utils.ts` (clsx + tailwind-merge).
- Dark mode via `next-themes` ThemeProvider.

### Components
- shadcn/ui components in `src/components/ui/`.
- Custom components in `src/components/` (logo, theme toggler, locale switcher, flags).
- App-specific components in `src/app/[lang]/(app)/components/` (header, sidebar).

## Commands
- **Dev server:** `bun run dev` (Next.js 16 — Turbopack is the default, no flag needed)
- **Build:** `bun run build`
- **Install packages:** `cd apps/web-ui && bun add <package>` (not `--filter`)

## Environment Variables
- `NEXT_PUBLIC_API_URL` — API endpoint for tRPC client.
- `NODE_ENV` — used for cookie security flags (secure: true in production).

## Loading / Error State Patterns

All tRPC query states follow a consistent order: **loading → error → empty → data**.

### Shared component
`<QueryError>` (`src/components/query-error.tsx`) — renders an icon, localized message, and optional retry button. Use it for all inline query error states.

```tsx
import { QueryError } from "@/components/query-error";

<QueryError message={query.error.message} onRetry={() => query.refetch()} />
```

### Skeleton loaders
- Co-locate skeleton components with the parent that owns the query (e.g. `PostFeedSkeleton` lives in `post-feed.tsx`)
- Name them `<FeatureName>Skeleton` or `<ComponentName>Skeleton`
- Build repeating items with `[1, 2, 3].map(i => ...)` — avoids hardcoded duplication
- Always use `<Skeleton>` from `src/components/ui/skeleton` — never `animate-pulse` on raw divs

### Single-query components → early returns
Use early returns when a component is dedicated to one query:

```tsx
if (query.isLoading) return <FeatureSkeleton />;
if (query.isError) return <QueryError message={query.error.message} onRetry={() => query.refetch()} />;
if (!query.data || query.data.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No items.</p>;
return <Content data={query.data} />;
```

### Multi-query pages → JSX conditionals
When a page has multiple queries or a complex layout, use inline conditionals. Guard empty-state checks with `!isLoading && !isError`:

```tsx
{query.isLoading && <FeatureSkeleton />}
{query.isError && <QueryError message={query.error.message} onRetry={() => query.refetch()} />}
{!query.isLoading && !query.isError && query.data?.length === 0 && (
  <p className="py-8 text-center text-sm text-muted-foreground">No items.</p>
)}
{query.data && query.data.length > 0 && <Content data={query.data} />}
```

### Mutations
- Show errors via `toast.error(e.message)` in `onError` — no inline error UI needed
- Always use dictionary strings for toast messages — never hardcode English. Add new error keys to `dictionary.groups.*`, `dictionary.home.createPost.*`, etc. as needed
- Disable submit buttons and show a `<Loader2 className="animate-spin" />` during `mutation.isPending`

### Route-level special files
| File | Purpose |
|---|---|
| `app/[lang]/(app)/loading.tsx` | Suspense fallback for content area during initial render |
| `app/[lang]/(app)/error.tsx` | Error boundary for all protected app pages; localized, has retry + go-home |
| `app/[lang]/error.tsx` | Error boundary for auth pages and other `[lang]` routes |
| `app/[lang]/not-found.tsx` | Localized 404 page; shown when `notFound()` is called or route doesn't exist |
| `app/not-found.tsx` | Root fallback 404; English-only, shown for paths without a `[lang]` prefix |

The `error.tsx` files are React Error Boundaries for **unexpected component crashes** — NOT for tRPC query failures. Always handle query errors inline with `<QueryError>`.

### Dictionary strings for errors
All user-visible error strings must live in the dictionary (`src/dictionaries/en.ts`, `es.ts`, `types.ts`). Shared UI strings:
- `dictionary.common.tryAgain` — retry button label
- `dictionary.common.goHome` — go-home button label
- `dictionary.common.error.title/subtitle` — generic error page copy
- `dictionary.common.notFound.title/subtitle` — 404 page copy

## File Uploads
- `POST /sign` on the API returns a Supabase signed upload URL.
- Client calls `/sign` with a Bearer token, then PUTs the file directly to Supabase.
- Used for avatar uploads (in profile edit) and post image attachments.

## Known Issues
- `/marketplace` sidebar link has no page yet
