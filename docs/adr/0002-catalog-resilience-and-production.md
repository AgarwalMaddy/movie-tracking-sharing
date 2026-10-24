# ADR 0002 — Catalog resilience and production

**Status:** Accepted  
**Date:** 2026-10-24  
**Feature:** Catalog, deploy, security baseline, presence chrome

## Context

The SPA already talks to `apps/api`. Discover still dies when any of six TMDB calls fail. Cache is process memory. Nothing is deployed. GitHub only runs lint. The owner asked to make the product work and delegated the calls.

## Options

### A — Keep Express + TMDB, persist rails, one Render service

Same stack as ADR 0001. Postgres holds last-good rails. SPA is served from the API in production so cookies stay first-party.

### B — New backend or Next.js rewrite

Delays a working catalog.

### C — Switch catalog provider

OMDb is thinner. Trakt needs extra OAuth. Live failures still need a cache.

## Decision

Option A.

- `CatalogSnapshot` in Prisma. Per-rail fetch. Stale 200s.
- TMDB v3 with `Authorization: Bearer` when the key is a JWT, else `api_key`.
- Resolve `api.themoviedb.org` through public DNS (`1.1.1.1` / `8.8.8.8`). Some ISP resolvers return a dead address. `TMDB_DNS_SERVERS` overrides that list.
- Bundled rail fallback if live TMDB and Postgres snapshots are both empty. Discover still returns 200.
- Production: Render Node, `0.0.0.0:$PORT`, static `apps/web/dist` from the same origin.
- Helmet, auth rate limit, required `SESSION_SECRET`.
- Dependabot + npm audit. No CodeQL on this private repo.
- Featured Discover/title hero uses TMDB cast stills (ikevinadams reel, translated to web).

## Consequences

- Discover can show yesterday's rails when TMDB is angry. That is better than an error.
- One Render service is simpler than Vercel SPA + Render API (CORS and `SameSite=None`).
- Cast portraits depend on TMDB `profile_path`. Titles with no stills show backdrop only.

## Follow-up (HLD)

Implemented in this slice. HLD/LLD for later social features still follow PROCESS.
