# Phase 1: Access & Design Foundation - Research

**Researched:** 2026-05-17
**Domain:** Static site password gating, CSS design systems, responsive multi-page shell
**Confidence:** HIGH

## Summary

Phase 1 replaces the existing Supabase magic link gate with a client-side password system that auto-detects guest tier, establishes a warm/sunset visual design system using CSS custom properties, and creates a responsive multi-page shell with navigation across six sections. The entire site runs client-side on GitHub Pages with no build step — all implementation is vanilla HTML, CSS, and JavaScript.

The primary technical challenges are: (1) sharing authentication state across separate HTML pages using localStorage, (2) establishing a maintainable CSS design system without a preprocessor or build tools, and (3) building responsive navigation for six section links that works well from iPhone SE (375px) to desktop. None of these are novel problems — standard web platform APIs handle all of them without external libraries.

**Primary recommendation:** Use a single shared `styles.css` for the design system and a shared `auth.js` for password gate logic, loaded via relative `<link>` and `<script>` tags on every page. Hash passwords with SHA-256 via the Web Crypto API to avoid plaintext in source. Store the authenticated tier in localStorage and check it on every page load.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Warm welcome approach — couple's names, a photo of Natalie & Arash, and a playful tagline displayed above the password field. The landing page should feel like arriving at a doorstep, not hitting a locked gate.
- **D-02:** Hero visual is a couple photo (use a placeholder image for now; real photo will be swapped in later).
- **D-03:** Tagline/copy tone is playful and fun — cheeky, personality-forward (e.g., "You're invited to the party"), not corporate or overly sentimental.
- **D-04:** Sunset warm tones — terracotta, golden yellow, dusty rose, warm cream as the core palette. Earthy and romantic, like a golden hour.
- **D-05:** Playful personality expressed through subtle warmth — rounded corners, soft shadows, warm background colors, gentle hover effects. NOT through overt decoration like doodles or illustrations.
- **D-06:** No specific design references or inspiration sites to follow. The sunset warm + subtle warmth direction is sufficient guidance.
- **D-07:** Multi-page structure — separate HTML files per section under `narsh2026/`. Each section gets its own page and URL.
- **D-08:** All six sections appear in navigation from day one: Our Story, Our People, Puzzles, Schedule, Venue & Travel, Dress Code. Unbuilt sections show a friendly "Coming soon" placeholder page.
- **D-09:** Section labels confirmed: "Our Story" (map timeline), "Our People" (guest graph), "Puzzles" (puzzle page), "Schedule" (events), "Venue & Travel" (logistics), "Dress Code" (attire guidance).
- **D-10:** Single password field — auto-detects which tier based on which password was entered. Guests don't know there are two tiers.
- **D-11:** Access persists indefinitely via localStorage. Once a guest enters the correct password, they don't need to enter it again.
- **D-12:** Wrong password gets a playful nudge (e.g., "Hmm, that's not it — check your invitation!") matching the warm, fun tone.
- **D-13:** Use placeholder passwords during development (e.g., "day2guest" and "fullaccess"). Real passwords will be swapped in before launch.

