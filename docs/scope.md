# Scope

Living product scope. Last updated 2026-09-19 after a logged-in tour of [AddToTheList](https://www.addtothelist.com/user/agarwalmadhur19/lists) (account `agarwalmadhur19`).

## Job

Build a **full social TMDB watch tracker**: public profiles, lists, reviews, activity, collections, and stats. Same product class as AddToTheList (ATTL). Beat it on UX, not by shipping a smaller private-library app.

OTT auto-sync from Netflix/etc. is not the product. Manual tracking plus TMDB metadata is.

## Reference (what ATTL does)

Lists are the organizing unit. Watch history is the dated log. Friends + recommend + activity are the social layer. Collections, Discover, and reviews are the public layer.

| Area | What we saw logged in |
|------|------------------------|
| Track | Mark movies watched; TV season/episode progress (e.g. Reacher 32/32, Stop Watching); rewatches; personal notes; 1–10 rating vs IMDb/RT/Metacritic |
| Lists | User-created lists; likes/comments; “watched N of M” (list membership is not the same as watched); Add to List from title/library |
| Title page | Where to watch (JustWatch via TMDB), rate, list, review, recommend to friends, friends’ statuses, cast, trailers, recs, notes |
| Social | Friends (invite or add from profile); recommend titles; public activity (“watched”, “added to list”, “created list”); reviews |
| Public browse | Discover (Top 10 / coming soon / new releases / notable lists); global Titles, Reviews, Lists, Users |
| Collections | Editorial franchise/studio sets (Star Wars, Dark Knight trilogy, Pixar). Not user playlists |
| Profile | Recently watched, lists, stats (hours, genres, actors/directors/crew), awards, tags, activity |
| Chrome | Search titles or cast/crew; notifications; chat; Search Party; Pro/ads |

**UX to beat:** ads and Pro upsells; awards/Search Party clutter; title pages as long dumps; stats vs library vs lists overlapping; empty friends is invite-only; list vs watched is confusing; dated visual design.

## Must-have (product, not one release)

These belong in the product. They still ship **one feature ADR at a time**.

- Accounts with a public profile URL (username)
- TMDB title search (movies and TV)
- Watch log (dated; TV seasons/episodes)
- Ratings and private notes
- Custom lists (create, add/remove titles, public by default unless we later add privacy in an ADR)
- Title page: metadata, poster, where to watch, actions (rate, list, review, recommend)
- Reviews on titles
- Friends + recommend a title
- Activity (self and friends)
- Discover (what to watch next from TMDB/trending, not a black-box “algorithm product”)
- Editorial collections with completion
- Profile stats (counts, hours, simple breakdowns)
- Notifications for social events (friend request, recommendation, comment/like if we ship those)

## Later

- Shared lists with friends
- Chat / Search Party
- Year in Review
- Awards / gamification
- Cloning lists
- Native apps
- Push notifications
- Recommendation ranking beyond “friends watched / trending”
- Tags as a first-class taxonomy (ATTL has a Tags tab)

## Never (unless the user reopens)

- Third-party ads and a Pro paywall as the default experience
- OTT account auto-import as V1
- Shipping from the retired V1 spec (private library + required-message suggestions only)

## UX principles vs ATTL

1. One obvious way to log a watch. List membership and watched status must not fight each other.
2. Title page: primary actions first; credits, reviews, and recs below the fold.
3. Empty friends: search people on the product, not only email invite.
4. No ads. No awards treadmill on the home screen.
5. Stats are a profile section, not a second product.

## Delivery order (draft)

Order is a suggestion until Feature 1 ADR is accepted.

1. Auth and identity (`docs/adr/0001-auth-and-identity.md`)
2. Title catalog (TMDB search + title page, read-only)
3. Watch log and ratings
4. Lists
5. Public profile
6. Reviews
7. Friends and recommendations
8. Activity and notifications
9. Discover and collections
10. Stats

## Open questions

- Privacy: are profiles and lists public by default (ATTL-like) or have a private mode in an early ADR?
- Where to watch: TMDB watch providers only, or JustWatch-level region UX from day one?
- Comments/likes on lists and reviews: must-have with lists, or later?
- Keep existing Next.js/Prisma/Neon code as a husk or replace at Feature 1 LLD? **Resolved:** replace with React web + Express API; keep Neon (ADR 0001 amended).

Application `src/` stays frozen until Feature 1 LLD is agreed.
