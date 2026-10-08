# Process

Work one feature at a time. Do not write a single ADR for the whole product.

## Pipeline

1. **Scope.** Product job, must / later / never. File: `docs/scope.md`. Change it when the user changes the product, not when picking a library.
2. **ADR.** One file per feature in `docs/adr/`. Covers why we do this feature now, options, tech, risks, and the decision. Status starts as Proposed. Implementation waits until Accepted.
3. **HLD.** `docs/hld/` for that feature. What we pick and why at system level: boundaries, data, main flows, what we will not build in this slice.
4. **LLD.** `docs/lld/` for that feature. Concrete types, routes or actions, UI surfaces, error cases, test plan.
5. **Implement.** Only what the LLD lists. Leave the Next.js `src/` frozen until Feature 1 LLD is accepted; then replace it with `apps/web` and `apps/api`.
6. **Test, monitor, deploy.** Tests from the LLD. Then monitoring and deploy notes for that feature. Then the next ADR.

```
scope → ADR → HLD → LLD → implement → test / monitor / deploy → next ADR
```

## Rules

- Stop and ask if the work is not in `docs/scope.md` as a must-have for this stage.
- Do not implement from `docs/archive/` or from Cursor chats that predate this process.
- Stack is chosen in the feature ADR, not in `AGENTS.md`.
- No Figma MCP. Use the live AddToTheList site and Chrome / Cursor browser when you need a reference.
- Humanize markdown with `@humanize-docs` before you finish.

## ADR file shape

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

Number files `0001-kebab-name.md`. Do not skip HLD/LLD because the ADR felt detailed enough.
