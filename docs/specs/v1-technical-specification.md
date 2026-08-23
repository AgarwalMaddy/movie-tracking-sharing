# V1 Technical Specification — Movie Tracking & Sharing

**Version:** 1.0-draft  
**Status:** Pending review  
**Last updated:** 2026-08-23

---

## 1. Executive summary

Each user keeps a personal watch library and exchanges private suggestions with friends. V1 covers profiles, manual library tracking, friend connections, and direct suggestions.

**Primary value (V1):** Replace scattered WhatsApp notes and mental lists with one place to track what you watch and get recommendations written for you, not for a public feed.

---

## 2. Scope

### 2.1 In scope (V1)

| Area | Capability |
|------|------------|
| Auth | Email/password + Google OAuth |
| Profile | Display name, avatar, optional bio |
| Library | Manual add/update titles; statuses: **Watching**, **Watched**, **Want to Watch** |
| Title metadata | Search via TMDB API; cache locally |
| Friends | Send/accept/decline requests; unfriend |
| Suggestions | Send personalized recommendation to a friend; recipient accepts or dismisses |
| Feed | Activity feed of friends' library updates and suggestions received |
| Responsive web | Mobile-first responsive UI (not native app) |

### 2.2 Out of scope (V1 → future)

| Feature | Target phase |
|---------|--------------|
| Groups | V1.1 |
| Playlists / shared lists | V1.2 |
| OTT account linking | V2 |
| Browser extension auto-tracking | V2 |
| Recommendation algorithm | V2 |
| Push notifications | V2 |
| Native mobile apps | V3 |

### 2.3 Tracking strategy (phased)

V1 is **manual only**. Future phases follow this priority:

1. **OTT account APIs** — where platforms expose legal, stable APIs
2. **Browser extension** — only if legally and technically viable
3. **Manual fallback** — always available

---

## 3. User Flows (End-to-End)

### 3.1 Onboarding

```
Landing → Sign up (email or Google) → Create profile → Empty library → Prompt: "Add your first title" or "Find friends"
```

**Acceptance:** User can complete signup and land on library within 2 minutes.

### 3.2 Add title to library

```
Library → Search (TMDB) → Select title → Choose status → Optional personal note → Save
```

**Rules:**
- Same title cannot exist twice for one user (upsert by TMDB ID + media type)
- Status change updates `updatedAt`; optional note is private to the user

### 3.3 Friend connection

```
Friends → Search by email/display name → Send request → Recipient: Accept | Decline
```

**Rules:**
- Friendship is mutual after accept
- Either party can unfriend (removes friendship; does not delete past suggestions)
- After accept, each friend can view the other's full library (titles, statuses, optional ratings). Personal notes stay private

### 3.4 Send suggestion

```
Friend profile OR title detail → "Suggest to [Friend]" → Write personalized message (required, min 10 chars) → Send
```

**Recipient flow:**
```
Suggestions inbox → View (sender, title, message) → Accept (adds to Want to Watch) | Dismiss
```

**Rules:**
- Suggestion is private between sender and recipient
- Accepting creates/updates library entry with status **Want to Watch** and links suggestion metadata
- Dismissed suggestions remain viewable in history (read-only)

### 3.5 Browse friend activity

```
Feed → See: friend added/changed status on title, friend sent you a suggestion
```

V1 feed is **chronological only** (no ranking algorithm).

---

## 4. Functional Requirements

### 4.1 Authentication & authorization

- Session-based auth via NextAuth.js v5
- Email/password signups require email verification before accessing the app
- Google OAuth accounts count as verified via the provider
- Protected routes: all app pages except landing, login, signup
- Users may only read/write their own library
- Accepted friends can view each other's **full library** (title, status, optional rating). Personal notes stay private to the owner
- Suggestions visible only to sender and recipient

### 4.2 Profile

| Field | Required | Notes |
|-------|----------|-------|
| username | Yes | 3–30 chars, unique, URL-safe; used for friend search |
| displayName | Yes | 2–50 chars |
| avatarUrl | No | Upload or Gravatar from email |
| bio | No | Max 160 chars |

### 4.3 Library entry

| Field | Type | Notes |
|-------|------|-------|
| userId | FK | Owner |
| tmdbId | int | TMDB identifier |
| mediaType | enum | `movie` \| `tv` |
| status | enum | `watching` \| `watched` \| `want_to_watch` |
| personalNote | string? | Private; max 500 chars |
| rating | int? | 1–10; optional per entry; **in V1** |

### 4.4 Suggestion

| Field | Type | Notes |
|-------|------|-------|
| senderId | FK | |
| recipientId | FK | Must be accepted friend |
| tmdbId + mediaType | | Title reference |
| message | string | 10–1000 chars; the personalized pitch |
| status | enum | `pending` \| `accepted` \| `dismissed` |

### 4.5 Friend request

| Field | Type | Notes |
|-------|------|-------|
| requesterId | FK | |
| recipientId | FK | |
| status | enum | `pending` \| `accepted` \| `declined` |

---

## 5. Data Model (Prisma)

