# Changelog

All notable documentation and release changes for this project.

Format based on [Keep a Changelog](https://keepachangelog.com/). This repo is pre-release; only documentation entries exist so far.

## [Unreleased]

### Added

- ADR 0002: persist TMDB rails, serve stale catalog, one free Render service, helmet/rate-limit, Dependabot, character-presence heroes from TMDB cast stills. TMDB lookups use public DNS; bundled rails cover a total catalog miss. Vercel Git deploys for this repo are ignored.
- Spec: `docs/superpowers/specs/2026-10-24-working-product-design.md`.

### Changed

- API and web source now follow TravelTogether's folder and writing rules (adapted): API `routes → controller → service → repository` with `#` imports; web `app → pages → features → components → lib` with `@/`. Prisma stays the data layer. SPA errors stay `{ error, code }`. Guides: `apps/api/AGENTS.md`, `apps/web/AGENTS.md`.

### Added

- ESLint 9 + Prettier 3 per app (`apps/web`, `apps/api`), VS Code format-on-save, and CI that auto-formats PRs then typechecks and lints (same shape as TravelTogether). Root scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`.

### Removed

- Old Next.js tree (`src/`), Playwright/Vitest configs, Sentry/Next config, and the `public/` placeholders. CI now only generates Prisma.

### Changed

- App is `apps/web` + `apps/api` (React Vite + Express). `docs/development.md` and `AGENTS.md` describe that stack. Feature 1 HLD/LLD marked implemented; Google OAuth still not built.

### Changed

- ADR 0001 amended: React (Vite) web + Express API so a later React Native app can share the API. Next.js HLD agreement void. New HLD/LLD drafts. No code until HLD is re-agreed and LLD accepted.

### Changed

- Reset documentation to Scope → ADR → HLD → LLD. Canonical files: `docs/PROCESS.md`, `docs/scope.md`, `docs/adr/`. Retired the V1 spec, DESIGN, LEARNINGS, implementation plan, redesign/mockups, and `PRODUCT.md` (banners; see `docs/archive/README.md`).
- `AGENTS.md` and `README.md` no longer lock the old private-library V1 or the stack. Application `src/` is frozen until Feature 1 LLD.
- `@maintain-project-docs` and `.cursor/rules/project-documentation.mdc` match the new map. No Figma in the workflow.

### Added

- `docs/adr/0001-auth-and-identity.md` — Proposed Feature 1 ADR
- `docs/hld/` and `docs/lld/` placeholders (empty until ADR accepted)

### Added

- `docs/redesign-plan-2026-08-29.md` — cinematic dark theme redesign plan (landing + auth)
- `docs/mockups/desktop/index.html` — desktop 1440×900 HTML mockups (Landing, Login, Signup) for review while Figma MCP is rate-limited
- Doc index links for redesign plan and desktop mockups

### Changed

- Moved `DESIGN.md` and `LEARNINGS.md` into `docs/`; removed redundant `CLAUDE.md` alias
- Updated doc index, agent rules, and skills to match new paths
- `docs/DESIGN.md` — full-width header, mobile bottom nav, desktop 1440 Figma page
- Figma `hbE2tqULfyK9QOsHwxipTQ` — 1440 desktop frames `D01`–`D06` on **V1 Mobile Screens**

### Added

- Root `README.md` with status table and doc index
- `docs/development.md` — planned local setup guide
- `docs/risk-register.md` — lightweight risk and open-question tracker
- `docs/CHANGELOG.md` — this file
- `.cursor/skills/humanizer/` — AI prose cleanup skill (from [blader/humanizer](https://github.com/blader/humanizer))
- `.cursor/skills/humanize-docs/` — project doc humanization workflow
- `.cursor/rules/humanize-writing.mdc` — markdown humanize rule

### Changed

- `docs/specs/v1-technical-specification.md` — resolved §14: email verify required; full friend library; ratings in V1
- `DESIGN.md` — §14 decision entry
- `docs/risk-register.md` — R3–R5 mitigated
- `AGENTS.md` — rewritten for agent session workflow
- `README.md`, `docs/README.md`, `DESIGN.md`, `docs/development.md` — humanized prose
- `docs/specs/v1-technical-specification.md` — humanized executive summary
- `docs/superpowers/specs/2026-08-22-movie-tracking-v1-design.md` — humanized prose
- Notion Project Hub, Agent Guide, Design Decisions — synced 2026-08-23

## [2026-08-23] — Implementation plan

- Added `docs/superpowers/plans/2026-08-23-v1-implementation.md`

## [2026-08-22] — Initial documentation

- V1 technical specification draft
- V1 design doc (`docs/superpowers/specs/2026-08-22-movie-tracking-v1-design.md`)
- `AGENTS.md`, `DESIGN.md`, `LEARNINGS.md`
- `.cursor/rules/project-documentation.mdc`
- `@maintain-project-docs` skill
