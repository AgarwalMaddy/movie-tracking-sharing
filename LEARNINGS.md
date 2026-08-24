# LEARNINGS.md — Session Notes

Newest entries first. Keep entries short — one insight per bullet cluster.

---

## 2026-08-24 — Figma chrome + private GitHub repo

- Mobile headers now FILL 390px; Library/Friends/Suggestions/Feed have a four-tab bottom nav.
- 1440 desktop frames (`D01`–`D06`) sit on the same Figma page below the 390 mobile frames. A second page did not keep children after the plugin run.
- App: hide top nav below `md`; `MobileNav` is fixed at the bottom. Repo: https://github.com/AgarwalMaddy/movie-tracking-sharing (private).

## 2026-08-24 — Neon project provisioned

- Neon project `raspy-haze-49639619` (org Madhur Agarwal); DB `neondb`.
- Prisma `init` migration applied; all V1 tables present.
- Local `.env` / `.env.local` hold `DATABASE_URL` (gitignored). Prisma CLI reads `.env`.

## 2026-08-24 — Neon, ARM Prisma, Figma

- Chose **Neon** over Supabase for free-tier/Vercel fit (Postgres only).
- Prisma Windows ARM is a known gap; fixed locally with `engineType = "binary"` (client loads; fails only if DB unreachable).
- Figma: https://www.figma.com/design/hbE2tqULfyK9QOsHwxipTQ — Landing, Login, Library, Friends, Suggestions, Feed.
- Aligned CSS primary/background to teal + warm paper from comps.

## 2026-08-23 — V1 inline implementation started

- Branch: `feat/v1-implementation`
- Tasks 1–12 scaffolded: Next.js 15, Prisma schema, auth, TMDB, library, friends, suggestions, feed
- Blockers on this machine: Docker unavailable; Prisma query engine arch mismatch — need local Postgres + `npx prisma migrate dev`

## 2026-08-23 — Spec §14 locked

- Email verification required for email/password; Google OAuth counts as verified.
- Friends see full libraries; personal notes stay private.
- Optional 1–10 rating is in V1 (not deferred).
- Remaining blocker for code: formal **spec approval** (R1), not open product questions.

## 2026-08-23 — Humanize pass and Notion sync

- Humanized public docs: `README.md`, `docs/README.md`, `DESIGN.md`, `docs/development.md`, V1 design doc, spec executive summary.
- Rewrote `AGENTS.md` for agent session workflow (start checklist, scope guard, session end).
- Notion synced: Project Hub, Agent Guide, Design Decisions (humanize entry), V1 Technical Specification (status/next step).

## 2026-08-23 — Documentation audit and humanize setup

**Gap audit** (vs Artezio, Lark, SoftwareSuggest best practices):

| Gap | Why it existed | Fix applied |
|-----|----------------|-------------|
| No root `README.md` | Agent-first docs (`AGENTS.md`); scaffold not started | Added `README.md` with status table |
| Stale phase in `AGENTS.md` | Plan written after agents file; status not updated | Corrected to "spec + plan done, code not started" |
| No dev setup guide | Pre-scaffold; deferred to implementation | Added `docs/development.md` (marked as planned) |
| No changelog | Pre-release; informal git history only | Added `docs/CHANGELOG.md` |
| No risk register | Open questions only in spec §14 | Added `docs/risk-register.md` |
| No humanize workflow | Docs drafted by agents without prose review | Added `@humanizer`, `@humanize-docs`, `humanize-writing.mdc` rule |
| No execution-phase doc map | `docs/README.md` lacked plan, dev, risk entries | Updated index + lifecycle table |

**Still deferred (appropriate for pre-implementation):**

- Requirements traceability matrix (add when tests exist)
- Post-mortem / closure doc (add at V1 ship)
- Separate API quick-reference (spec §6 is enough for now)

**Humanizer install:** Project skills at `.cursor/skills/humanizer/`. For global use across repos, copy to `~/.agents/skills/humanizer/` (mirror `~/.cursor/skills/`).

## 2026-08-22 — Project kickoff

- Product is a **social platform** (individual profiles + friend graph), not a shared group tracker.
- V1 MVP = profiles + manual tracking + direct suggestions; auto-tracking deferred to V2.
- Tracking priority when built: OTT APIs → browser extension (if legal) → manual fallback.
- Documentation dual-maintained: local repo (source of truth) + Notion Project Hub.
- Full vision includes playlists, groups, algorithms — explicitly out of V1 scope.
