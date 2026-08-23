# AGENTS.md — Movie Tracking & Sharing

> Read this file at the start of every session. It is the single entry point for agents.

---

## Session start (in order)

1. Read this file.
2. Read `LEARNINGS.md` (latest entry only unless the task needs history).
3. Read the spec section that matches your task (see table below).
4. If the task touches UI, read recent entries in `DESIGN.md`.
5. Confirm the task is in V1 scope. If not, stop and ask the user.

| Task type | Read first |
|-----------|------------|
| Feature implementation | `docs/specs/v1-technical-specification.md` (relevant §) |
| UI/UX work | `DESIGN.md` + spec §9 |
| Architecture / API change | Spec §5–§8 + update spec before coding |
| Doc updates | `@maintain-project-docs` skill |
| Bootstrap / setup | `docs/superpowers/plans/2026-08-23-v1-implementation.md` |

---

## Project summary

Each user has a personal watch library and sends private suggestions to friends. V1 is manual tracking plus friend suggestions. OTT auto-sync is out of scope.

---

## Current status

| Item | State |
|------|-------|
| Spec | Draft — `docs/specs/v1-technical-specification.md` |
| Implementation plan | Written — `docs/superpowers/plans/2026-08-23-v1-implementation.md` |
| Application code | Not started |
| Blocker | Formal **spec approval** required before implementation (§14 product questions resolved) |

**Do not scaffold or implement features until the user approves the spec.**

---

## V1 scope guard

### In scope

Auth, profiles, manual library (Watching / Watched / Want to Watch), TMDB search, friends, direct suggestions, chronological feed.

### Out of scope (require explicit user approval)

Groups, playlists, OTT auto-tracking, browser extension, recommendation algorithms, native apps, push notifications.

### When unsure

- Default: defer to spec §2.2 and ask the user.
- Never add out-of-scope features "while you're here."
- Record approved scope changes in spec §2 and append `DESIGN.md`.

---

## Tech stack (locked)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 (email + Google) |
| UI | Tailwind CSS + shadcn/ui |
| Metadata | TMDB API v3 (server-side only) |
| Validation | Zod |
| Tests | Vitest, Playwright (mobile viewport) |
| Hosting | Vercel |

---

## Repository conventions

- **Mutations:** Server Actions. **TMDB proxy:** Route Handlers only.
- **Colocation:** `src/features/{auth,library,friends,suggestions,feed}`
- **Secrets:** Never expose `TMDB_API_KEY` or auth secrets to the client.
- **Errors:** Return `{ error, code }` to the client. No stack traces.
- **Commits:** Only when the user explicitly asks.

---

## Domain terms

| Term | Definition |
|------|------------|
| Library entry | One user's record for a title + watch status |
| Suggestion | Private recommendation with a required message |
| Title | Cached TMDB metadata (movie or TV) |
| Friend | Mutual connection after an accepted request |

---

## Documentation map

| File | Purpose |
|------|---------|
| `docs/specs/v1-technical-specification.md` | Canonical V1 spec |
| `docs/superpowers/plans/2026-08-23-v1-implementation.md` | Task-by-task build plan |
| `docs/superpowers/specs/2026-08-22-movie-tracking-v1-design.md` | Product design context |
| `DESIGN.md` | Decision log (append-only, newest first) |
| `LEARNINGS.md` | Session notes (local only, not synced to Notion) |
| `docs/README.md` | Full doc index |
| `docs/development.md` | Local setup (after scaffold) |
| `docs/risk-register.md` | Risks and open decisions |
| `docs/CHANGELOG.md` | Doc and release history |
| `README.md` | Human-facing project overview |
| [Notion Project Hub](https://app.notion.com/p/3c4f639a8a4d81d8bdc3e36effd3d48e) | Human mirror (summaries only) |

**Source of truth:** Local repo. Sync summaries to Notion after material doc changes.

---

## Session end checklist

1. Update docs if you changed scope, architecture, or product decisions.
2. Run `@humanize-docs` on any edited markdown.
3. Prepend `LEARNINGS.md` with session notes.
4. Sync to Notion if spec, `AGENTS.md`, or `DESIGN.md` changed materially (`@maintain-project-docs`).
5. Add `docs/CHANGELOG.md` entry if doc structure changed.

---

## Skills

| Skill | When |
|-------|------|
| `@maintain-project-docs` | Creating or updating project docs; Notion sync |
| `@humanize-docs` | Before finishing any markdown edit |
| `writing-plans` | After spec approval, for new implementation plans |
