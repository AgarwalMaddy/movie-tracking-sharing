> **Retired 2026-09-19.** Not requirements. Product is a social TMDB tracker; see `docs/scope.md`.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Movie and TV enthusiasts who currently track what they watch through scattered notes, mental lists, or messaging apps. They want to remember what they've seen, discover their friends' recommendations with personal context, and share suggestions that feel thoughtful rather than algorithmic.

Primary usage: casual tracking during downtime (evenings, weekends), checking friends' activity while deciding what to watch next.

## Product Purpose

**Movie Tracking & Sharing** is a personal library for what you watch, combined with private friend-to-friend recommendations that include the reason why.

Success means users consistently add titles as they watch them, and friends actually follow through on suggestions because they trust the personal context.

## Positioning

The personalized suggestion message is required and front-and-center. Unlike public review sites (Letterboxd, IMDb) where you write for an audience, or algorithmic feeds (Netflix) that don't explain why, every recommendation here includes the friend's voice explaining why this title is for you.

## Operating Context

Users interact during leisure time—scrolling while on the couch, checking on their phone between episodes, or searching for something to watch with friends physically present. The interface competes with streaming apps for attention during decision moments.

## Capabilities and Constraints

**V1 Manual tracking:**
- Personal library with three statuses: Watching, Watched, Want to Watch
- Search titles via TMDB API (server-side only)
- Friend connections (mutual approval required)
- Direct suggestions with required personal message (10–1000 chars)
- Chronological activity feed of friends' library updates
- Optional 1–10 rating per title

**Constraints:**
- No groups, playlists, or recommendation algorithms in V1
- No OTT auto-tracking yet (manual only)
- TMDB API key must never reach the client
- Email verification required for email/password signups
- Friends see each other's full libraries (titles + statuses + optional ratings); personal notes stay private

**Deliberately undecided:**
- Whether to add mood/genre filtering in the activity feed (deferred post-V1)

## Brand Commitments

**Name:** Movie Tracking & Sharing (functional, not consumer-facing brand name)

**Voice:** Conversational and genuine, not corporate or algorithmic. Copy should feel like text from a friend, not marketing or system notifications.

**No fabricated evidence:** No fake testimonials, invented user counts, or placeholder customer logos may be added.

## Evidence on Hand

- V1 technical specification: `docs/specs/v1-technical-specification.md`
- Existing Figma file (warm paper + deep teal theme) at `hbE2tqULfyK9QOsHwxipTQ` — documented but user identified it as mismatched to the category
- Implemented features: auth (email + Google OAuth with custom adapter), basic library CRUD, friends, suggestions, feed
- No user testimonials, case studies, or real usage data yet (pre-launch)

## Product Principles

1. **Trust through context** — Recommendations carry weight because the friend explains why, not because an algorithm scored it
2. **Effortless memory** — Tracking what you watch should take seconds, not become a journaling task
3. **Private by default** — Personal notes and suggestions stay between individuals, not broadcast to a timeline
4. **Manual first, automated later** — V1 ships with intentional tracking; convenience features follow only after the core loop proves valuable
5. **Lightweight pleasure** — The interface should feel like leisure, not productivity software
