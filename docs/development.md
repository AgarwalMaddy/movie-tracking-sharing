# Development guide

The app scaffold does not exist yet. This page describes the planned setup from the V1 spec and implementation plan. Update it when Task 1 (project initialization) lands.

## Prerequisites

- Node.js 20+
- Docker (local PostgreSQL) or a hosted Postgres URL
- TMDB API key — [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Google OAuth credentials

## Local setup (planned)

```bash
cp .env.example .env.local
# Set DATABASE_URL, NEXTAUTH_*, GOOGLE_*, TMDB_API_KEY

npm install
npx prisma migrate dev
npm run dev
```

Dev server: `http://localhost:3000`

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | Yes | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth client secret |
| `TMDB_API_KEY` | Yes | Server-side only |

## Scripts (planned)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |

## Layout (planned)

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
