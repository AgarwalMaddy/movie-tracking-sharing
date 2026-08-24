---
name: maintain-project-docs
description: >-
  Maintains Movie Tracking & Sharing project documentation (AGENTS.md,
  docs/DESIGN.md, docs/LEARNINGS.md, V1 spec) and syncs summaries to Notion. Use when
  creating or updating project docs, onboarding agents, recording design
  decisions, or syncing documentation to Notion Project Hub.
---

# Maintain project docs

## Source of truth

Local repo wins. Notion is a human-readable mirror. Sync summaries, not every edit.

## File responsibilities

| File | Update when | Format |
|------|-------------|--------|
| `AGENTS.md` | Stack, scope, workflow, status | Replace sections; keep under 120 lines |
| `docs/DESIGN.md` | Product/UI decision | Append entry at top with date |
| `docs/LEARNINGS.md` | Session end or discovery | Prepend dated bullet cluster |
| `docs/specs/v1-technical-specification.md` | Scope, API, architecture | Edit in place; bump §15 history |
| `docs/README.md` | New doc file | Add row to index |
| `docs/CHANGELOG.md` | Structural doc change | Entry under Unreleased |
| `docs/risk-register.md` | New risk or resolved decision | Add or update row |
| `README.md` | Status or stack change | Update status table |
| `docs/development.md` | Env or setup change | Edit in place |

Do not create new doc files unless the content cannot live in the files above.

## Templates

### docs/DESIGN.md entry

```markdown
## YYYY-MM-DD — [Short title]

**Decision:** …
**Rationale:** …
**Alternatives rejected:** … (optional)
**Spec ref:** section or file path
```

### docs/LEARNINGS.md entry

```markdown
## YYYY-MM-DD — [Session topic]

- …
```

## Humanize step

Before finishing any markdown edit: `@humanize-docs` (or `@humanizer` for pasted text). Rule: `.cursor/rules/humanize-writing.mdc`.

Public-facing docs (README, DESIGN, spec prose, design doc): plain tone, no filler.  
Agent-facing docs (AGENTS.md): structured, imperative, no motivational language.

## Notion sync

After material local doc changes:

| Notion page | ID | Sync when |
|-------------|-----|-----------|
| Project Hub | `3c4f639a-8a4d-81d8-bdc3e36effd3d48e` | Status, scope, stack, doc map |
| V1 Technical Specification | `4ee223f1-ab68-4845-85f6-f1bdf58dc1d8` | Spec sections change materially |
| Agent Guide | `fe95937c-9b9b493ea6fe6c8cea580d03` | `AGENTS.md` changes |
| Design Decisions | `10d6066cd0c14a6fa27d399e0fbf56d6` | New `docs/DESIGN.md` entries |

Skip Notion sync for: typo fixes, `docs/LEARNINGS.md`-only updates, WIP drafts.

Use `notion-fetch` then `notion-update-page` with `update_content` for targeted edits. Preserve child page links when replacing content.

## Agent session checklist

1. Read `AGENTS.md` + relevant spec section
2. Read latest `docs/LEARNINGS.md` + recent `docs/DESIGN.md`
3. Work within V1 scope
4. Update docs if decisions changed
5. Run `@humanize-docs` on edited markdown
6. Prepend `docs/LEARNINGS.md` before ending session
7. Sync to Notion if spec / AGENTS / docs/DESIGN changed materially
8. Add `docs/CHANGELOG.md` entry if doc structure changed

## V1 scope guard

Do not add features to spec without user approval. Deferred work goes in spec §2.2 only.