### Claude's Discretion
- Post-password transition approach (smooth reveal vs page redirect — pick whichever works best for the multi-page static site)
- Typography selection (pick a font pairing that complements the sunset warm palette)
- Mobile navigation pattern (hamburger menu vs bottom tab bar vs other approach)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACC-01 | Guest can enter a password on the landing page to access the site | Password gate pattern with SHA-256 hashing, localStorage persistence, shared auth.js |
| ACC-02 | Day 2 password shows Day 2 event info; full-access password shows all days | Two-tier localStorage value ("day2" vs "full"), tier-aware content visibility via CSS classes and JS |
| ACC-03 | Navigation menu allows moving between site sections | Responsive nav component in shared styles, hamburger menu on mobile, 6 section links |
| ACC-04 | All pages render well on mobile devices (responsive from day one) | CSS custom properties, fluid typography, mobile-first media queries, tested at 375px (iPhone SE) |
| ACC-05 | Warm, playful, colorful visual design foundation and shared styles | Sunset warm color palette in CSS custom properties, Google Fonts typography, shared styles.css |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Password gate & tier detection | Browser / Client | -- | Static site has no server; all auth logic runs client-side with localStorage |
| Design system (colors, typography, spacing) | Browser / Client (CSS) | -- | CSS custom properties in a shared stylesheet, no preprocessor |
| Responsive navigation | Browser / Client | -- | HTML nav element + CSS media queries + minimal JS for mobile toggle |
| Content tier visibility | Browser / Client (JS) | -- | Shared JS reads localStorage tier and toggles CSS classes on tier-gated elements |
| Page routing | CDN / Static (GitHub Pages) | -- | Each section is a separate HTML file; GitHub Pages serves them as static assets |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla HTML5 | N/A | Page structure | Project constraint: no frameworks, no build step [VERIFIED: CLAUDE.md, STACK.md] |
| Vanilla CSS3 | N/A | Styling via shared stylesheet + CSS custom properties | Project constraint: no preprocessors [VERIFIED: CLAUDE.md] |
| Vanilla JavaScript (ES2020+) | N/A | Auth gate logic, nav toggle, tier visibility | Project constraint: no modules/bundlers [VERIFIED: CLAUDE.md] |
| Web Crypto API | Built-in | SHA-256 password hashing via `crypto.subtle.digest()` | Built into all modern browsers, no library needed [ASSUMED] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts | CDN | Custom typography (Playfair Display + Source Sans 3) | Load via `<link>` in `<head>` of every page [ASSUMED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shared CSS file | Inline `<style>` per page (current pattern) | Inline styles prevent reuse; shared file enables design system consistency across 7+ pages |
| SHA-256 hashing | Plaintext password comparison | Plaintext exposes passwords in source view; SHA-256 adds minimal obscurity appropriate for a "polite lock" |
| Google Fonts CDN | Self-hosted font files | CDN is simpler (no build step), faster first load via Google's cache; self-hosted avoids third-party dependency |
| Hamburger menu | Bottom tab bar | Tab bar works for 3-5 items but 6 sections is too many; hamburger scales better and is the web standard |

**Installation:**
```
No npm install needed. All dependencies are loaded via CDN <link> and <script> tags.
```

## Architecture Patterns

### System Architecture Diagram

```
Guest arrives at arashrai.com/narsh2026/
        |
        v
  [Landing Page HTML]
        |
        v
  auth.js checks localStorage
        |
    +---+---+
    |       |
  stored  no stored
  tier     tier
    |       |
    v       v
  Show    Show
  content password
  (skip    gate
  gate)     |
            v
      Guest enters
      password
            |
            v
      auth.js hashes input
      with SHA-256
            |
        +---+---+
        |       |
    matches  matches
    day2     full
    hash     hash
        |       |
        v       v
    store    store
    "day2"   "full"
    in LS    in LS
        |       |
        +---+---+
            |
            v
      Redirect to
      main content
      page
            |
            v
   [Any Section Page]
            |
            v
      auth.js checks
      localStorage tier
            |
        +---+---+
        |       |
    no tier  has tier
        |       |
        v       v
    redirect  show page,
    to gate   apply tier
    page      visibility
              rules
```

### Recommended Project Structure

```
narsh2026/
├── index.html              # Landing page with password gate (ACC-01)
├── styles.css              # Shared design system (ACC-05)
├── auth.js                 # Shared password gate + tier logic (ACC-01, ACC-02)
├── nav.js                  # Mobile navigation toggle (ACC-03)
├── our-story/
│   └── index.html          # "Our Story" placeholder (ACC-03)
├── our-people/
│   └── index.html          # "Our People" placeholder (ACC-03)
├── puzzles/
│   └── index.html          # "Puzzles" placeholder (ACC-03)
├── schedule/
│   └── index.html          # "Schedule" placeholder (ACC-03)
├── venue-travel/
│   └── index.html          # "Venue & Travel" placeholder (ACC-03)
└── dress-code/
    └── index.html          # "Dress Code" placeholder (ACC-03)
```

Each section page is a subdirectory with an `index.html` so that URLs are clean (e.g., `arashrai.com/narsh2026/our-story/` instead of `arashrai.com/narsh2026/our-story.html`). GitHub Pages serves `index.html` by default for directory URLs. [VERIFIED: GitHub Pages behavior from existing `narsh2026/index.html` pattern]

### Pattern 1: Client-Side Password Gate with SHA-256

**What:** Hash the two tier passwords with SHA-256 at build time (store the hex digest as constants in auth.js). On form submit, hash the user's input with `crypto.subtle.digest()` and compare against the stored hashes. Store the tier string (not the password) in localStorage.

**When to use:** On the landing page (narsh2026/index.html) where the password form lives.

**Example:**
```javascript
// Source: Web Crypto API [ASSUMED — standard browser API]
const TIER_HASHES = {
  // SHA-256 of "day2guest" and "fullaccess" (placeholder passwords)
  "day2": "HASH_OF_DAY2_PASSWORD_HERE",
  "full": "HASH_OF_FULL_PASSWORD_HERE"
};

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

const checkPassword = async (input) => {
  const hashed = await hashPassword(input.trim().toLowerCase());
  for (const [tier, expectedHash] of Object.entries(TIER_HASHES)) {
    if (hashed === expectedHash) {
      localStorage.setItem("narsh-tier", tier);
      return tier;
    }
  }
  return null;
};
```

### Pattern 2: Tier-Aware Content Visibility

**What:** On every page, auth.js reads `localStorage.getItem("narsh-tier")`. If no tier, redirect to the gate page. If a tier exists, apply visibility rules: elements with `data-tier="full"` are only shown when the stored tier is "full". Day 2 content is visible to both tiers.

**When to use:** On every section page and on the schedule/info pages in Phase 5 where content differs by tier.

**Example:**
```javascript
// Source: Standard DOM API [ASSUMED]
const initAuth = () => {
  const tier = localStorage.getItem("narsh-tier");
  if (!tier) {
    window.location.href = "/narsh2026/";
    return;
  }

  // Hide full-access-only content for day2 guests
  if (tier === "day2") {
    document.querySelectorAll("[data-tier='full']").forEach(el => {
      el.style.display = "none";
    });
  }
};

// Run on DOM ready
document.addEventListener("DOMContentLoaded", initAuth);
```

### Pattern 3: CSS Custom Properties Design System

**What:** Define all design tokens (colors, spacing, typography, border-radius, shadows) as CSS custom properties on `:root`. Every component references these variables. This enables consistent theming across all pages via a single `styles.css` file.

**When to use:** In the shared `styles.css` loaded by every page.

**Example:**
```css
/* Source: CSS Custom Properties specification [ASSUMED] */
:root {
  /* Colors — Sunset Warm Palette (D-04) */
  --color-terracotta: #C2704F;
  --color-golden: #D4A843;
  --color-dusty-rose: #C9928E;
  --color-cream: #FFF8F0;
  --color-warm-white: #FFFDFB;
  --color-text-primary: #3D2B1F;
  --color-text-secondary: #6B4F3A;

  /* Typography */
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-base: 17px;
  --font-size-sm: 14px;
  --font-size-lg: 20px;
  --font-size-xl: 28px;
  --font-size-2xl: 40px;
  --line-height-body: 1.6;
  --line-height-heading: 1.2;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  /* Shape (D-05: rounded corners, soft shadows) */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-soft: 0 2px 8px rgba(61, 43, 31, 0.08);
  --shadow-medium: 0 4px 16px rgba(61, 43, 31, 0.12);

  /* Transitions (D-05: gentle hover effects) */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Pattern 4: Responsive Navigation (Hamburger)

**What:** A `<nav>` element with 6 links, displayed as a horizontal bar on desktop (>768px) and collapsed into a hamburger icon with slide-in overlay on mobile. A small `nav.js` toggles the `.nav-open` class on the body.

**When to use:** Included in every section page's HTML.

**Example (HTML):**
```html
<!-- Source: Standard responsive nav pattern [ASSUMED] -->
<header class="site-header">
  <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false">
    <span class="nav-toggle-icon"></span>
  </button>
  <nav class="site-nav" id="site-nav">
    <a href="/narsh2026/our-story/">Our Story</a>
    <a href="/narsh2026/our-people/">Our People</a>
    <a href="/narsh2026/puzzles/">Puzzles</a>
    <a href="/narsh2026/schedule/">Schedule</a>
    <a href="/narsh2026/venue-travel/">Venue & Travel</a>
    <a href="/narsh2026/dress-code/">Dress Code</a>
  </nav>
</header>
```

### Pattern 5: Post-Password Transition (Discretion Decision)

**Recommendation: Page redirect, not smooth reveal.**

Rationale: Since the site uses separate HTML files per section (D-07), the natural flow after password entry is to redirect to a "home" or "hub" page that has the navigation and content. A smooth reveal on the landing page would only show content that also exists on section pages — creating redundancy. The gate page should be a single-purpose password entry page. After successful password entry, redirect to the first content page (or a hub/welcome page within `narsh2026/`).

The landing page (`narsh2026/index.html`) serves dual duty: it is the gate for unauthenticated users and could show a welcome/hub for authenticated users. This avoids an extra page and keeps the URL clean. After successful password, the gate div hides and the welcome content with navigation appears — but this is a full page replacement, not a partial reveal of gated sections.

### Anti-Patterns to Avoid

- **Storing the password itself in localStorage:** Store only the tier string ("day2" or "full"). The password has no reason to persist. [ASSUMED]
- **Hardcoding tier checks on every page individually:** Centralize in `auth.js`. Each page only needs to include the shared script. [ASSUMED]
- **Duplicating navigation HTML in every file without a pattern:** Create a consistent header/nav HTML structure. Since there's no build step or templating, the nav HTML will be duplicated per page — but it should be identical across files for maintainability. [VERIFIED: no build step constraint from STACK.md]
- **Using `!important` in CSS:** Design tokens via custom properties eliminate the need for specificity overrides. [ASSUMED]
- **Blocking render with font loading:** Use `font-display: swap` in the Google Fonts URL to prevent invisible text during font load. [ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font hosting | Self-host and manage font files | Google Fonts CDN | Handles subsetting, caching, format negotiation; zero maintenance |
| SHA-256 hashing | Import a crypto library | Web Crypto API (`crypto.subtle.digest`) | Built into every modern browser; no dependency needed |
| Responsive breakpoints | Custom viewport detection JS | CSS media queries | Native browser feature; JS-based detection is fragile and unnecessary |
| Scroll behavior | Custom scroll animation JS | CSS `scroll-behavior: smooth` | Native CSS property; works for anchor links without JS |

**Key insight:** This project's "no build step, no framework" constraint means leaning heavily on native web platform features. Modern CSS and browser APIs cover all needs for this scope without any external dependencies beyond Google Fonts.

## Common Pitfalls

### Pitfall 1: localStorage Not Available (Private Browsing)
**What goes wrong:** Safari private browsing used to throw errors on `localStorage.setItem()`. Modern Safari (15+) allows it but clears on session end. Some browsers in strict privacy mode may still restrict it.
**Why it happens:** Privacy-focused browser modes limit persistent storage.
**How to avoid:** Wrap localStorage calls in a try/catch. If localStorage fails, fall back to sessionStorage (cleared on tab close) or a module-scoped variable (cleared on navigation — poor UX for multi-page but functional).
**Warning signs:** Password works but user is prompted again on every page visit in private browsing.

### Pitfall 2: Password Gate Flicker (FOUC for Auth)
**What goes wrong:** On section pages, the HTML content renders briefly before auth.js redirects unauthenticated users. Guests see a flash of gated content.
**Why it happens:** The script runs after HTML parses; there's a timing gap.
**How to avoid:** Add a CSS class on `<body>` (e.g., `class="auth-pending"`) that hides main content by default. auth.js removes this class after confirming the tier. The CSS rule `body.auth-pending main { visibility: hidden; }` prevents the flash. Use `visibility: hidden` (not `display: none`) so layout is stable when content appears.
**Warning signs:** Brief content flash on page load before redirect.

### Pitfall 3: Relative Path Breakage in Nested Directories
**What goes wrong:** CSS/JS paths break when pages are at different directory depths. `styles.css` referenced as `./styles.css` from `narsh2026/our-story/index.html` looks for `narsh2026/our-story/styles.css` instead of `narsh2026/styles.css`.
**Why it happens:** Relative paths resolve from the current HTML file's directory.
**How to avoid:** Use root-relative paths (`/narsh2026/styles.css`) or consistent relative paths from each page depth (`../styles.css` from subdirectory pages, `./styles.css` from root `narsh2026/index.html`). Root-relative paths are cleaner and less error-prone.
**Warning signs:** Styles or auth not loading on section pages while working on the landing page.

### Pitfall 4: Google Fonts Performance Impact
**What goes wrong:** Loading multiple font weights blocks rendering or causes layout shift.
**Why it happens:** Default Google Fonts loading blocks text rendering until fonts download.
**How to avoid:** (1) Use `&display=swap` in the Google Fonts URL. (2) Limit to 2-3 font weights total (e.g., Playfair Display 400+700, Source Sans 3 400+600). (3) Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` before the font stylesheet link.
**Warning signs:** Invisible text on slow connections; layout jumps when fonts load.

### Pitfall 5: Hamburger Menu Accessibility
**What goes wrong:** Screen readers can't navigate the hamburger menu; keyboard users can't open/close it.
**Why it happens:** Custom button elements without ARIA attributes and keyboard event handlers.
**How to avoid:** Use a `<button>` (not `<div>`) for the toggle. Set `aria-expanded="false|true"` and `aria-controls="site-nav"`. Handle Escape key to close. Trap focus inside the open nav on mobile.
**Warning signs:** Menu toggle doesn't respond to keyboard; screen reader doesn't announce state.

### Pitfall 6: CSS Custom Properties Not Supported
**What goes wrong:** Very old browsers (IE 11) don't support CSS custom properties.
**Why it happens:** IE 11 lacks CSS custom property support entirely.
**How to avoid:** This is a non-issue for a 2026 wedding site. CSS custom properties are supported by 97%+ of browsers. IE 11 global usage is effectively zero. No fallback needed.
**Warning signs:** None expected.

## Code Examples

### Landing Page Password Form (ACC-01, D-01, D-02, D-03)
```html
<!-- Source: Project decisions D-01 through D-03 [VERIFIED: CONTEXT.md] -->
<main class="gate-page">
  <div class="gate-hero">
    <img src="/narsh2026/images/couple-placeholder.jpg"
         alt="Natalie and Arash"
         class="hero-photo">
    <h1>Natalie & Arash</h1>
    <p class="tagline">You're invited to the party.</p>
  </div>
  <form id="password-form" class="gate-form">
    <input id="password-input"
           type="password"
           placeholder="Enter your password"
           autocomplete="off"
           required>
    <button type="submit">Let's go</button>
  </form>
  <p id="gate-status" class="gate-status" aria-live="polite"></p>
</main>
```

### Shared Auth Script Structure (ACC-01, ACC-02)
```javascript
// auth.js — loaded on every page
// Source: Architecture pattern [ASSUMED]

const NARSH_AUTH = (() => {
  const STORAGE_KEY = "narsh-tier";
  const GATE_URL = "/narsh2026/";

  // Pre-computed SHA-256 hashes of tier passwords
  const TIER_HASHES = {
    // These will be replaced with real password hashes before launch
    "day2": "PLACEHOLDER_HASH_DAY2",
    "full": "PLACEHOLDER_HASH_FULL"
  };

  const hashPassword = async (password) => {
    const data = new TextEncoder().encode(password.trim().toLowerCase());
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const getTier = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const setTier = (tier) => {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch {
      // Private browsing fallback: tier persists only for this page
    }
  };

  const requireAuth = () => {
    const tier = getTier();
    if (!tier) {
      window.location.href = GATE_URL;
    }
    return tier;
  };

  const checkPassword = async (input) => {
    const hashed = await hashPassword(input);
    for (const [tier, expectedHash] of Object.entries(TIER_HASHES)) {
      if (hashed === expectedHash) {
        setTier(tier);
        return tier;
      }
    }
    return null;
  };

  const applyTierVisibility = (tier) => {
    if (tier === "day2") {
      document.querySelectorAll("[data-tier='full']").forEach(el => {
        el.style.display = "none";
      });
    }
    document.body.classList.remove("auth-pending");
  };

  return { getTier, setTier, requireAuth, checkPassword, applyTierVisibility, hashPassword };
})();
```

### Google Fonts Loading (ACC-05)
```html
<!-- Source: Google Fonts usage pattern [ASSUMED] -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/narsh2026/styles.css">
```

### Placeholder Section Page Template
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Story — Narsh 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/narsh2026/styles.css">
  </head>
  <body class="auth-pending">
    <header class="site-header">
      <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false">
        <span class="nav-toggle-icon"></span>
      </button>
      <nav class="site-nav" id="site-nav">
        <a href="/narsh2026/our-story/" class="active">Our Story</a>
        <a href="/narsh2026/our-people/">Our People</a>
        <a href="/narsh2026/puzzles/">Puzzles</a>
        <a href="/narsh2026/schedule/">Schedule</a>
        <a href="/narsh2026/venue-travel/">Venue & Travel</a>
        <a href="/narsh2026/dress-code/">Dress Code</a>
      </nav>
    </header>
    <main class="page-content">
      <h1>Our Story</h1>
      <p class="coming-soon">Coming soon — we're working on something special.</p>
    </main>
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) NARSH_AUTH.applyTierVisibility(tier);
    </script>
  </body>
