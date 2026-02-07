# Web-UI Code Review

## What's Good

### Architecture & Organization
- Clean route organization with `[lang]/(auth)` and `[lang]/(app)` route groups. Auth pages are public, app pages are protected via `RequireAuthProvider`.
- End-to-end type safety — tRPC client imports `AppRouter` from the API package. Types flow from Prisma schema to the frontend with no gaps.
- Good separation of concerns: auth logic in `src/auth/`, tRPC setup in `src/trpc/`, dictionaries in `src/dictionaries/`, shared UI in `src/components/`.

### Authentication
- JWT access/refresh tokens stored in cookies with proper config (sameSite strict, secure in production).
- Automatic 401 interception and token refresh in the tRPC provider (`src/trpc/app-trpc-provider.tsx`).
- Middleware-based route protection: unauthenticated users redirected to login, authenticated users redirected away from auth pages.

### Internationalization
- Dictionary-based translations (en/es) with type-safe dictionary structure.
- Locale detection via middleware (Accept-Language header + cookie).
- `useLocale()` hook for client components, locale persisted in cookie.

### State Management
- Zustand for auth state (client-only, synchronous).
- TanStack Query via tRPC for server state. No redundant duplication.

### UI & Accessibility
- shadcn/ui + Radix UI primitives — accessible, composable, themed.
- `sr-only` labels on icon buttons, semantic HTML (`<header>`, `<nav>`, `<form>`), `role="search"`, `aria-invalid` support.
- Dark mode with CSS variables (oklch color space), theme toggler.
- react-hook-form + zod for forms with localized error messages.

---

## Critical Issues

### ~~1. Security Vulnerabilities in Dependencies~~ ✅ Resolved
Dependencies updated to Next.js 16.1.x and React 19.2.x.

---

## Medium Issues

### ~~2. No Error Boundary~~ ✅ Resolved
Added `error.tsx` error boundary for the `(app)` route group.

### ~~3. RequireAuthProvider Doesn't Attempt Refresh~~ ✅ Resolved
`RequireAuthProvider` now tries access token → refresh token → logout.

### ~~4. Password Validation Inconsistency~~ ✅ Resolved
Both frontend and API use `min(8)` for password validation.

### ~~5. useLocale() Relies on Pathname Parsing~~ ✅ Resolved
Replaced `pathname.split("/")[1]` with `useParams()` to get the `[lang]` param directly.

### 6. No Loading/Error State Patterns
The home page is a placeholder, but as pages are built out there should be a consistent pattern for loading skeletons and error states on tRPC queries.

---

## Minor Issues

### 7. Hardcoded Dummy Notifications
**File:** `src/app/[lang]/(app)/components/app-header.tsx`

30 dummy notification items in the dropdown. Should be cleaned up or gated before going live.

### 8. Sidebar Nav Items Are Placeholders
Only Home actually links somewhere. Calendar, Users, Photos, Marketplace are non-functional.

### ~~9. FROM_LOGIN_COOKIE Workaround~~ ✅ Resolved
Removed. No longer needed since `RequireAuthProvider` properly attempts token refresh.

### ~~10. No Favicon~~ ✅ Resolved
Added `icon.png` in the `app/` directory (auto-detected by Next.js).

---

## Dependency Update Status

| Package | Current | Latest | Priority |
|---------|---------|--------|----------|
| ~~next~~ | ~~15.3.4~~ | 16.1.x | ✅ Updated |
| ~~react / react-dom~~ | ~~19.1.0~~ | 19.2.x | ✅ Updated |
| tailwindcss | 4.1.11 | 4.1.18 | Low (patch) |
| @tanstack/react-query | 5.81.5 | 5.90.19 | Low (minor) |
| @trpc/client | 11.4.3 | 11.6.0 | Low (minor) |
| typescript | 5.8.3 | 5.9.x | Low (minor) |

---

## Suggested Priority

1. ~~Patch Next.js + React security vulnerabilities (critical)~~ ✅
2. ~~Add error boundaries (medium)~~ ✅
3. ~~Fix RequireAuthProvider to attempt refresh before logout (medium)~~ ✅
4. ~~Align password validation between frontend and API (medium)~~ ✅
5. Update remaining dependencies to latest minor/patch (low)
6. ~~Replace pathname parsing with useParams() in useLocale (low)~~ ✅
