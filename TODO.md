# Faindor — Future Improvements

A prioritized list of things to add to make the app more robust, secure, and feature-complete.

---

## Security

### Rate limiting on auth endpoints
**Effort:** ~2 hours
**Why:** `/auth.logInWithCredentials`, `/auth.register`, `/auth.refreshToken` are publicly callable with no throttling — vulnerable to brute force and credential stuffing.

**What to do:**
- Add Hono middleware (e.g. [`hono-rate-limiter`](https://github.com/rhinobase/hono-rate-limiter)) to the auth routes
- Stricter limits on login (e.g. 5 attempts / 15 min per IP) than on register

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

### Fix refresh token race condition
**Effort:** ~2 hours
**Why:** If two concurrent requests fail with 401, both trigger a token refresh simultaneously. They produce two different token pairs; whichever finishes second wins, potentially invalidating the first.

**What to do:**
- In `app-trpc-provider.tsx`, add a refresh lock (a `Promise` ref) — if a refresh is in flight, queue subsequent 401s to wait on it rather than each triggering their own refresh

---

### Token revocation on logout / user deletion
**Effort:** ~3 hours
**Why:** Currently, logging out just deletes the cookies client-side. The JWT is still cryptographically valid until expiry. A stolen token remains usable for up to 15 min (access) or 30 days (refresh).

**What to do:**
- Add a `tokenVersion: Int @default(0)` field to `User`
- Include `tokenVersion` in the access token payload
- On logout or user deactivation, increment `tokenVersion` in the DB
- In `authenticatedProcedure`, verify that `tokenVersion` in the JWT matches the DB value

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

### Post image/file attachments
**Effort:** ~1 day
**Why:** Text-only posts limit engagement.
**How:** Use Supabase Storage — S3-compatible, generous free tier, direct upload from browser.

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
