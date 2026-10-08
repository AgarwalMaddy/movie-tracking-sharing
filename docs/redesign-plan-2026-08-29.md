> **Retired 2026-09-19.** Not requirements. No Figma in the current workflow.

# Movie Tracking & Sharing — Visual Redesign Plan
**Date:** 2026-08-29  
**Status:** Retired  
**Scope:** Landing page, auth pages (login/signup), and foundational theme

---

## 1. Current State Analysis

### What We're Replacing
- **Color:** Warm paper (`oklch(0.985 0.008 95)`) + deep teal (`oklch(0.42 0.07 175)`)
  - Reads as productivity tool, not entertainment
  - Too bright/neutral for evening leisure usage
- **Landing page:** Generic gradient, centered text, basic CTAs
  - No personality or category signaling
  - No visual connection to movies/TV
- **Auth pages:** Plain white cards with standard forms
  - Transactional, not inviting
  - No brand presence

### What We Keep
- Product truth: personal library + friend suggestions with required messages
- Tech stack: Next.js 15, Tailwind, shadcn/ui, TMDB
- Existing features: auth (email + Google), library CRUD, friends, suggestions, feed
- Copy and CTAs (may refine for tone)

---

## 2. Reference Platform Analysis

### Letterboxd (letterboxd.com)
**What works:**
- Dark theme with orange accent (signature)
- Film strip motifs, poster grids
- Editorial typography (serif display)
- Community feels approachable, not corporate

### Dark.Design curated examples
**Patterns to adopt:**
- Deep backgrounds (`#0a0a0f` to `#141419` range)
- Glowing accents for interactive elements
- Translucent panels over content
- Subtle film grain or texture

### Mobbin — entertainment apps
**iOS/Android patterns:**
- Poster/card grids as primary navigation
- Bottom sheets for actions
- Large hero imagery
- Frosted glass materials

### Apple Design Principles (from skill)
**Motion fundamentals:**
- Springs for all transitions (damping 1.0 default, 0.8 for momentum)
- Interruptible animations
- Translucent materials with backdrop blur
- Immediate feedback on pointer-down

---

## 3. New Visual World

### Mode
- **Landing:** Persuade (visitor decides to sign up)
- **Auth pages:** Persuade (complete sign-up quickly, feel welcomed)
- **App interior:** Operate (logged-in user tracking/browsing)

### Color Strategy: **Committed Dark**

One saturated accent carries the brand; deep backgrounds create theater atmosphere.

#### Palette

```css
/* Backgrounds — Cinematic blacks with subtle warmth */
--background: oklch(0.12 0.01 260);        /* Deep navy-black */
--surface: oklch(0.16 0.015 260);          /* Raised panels */
--card: oklch(0.18 0.018 260);             /* Cards, modals */

/* Foreground */
--foreground: oklch(0.95 0.005 260);       /* Primary text */
--muted-foreground: oklch(0.6 0.02 260);   /* Secondary text */

/* Accent — Amber/Gold (movie awards, film reels, spotlight) */
--primary: oklch(0.72 0.16 65);            /* Warm gold */
--primary-foreground: oklch(0.15 0.02 65); /* Text on gold */

/* Supporting */
--accent: oklch(0.45 0.12 220);            /* Cool blue for secondary actions */
--destructive: oklch(0.62 0.24 25);        /* Red for dismissals */
--border: oklch(0.25 0.02 260);            /* Subtle borders */
--input: oklch(0.22 0.02 260);             /* Form inputs */

/* Materials */
--glass-bg: oklch(0.18 0.018 260 / 0.6);   /* Translucent panels */
--glass-blur: blur(24px) saturate(180%);    /* Backdrop filter */
```

**Rationale:**
- Dark backgrounds suit evening/leisure usage and reduce eye strain
- Gold accent evokes cinema (film awards, spotlights, vintage posters)
- Navy-black (not pure black) adds sophistication vs. flat #000
- Translucent materials create depth like Apple's UIs

### Typography

