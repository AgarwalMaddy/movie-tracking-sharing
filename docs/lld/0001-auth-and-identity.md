# LLD 0001 — Auth and identity

**Status:** Implemented (local MVP; Google OAuth still out)
**Date:** 2026-09-20
**HLD:** [0001-auth-and-identity.md](../hld/0001-auth-and-identity.md)
**ADR:** [0001-auth-and-identity.md](../adr/0001-auth-and-identity.md)

Do not treat this LLD as a freeze. The 2026-09-20 build shipped a full product slice (library, lists, reviews, friends) in the same repos so later edits can happen in small files under `apps/`. Google OAuth and `packages/shared` are still later.

## Layout

```
apps/api    Express + Prisma
apps/web    Vite + React
packages/shared   Zod schemas + error codes (optional in Feature 1; inlined if faster)
```

npm workspaces. TypeScript everywhere.

## Data

Same as HLD. `passwordHash` on `User`. `username` unique lowercase, nullable. Unique index. Prisma `P2002` → `USERNAME_TAKEN`.

Username: `^[a-z0-9_]{3,20}$`. Reserved: `login`, `signup`, `logout`, `settings`, `home`, `discover`, `titles`, `reviews`, `lists`, `collections`, `friends`, `users`, `api`, `onboarding`, `verify-email`, `auth`, `admin`, `www`.

Password: min 8, max 72, bcrypt cost 12.

## Env (API)

Required: `DATABASE_URL`, `SESSION_SECRET` (min 32), `API_URL`, `WEB_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional pair; hide Google if missing).

Optional: `RESEND_API_KEY` (same rule as before: log verify URL in development; `EMAIL_SEND_FAILED` in production if send required and missing).

Web env: `VITE_API_URL`.

## HTTP API

JSON. `{ error, code }` on failure.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/signup` | public | Create unverified user; send email; no session |
| POST | `/auth/login` | public | Email/password; cookie + `{ accessToken }` |
| POST | `/auth/logout` | session or bearer | Revoke |
| GET | `/auth/google` | public | Redirect to Google |
| GET | `/auth/google/callback` | public | Set cookie; redirect to `WEB_ORIGIN/onboarding/username` or `/home` |
| GET | `/auth/verify-email?token=` | public | Mark verified; redirect to web `/login` |
| POST | `/auth/resend-verification` | public | Always `{ ok: true }` |
| POST | `/auth/username` | required | Set username once |
| GET | `/auth/me` | required | `{ id, email, username, name, image }` |

Web routes (React Router): `/`, `/login`, `/signup`, `/verify-email` (landing copy if the API already redirected), `/onboarding/username`, `/home`.

Route guards on the client using `/auth/me`. Do not treat the SPA router as security; the API enforces auth.

## Auth details

- Web: httpOnly, `Secure` in production, `SameSite=Lax`, cookie on the API host. SPA uses `fetch(..., { credentials: "include" })`.
- Native later: `Authorization: Bearer <accessToken>` from login JSON. Refresh-token rotation can wait for a later ADR if Feature 1 only needs a long-lived access token for web cookies; **do not** block Feature 1 on a full OAuth2 server. Document that RN will use the same login body.
- Google OAuth 2.0 on Express (`passport-google-oauth20` or Better Auth Express). Callback URL: `{API_URL}/auth/google/callback`.

Library choice in implementation: **Better Auth** if it supports Express + cookies + Google with little glue; otherwise **Passport** + `express-session` (or iron-session) + bcrypt. Pick one in implementation and note it in a one-line changelog; do not mix both.

## UI (web)

Landing, login, signup, verify notice, username onboarding, home stub + logout. Tailwind + existing primitive style is fine; no ATTL chrome.

## Error codes

`VALIDATION`, `EMAIL_TAKEN`, `USERNAME_TAKEN`, `USERNAME_RESERVED`, `UNVERIFIED`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `EXPIRED_TOKEN`, `EMAIL_SEND_FAILED`, `AUTH_REQUIRED`.

## Test plan

**Vitest (API):** username schema; signup creates unverified user; login unverified fails; `P2002` username.

**Playwright (web against local API):** landing CTAs; signup/login required fields; `/home` without cookie → login.

No live Google in CI.

**Deploy:** `WEB_ORIGIN` and Google console URIs; API health `GET /health`.

## Out of scope

React Native project, TMDB, lists, friends, Next.js, Auth.js.
