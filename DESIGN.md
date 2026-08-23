# DESIGN.md — Decision log

Product and UI/UX decisions. Newest first. Append only.

---

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

**Decision:** Local repo is source of truth; Notion mirrors summaries. `LEARNINGS.md` stays local.  
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