**Display (Headings, Hero):**
- **Primary choice:** `Syne` (800–900 weight)
  - Geometric with personality, not overused
  - Works at large scale, good tracking at display sizes
  - Available via Google Fonts
- **Fallback:** `Cabinet Grotesk` or `Clash Display` if licensing allows
- **Tracking:** `-0.02em` at display sizes, `-0.01em` at h2

**Body (UI, Copy):**
- **System stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- Respects platform conventions (SF Pro on Mac, Segoe on Windows)
- **Line height:** `1.6` for readability in paragraphs; `1.4` for UI labels
- **Weight:** 400 regular, 500 medium for emphasis, 700 bold for CTAs

**Mono (Metadata, Timestamps):**
- `Geist Mono` (already in project)
- For release years, runtime, "Sent 2h ago" labels
- Adds editorial precision

**Rejected alternatives:**
- Playfair/Cormorant/Lora: too editorial-magazine, not enough tech product
- Inter/DM Sans as display: training-data defaults
- Space Grotesk: overused in AI-generated sites

### Materials & Depth

Following Apple's translucent UI principles:

1. **Floating chrome** (nav, sheets, modals):
   - `background: var(--glass-bg)`
   - `backdrop-filter: var(--glass-blur)`
   - Content scrolls underneath

2. **Elevation system:**
   - Level 0: Page background
   - Level 1: Surface cards (subtle border)
   - Level 2: Raised panels (stronger border + shadow)
   - Level 3: Modals/sheets (heavy shadow + blur)

3. **Shadows:**
   ```css
   --shadow-sm: 0 2px 8px oklch(0.1 0 0 / 0.12);
   --shadow-md: 0 4px 16px oklch(0.08 0 0 / 0.18);
   --shadow-lg: 0 12px 40px oklch(0.06 0 0 / 0.3);
   ```

4. **Film grain texture** (optional, subtle):
   - 2% opacity noise overlay on hero sections only
   - PNG pattern or CSS `filter: contrast(1.02) brightness(0.98)`

---

## 4. Landing Page — Structure & Composition

### First Viewport (Hero)

**Thesis:** "Your movies. Their reasons." — shows the product mechanism immediately, not just mood.

**Composition:**

```
┌──────────────────────────────────────────────┐
│  [Logo]              [Sign In] [Get Started] │ ← Floating nav, translucent
├──────────────────────────────────────────────┤
│                                              │
│     Your library.                            │ ← Display (Syne 900, 64px)
│     Their suggestions.                       │   Tight tracking
│                                              │
│     Track what you watch and share           │ ← Body (20px, muted)
│     recommendations with the reason why.     │
│                                              │
│     [Get Started →]                          │ ← Primary CTA (gold)
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ [Animated poster grid or suggestion   │ │ ← Visual proof
│  │  card mockup showing "Why you'll      │ │   Shows the product working
│  │  love this" message]                  │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

**Visual elements:**
- **Background:** Deep gradient from `--background` to slightly lighter at bottom
- **Poster grid:** 4–6 real movie posters (TMDB API or curated set) in a tilted/scattered arrangement, subtle parallax on scroll
- **OR Suggestion card mockup:** Single large card showing:
  ```
  [Poster: The Grand Budapest Hotel]
  From: Alex
  "Perfect for your love of symmetrical shots and quirky humor. 
   Wes Anderson at his best."
  ```
- **No generic stock photos or lorem ipsum** — use real movie titles

### Section 2: Feature Showcase

Three columns (desktop) / stacked cards (mobile):

1. **Track Everything**
   - Icon: Film strip or check list
   - Copy: "Three simple statuses: Watching, Watched, Want to Watch. Add titles in seconds."
   
2. **Get Personal Recommendations**
   - Icon: Message bubble with heart
   - Copy: "Friends send suggestions with a note explaining why. No algorithms, just people."

3. **Stay in the Loop**
   - Icon: Activity feed
   - Copy: "See what your friends are watching. Discover through their activity."

**Visual treatment:**
- Each card: frosted glass background, hover → subtle scale(1.02) spring
- Icons: Custom illustrated (not generic Lucide icons) or sourced from icon set with personality
- Motion: Stagger entrance (100ms delay between cards)

### Section 3: Social Proof (Future — placeholder for now)

- Empty state message: "Join the beta. Be among the first."
- No fake testimonials or user counts

### Footer

Minimal: Privacy · Terms · GitHub · Made with ❤️ in [Location]

---

## 5. Auth Pages — Visual Treatment

### Shared Layout

```
┌──────────────────────────────────────────────┐
│  [← Back]                                    │ ← Top-left corner, subtle
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────┐  ┌───────────────┐│
│  │                     │  │               ││
│  │  [Form card]        │  │  [Visual      ││ ← Split layout (desktop)
│  │                     │  │   panel]      ││   Single column (mobile)
│  │                     │  │               ││
│  └─────────────────────┘  └───────────────┘│
│                                              │
└──────────────────────────────────────────────┘
```

### Auth Flow (Desktop-first)

```
Landing Page
  ├─ Get Started → Signup
  └─ Sign In → Login
