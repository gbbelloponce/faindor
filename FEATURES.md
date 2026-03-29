# Faindor — Feature Showcase

A summary of the notable features built into Faindor, organized by area.

---

## Authentication & Security

### Custom JWT Authentication
Full access + refresh token flow built from scratch — no Auth.js or Clerk. Access tokens expire in 15 minutes; refresh tokens in 30 days. The tRPC provider intercepts 401 responses and auto-refreshes transparently, with a module-level lock to prevent refresh race conditions when multiple requests fail simultaneously.

### Token Revocation
Each user has a `tokenVersion` counter embedded in their access token. On every authenticated request, the API validates the token's version against the DB. Incrementing the counter (on logout or suspension) immediately invalidates all existing sessions — no token blacklist needed.

### Email Verification
On registration, a signed JWT verification link is emailed via Resend (fire-and-forget — won't block signup). The `/verify-email` page handles the full flow: "check your inbox" state, auto-verification via `?token=` query param, resend button with cooldown, and expired/invalid token error states. Unverified users are gated from the app.

### Rate Limiting
Auth endpoints are rate-limited per IP via `hono-rate-limiter`:
- Login: 15 attempts / 15 min
- Register: 10 attempts / hour
- Token refresh: 30 attempts / 15 min
- Resend verification: 5 attempts / hour

---

## Organization System

### Automatic Email-Domain Assignment
Users are automatically assigned to organizations based on their email domain on registration. `@company.com` → Company's private org. `@gmail.com`, `@yahoo.com`, etc. → General public org. No manual org selection needed.

### Admin Panel
The first registered user in an organization becomes its admin. The admin panel has four tabs:
- **Users** — suspend/activate/delete accounts, promote/revoke admin role
- **Org Settings** — update organization name and description
- **Events** — create organization events
- **Content** — delete any post in the org

Suspending a user increments their `tokenVersion`, immediately invalidating their active sessions.

---

## Social Features

### Post Feed
Org-scoped post feed with image attachment support. Images are uploaded directly to Supabase Storage via pre-signed URLs — the API never proxies the file bytes. Posts support likes and nested comments.

### Notifications
Notification system for likes, comments, and replies — with unread count badge on the bell icon in the header. `markAllAsRead` clears the badge in one call.

### Groups
Users can create and join organization-specific groups. Posts can be scoped to a group. Group detail page shows members and the group's post feed.

### Saved Posts
Users can save posts for later with `savePostById` / `unsavePostById`. `getSavedPosts` returns the user's saved feed.

---

## Real-Time Messaging

Direct messages between org members, delivered via **Supabase Realtime** (`postgres_changes` subscription) with a **3-second polling fallback** for environments where WebSockets are blocked. Conversations are org-scoped. Unread count shown in the sidebar badge.

---

## Events

Organization events with RSVP. Each event has title, description, start/end times, optional physical location, and an optional online URL. Users RSVP with Going / Not Going. Event creation is admin-only.

---

## Developer Experience

### End-to-End Type Safety
tRPC connects the Hono API to the Next.js frontend with a single shared `AppRouter` type. No manual API client code, no type duplication, no runtime schema mismatches.

### Monorepo with Bun
Bun workspaces manage the `apps/api` and `apps/web-ui` packages. The API exports its tRPC types via `package.json` exports, consumed by the frontend as a workspace dependency.

### Internationalization
Full i18n with English and Spanish. Locale is detected from the `Accept-Language` header on first visit, stored in a cookie, and prefixed in every URL (`/en/...`, `/es/...`). All user-visible strings — including toast errors — live in typed dictionary files.

### Consistent Loading & Error States
Every tRPC query follows the same pattern: co-located skeleton component → shared `<QueryError>` component with retry → empty state → data. Mutations use `toast.error()` with dictionary strings and a `<Loader2>` spinner on submit buttons.

### Dark Mode
Full dark/light theme support via `next-themes`, using CSS variables in the oklch color space.