</html>
```

## Discretion Recommendations

### Typography: Playfair Display + Source Sans 3
**Recommendation:** Use **Playfair Display** (serif) for headings and **Source Sans 3** (sans-serif) for body text. [ASSUMED]

**Rationale:** Playfair Display is a transitional serif with high contrast and elegant curves — it pairs naturally with warm, romantic palettes and feels celebratory without being fussy. Source Sans 3 (the renamed/updated version of Source Sans Pro by Adobe) is a clean, highly readable sans-serif that complements Playfair's personality without competing with it. Both are freely available on Google Fonts.

**Weights to load:** Playfair Display 400 (body quotes/accents) and 700 (headings). Source Sans 3 400 (body) and 600 (semibold for labels/buttons). Four weights total — minimal performance impact.

**Alternative considered:** Cormorant Garamond + Montserrat. Cormorant is more dramatic but harder to read at small sizes on mobile. Lora + Inter is warmer but less distinctive.

### Mobile Navigation: Hamburger with Overlay
**Recommendation:** Use a hamburger icon (`<button>`) that toggles a full-screen overlay nav on mobile (below 768px). On desktop, the nav displays as a horizontal bar in the header. [ASSUMED]

**Rationale:** Six navigation items is too many for a bottom tab bar (which works best for 3-5 items). A hamburger with an overlay is the standard pattern for content-focused sites with more than 4-5 nav items. The overlay provides generous tap targets on mobile and a clear "close" action. The hamburger icon is universally recognized.

### Post-Password Transition: Redirect to Welcome View
**Recommendation:** After successful password entry on `narsh2026/index.html`, replace the gate UI with a welcome screen that includes the navigation and a brief welcome message. This keeps the user on the same URL but transforms the page content. Subsequent visits (with localStorage set) skip the gate entirely and show the welcome view directly.

**Rationale:** A redirect to a separate page would change the URL, and the landing page URL (`/narsh2026/`) is the most natural "home" for the wedding site. Keeping authenticated users on this URL while showing different content (welcome vs gate) is cleaner than having a separate `/narsh2026/home/` page. The existing code already uses this pattern with the `#gate` / `#content` div toggle.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| System font stack | Google Fonts with `display=swap` and `preconnect` | ~2019+ widely adopted | Better typography with minimal performance cost |
| Inline `<style>` per page | Shared CSS file with custom properties | CSS Custom Properties: supported since ~2017 | Design consistency across multi-page sites |
| Supabase magic link auth | Client-side password with SHA-256 hash | Project decision (D-10) | Simpler UX, no third-party dependency, appropriate for wedding "polite lock" |
| `var()` fallbacks needed | CSS custom properties universal support | IE 11 EOL (June 2022) | No fallback CSS needed for modern browsers |

