# Development guide

npm workspaces: `apps/web` (Vite, port 5173) and `apps/api` (Express, port 4000). Vite proxies `/api` to the API so cookies and `fetch('/api/...')` share localhost.

## Start

```bash
cp .env.local.example .env.local
# Set DATABASE_URL (Neon pooled URL is fine) and TMDB_API_KEY

npm install
npx prisma generate
npx prisma db push
npm run dev
```

- Web: http://localhost:5173
- API health: http://localhost:4000/health

Prisma CLI loads `.env` in the repo root. Keep `DATABASE_URL` there or in `.env.local` (the API loads both).

## Env

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon URL with `sslmode=require` |
| `TMDB_API_KEY` | Yes | Server only. Node `fetch` to TMDB needs a real User-Agent (already set in `tmdb.ts`) |
| `SESSION_SECRET` | No in dev | Falls back to `NEXTAUTH_SECRET` or a local default |
| `WEB_ORIGIN` | No | Default `http://localhost:5173` (CORS) |
| `GOOGLE_CLIENT_*` | Unused | Google login is not implemented yet |

Development signup marks the email verified and returns `accessToken`. The SPA stores that token and also sends the `mts_session` cookie when the proxy allows it.

## Windows ARM64 + Prisma

Prisma has no native Windows ARM Node-API engine yet ([prisma#15306](https://github.com/prisma/prisma/issues/15306)). This repo sets `engineType = "binary"` in `prisma/schema.prisma`. Vercel Linux builds are unaffected.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | API + web together |
| `npm run dev:api` / `dev:web` | One app |
| `npx prisma db push` | Sync schema to Neon |
| `npx prisma generate` | Client |

## Layout

```
apps/api/src/   Express: env, db, http, tmdb, titles, domain, routes, index
apps/web/src/   React: api.ts, auth.tsx, pages.tsx, App.tsx
prisma/         Shared schema
src/            Old Next.js tree. Ignore
```

## Checks worth running by hand

1. Sign up with a throwaway email → land on Discover
2. Search a title → mark Watched → write a review
3. Create a list → add a title
4. Open `/u/{username}` and `/activity`
