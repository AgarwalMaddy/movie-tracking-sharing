# HLD 0001 — Auth and identity

**Status:** Implemented (Express + React as shipped)
**Date:** 2026-09-20
**ADR:** [0001-auth-and-identity.md](../adr/0001-auth-and-identity.md) (Accepted, option B, Express + React)

## What we pick and why

Replace the Next.js app with:

- **Web:** React (Vite + TypeScript)
- **API:** Express (TypeScript) + Prisma + Neon
- **Later mobile:** React Native against the same API (not built now)

Auth.js does not run on Express. The API owns signup, login, Google OAuth, verify-email, and username.

## Boundaries

**In this slice**

- Sign up (email + password), email verification, login, logout
- Google OAuth (verified email)
- Unique username (sign up, or one step after Google)
- Session for the web app; API also returns a bearer token for future native clients
- Screens: landing, login, signup, verify-email, username onboarding, signed-in stub home

**Out of this slice**

- React Native app, TMDB, lists, reviews, friends, activity, stats, collections
- Public `/user/{username}` page
- Ads, Pro, Figma

## System

```
React web (Vite)  →  HTTPS JSON  →  Express
                                      → Prisma → Neon
React Native (later)  →  same API
```

Repo shape on implement (after LLD): `apps/web`, `apps/api`, optional `packages/shared` for Zod schemas. One git repo.

No TMDB calls in this slice.

## Data

Identity tables only:

| Model | Role |
|-------|------|
| `User` | `id`, `email` (unique), `emailVerified`, `username` (unique, nullable until Google onboarding), `name`, `image`, `passwordHash` |
| `Account` | Google (and later providers): provider, provider account id, tokens |
| `Session` or token store | Server-side session and/or refresh tokens. LLD picks cookie name and JWT vs opaque tokens |
| `VerificationToken` | Email verify links |

Username: URL-safe, case-insensitive unique, reserved list (`login`, `signup`, `settings`, …). Exact charset in LLD.

Retired V1 tables dropped on migrate.

## Main flows

1. **Email sign up** → create unverified user → send verify email → no session until verified.
2. **Email login** → reject unverified → set httpOnly cookie (web) and return access token in JSON for native later.
3. **Google** → OAuth on the API (`/auth/google`) → verified user → username step if missing.
4. **Logout** → revoke session/token → login.

Errors: `{ error, code }`. No stack traces.

## Hosting

- Web: static SPA (Vercel or any static host).
- API: long-running Node (Render, Fly, Railway, or similar). Not a Next.js serverless function.

CORS: allow the web origin. Credentials: cookies on that origin.

## Risks

- Two deploys and CORS. Google redirect URI is the **API** origin, not the SPA origin.
- Cookie `SameSite` / HTTPS in production.
- Replacing `src/` is a large diff; only after LLD.

## Follow-up (LLD)

`docs/lld/0001-auth-and-identity.md`. No app code until this HLD is agreed and that LLD is accepted.
