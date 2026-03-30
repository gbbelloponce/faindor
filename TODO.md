# Faindor — Future Improvements

A prioritized list of things to add to make the app more robust, secure, and feature-complete.

---

## Security

### ~~Rate limiting on auth endpoints~~ ✅ Done
`hono-rate-limiter` added in `apps/api/src/index.ts`:
- Login: 15 attempts / 15 min per IP
- Register: 10 attempts / hour per IP
- Refresh token: 30 attempts / 15 min per IP

---

### ~~Email verification for email/password signups~~ ✅ Done
- `emailVerifiedAt DateTime?` added to `User` model and migrated
- On register: verification email sent via Resend (fire-and-forget, won't fail registration)
- `auth.verifyEmail` (public): validates signed JWT token, sets `emailVerifiedAt`
- `auth.sendVerificationEmail` (authenticated): resends the verification email
- `RequireAuthProvider` redirects unverified users to `/verify-email`
- `/verify-email` page handles: "check your inbox" state, auto-verify via `?token=...`, resend button, expired/invalid token error state
- Set `RESEND_API_KEY` in `apps/api/.env` to enable sending (free tier: 3k emails/month)
- Optionally set `RESEND_FROM_EMAIL` (defaults to `onboarding@resend.dev` sandbox)
- For prod with a custom domain: add domain in Resend dashboard, set `RESEND_FROM_EMAIL=noreply@yourdomain.com`

---

### ~~Fix refresh token race condition~~ ✅ Done
Added a module-level `refreshPromise` lock in `app-trpc-provider.tsx`. Concurrent 401s now share a single in-flight refresh instead of each triggering their own.

---

### ~~Token revocation on logout / user deletion~~ ✅ Done
- `tokenVersion Int @default(0)` added to `User` model (migrated)
- `tokenVersion` included in access token payload
- `createContext` verifies JWT `tokenVersion` matches DB on every authenticated request
- `auth.logOut` procedure increments `tokenVersion` via the refresh token (works even with an expired access token)
- `logOut()` in `useAuth.tsx` fires revocation call best-effort before clearing cookies

---

## Auth Features

### OAuth — Sign in with Google / Microsoft
**Effort:** ~1-2 days per provider
**Why:** Companies use Google Workspace or Microsoft 365. Offering SSO with those is a real selling point for corporate users.

**Library:** [Arctic](https://arcticjs.dev/) — framework-agnostic OAuth client, works cleanly with Hono (unlike Passport.js which is Express-only).

**What to do:**
1. Add dedicated Hono routes (outside tRPC) for the OAuth flow:
   - `GET /auth/google` → redirect to Google consent screen
   - `GET /auth/google/callback` → exchange code, get user info
2. Handle account linking: if the OAuth email already exists in DB, link the provider; if not, create user
3. Apply existing org-assignment logic (email domain → org) to OAuth signups too
4. Issue your existing JWT access + refresh tokens at the end of the callback
5. Store `googleId` / `microsoftId` on the `User` model
6. Implement PKCE + `state` param to prevent CSRF on the callback

**Note:** Microsoft OAuth is the more valuable one for corporate (Azure AD). Start with Google for simplicity.

---

## Core Features

### ~~Notifications page~~ ✅ Done
- `/notifications` page with full paginated list, unread highlighting, "Mark all as read" button
- "View all notifications" link added to the bell dropdown in the header
- Notifications sidebar link with unread count badge (15s polling)

---

### ~~Saved posts page~~ ✅ Done
- `/saved` standalone page reusing `PostCard`
- Saved sidebar link added
- Profile page still has the saved tab for in-context access

---

### Avatar image optimization
**Effort:** ~1 hour (when on Supabase Pro)
**Why:** Currently whatever the user uploads is stored and served as-is. Supabase Storage has a built-in CDN image transformation API (`transform: { width, height, format: "webp", quality }` on `getPublicUrl`) that resizes and converts on the edge — no extra infrastructure needed.
**Blocked by:** Supabase Pro plan (image transforms are not available on the free tier).
**What to do:** In `uploadAvatar()`, use the transform option on `getPublicUrl` to save a `200x200` webp URL to the DB instead of the raw upload URL.

---



### Marketplace
**Effort:** ~2-3 days
**Why:** Org members often want to buy/sell/trade items with colleagues (gear, books, furniture, etc.) or offer services. A lightweight internal marketplace keeps this within the platform.
**What to do:**
- Add `Listing` model: title, description, price (optional — can be free or negotiable), category, imageUrl, status (ACTIVE, SOLD, CLOSED), authorId, organizationId
- Categories: Items for Sale, Free, Services, Housing, Jobs
- API: `listings.createListing`, `listings.getListings` (org-scoped, filterable by category), `listings.getListingById`, `listings.closeListing`
- Web-UI: `/marketplace` page with category filters and listing cards; listing detail page; create listing form (reuse image upload from posts)
- Contact: clicking "Contact seller" opens a mailto or links to their profile (no in-app messaging needed yet)

---

### ~~Organizational Events~~ ✅ Done
- `Event` + `EventRsvp` models added and migrated
- API: `events.createEvent` (admin-only), `events.getEvents`, `events.getEventById`, `events.rsvp`, `events.getMyRsvp`
- Web-UI: `/events` page with RSVP (Going/Not Going); event creation in admin Events tab
- Sidebar Events link wired up (was pointing to `/calendar` before)

---

### Kudos system
**Effort:** TBD
**Why:** Core differentiating feature — peer recognition with AI-generated images.
**How (planned):** Generate image via AI (DALL-E / Stable Diffusion), mint as NFT on a cheap L2 (Base, Polygon).

---

## Admin

### ~~Admin UI for organization management~~ ✅ Done
- `adminProcedure` enforces `APP_ADMIN` role on all admin API routes
- `/admin` page with 4 tabs: Users (suspend/activate/delete/promote/revoke), Org Settings (name + description), Events (create events), Content (delete posts)
- Suspended users have `tokenVersion` incremented → existing tokens immediately invalid
- Admin link in sidebar visible only to `APP_ADMIN` users; non-admins redirected away from `/admin`

---

## Developer Experience

### Error monitoring
- Add [Sentry](https://sentry.io) to both apps for runtime error tracking

### ~~Loading / error state patterns~~ ✅ Done
- `<QueryError>` (`src/components/query-error.tsx`) — localized icon + message + retry button for inline query errors
- Co-located skeleton components per feature, built with shadcn `<Skeleton>`
- Pattern: single-query → early returns (loading → error → empty → data); multi-query → JSX conditionals in same order
- Route-level files: `(app)/loading.tsx` (content skeleton), `(app)/error.tsx` (localized, retry + go-home), `[lang]/error.tsx` (covers auth routes), `[lang]/not-found.tsx` (localized 404), `app/not-found.tsx` (root English fallback)
- Mutations: `toast.error()` in `onError` with dictionary strings (no hardcoded English), `<Loader2>` spinner during `isPending`
- Applied to all existing pages; documented in `apps/web-ui/CLAUDE.md` and root `CLAUDE.md`

---

## What's Next (recommended order)

### 1. Marketplace page
**Effort:** ~2-3 days
The sidebar link already exists. This is the most visible gap — users clicking "Marketplace" get nothing. See the full spec in the Marketplace section above.

### 2. Pagination / infinite scroll
**Effort:** ~1 day
Every page currently loads `page: 1` only (20 items). Adding a "Load more" button or infinite scroll to the home feed, notifications, and saved posts would noticeably improve the experience without touching the API (pagination args already exist).

### 3. Post editing
**Effort:** ~half a day
`posts.updatePost` procedure exists in the API. The UI has no "Edit" option on posts. Add an edit flow on `PostCard` (e.g. a popover menu with Edit/Delete for the author).

### 4. Post deletion for authors
**Effort:** ~2 hours
`posts.softDeletePost` exists in the API. Currently only admins can delete posts (via admin panel). Add a delete option to the author's `PostCard` menu.

### 5. OAuth (Google / Microsoft)
**Effort:** ~1-2 days per provider
See the full spec in the Auth Features section above. Most valuable for a corporate-focused app.

### 6. Error monitoring (Sentry)
**Effort:** ~2 hours
Add Sentry to both apps for runtime error visibility in production.
