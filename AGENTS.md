# AGENTS.md — Movie Tracking & Sharing

> Read this file at the start of every session.

---

## Session start (in order)

1. Read this file.
2. Read `docs/PROCESS.md`.
3. Read `docs/scope.md`.
4. For a feature: ADR → HLD → LLD. The first cut of the app is already in `apps/`. Further changes should still go through that path unless the user asks to ship first.
5. Do not use `docs/archive/` or the old V1 spec as requirements.

---

## Product

Social TMDB-backed watch tracker. Public profiles, lists, reviews, activity, collections, and stats. Reference to beat: [AddToTheList](https://www.addtothelist.com/user/agarwalmadhur19/lists).

Living scope: `docs/scope.md`.

---

## Status

| Item     | State                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Process  | Scope → ADR → HLD → LLD → implement → test / monitor / deploy                                                                       |
| Scope    | Draft — `docs/scope.md`                                                                                                             |
| App      | Vite SPA + Express API. Catalog rails persist in Postgres. TMDB uses public DNS; bundled rails if both live TMDB and snapshots miss |
| Auth     | Email/password, Google (when `GOOGLE_CLIENT_*` are set), demo via `POST /auth/demo`. Dev signup auto-verifies                       |
| Infra    | Neon, GitHub. `render.yaml` for one free Node service (API serves `apps/web/dist`). Vercel Git deploys are off                      |
| Security | Helmet, auth rate limit, Dependabot alerts, CI npm audit. CodeQL is not on the free private-repo plan                               |

---

## Run locally

```
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Web: `http://localhost:5173`. API: `http://localhost:4000`. Vite proxies `/api`.

Lint and format (same idea as TravelTogether): `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run typecheck`. Before finishing a change, lint and typecheck should pass. Warnings are allowed; errors are not. Format-on-save is in `.vscode/settings.json`.

---

## Conventions

- Secrets stay on the API (`TMDB_API_KEY`, `DATABASE_URL`, session secret).
- Client errors: `{ error, code }`. No stack traces.
- API layers: `routes → controller → service → repository`. Prisma stays in repositories. `#alias` imports, `.js` suffix. Details: `apps/api/AGENTS.md`.
- Web folders: `app → pages → features → components → lib`. `@/` alias. Details: `apps/web/AGENTS.md`.
- ESLint + Prettier live per app (`apps/web`, `apps/api`). CI formats PRs, then typechecks and lints.
- Commits only when the user asks.

---

## Documentation map

| File                    | Purpose                                |
| ----------------------- | -------------------------------------- |
| `docs/PROCESS.md`       | How we work                            |
| `docs/scope.md`         | Product job, must / later / never      |
| `docs/adr/`             | Per-feature ADRs                       |
| `docs/hld/` `docs/lld/` | Design for the feature in flight       |
| `docs/development.md`   | Local setup                            |
| `apps/api/AGENTS.md`    | API layers, imports, errors            |
| `apps/web/AGENTS.md`    | Web folders and import direction       |
| `docs/archive/`         | Pre-2026-09-19 notes. Not requirements |
| `README.md`             | Human overview                         |

Local repo is source of truth. Notion hub: summaries only.

---

## Skills

| Skill                    | When                            |
| ------------------------ | ------------------------------- |
| `@maintain-project-docs` | Doc map, Notion sync            |
| `@humanize-docs`         | Before finishing markdown edits |
