# Reelwright working product

**Date:** 2026-10-24  
**Status:** Accepted (owner delegated implementation)

Social TMDB tracker with a separate Express API and Vite SPA. This spec is the production slice: catalog that stays up, deploy, baseline security, usable chrome at four widths, and a character-presence hero taken from the ikevinadams Android TV reel.

## What we saw in the reel

Chrome opened [instagram.com/reel/Dey7OjuJ7pF](https://www.instagram.com/reel/Dey7OjuJ7pF/). Kevin Adams vibe-coded an Android TV home. The featured row is not a poster wall. It is a **group of the current show's characters** (Big Bang Theory cast composited as one image) with the title overlaid. Figures sit on the bezel. The point is: the people of the title occupy the screen and set the mood.

We are not shipping an Android launcher, physical figures, or generated rooms. On the web that idea is: TMDB backdrops plus billed cast portraits, overlapping, on Discover, landing, and the title page.

## Decisions

1. Keep Express + Vite + Neon. Do not add a second backend. Do not collapse to Next.js.
2. Keep TMDB. Failures come from live-only fetches, `Promise.all` on six rails, and an in-memory cache. Persist rails in Postgres. Serve last-good data. Refresh in the background.
3. One Render web service: API + built SPA. Same origin, so session cookies stay `SameSite=Lax`.
4. GitHub: Dependabot + `npm audit` in CI. CodeQL and secret scanning are paid on this private repo; do not pretend they are on.
5. Character presence uses TMDB credits stills only. No generative images.

## Catalog

- Each Discover rail fetches on its own. One 429 does not empty the page.
- Successful rails write `CatalogSnapshot` and upsert `Title` rows.
- Failed rails read the snapshot. HTTP 200 with `stale: true` if any rail is leftover data.
- Search: TMDB first; on failure, `Title.title` contains query.
- Title page: if TMDB is down, return the cached row even when it is older than a day.
- Client: keep showing posters from session cache or the stale payload. Never a blank error page when we have titles.

## Security

- `SESSION_SECRET` required in production (no default).
- `helmet`, `trust proxy`, rate limits on `/api/auth` and `/api`.
- Cookie `httpOnly`. Bearer token remains for a future native client.
- Dependabot for npm and GitHub Actions. CI `npm audit --omit=dev --audit-level=high`.

## Chrome and flow

Loop: land or Discover → search or a rail → title → Want / Watching / Watched.

- Phone (<800px): bottom bar Discover, Search, Library, You. Search is a page with a field, not a hidden overlay.
- Tablet and up: search field in the header. Primary nav on one line.
- Lists, friends, inbox stay under More.

## Character presence

API adds `cast[]` (`name`, `character`, `imageUrl`) on title and a `featured` object on Discover (first trending title with a backdrop + its cast).

UI: backdrop as stage, 3–6 portraits overlapping on the right (fewer on the phone), title and primary actions in the left copy. Reduced motion: no float, still images.

## Out of scope here

Google OAuth, email sending, replacing TMDB, a Pro paywall, native apps, AI image generation.
