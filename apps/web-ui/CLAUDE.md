# Web-UI - Context for Claude Code

## Routing Structure
Next.js App Router with dynamic `[lang]` locale prefix:
- `src/app/[lang]/` — root layout (fonts, ThemeProvider, AppTRPCProvider, Toaster)
- `src/app/[lang]/(auth)/` — public auth pages (login, register). Layout has locale switcher + theme toggler.
- `src/app/[lang]/(app)/` — protected app pages. Layout wraps with `RequireAuthProvider`, `SidebarProvider`, `AppHeader`, `AppSidebar`.

## Key Patterns

### Authentication
- Tokens stored in cookies via `js-cookie`. Config in `src/auth/constants.ts`.
- `useAuth()` hook (Zustand store) in `src/auth/useAuth.tsx` provides: `logInWithCredentials`, `logInWithAccessToken`, `refreshAccessToken`, `register`, `logOut`, `currentUser`.
- `RequireAuthProvider` (`src/auth/require-auth-provider.tsx`) validates auth on page load for protected routes.
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
- `useLocale()` hook in `src/dictionaries/useLocale.ts` — returns dictionary, locale, and `changeLocale()`.
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

## Known Issues
See `CODE_REVIEW.md` for the full list. Key ones:
- `RequireAuthProvider` doesn't attempt token refresh before logging out
- Password validation is min(8) on frontend but min(1) on API — should be aligned
- `useLocale()` parses pathname directly instead of using `useParams()`
