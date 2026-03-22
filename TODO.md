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

### Email verification for email/password signups
**Effort:** ~1 day
**Why:** Currently users can register with any email — fake or mistyped — which breaks the org-assignment logic (a typo in a corporate email puts someone in the wrong org).

**What to do:**
1. Add `emailVerifiedAt: DateTime?` to the `User` model
2. On register: generate a signed, time-limited verification token (can reuse the JWT utils), store it, send an email with a verification link
3. Add a `auth.verifyEmail` tRPC procedure that validates the token and sets `emailVerifiedAt`
4. Gate access to the app (in proxy or `RequireAuthProvider`) until email is verified
5. For email sending: use [Resend](https://resend.com) — simple API, generous free tier, good DX

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

### Organizational Events
**Effort:** ~2 days
**Why:** Teams need a place to announce and coordinate org-wide or group-specific events (town halls, workshops, socials, hackathons).
**What to do:**
- Add `Event` model: title, description, startsAt, endsAt, location (optional string), onlineUrl (optional), organizationId, authorId, groupId (optional — scoped to a group)
- Add `EventRsvp` model: eventId, userId, status (GOING, NOT_GOING)
- API: `events.createEvent`, `events.getEvents` (org-scoped, upcoming first), `events.getEventById`, `events.rsvp`
- Web-UI: `/events` page with upcoming events list; event detail page with RSVP button and attendee count; create event form (admins or all users, TBD)
- Sidebar: add Events nav item

---

### Kudos system
**Effort:** TBD
**Why:** Core differentiating feature — peer recognition with AI-generated images.
**How (planned):** Generate image via AI (DALL-E / Stable Diffusion), mint as NFT on a cheap L2 (Base, Polygon).

---

## Admin

### Admin UI for organization management
**Effort:** ~2-3 days
**Why:** The first user becomes admin but there's no UI to exercise those powers.
**What to do:** Build an `/admin` section with:
- User list with role management
- Content moderation (delete posts/comments)
- Org settings (name, allowed domains)

---

## Developer Experience

### Error monitoring
- Add [Sentry](https://sentry.io) to both apps for runtime error tracking

### Loading / error state patterns
- Establish consistent skeleton loaders and error fallbacks for tRPC queries across all pages