**Deprecated/outdated:**
- **Supabase magic link system**: Being replaced by password gate per project decisions. Remove `@supabase/supabase-js` CDN reference and all Supabase-related code. [VERIFIED: CONTEXT.md decisions]
- **Inline styles per page**: Moving to shared `styles.css`. Individual pages should not define custom `<style>` blocks except for page-specific overrides that don't fit in the shared system. [VERIFIED: Code context from CONTEXT.md]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes (limited) | Client-side password comparison — this is a "polite lock", not a security boundary. Passwords are SHA-256 hashed to avoid plaintext in source, but determined users can bypass by reading localStorage or JS source. Acceptable for a wedding site. |
| V3 Session Management | No | localStorage persistence is not a session; it's a convenience store. No session tokens, no expiry needed per D-11. |
| V4 Access Control | Yes (limited) | Tier-based content visibility via CSS/JS. Content is in the HTML source regardless — this is UI-level gating, not server-enforced access control. Acceptable for a wedding site. |
| V5 Input Validation | Yes | Sanitize password input (trim, lowercase). No user-generated content is rendered, so XSS risk is minimal. |
| V6 Cryptography | No | SHA-256 is used for obscurity, not security. No secrets to protect beyond "polite" passwords. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Password visible in page source | Information Disclosure | SHA-256 hash stored instead of plaintext; determined users can still reverse common passwords but casual viewing won't reveal them |
| Content visible in HTML source despite gate | Information Disclosure | Accepted tradeoff for static site. Wedding content is not sensitive. Server-side rendering would solve this but violates project constraints. |
| localStorage manipulation | Tampering | Tier values are simple strings; a user could set `narsh-tier=full` manually. Acceptable for wedding site — no security-critical content. |

