# ADR 0001 — Auth and identity

**Status:** Accepted (amended 2026-09-20)
**Date:** 2026-09-19
**Feature:** Auth and identity

## Context

The product is a public social TMDB tracker. Later slices need a signed-in user and a stable public profile URL (`/user/{username}`).

The repo has a Next.js 15 app with Auth.js on Neon, built for a retired V1. Feature 1 replaces that app and keeps Neon.

This slice does not include ads, Pro, TMDB, lists, or friends.

**Amendment (2026-09-20):** The web UI is React. A React Native app may come later, so the backend is a separate **Express** HTTP API that both clients can call. Next.js App Router and Auth.js are no longer the Feature 1 stack.

## Options (original)

### A — Reuse current NextAuth + Prisma + Neon

Patch the existing Next.js app.

### B — New app, same Neon

Replace application code. Keep the Neon project. Identity modeled from day one (including `username`).

### C — Hosted auth (Clerk, WorkOS, etc.) + Neon for app data

Extra vendor; username still in our DB.

## Decision

**Option B, amended.** New application code on the same Neon project. Unique username as the public profile key. Email + Google. Email verification required for password accounts. Google counts as verified.

**UI:** React for web (Vite). React Native is out of this slice; the API must not depend on a browser-only session so a native app can use the same endpoints later.

**Server:** Express (TypeScript). JSON REST. Prisma on Neon.

**Auth mechanism (this ADR):** Application-owned auth on Express. Not Auth.js (Next-specific). Not Clerk unless a later ADR reopens hosted auth. Cookie session for the web client; token (Bearer) responses so React Native can authenticate without cookies. Exact library is in the HLD (Passport, Better Auth, or equivalent).

Prisma schema for this slice is identity only. Retired V1 tables are not carried forward.

Do not implement until HLD and LLD for this stack are agreed. Implementation replaces the current Next.js `src/` rather than patching it.

## Consequences

- Two processes in local dev: API + web. Deploy is SPA + Node API (Vercel static for the SPA is fine; Express needs a Node host).
- Shared TypeScript types (Zod) between web and API; React Native can reuse those later.
- Feature 1 is identity only.
- `TMDB_API_KEY` unused in this slice.
- Neon reset/migration will drop retired V1 tables.

## Follow-up (HLD)

HLD rewritten for React + Express: `docs/hld/0001-auth-and-identity.md`. Previous Next.js HLD agreement is void. Re-agree HLD, then LLD, then implement.
