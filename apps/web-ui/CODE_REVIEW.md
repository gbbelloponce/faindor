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

### 1. Security Vulnerabilities in Dependencies
**Current versions:** Next.js 15.3.4, React 19.1.0

**Next.js CVEs:**
- CVE-2025-66478: Remote Code Execution via React Server Components (CVSS 10.0)
- CVE-2025-55184: Denial of Service in Server Functions
- CVE-2025-55183: Source Code Exposure (can leak API keys/secrets)

**React CVEs:**
- CVE-2025-55182: RCE in Server Components
- CVE-2025-67779: DoS via infinite loops

**Fix:** Upgrade to at least Next.js 15.2.8+ and React 19.1.5, or to Next.js 16.1.2 + React 19.2.4.

---

## Medium Issues

### 2. No Error Boundary
If a component throws, the whole app crashes. Add React error boundaries at minimum around the `(app)` layout.

### 3. RequireAuthProvider Doesn't Attempt Refresh
**File:** `src/auth/require-auth-provider.tsx`

If the access token is expired, the provider tries `logInWithAccessToken()`, fails, and logs the user out. It doesn't attempt to use the refresh token before giving up. The tRPC provider handles 401 refresh for API calls, but the initial auth check on page load doesn't.

### 4. Password Validation Inconsistency
**File:** `src/app/[lang]/(auth)/login/login-form.tsx`

Login form validates `password: z.string().min(8)` but the API's auth schema validates `min(1)`. These should match (both should be 8+).

### 5. useLocale() Relies on Pathname Parsing
**File:** `src/dictionaries/useLocale.ts`

Extracts locale by splitting `window.location.pathname`. If the route structure changes, this breaks. Consider using Next.js `useParams()` to get the `[lang]` param directly.

### 6. No Loading/Error State Patterns
The home page is a placeholder, but as pages are built out there should be a consistent pattern for loading skeletons and error states on tRPC queries.

---

## Minor Issues

### 7. Hardcoded Dummy Notifications
**File:** `src/app/[lang]/(app)/components/app-header.tsx`

30 dummy notification items in the dropdown. Should be cleaned up or gated before going live.

### 8. Sidebar Nav Items Are Placeholders
Only Home actually links somewhere. Calendar, Users, Photos, Marketplace are non-functional.

### 9. FROM_LOGIN_COOKIE Workaround
**File:** `src/auth/require-auth-provider.tsx`

A cookie is set after login to skip re-validation. Works but is a bit fragile.

### 10. No Favicon
Only the logo image exists in `/public`. Should add a proper `favicon.ico`.

---

## Dependency Update Status

| Package | Current | Latest | Priority |
|---------|---------|--------|----------|
| next | 15.3.4 | 16.1.2 | CRITICAL (security) |
| react / react-dom | 19.1.0 | 19.2.4 | CRITICAL (security) |
| tailwindcss | 4.1.11 | 4.1.18 | Low (patch) |
| @tanstack/react-query | 5.81.5 | 5.90.19 | Low (minor) |
| @trpc/client | 11.4.3 | 11.6.0 | Low (minor) |
| typescript | 5.8.3 | 5.9.x | Low (minor) |

---

## Suggested Priority

1. Patch Next.js + React security vulnerabilities (critical)
2. Add error boundaries (medium)
3. Fix RequireAuthProvider to attempt refresh before logout (medium)
4. Align password validation between frontend and API (medium)
5. Update remaining dependencies to latest minor/patch (low)
6. Replace pathname parsing with useParams() in useLocale (low)