**Security posture note:** This is a wedding website, not a financial application. The password gate is a user experience feature (making guests feel like they have a personal invitation) rather than a security boundary. The decisions (D-10 through D-13) explicitly accept this model. No additional security measures are warranted.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `crypto.subtle.digest("SHA-256", ...)` is available in all modern browsers including mobile Safari | Standard Stack, Pattern 1 | Password hashing would fail; fallback to plaintext comparison (low impact for wedding site) |
| A2 | Playfair Display and Source Sans 3 are available on Google Fonts | Discretion Recommendations | Would need to choose different fonts; low impact, many alternatives |
| A3 | Google Fonts `display=swap` and `preconnect` patterns work as described | Code Examples | Font loading might block render; fixable with alternative loading strategy |
| A4 | GitHub Pages serves `index.html` for directory URLs automatically | Architecture Patterns | Clean URLs would break; fixable by using `.html` extensions instead |
| A5 | CSS `visibility: hidden` prevents auth flicker while maintaining layout | Common Pitfalls | FOUC may still occur; alternative is to use `display: none` and accept layout shift |
| A6 | Six navigation items work well in a hamburger menu overlay on mobile | Discretion Recommendations | If too many for overlay, could use accordion or scrollable nav |

## Open Questions

1. **Placeholder image for hero photo (D-02)**
   - What we know: A couple photo placeholder is needed for the landing page
   - What's unclear: Should we use a solid color block, a generic placeholder image, or an SVG illustration as the placeholder?
   - Recommendation: Use a warm-toned gradient or solid `--color-dusty-rose` rectangle with the couple's initials ("N & A") as the placeholder. This matches the design language and is zero-dependency.

