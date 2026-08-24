# Development guide

Local setup for the V1 Next.js app on branch `feat/v1-implementation`.

## Database: Neon (recommended)

We use **Neon** as hosted Postgres, not local Docker.

| Factor | Neon | Supabase |
|--------|------|----------|
| Fit for this stack | Postgres only — we already use NextAuth + Vercel | Full BaaS (Auth/Storage we do not need) |
| Free tier | Scale-to-zero compute; ~0.5 GB storage | Pauses after ~1 week idle |
| Latency | ~0.5s cold start after idle; warm is fine | Free pause/resume; Pro is always-on |
| Cost at low traffic | Idle compute ≈ $0; usage-based paid | Free or $25/mo Pro flat |
| Vercel | Native branching / preview DBs | Works, less tight coupling |

**Verdict:** Neon for V1. Keep NextAuth and TMDB as specified.

### Create a Neon database

1. Sign up at [console.neon.tech](https://console.neon.tech)
2. Create project → copy the connection string (pooled URL is fine for the app)
3. Put it in `.env.local` as `DATABASE_URL`

```bash
cp .env.local.example .env.local
# Set DATABASE_URL from Neon, plus NEXTAUTH_*, TMDB_API_KEY

npm install
npx prisma migrate dev
npm run dev
```

Dev server: `http://localhost:3000`

## Prerequisites

- Node.js 20+ (see Windows ARM note below)
- Neon Postgres URL (or any Postgres URL)
- TMDB API key — [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Google OAuth credentials (optional for dev) — see [Google OAuth](#google-oauth) below
- Resend API key (optional; verification URL logs to console without it)

## Windows ARM64 + Prisma

Prisma does **not** ship a native Windows ARM Node-API engine yet ([prisma#15306](https://github.com/prisma/prisma/issues/15306)). Native ARM Node (`process.arch === "arm64"`) fails to load `query_engine-windows.dll.node` with “not a valid Win32 application.”

**Fix in this repo:** `engineType = "binary"` in `prisma/schema.prisma` so the engine runs as a sidecar (Windows can translate x64). Vercel Linux builds are unaffected.

**Alternative:** Install **x64** Node for Windows (e.g. via [nvm-windows](https://github.com/coreybutler/nvm-windows) `nvm install 20.19.0` choosing the x64 build) and use that shell for local Prisma. Do not mix ARM and x64 Node in the same `node_modules`.

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon (or other) Postgres URL with `sslmode=require` |
| `NEXTAUTH_SECRET` | Yes | 32+ chars; also set `AUTH_SECRET` to the same value |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | No | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | OAuth client secret |
| `TMDB_API_KEY` | Yes | Server-side only |
| `RESEND_API_KEY` | No | Email verification; logs link if unset |

## Google OAuth

NextAuth uses the standard Google callback path: `/api/auth/callback/google`.

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your OAuth client → **Authorized redirect URIs**, add both:

```
http://localhost:3000/api/auth/callback/google
https://movie-tracking-sharing.vercel.app/api/auth/callback/google
```

Copy `client_id` and `client_secret` into `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Keep `NEXTAUTH_URL` as `http://localhost:3000` for local dev.

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
