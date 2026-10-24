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

`npm run lint`, `npm run format`, and `npm run typecheck` cover both apps. PRs get a Prettier auto-format commit, then lint and typecheck.

## Layout

| Path | What |
|------|------|
| `apps/web` | React SPA (Vite, React Router). Folders: `app/`, `pages/`, `features/`, `lib/` |
| `apps/api` | Express JSON API, Prisma, TMDB. Layers: routes → controller → service → repository |
| `prisma/schema.prisma` | Neon Postgres schema |

Screens: discover, search, title, library, lists, reviews, friends, inbox, activity, profile, stats, collections.

Discover keeps last-good TMDB rails in Postgres so a 429 does not empty the page. Phone chrome is a bottom bar (Discover, Search, Library, You). Title and Discover heroes use TMDB cast stills.

Production: `render.yaml` is one Node service. It builds the SPA and the API serves `/health`, `/api`, then `apps/web/dist`.

## Docs

Work is still **scope → ADR → HLD → LLD** for new slices. Index: [docs/README.md](docs/README.md). Setup: [docs/development.md](docs/development.md).
