---
name: humanize-docs
description: |
  Humanizes project documentation (AGENTS.md, docs/DESIGN.md, docs/LEARNINGS.md, specs,
  README) to remove AI writing patterns. Use when creating or editing markdown
  docs in this repo, before committing doc changes, or when prose sounds generic.
---

# Humanize project docs

Apply before finishing any documentation edit in this repo.

## When to run

- New or substantially rewritten markdown in `docs/`, `AGENTS.md`, `README.md`
- After agent-generated doc drafts
- Before Notion sync summaries (repo file is still source of truth)

## Steps

1. Read `@humanizer` skill (`.cursor/skills/humanizer/SKILL.md`) and [patterns.md](../humanizer/patterns.md) if needed.
2. Run humanizer in **file mode** on the edited file(s).
3. Preserve:
   - Tables, code blocks, route paths, env var names
   - Spec section numbers and cross-links
   - Decision log dates and structured fields (`**Decision:**`, `**Rationale:**`)
4. Technical docs stay neutral. No blog tone, no motivational closers.
5. Update `docs/CHANGELOG.md` when doc structure or canonical files change.

## Doc voice for this project

- Short sentences. One idea per bullet.
- Sentence-case headings.
- State what the system does, not what it "enables" or "empowers".
- Prefer "is", "has", "uses" over "serves as", "leverages", "showcases".

## Pair with

- `@maintain-project-docs` for file responsibilities and Notion sync
- Rule `.cursor/rules/humanize-writing.mdc` (auto-applies on markdown edits)
