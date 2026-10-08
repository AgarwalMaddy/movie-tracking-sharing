---
name: maintain-project-docs
description: >-
  Maintains Movie Tracking & Sharing docs (AGENTS.md, PROCESS, scope, ADRs)
  and syncs summaries to Notion. Use when creating or updating project docs,
  onboarding agents, recording ADRs, or syncing to the Notion Project Hub.
---

# Maintain project docs

## Source of truth

Local repo wins. Notion is a human-readable mirror. Sync summaries, not every edit.

## File responsibilities

| File | Update when | Format |
|------|-------------|--------|
| `AGENTS.md` | Status, process, doc map | Replace sections; keep under 120 lines |
| `docs/PROCESS.md` | How we work | Edit in place |
| `docs/scope.md` | Product job, must / later / never | Edit in place |
| `docs/adr/` | Feature decision | New `NNNN-kebab.md`; status Proposed until accepted |
| `docs/hld/` | After ADR accepted | One HLD per in-flight feature |
| `docs/lld/` | After HLD agreed | One LLD per in-flight feature |
| `docs/README.md` | New canonical doc | Add a row |
| `docs/CHANGELOG.md` | Structural doc change | Entry under Unreleased |
| `README.md` | Status or product one-liner | Edit in place |
| `docs/development.md` | Env or setup | Edit in place |

Do not treat `docs/DESIGN.md`, `docs/LEARNINGS.md`, `docs/specs/`, or `docs/superpowers/` as canonical. They are retired (see `docs/archive/README.md`).

## ADR template

```markdown
# ADR NNNN — Title

**Status:** Proposed | Accepted | Superseded
**Date:** YYYY-MM-DD
**Feature:** short name

## Context
## Options
## Decision
## Consequences
## Follow-up (HLD)
```

## Humanize step

Before finishing any markdown edit: `@humanize-docs`. Rule: `.cursor/rules/humanize-writing.mdc`.

Public-facing docs: plain tone, no filler. Agent-facing docs: structured, imperative.

## Notion sync

After material local doc changes:

| Notion page | ID | Sync when |
|-------------|-----|-----------|
| Project Hub | `3c4f639a-8a4d-81d8-bdc3e36effd3d48e` | Status, scope, process, doc map |
| Agent Guide | `fe95937c-9b9b-493e-a6fe-6c8cea580d03` | `AGENTS.md` changes |
| V1 Technical Specification | `4ee223f1-ab68-4845-85f6-f1bdf58dc1d8` | Note retired; do not treat as live spec |
| Design Decisions | `10d6066cd0c14a6fa27d399e0fbf56d6` | Only if we revive a decision log |

Skip Notion for typo-only edits and WIP drafts.

Use `notion-fetch` then `notion-update-page` with `update_content`. Preserve child page links when replacing content.

## Agent session checklist

1. Read `AGENTS.md` + `docs/PROCESS.md` + `docs/scope.md`
2. If coding: accepted ADR + HLD + LLD for that feature
3. Do not implement from retired docs
4. Run `@humanize-docs` on edited markdown
5. Sync Notion if AGENTS / process / scope changed
6. Changelog entry if the doc map changed
