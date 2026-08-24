# Changelog

All notable documentation and release changes for this project.

Format based on [Keep a Changelog](https://keepachangelog.com/). This repo is pre-release; only documentation entries exist so far.

## [Unreleased]

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
