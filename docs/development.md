# Development guide

Local setup for the V1 Next.js app on branch `feat/v1-implementation`.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (Docker, local install, or Neon/Supabase URL)
- TMDB API key — [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Google OAuth credentials (optional for dev)
- Resend API key (optional; verification URL logs to console without it)

## Local setup

```bash
cp .env.local.example .env.local
# Set DATABASE_URL, NEXTAUTH_SECRET, AUTH_SECRET, NEXTAUTH_URL, TMDB_API_KEY

npm install
npx prisma migrate dev
npm run dev
```

Dev server: `http://localhost:3000`

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | 32+ chars; also set `AUTH_SECRET` to the same value |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | No | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | OAuth client secret |
| `TMDB_API_KEY` | Yes | Server-side only |
| `RESEND_API_KEY` | No | Email verification; logs link if unset |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (run `npx playwright install` first) |

## Layout

```
src/features/
  auth/
  library/
  friends/
  suggestions/
  feed/
```

Mutations use Server Actions. TMDB calls go through Route Handlers.

## Critical test paths

From spec §11:

1. Sign up → add title → appears in library
2. Friend request → accept → view friend library
3. Send suggestion → accept → title in Want to Watch

## References

- [V1 technical spec](specs/v1-technical-specification.md)
- [Implementation plan](superpowers/plans/2026-08-23-v1-implementation.md)
- [AGENTS.md](../AGENTS.md)
