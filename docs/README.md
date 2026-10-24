# Documentation index

Repo files are the source of truth. Notion holds summaries.

| Document | Path | Notion |
|----------|------|--------|
| Process | [PROCESS.md](PROCESS.md) | — |
| Product scope | [scope.md](scope.md) | — |
| ADRs | [adr/](adr/) | Latest: [0002 catalog and production](adr/0002-catalog-resilience-and-production.md) |
| HLD (in flight) | [hld/](hld/) | — |
| LLD (in flight) | [lld/](lld/) | — |
| Project README | [../README.md](../README.md) | — |
| Agent guide | [../AGENTS.md](../AGENTS.md) | [Agent Guide](https://app.notion.com/p/fe95937c9b9b493ea6fe6c8cea580d03) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) | — |
| Development | [development.md](development.md) | — |
| Retired docs | [archive/README.md](archive/README.md) | — |
| API agent guide | [../apps/api/AGENTS.md](../apps/api/AGENTS.md) | — |
| Web agent guide | [../apps/web/AGENTS.md](../apps/web/AGENTS.md) | — |
| Project hub | — | [Project Hub](https://app.notion.com/p/3c4f639a8a4d81d8bdc3e36effd3d48e) |

## Maintenance

- `@maintain-project-docs` — file map and Notion sync
- `@humanize-docs` — prose cleanup
- `.cursor/rules/humanize-writing.mdc` — applies to `**/*.md`

## Lifecycle

| Phase | Docs |
|-------|------|
| Scope | `scope.md` |
| Feature design | ADR → HLD → LLD |
| Execution | `development.md`, `CHANGELOG.md`, tests |
| Retired | files listed in `archive/README.md` |