Login
  ├─ Email + Password → Sign In
  ├─ Continue with Google
  └─ Create an account → Signup
Signup
  ├─ Name, Email, Password, Confirm Password → Create Account
  ├─ Continue with Google
  └─ Already have an account? → Login
```

### Login Page

**Left panel (60% width, desktop):**
- Title: "Welcome back" (Display, 40px)
- Email input (with label)
- Password input (with show/hide toggle)
- [Sign In] button (primary gold)
- Divider: "Or continue with"
- [Google icon] Google button (outline, white)
- Error messages: amber border + icon
- Footer link: "Don't have an account? Create an account"

**Right panel (40% width, desktop):**
- Blurred poster collage background
- Overlay text: Movie quote or tagline
  - Example: "The stuff that dreams are made of." — The Maltese Falcon
- Subtle animation: posters fade/crossfade every 8s

### Signup Page

**Same split layout, adjusted:**
- Title: "Create an account"
- Fields: Name, Email, Password, Confirm Password
- [Create Account] button (primary gold)
- Divider + Continue with Google
- Footer link: "Already have an account? Sign in"

**Visual panel quote:** Different quote, e.g., "Here's looking at you, kid." — Casablanca

---

## 6. Motion Principles

Following Apple Design skill + Emil Kowalski principles:

### Core Rules

1. **Default spring:** `damping: 1.0, response: 0.3s` (critically damped, no overshoot)
2. **Momentum interactions:** `damping: 0.8, response: 0.3s` (slight bounce for flicks/drags)
3. **Instant feedback:** Button press shows scale(0.97) on pointer-down, not click
4. **Interruptible:** All animations can be reversed mid-flight

### Specific Animations

| Element | Trigger | Animation | Values |
|---------|---------|-----------|--------|
| CTA buttons | Hover | Scale + glow | `scale(1.02)`, `box-shadow` fade-in 150ms |
| CTA buttons | Active | Press feedback | `scale(0.97)`, 100ms ease-out |
| Feature cards | Entrance | Stagger fade-up | Opacity 0→1, y: 20→0, spring, 100ms stagger |
| Poster grid | Scroll | Subtle parallax | `translateY` at 0.3x scroll speed |
| Form inputs | Focus | Border glow | Gold border 200ms ease, no bounce |
| Modals/sheets | Enter | Scale + fade | From 95% scale, spring damping 0.85 |
| Navigation | Scroll | Blur on scroll | Backdrop blur increases 20→32px |

### Accessibility

- `@media (prefers-reduced-motion: reduce)`: Replace all springs/slides with 200ms opacity fades
- `@media (prefers-reduced-transparency: reduce)`: Solid backgrounds, no blur
- All interactive elements: 44px min touch target (mobile)

---

## 7. Figma Frames Plan (Desktop-first)

### Frames to Create

1. **Landing — Desktop (1440×900)**
   - Hero section (first viewport)
   - Animated iconic-classic poster grid
   - Feature showcase + footer
   - CTAs: Get Started → Signup, Sign In → Login

2. **Login — Desktop (1440×900)**
   - Split layout: form left (60%), quote + posters right (40%)
   - Email, Password, Sign In, Continue with Google
   - Link: Create an account → Signup

3. **Signup — Desktop (1440×900)**
   - Same split layout
   - Name, Email, Password, Confirm Password
   - Create Account + Continue with Google
   - Link: Sign in → Login

Mobile frames are deferred until desktop is approved.

### Assets Needed

**Posters (real TMDB sourced or curated set):**
- The Grand Budapest Hotel
- Parasite
- The Dark Knight
- Spirited Away
- Mad Max: Fury Road
- Everything Everywhere All at Once

**Icons:**
- Film strip (for "Track Everything")
- Message/chat bubble (for "Recommendations")
- Activity/feed icon
- Google logo (already have as `google-icon.tsx`)

**Typography specimens:**
- Syne: 900 weight at 64px, 48px, 32px
- System stack body samples

### Color Swatches in Figma

```
Backgrounds: #1a1a24, #26262f, #2d2d37
Gold accent: #e0a835
Blue accent: #3a5a8c
Text: #f2f2f5, #99999f
```

---

## 8. Implementation Plan (Post-Approval)

### Phase 1: Foundation (Theme tokens)
- Update `globals.css` with new palette
- Add glass/blur utility classes
- Typography tokens (Syne via Google Fonts + system stack)

### Phase 2: Landing Page
- New hero composition with poster grid
- Feature showcase cards
- Motion (springs via Framer Motion)
- Responsive mobile layout

### Phase 3: Auth Pages
- Split layout component
- Visual panel with quote rotation
- Form styling (focus states, validation)
- Back button integration

### Phase 4: Polish
- Film grain texture (optional)
- Poster parallax
- Navigation blur on scroll
- Reduced-motion media queries

### Phase 5: Design System Documentation
- Run `$impeccable document` to generate DESIGN.md from built world
- Record token values, component patterns, motion presets

---

## 9. Approved Decisions

1. **Poster selection:** ✓ Iconic classics (Casablanca, The Godfather, Citizen Kane, Vertigo, Singin' in the Rain, 2001: A Space Odyssey)
2. **Film grain texture:** ✓ Omit — cleaner presentation, better performance
3. **Auth visual panel:** ✓ Movie quotes + poster collage
4. **Landing poster grid:** ✓ Animated (crossfade between posters, subtle entrance animations)

---

## 10. Success Criteria

**Landing page:**
- First-time visitor understands "track + suggest" within 5 seconds
- Clear primary CTA (Get Started)
- Feels distinctly "movie platform," not generic SaaS

**Auth pages:**
- Welcoming, not transactional
- Google SSO visually prominent
- Desktop split layout reads clearly; form usable without clutter

**Overall theme:**
- Dark theme reduces eye strain during evening usage
- Gold accent feels premium/cinematic
- Motion feels fluid, never janky

---

## 11. Mockups — Status

**Figma file:** [Movie Tracking & Sharing — V1 Redesign](https://www.figma.com/design/fFD6zTO1rq7lLRRunILPMh)

**Blocked:** Figma MCP Starter plan rate limit. Cannot write more frames until the limit resets or the plan is upgraded.

**HTML desktop mockups (review now):** `docs/mockups/desktop/index.html`

| Screen | Size | Status |
|--------|------|--------|
| Landing | 1440×900 | ✓ HTML mockup (clickable flow) |
| Login | 1440×900 | ✓ HTML mockup — Email, Password, Google, Create an account |
| Signup | 1440×900 | ✓ HTML mockup — Name, Email, Password, Confirm Password, Google |

**Existing in Figma (partial / outdated):** Landing Desktop, Landing Mobile, Login Desktop — will be replaced with the approved desktop-only set when Figma writes are available again.

**Next Step:** Review the HTML mockups in a browser. Once Figma quota resets (or after a plan upgrade), sync the three desktop screens into the Figma file for final sign-off before coding.
