# Movie Tracking & Sharing — V1 design

**Date:** 2026-08-22  
**Status:** Approved for spec  
**Canonical spec:** [`docs/specs/v1-technical-specification.md`](../../specs/v1-technical-specification.md)

---

## Problem

Friend groups track movies and shows across WhatsApp, notes apps, and OTT watchlists. Recommendations are personal ("you'll love this because…") but get lost in chat. There is no single place for my library, friend connections, and private suggestions.

## Vision (long-term)

Personal profiles, optional auto-tracking (API, then extension, then manual fallback), playlists, groups, algorithmic discovery.

## V1: social foundation first

**Approach:** Next.js web app with PostgreSQL  
**MVP:** Profiles, manual library, direct friend suggestions

Ship the social loop first. Add OTT integrations only after friends actually use it.

## Alternatives considered

| Approach | Verdict |
|----------|---------|
| PWA mobile-first | Deferred — add install manifest after core UX works |
| React Native | Deferred — slower iteration for a solo builder |
| Shared group tracker | Rejected — product is per-user profiles with a friend graph |

## Core user stories (V1)

1. Sign up and maintain a watch list with three statuses.
2. Connect with friends via requests.
3. Send a friend a title and a message about why they should watch it.
4. Accept a suggestion and have it land in Want to Watch.
5. See a feed of friend activity.

## Tracking roadmap

1. V1: Manual + TMDB search
2. V2: OTT account linking where APIs exist
3. V2: Browser extension if legal and safe
4. Always: Manual fallback

## Success criteria

A core friend group (5+ people) uses the app weekly for library updates and suggestions within 8 weeks of launch.

## Open questions

Resolved in spec §14 (2026-08-23): email verification required; friends see full library; ratings in V1.
