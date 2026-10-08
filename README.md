# Movie Tracking & Sharing

Social TMDB watch tracker: log what you watch, make lists, review, and share with friends. Reference: [AddToTheList](https://www.addtothelist.com/user/agarwalmadhur19/lists).

## Run it

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

- App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000](http://localhost:4000) (`GET /health`)

Needs `DATABASE_URL` and `TMDB_API_KEY` in `.env` or `.env.local`. In development, signup verifies the email immediately so you can use a throwaway account.

## Layout

| Path | What |
|------|------|
| `apps/web` | React SPA (Vite, React Router) |
| `apps/api` | Express JSON API, Prisma, TMDB |
| `prisma/schema.prisma` | Neon Postgres schema |
| `src/` | Old Next.js app. Do not extend |

Screens: discover, search, title, library, lists, reviews, friends, inbox, activity, profile, stats, collections.

## Docs

Work is still **scope → ADR → HLD → LLD** for new slices. Index: [docs/README.md](docs/README.md). Setup: [docs/development.md](docs/development.md).