2. **Password hash generation workflow**
   - What we know: SHA-256 hashes of placeholder passwords need to be in `auth.js`
   - What's unclear: How to generate them without a build step
   - Recommendation: Compute the hashes once using Node.js or the browser console and paste them as string constants in `auth.js`. Include the one-liner command in the code comments for when passwords change before launch.

3. **Favicon update**
   - What we know: There's an existing `favicon.ico` in the repo root
   - What's unclear: Whether it should be updated to match the new warm design
   - Recommendation: Defer to a later phase or handle ad-hoc. The existing favicon works and doesn't block any requirements.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Hash generation helper (one-time) | Yes | v26.0.0 | Browser console `crypto.subtle.digest()` |
| Git | Version control | Yes | 2.50.1 | -- |
| Google Fonts CDN | Typography (runtime) | Assumed available | -- | System font stack fallback in CSS |
| GitHub Pages | Hosting (deploy) | Yes (existing) | -- | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None. All dependencies are either already available or are runtime CDN resources.

## Project Constraints (from CLAUDE.md)

These directives from CLAUDE.md constrain implementation and the planner must verify compliance:

1. **No build step:** Edit HTML/JS directly, push to main, GitHub Pages deploys. No bundlers, transpilers, or preprocessors. [VERIFIED: CLAUDE.md]
2. **Indentation:** 2 spaces for HTML and JS. [VERIFIED: CLAUDE.md]
3. **Quotes:** Double quotes in HTML attributes and JS strings. [VERIFIED: CLAUDE.md]
4. **Semicolons:** Yes in JS. [VERIFIED: CLAUDE.md]
5. **Variable declarations:** `const` throughout (no `let` or `var`). [VERIFIED: CLAUDE.md]
6. **DOM references:** Suffix `El` for element variables (e.g., `gateEl`, `formEl`). [VERIFIED: CLAUDE.md]
7. **Root `index.html` is off-limits:** Arash's personal page — do not modify. [VERIFIED: CONTEXT.md canonical refs]
8. **CNAME must not be modified.** [VERIFIED: CONTEXT.md canonical refs]
9. **No modules:** Single script file pattern, no imports/exports. Shared scripts loaded via `<script src>`. [VERIFIED: CLAUDE.md]
10. **Accessibility basics:** `lang="en"`, `autocomplete` on inputs, `required` on required fields. [VERIFIED: CLAUDE.md]
11. **GSD workflow:** Do not make direct repo edits outside a GSD workflow unless explicitly asked to bypass. [VERIFIED: CLAUDE.md]

