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

| Variable                                    | Required               | Notes                                                                                                                     |
| ------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                              | Yes                    | Neon URL with `sslmode=require`                                                                                           |
| `TMDB_API_KEY`                              | Yes                    | Server only. v3 key or v4 read token (`eyJ…`). User-Agent is set in `apps/api/src/integrations/tmdb.ts`                   |
| `TMDB_DNS_SERVERS`                          | No                     | Comma-separated resolvers for `api.themoviedb.org`. Default `1.1.1.1,8.8.8.8,1.0.0.1`. Some ISP DNS returns a blocked IP. |
| `SESSION_SECRET`                            | Required in production | Dev falls back to a local default                                                                                         |
| `WEB_ORIGIN`                                | No                     | Default `http://localhost:5173` (CORS). Google callback is `{WEB_ORIGIN}/api/auth/google/callback`                        |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No                     | Both set → Continue with Google. Add that callback URI in Google Cloud                                                    |

Development signup marks the email verified and returns `accessToken`. The SPA stores that token and also sends the `mts_session` cookie when the proxy allows it.

## Windows ARM64 + Prisma

Prisma has no native Windows ARM Node-API engine yet ([prisma#15306](https://github.com/prisma/prisma/issues/15306)). This repo sets `engineType = "binary"` in `prisma/schema.prisma`. Vercel Linux builds are unaffected.

## Scripts

| Command                           | Purpose             |
| --------------------------------- | ------------------- |
| `npm run dev`                     | API + web together  |
| `npm run dev:api` / `dev:web`     | One app             |
| `npx prisma db push`              | Sync schema to Neon |
| `npx prisma generate`             | Client              |
| `npm run lint` / `lint:fix`       | ESLint (both apps)  |
| `npm run format` / `format:check` | Prettier            |
| `npm run typecheck`               | `tsc --noEmit`      |

Editor: Prettier on save, ESLint fix on save (`.vscode/settings.json`). Install the recommended Prettier and ESLint extensions.

CI (pull requests): a Prettier job writes formatting and commits `style: apply Prettier` on same-repo PRs. Web and API jobs then typecheck, lint, and `format:check`. The API job also runs `prisma generate` and `npm audit --omit=dev --audit-level=high`. Same checks run on push to `main`, without the auto-commit. Dependabot opens weekly PRs from `.github/dependabot.yml`.

Production (Render): `render.yaml`. One free web service, `0.0.0.0:$PORT`, health at `/health`. After `npm run build --workspace=@mts/web`, the API serves the SPA from `apps/web/dist`. The old Vercel Git link is ignored (`vercel.json`).

## Layout

```
apps/api/src/     Express: app.ts, server.ts, config/, modules/<resource>/
apps/api/AGENTS.md
apps/web/src/     React: app/, pages/, features/, lib/
apps/web/AGENTS.md
prisma/           Shared schema
```

API writing rules: `apps/api/docs/architecture.md` and `conventions.md`. Web: `apps/web/docs/structure.md` and `conventions.md`.

## Checks worth running by hand

1. Sign up with a throwaway email → land on Discover
2. Search a title → mark Watched → write a review
3. Create a list → add a title
4. Open `/u/{username}` and `/activity`
