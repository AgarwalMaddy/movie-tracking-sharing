# Documentation index

Repo files are the source of truth. Notion holds summaries for browsing.

| Document | Path | Notion |
|----------|------|--------|
| V1 technical spec | [specs/v1-technical-specification.md](specs/v1-technical-specification.md) | [V1 Technical Specification](https://app.notion.com/p/4ee223f1ab68484585f6f1bdf58dc1d8) |
| V1 design | [superpowers/specs/2026-08-22-movie-tracking-v1-design.md](superpowers/specs/2026-08-22-movie-tracking-v1-design.md) | In Design Decisions |
| Implementation plan | [superpowers/plans/2026-08-23-v1-implementation.md](superpowers/plans/2026-08-23-v1-implementation.md) | — |
| Project README | [../README.md](../README.md) | — |
| Agent guide | [../AGENTS.md](../AGENTS.md) | [Agent Guide](https://app.notion.com/p/fe95937c9b9b493ea6fe6c8cea580d03) |
| Design decisions | [DESIGN.md](DESIGN.md) | [Design Decisions](https://app.notion.com/p/10d6066cd0c14a6fa27d399e0fbf56d6) |
| Session learnings | [LEARNINGS.md](LEARNINGS.md) | Local only |
| Development guide | [development.md](development.md) | — |
| Risk register | [risk-register.md](risk-register.md) | — |
| Changelog | [CHANGELOG.md](CHANGELOG.md) | — |
| Project hub | — | [Project Hub](https://app.notion.com/p/3c4f639a8a4d81d8bdc3e36effd3d48e) |

## Maintenance

- `@maintain-project-docs` — update workflow and Notion sync
- `@humanize-docs` — clean up prose before you finish
- `.cursor/rules/humanize-writing.mdc` — applies to `**/*.md`

## Doc lifecycle

| Phase | Docs to maintain |
|-------|------------------|
| Initiation | Design doc, spec summary |
| Planning | V1 spec, implementation plan, risk register |
| Execution | `development.md`, `CHANGELOG.md`, `LEARNINGS.md` |
| Closure | Retrospective in `LEARNINGS.md`, release entry in `CHANGELOG.md` |

Implementation plans go in `docs/superpowers/plans/` after spec approval.
