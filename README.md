# Movie Tracking & Sharing

Track what you watch. Send friends recommendations with a note about why they'd like it.

V1 covers manual tracking and friend suggestions. OTT sync comes later.

## Where things stand

| Item | State |
|------|-------|
| V1 spec | Draft — [read spec](docs/specs/v1-technical-specification.md) |
| Build plan | Done — [implementation plan](docs/superpowers/plans/2026-08-23-v1-implementation.md) |
| Code | Not started — waiting on spec approval |

## V1 features

- Sign in with email or Google
- Personal library: Watching, Watched, Want to Watch
- Search titles via TMDB
- Friend requests
- Suggestions (message required)
- Activity feed (newest first, no ranking)

## Documentation

| Doc | What it's for |
|-----|---------------|
| [docs/README.md](docs/README.md) | Full index |
| [docs/DESIGN.md](docs/DESIGN.md) | Product and UI decisions |
| [docs/development.md](docs/development.md) | Local setup (after scaffold) |
| [docs/risk-register.md](docs/risk-register.md) | Open risks and decisions |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | What changed and when |
| [AGENTS.md](AGENTS.md) | AI agent onboarding |

Repo files are the source of truth. Summaries also live in the [Notion Project Hub](https://app.notion.com/p/3c4f639a8a4d81d8bdc3e36effd3d48e).

## Stack

Next.js 15, TypeScript, PostgreSQL, Prisma, NextAuth.js v5, Tailwind, shadcn/ui, TMDB API v3, Vercel.
