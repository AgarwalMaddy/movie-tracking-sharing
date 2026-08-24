# Risk register

Lightweight tracker for V1 risks and open decisions. Review when scope or architecture changes.

| ID | Risk / question | Likelihood | Impact | Mitigation / next step | Owner | Status |
|----|-----------------|------------|--------|------------------------|-------|--------|
| R1 | Spec not approved before coding starts | Medium | High | Hold implementation until spec sign-off; reference spec § numbers in PRs | — | Open |
| R2 | TMDB rate limits or API changes | Low | Medium | Server-side proxy, cache `Title` rows, debounce search (spec §7.1) | — | Open |
| R3 | Email verification policy undecided | Medium | Medium | **Decided:** verification required for email/password; Google counts as verified (spec §14) | — | Mitigated |
| R4 | Friend library visibility undecided | Medium | Medium | **Decided:** accepted friends see full library; notes private (spec §14) | — | Mitigated |
| R5 | Rating field scope creep | Low | Low | **Decided:** optional 1–10 rating in V1 (spec §14) | — | Mitigated |
| R6 | Solo builder bandwidth | Medium | Medium | Stick to V1 scope guard; no groups/algorithms in V1 | — | Open |
| R8 | Prisma on Windows ARM64 | High | High | **Mitigated:** `engineType=binary` (prisma#15306); optional x64 Node | — | Mitigated |
| R9 | Neon cold starts on free tier | Medium | Low | Accept ~0.5s idle resume; warm traffic is fine for friend-group MVP | — | Open |

## How to use

1. Add a row when a new risk or unresolved decision appears.
2. Move status to **Mitigated** when the spec or `DESIGN.md` records the decision.
3. Close rows that no longer apply.

Cross-ref: spec [§14 Resolved decisions](specs/v1-technical-specification.md#14-resolved-decisions-was-open-questions).
