# DESIGN.md — Decision log

Product and UI/UX decisions. Newest first. Append only.

---

## 2026-08-24 — Full-width chrome, mobile bottom nav, desktop 1440

**Decision:** App chrome is full-width. Phone layouts use a four-tab bottom nav (Library, Friends, Suggestions, Feed). `md` and up keep those links in the top header. Figma file `hbE2tqULfyK9QOsHwxipTQ` page **V1 Mobile Screens** has 390 frames plus 1440 desktop frames (`D01`–`D06`) on the same canvas.

**Rationale:** The first comps hugged the header (~265px), which left a dead gap on the right. The shipped app already stretched the bar; it still used desktop-style top links on a phone. Bottom nav is the mobile pattern; 1440 frames cover web.

**Alternatives rejected:** Hamburger drawer; keeping top links on every breakpoint.

**Spec ref:** spec §9, Figma `hbE2tqULfyK9QOsHwxipTQ`

## 2026-08-24 — Neon Postgres + Figma V1 screens

**Decision:** Host V1 Postgres on **Neon** (not local Docker / not Supabase). Ship UI comps in Figma file [Movie Tracking — V1 Screens](https://www.figma.com/design/hbE2tqULfyK9QOsHwxipTQ) and align app tokens to warm paper + deep teal.

**Rationale:** Stack already has NextAuth and Vercel — Neon is Postgres-only with free scale-to-zero and preview branching. Supabase’s auth/storage bundle is unused cost. Figma gives a visual source of truth for mobile screens before more polish.

**Alternatives rejected:** Local Docker (unavailable / not required); Supabase as primary DB (we would ignore most of the BaaS); purple/default shadcn look.

**Spec ref:** `docs/development.md`, Figma `hbE2tqULfyK9QOsHwxipTQ`

## 2026-08-24 — Prisma binary engine on Windows ARM

**Decision:** Set `engineType = "binary"` in Prisma schema for local Windows ARM64 Node.

**Rationale:** Prisma has no native Windows ARM Node-API engines ([#15306](https://github.com/prisma/prisma/issues/15306)). Binary sidecar lets Windows translate x64. Vercel Linux is unaffected.

**Alternatives rejected:** Force global x64 Node uninstall (invasive); wait for native ARM engines.

## 2026-08-23 — Spec §14 decisions

**Decision:** (1) Email verification required at launch for email/password. Google OAuth counts as verified. (2) Accepted friends see full libraries (title, status, optional rating); personal notes stay private. (3) Optional 1–10 rating stays in V1.

**Rationale:** Verification reduces fake accounts before the friend graph grows. Full library sharing matches how the core group already talks about what everyone is watching. Ratings are small schema/UI cost and useful when suggesting.

**Alternatives rejected:** Google-only launch; status-count summaries until opt-in; defer ratings to V1.1.

**Spec ref:** `docs/specs/v1-technical-specification.md` §4.1, §4.3, §7.2, §14

## 2026-08-23 — Humanize writing for docs

**Decision:** Run all project markdown through `@humanize-docs` before merge. Based on [blader/humanizer](https://github.com/blader/humanizer).  
**Rationale:** Agent drafts pick up stock phrases and padded tone. Docs need a dedicated cleanup pass.  
**Artifacts:** `.cursor/skills/humanizer/`, `.cursor/skills/humanize-docs/`, `.cursor/rules/humanize-writing.mdc`

## 2026-08-22 — Documentation infrastructure

**Decision:** Local repo is source of truth; Notion mirrors summaries. `docs/LEARNINGS.md` stays local.  
**Rationale:** Git history for agents; Notion for human browsing without duplicating every edit.  
**Artifacts:** `.cursor/rules/project-documentation.mdc`, `@maintain-project-docs`

## 2026-08-22 — V1 MVP scope

**Decision:** Ship profiles, manual library, and friend suggestions first.  
**Rationale:** Test the social loop before OTT or extension work.  
**Alternatives rejected:** Auto-tracking first, group-first tracker.  
**Spec ref:** `docs/specs/v1-technical-specification.md` §2

## 2026-08-22 — Platform approach

**Decision:** Responsive web app (Next.js), not native mobile for V1.  
**Rationale:** Faster to ship and iterate; mobile can follow.  
**Spec ref:** `docs/superpowers/specs/2026-08-22-movie-tracking-v1-design.md`

## 2026-08-22 — Library statuses

**Decision:** Three statuses: Watching, Watched, Want to Watch.  
**Rationale:** Matches how friend groups talk about media; maps to the suggestion accept flow.

## 2026-08-22 — Suggestion model

**Decision:** Suggestions are private, message-required, friend-to-friend only.  
**Rationale:** Differentiator vs public review sites (Letterboxd, IMDb).