## Sources

### Primary (HIGH confidence)
- CLAUDE.md — Project conventions, stack constraints, architecture patterns
- CONTEXT.md (01-CONTEXT.md) — User decisions D-01 through D-13, discretion areas
- REQUIREMENTS.md — Phase 1 requirement IDs ACC-01 through ACC-05
- STACK.md, STRUCTURE.md — Current codebase state
- Existing source files: `narsh2026/index.html`, `narsh2026/app.js`, `index.html`

### Secondary (MEDIUM confidence)
- None (web search and Context7 were unavailable in this session)

### Tertiary (LOW confidence)
- All claims tagged [ASSUMED] — based on training knowledge of standard web platform APIs, Google Fonts, and CSS custom properties. These are well-established, stable web standards unlikely to have changed, but were not verified against live documentation in this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — vanilla HTML/CSS/JS is the project constraint; no library selection needed
- Architecture: HIGH — multi-page static site with shared CSS/JS is a well-understood pattern; project decisions are clear and specific
- Pitfalls: HIGH — localStorage quirks, auth flicker, relative path issues, and font loading are well-documented patterns in training data
- Design system: MEDIUM — color hex values and font pairing are based on training knowledge, not verified against live Google Fonts or color theory resources
- Security model: HIGH — the "polite lock" tradeoffs are explicitly acknowledged in project decisions; no false security claims

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable web platform APIs; 30-day validity)