```
User
  id, email, emailVerified, username, name, image, bio, createdAt, updatedAt

Account, Session, VerificationToken  (NextAuth)

FriendRequest
  id, requesterId, recipientId, status, createdAt, updatedAt
  @@unique([requesterId, recipientId])

Friendship
  id, userId, friendId, createdAt
  @@unique([userId, friendId])

Title (cached TMDB)
  id, tmdbId, mediaType, title, posterPath, releaseDate, overview, cachedAt
  @@unique([tmdbId, mediaType])

LibraryEntry
  id, userId, titleId, status, personalNote, rating, createdAt, updatedAt
  @@unique([userId, titleId])

Suggestion
  id, senderId, recipientId, titleId, message, status, createdAt, updatedAt

ActivityEvent
  id, actorId, type, payload (JSON), createdAt
  types: LIBRARY_ADD, LIBRARY_STATUS_CHANGE, SUGGESTION_SENT, SUGGESTION_ACCEPTED
```

---

## 6. API & Server Actions

V1 uses **Next.js App Router** with **Server Actions** for mutations and **Route Handlers** for external API proxy.

| Operation | Method | Auth |
|-----------|--------|------|
| `searchTitles(query)` | Server Action | Optional |
| `addToLibrary`, `updateLibraryEntry`, `removeFromLibrary` | Server Action | Required |
| `sendFriendRequest`, `respondToFriendRequest`, `unfriend` | Server Action | Required |
| `sendSuggestion`, `respondToSuggestion` | Server Action | Required |
| `getFeed`, `getLibrary`, `getSuggestions` | Server Component data / Server Action | Required |
| `GET /api/tmdb/search` | Route Handler | Rate-limited |
| `GET /api/tmdb/[type]/[id]` | Route Handler | Rate-limited |

**Validation:** Zod schemas colocated with each action.

**Errors:** Return `{ error: string, code: string }` — never leak stack traces to client.

---

## 7. External Integrations

### 7.1 TMDB API v3

- Server-side only; `TMDB_API_KEY` in env
- Search: `/search/multi` filtered to movie/tv
- Detail fetch on first library add; cache in `Title` table
- Poster images via TMDB CDN URLs (no local storage V1)

### 7.2 Email (required for V1)

- Email verification and password reset via Resend or similar
- Unverified email/password accounts cannot use protected app routes until they confirm

---

## 8. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 15 App (Vercel)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ App Router  │  │ Server       │  │ Route Handlers│  │
│  │ (RSC + UI)  │→ │ Actions      │  │ (TMDB proxy)  │  │
│  └─────────────┘  └──────┬───────┘  └───────┬───────┘  │
│                          │                   │          │
│                    ┌─────▼───────────────────▼─────┐    │
│                    │ Prisma ORM                     │    │
│                    └─────────────┬─────────────────┘    │
└──────────────────────────────────┼──────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ PostgreSQL (Neon / Supabase) │
                    └─────────────────────────────┘
```

**Colocation:** Feature folders under `src/features/{auth,library,friends,suggestions,feed}`.

**UI:** Tailwind CSS + shadcn/ui; dark mode support in V1.

---

## 9. Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing / marketing |
| `/login`, `/signup` | Auth |
| `/library` | User's watch library (default home after login) |
| `/library/[status]` | Filtered view |
| `/search` | TMDB search + add flow |
| `/friends` | Friend list, requests |
| `/friends/[userId]` | Friend profile + their full library |
| `/suggestions` | Inbox / sent |
| `/feed` | Activity feed |
| `/settings` | Profile edit |

---

## 10. Non-Functional Requirements

| Category | Target |
|----------|--------|
| Performance | LCP < 2.5s on 4G; TMDB search debounced 300ms |
| Security | OWASP basics; CSRF via NextAuth; rate limit auth endpoints |
| Accessibility | WCAG 2.1 AA for core flows |
| Testing | Vitest unit/integration; Playwright E2E for critical paths |
| Observability | Vercel Analytics; structured server logs |

---

## 11. Testing Strategy

**Critical E2E paths:**
1. Sign up → add title → verify in library
2. Send friend request → accept → view friend library
3. Send suggestion → accept → appears in Want to Watch

**Unit/integration:** Server Actions, Zod schemas, Prisma queries.

---

## 12. Deployment & Environments

| Env | Purpose |
|-----|---------|
| `development` | Local Postgres (Docker) |
| `preview` | Vercel preview per PR |
| `production` | Vercel + managed Postgres |

**Required env vars:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TMDB_API_KEY`, `RESEND_API_KEY` (or equivalent email provider key)

---

## 13. Success Metrics (V1)

| Metric | Target (first 8 weeks) |
|--------|--------------------------|
| Active friend group users | ≥ 5 (your core group) |
| Weekly library updates per user | ≥ 2 |
| Suggestions sent per week | ≥ 3 across group |
| Retention (4-week) | ≥ 60% of signups |

---

## 14. Resolved decisions (was Open Questions)

| # | Decision | Detail |
|---|----------|--------|
| 1 | Email verification **required** at launch | Email/password must verify before app access. Google OAuth counts as verified. |
| 2 | Friends see **full library** | Accepted friends see titles, statuses, and optional ratings. Personal notes remain private. No opt-in gate in V1. |
| 3 | Rating field **in V1** | Optional 1–10 on library entries (schema §4.3 / §5). |

---

## 15. Document History

| Date | Change |
|------|--------|
| 2026-08-23 | Resolved §14: email verify required; full friend library; ratings in V1 |
| 2026-08-23 | Humanized executive summary; doc audit and Notion sync |
| 2026-08-22 | Initial V1 spec draft |
