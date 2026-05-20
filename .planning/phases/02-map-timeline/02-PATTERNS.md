# Phase 2: Map Timeline - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 7 (1 rewrite, 5 new, 1 modified)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `narsh2026/our-story/index.html` | page (rewrite) | request-response | `narsh2026/our-story/index.html` (current) + `narsh2026/schedule/index.html` | exact |
| `narsh2026/our-story/map.js` | controller | event-driven | `narsh2026/auth.js` | role-match |
| `narsh2026/our-story/story-data.js` | data/config | static | `narsh2026/auth.js` (IIFE + const data) | role-match |
| `narsh2026/our-story/scroll-controller.js` | controller | event-driven | `narsh2026/nav.js` | role-match |
| `narsh2026/our-story/timeline.js` | component | event-driven | `narsh2026/nav.js` | role-match |
| `narsh2026/our-story/carousel.js` | component | event-driven | `narsh2026/nav.js` | role-match |
| `narsh2026/our-story/our-story.css` | stylesheet | N/A | `narsh2026/styles.css` | role-match |
| `narsh2026/styles.css` | stylesheet (modify) | N/A | `narsh2026/styles.css` (self) | exact |

## Pattern Assignments

### `narsh2026/our-story/index.html` (page, rewrite)

**Analog:** `narsh2026/our-story/index.html` (current placeholder) + `narsh2026/schedule/index.html` (section page template)

The current `our-story/index.html` is a placeholder that will be completely rewritten. The section page template pattern from `schedule/index.html` provides the structural skeleton. The rewrite retains the head block, header/nav, auth guard, and script loading order -- but replaces `<main class="page-content">` with the map container, content panel, timeline bar, and scroll container.

**Head block pattern** (`narsh2026/schedule/index.html` lines 1-12):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>Schedule -- Narsh 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/narsh2026/styles.css">
  </head>
```

**Header/nav pattern** (`narsh2026/our-story/index.html` lines 13-27):
```html
  <body class="auth-pending">
    <header class="site-header">
      <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
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
```

**Auth guard + script loading pattern** (`narsh2026/our-story/index.html` lines 32-40):
```html
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) {
        NARSH_AUTH.applyTierVisibility(tier);
      }
    </script>
```

**Key differences from template for the rewrite:**
- Add Mapbox GL CSS in `<head>`: `<link href="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.css" rel="stylesheet">`
- Add page-specific CSS in `<head>`: `<link rel="stylesheet" href="/narsh2026/our-story/our-story.css">`
- Replace `<main class="page-content">` with map container, content panel, timeline bar, and scroll container divs
- Add Mapbox GL JS script before page scripts: `<script src="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.js"></script>`
- Add page-specific scripts after auth/nav: `story-data.js`, `map.js`, `scroll-controller.js`, `carousel.js`, `timeline.js`
- Add initialization script that wires all modules together after auth check

---

### `narsh2026/our-story/map.js` (controller, event-driven)

**Analog:** `narsh2026/auth.js` (IIFE module pattern)

This file creates the `NARSH_MAP` module. It follows the same IIFE module pattern as `NARSH_AUTH` but wraps Mapbox GL JS initialization, fly-to orchestration, GeoJSON line drawing, and pin management.

**IIFE module pattern** (`narsh2026/auth.js` lines 7-75):
```javascript
const NARSH_AUTH = (() => {
  "use strict";

  // Private constants
  const STORAGE_KEY = "narsh-tier";
  const GATE_URL = "/narsh2026/";

  // Private data (equivalent: MAPBOX_TOKEN, mapInstance)
  const TIER_HASHES = {
    "day2": "a8e11207989a2ab9fe956ce183139683e10e135007873faa6b824bc49a8d6c2d",
    "full": "44ffde91067d45353ee3b6ec012580e30fea73b60654a905013269cb092b7b8d"
  };

  // Private functions (equivalent: setupLayers, animateLineSegment, drawLineToStop)
  const hashPassword = async (password) => {
    const data = new TextEncoder().encode(password.trim().toLowerCase());
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // Public API via return object
  return { getTier, setTier, requireAuth, checkPassword, applyTierVisibility, hashPassword };
})();
```

**Apply to `NARSH_MAP`:**
- Same `const NARSH_MAP = (() => { "use strict"; ... })();` wrapper
- Private: `MAPBOX_TOKEN` constant, `mapInstance` variable, `setupLayers()`, `animateLineSegment()`
- Public return: `{ init, flyToStop, updateLines, updatePins, getMap }`
- `init()` returns a Promise (map.on("load") resolves it), similar to `hashPassword()` being async

**DOM reference naming** (`narsh2026/nav.js` lines 7-8):
```javascript
  const toggleEl = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");
```

All DOM element variables use the `El` suffix: `mapEl`, `containerEl`, `errorEl`.

---

### `narsh2026/our-story/story-data.js` (data/config, static)

**Analog:** `narsh2026/auth.js` (IIFE with private data + computed getters)

This file creates the `NARSH_STORY_DATA` module. It follows the IIFE pattern but is primarily a data file with computed accessor functions.

**Private data + computed getters pattern** (`narsh2026/auth.js` lines 7-20, 30-36):
```javascript
const NARSH_AUTH = (() => {
  "use strict";

  // Private data
  const TIER_HASHES = {
    "day2": "a8e11207989a2ab9fe956ce183139683e10e135007873faa6b824bc49a8d6c2d",
    "full": "44ffde91067d45353ee3b6ec012580e30fea73b60654a905013269cb092b7b8d"
  };

  // Getter that reads private data
  const getTier = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  return { getTier, /* ... */ };
})();
```

**Apply to `NARSH_STORY_DATA`:**
- Same IIFE wrapper: `const NARSH_STORY_DATA = (() => { "use strict"; ... })();`
- Private: `const STOPS = [...]` array with stop objects
- Computed getters: `getArashCoords()`, `getNatalieCoords()`, `getStopById(id)`
- Public return: `{ STOPS, getArashCoords, getNatalieCoords, getStopById }`
- Each stop object: `{ id, owner, location, coords, zoom, year, narrative, photos, isConvergence }`

---

### `narsh2026/our-story/scroll-controller.js` (controller, event-driven)

**Analog:** `narsh2026/nav.js` (event listener registration, DOM state management)

This file creates the `NARSH_SCROLL` module. It follows the IIFE pattern and registers scroll/resize event listeners similar to how nav.js registers click/keydown listeners.

**Event listener registration pattern** (`narsh2026/nav.js` lines 4-52):
```javascript
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const toggleEl = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");

  if (!toggleEl || !navEl) {
    return;
  }

  // Named handler functions (not anonymous)
  const openNav = () => {
    document.body.classList.add("nav-open");
    toggleEl.setAttribute("aria-expanded", "true");
    const firstLinkEl = navEl.querySelector("a");
    if (firstLinkEl) {
      firstLinkEl.focus();
    }
  };

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    toggleEl.setAttribute("aria-expanded", "false");
    toggleEl.focus();
  };

  // Register event listeners
  toggleEl.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNav();
    }
  });
});
```

**Apply to `NARSH_SCROLL`:**
- IIFE pattern (not DOMContentLoaded -- uses explicit `init()` call instead, since it depends on story data being loaded first)
- `const NARSH_SCROLL = (() => { "use strict"; ... })();`
- Named private functions: `handleScroll()`, `handleResize()`
- Register `window.addEventListener("scroll", handleScroll, { passive: true })`
- Guard clause: `if (!scrollContainerEl) return;`
- Callback pattern: `onStopChange(newIndex, previousIndex)` -- similar to how nav.js calls `openNav/closeNav` based on state
- Public return: `{ init, scrollToStop, getCurrentIndex }`

**Key difference from nav.js:** Uses IIFE with explicit `init(stops, callback)` instead of `DOMContentLoaded` auto-init. This is because the scroll controller depends on story data and map being ready first. Auth.js uses this same deferred-init pattern.

---

### `narsh2026/our-story/timeline.js` (component, event-driven)

**Analog:** `narsh2026/nav.js` (interactive UI component with DOM manipulation + event listeners)

This file creates the `NARSH_TIMELINE` module. It follows the same pattern as nav.js: DOM queries, event listeners on interactive elements, visual state toggling via classes.

**DOM query + class toggling pattern** (`narsh2026/nav.js` lines 7-8, 14-27):
```javascript
  const toggleEl = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");

  const openNav = () => {
    document.body.classList.add("nav-open");
    toggleEl.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    toggleEl.setAttribute("aria-expanded", "false");
  };
```

**Apply to `NARSH_TIMELINE`:**
- IIFE: `const NARSH_TIMELINE = (() => { "use strict"; ... })();`
- `init(stops, onDotClick)` -- builds timeline dots from stops array, registers click listeners
- `setActive(index)` -- adds/removes `active` class on dots, updates `aria-label`
- `setVisited(index)` -- adds `visited` class on past dots
- Each dot is a `<button>` with `aria-label="{Location}, {Year}"` (per UI-SPEC accessibility)
- Click handler calls `onDotClick(index)` callback, similar to nav link click calling `closeNav`
- Public return: `{ init, setActive, setVisited }`

---

### `narsh2026/our-story/carousel.js` (component, event-driven)

**Analog:** `narsh2026/nav.js` (interactive UI component with event handlers + state management)

This file creates the `NARSH_CAROUSEL` module. Touch event handling (touchstart/touchmove/touchend) parallels nav.js's keyboard event handling.

**Event handler + element reference pattern** (`narsh2026/nav.js` lines 7-8, 29-35, 37-41):
```javascript
  const toggleEl = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");

  toggleEl.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNav();
    }
  });
```

**Apply to `NARSH_CAROUSEL`:**
- IIFE: `const NARSH_CAROUSEL = (() => { "use strict"; ... })();`
- Private state: `currentIndex`, `photos` array, element references (`containerEl`, `trackEl`, `prevEl`, `nextEl`, `dotsEl`, `announceEl`)
- Named functions: `goTo(index)`, `loadPhotos(newPhotos)`, `updateUI()`
- Touch events on track: `touchstart`, `touchmove`, `touchend` with `{ passive: true }`
- Click events on arrows: `prevEl.addEventListener("click", ...)`
- Keyboard: arrow keys cycle photos when carousel is focused
- Accessibility: `aria-live="polite"` region announces "Photo {n} of {total}"
- Public return: `{ init, loadPhotos, goTo }`

---

### `narsh2026/our-story/our-story.css` (stylesheet, page-specific)

**Analog:** `narsh2026/styles.css` (design tokens, naming conventions, media query pattern)

This is a new page-specific stylesheet. It follows the same conventions as `styles.css` but scoped to the Our Story page layout.

**CSS custom property usage** (`narsh2026/styles.css` lines 4-40):
```css
:root {
  /* Colors -- Sunset Warm Palette (D-04) */
  --color-terracotta: #C2704F;
  --color-golden: #D4A843;
  --color-dusty-rose: #C9928E;
  --color-cream: #FFF8F0;
  --color-warm-white: #FFFDFB;
  --color-text-primary: #3D2B1F;
  --color-text-secondary: #6B4F3A;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 12px;
  --shadow-soft: 0 2px 8px rgba(61, 43, 31, 0.08);
  --shadow-medium: 0 4px 16px rgba(61, 43, 31, 0.12);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

**Media query breakpoint pattern** (`narsh2026/styles.css` lines 312-337):
```css
@media (min-width: 768px) {
  body {
    font-size: 17px;
  }

  h1 {
    font-size: 28px;
  }

  .nav-toggle {
    display: none;
  }

  .site-nav {
    display: flex;
    gap: var(--space-lg);
  }
}
```

**Apply to `our-story.css`:**
- All values reference design tokens: `var(--color-cream)`, `var(--space-lg)`, `var(--radius-md)`, etc.
- Class-based selectors (no IDs for styling): `.map-container`, `.story-panel`, `.timeline-bar`
- Single breakpoint at `768px` for mobile/desktop split, matching `styles.css`
- Mobile-first: base styles are mobile, `@media (min-width: 768px)` adds desktop overrides
- Add `@media (prefers-reduced-motion: reduce)` block for accessibility
- Touch target minimum: `min-width: 44px; min-height: 44px` (established in `.gate-form button` at styles.css line 144)

---

### `narsh2026/styles.css` (modify -- add new tokens)

**Analog:** Self -- add tokens in the existing `:root` block.

**Token addition pattern** (`narsh2026/styles.css` lines 4-10):
```css
:root {
  /* Colors -- Sunset Warm Palette (D-04) */
  --color-terracotta: #C2704F;
  --color-golden: #D4A843;
  --color-dusty-rose: #C9928E;
  --color-cream: #FFF8F0;
  --color-warm-white: #FFFDFB;
```

**Tokens to add in `:root`:**
```css
  /* Journey Line Colors (family wedding-day colors, not sunset palette) */
  --color-journey-arash: #2A9D8F;
  --color-journey-natalie: #D4A843;  /* Same as --color-golden */
```

Note: `--color-journey-natalie` has the same value as `--color-golden` (#D4A843) but gets its own semantic token because it represents Natalie's family color, not the design system's golden accent. If the golden accent changes in a future phase, the journey line should remain unchanged.

---

## Shared Patterns

### Authentication Guard
**Source:** `narsh2026/auth.js` lines 46-52 + `narsh2026/our-story/index.html` lines 32-39
**Apply to:** `narsh2026/our-story/index.html` (the rewritten page)

```html
<body class="auth-pending">
  <!-- ... page content ... -->
  <script src="/narsh2026/auth.js"></script>
  <script src="/narsh2026/nav.js"></script>
  <script>
    const tier = NARSH_AUTH.requireAuth();
    if (tier) {
      NARSH_AUTH.applyTierVisibility(tier);
    }
  </script>
</body>
```

```javascript
// From auth.js -- requireAuth redirects to gate if not logged in
const requireAuth = () => {
  const tier = getTier();
  if (!tier) {
    window.location.href = GATE_URL;
  }
  return tier;
};
```

The auth check must happen BEFORE map initialization. Script loading order:
1. `auth.js` (shared)
2. `nav.js` (shared)
3. `story-data.js` (no dependencies)
4. `map.js` (depends on Mapbox GL JS CDN script)
5. `scroll-controller.js` (depends on story-data)
6. `carousel.js` (standalone)
7. `timeline.js` (standalone)
8. Inline `<script>` block that calls `requireAuth()` then initializes all modules

### FOUC Prevention
**Source:** `narsh2026/styles.css` lines 53-58
**Apply to:** `narsh2026/our-story/index.html`

```css
/* FOUC prevention for SECTION PAGES only. */
body.auth-pending main {
  visibility: hidden;
}
```

The `body.auth-pending` class is added in HTML and removed by `applyTierVisibility()`. For the map page, the map container and content panel should be hidden (not just `<main>`) until auth completes. The existing pattern handles this through `body.auth-pending main { visibility: hidden }` in styles.css -- the rewritten page should keep its primary content inside `<main>` or apply the same class to the relevant container.

### IIFE Module Pattern
**Source:** `narsh2026/auth.js` lines 7-75
**Apply to:** All new JS files (`map.js`, `story-data.js`, `scroll-controller.js`, `carousel.js`, `timeline.js`)

```javascript
const MODULE_NAME = (() => {
  "use strict";

  // Private constants (UPPER_SNAKE_CASE)
  const SOME_CONSTANT = "value";

  // Private mutable state
  let someState = null;

  // Private functions
  const privateHelper = () => {
    // ...
  };

  // Public API
  const publicMethod = () => {
    // ...
  };

  return { publicMethod };
})();
```

**Module naming convention:** `NARSH_` prefix + descriptive name in UPPER_SNAKE_CASE:
- `NARSH_AUTH` (existing)
- `NARSH_MAP` (new)
- `NARSH_STORY_DATA` (new)
- `NARSH_SCROLL` (new)
- `NARSH_CAROUSEL` (new)
- `NARSH_TIMELINE` (new)

**Exception:** `nav.js` uses `DOMContentLoaded` wrapper instead of IIFE because it auto-initializes. The Phase 2 modules use IIFE with explicit `init()` calls because they depend on data and each other.

### DOM Reference Naming
**Source:** `narsh2026/nav.js` lines 7-8, 17, `narsh2026/index.html` lines 53-58
**Apply to:** All new JS files

```javascript
// From nav.js
const toggleEl = document.querySelector(".nav-toggle");
const navEl = document.getElementById("site-nav");
const firstLinkEl = navEl.querySelector("a");

// From index.html inline script
const gateEl = document.getElementById("gate");
const welcomeEl = document.getElementById("welcome");
const formEl = document.getElementById("password-form");
const inputEl = document.getElementById("password-input");
const statusEl = document.getElementById("gate-status");
const submitEl = document.getElementById("password-submit");
```

Convention: `descriptiveName` + `El` suffix. Examples for Phase 2: `mapEl`, `panelEl`, `trackEl`, `prevEl`, `nextEl`, `dotsEl`, `barEl`, `scrollContainerEl`, `promptEl`, `loadingEl`, `errorEl`.

### CSS Design Token Usage
**Source:** `narsh2026/styles.css` lines 86-166 (gate-page styles as example of token-driven component CSS)
**Apply to:** `narsh2026/our-story/our-story.css`

```css
/* Component styles reference tokens, never raw values */
.gate-page {
  max-width: 560px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg) var(--space-lg);
  text-align: center;
}

.hero-photo {
  max-width: 280px;
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  margin-bottom: var(--space-md);
}

/* Interactive element with transition token */
.gate-form button[type="submit"] {
  background: var(--color-terracotta);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 16px;
  font-family: var(--font-body);
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  transition: filter var(--transition-fast);
}
```

Key rules for `our-story.css`:
- Every color, spacing, radius, shadow, transition uses a `var(--token)` reference
- Only raw pixel values for component-specific sizing (e.g., line-width: 3px, dot diameter: 12px)
- 44px minimum touch targets on all interactive elements
- `font-family: var(--font-body)` or `var(--font-heading)` -- never raw font names

### Script Loading Order in Section Pages
**Source:** `narsh2026/our-story/index.html` lines 32-39, `narsh2026/schedule/index.html` lines 38-47
**Apply to:** `narsh2026/our-story/index.html` (rewritten)

Established order:
1. CDN scripts (in `<head>` or before `</body>`)
2. `<script src="/narsh2026/auth.js"></script>` -- shared auth module
3. `<script src="/narsh2026/nav.js"></script>` -- shared nav module
4. Page-specific scripts (new for Phase 2)
5. Inline `<script>` block -- auth check + page initialization

For Phase 2 specifically:
```html
<!-- CDN: Mapbox GL JS (in <head> or before page scripts) -->
<script src="https://api.mapbox.com/mapbox-gl-js/v3.x.x/mapbox-gl.js"></script>

<!-- Shared modules -->
<script src="/narsh2026/auth.js"></script>
<script src="/narsh2026/nav.js"></script>

<!-- Page modules (order matters: data first, then controllers, then components) -->
<script src="/narsh2026/our-story/story-data.js"></script>
<script src="/narsh2026/our-story/map.js"></script>
<script src="/narsh2026/our-story/scroll-controller.js"></script>
<script src="/narsh2026/our-story/carousel.js"></script>
<script src="/narsh2026/our-story/timeline.js"></script>

<!-- Initialization -->
<script>
  const tier = NARSH_AUTH.requireAuth();
  if (tier) {
    NARSH_AUTH.applyTierVisibility(tier);
    // Initialize page modules...
  }
</script>
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason | RESEARCH.md Reference |
|------|------|-----------|--------|-----------------------|
| `narsh2026/our-story/map.js` (Mapbox-specific logic) | controller | event-driven | No existing Mapbox/WebGL code in codebase. IIFE structure has analog but Mapbox API usage (flyTo, GeoJSON sources, addLayer) is entirely new. | RESEARCH.md "Example 1: Complete Map Initialization", "Pattern 2: Progressive Line Drawing" |
| `narsh2026/our-story/scroll-controller.js` (scrollytelling) | controller | event-driven | No existing scroll-driven animation controller. Event listener structure has analog in nav.js but the scrollytelling pattern (tall container + position mapping) is new. | RESEARCH.md "Pattern 1: Scroll-Driven Animation Controller" |
| `narsh2026/our-story/carousel.js` (touch swipe) | component | event-driven | No existing touch-swipe UI component. Click/keyboard handling has analog in nav.js but touch events (touchstart/touchmove/touchend with deltaX tracking) are new. | RESEARCH.md "Example 3: Photo Carousel" |

For these three files, the IIFE module structure and DOM naming conventions come from existing analogs, but the domain-specific logic (Mapbox API, scrollytelling mechanics, touch carousel) must follow the patterns documented in RESEARCH.md.

---

## Metadata

**Analog search scope:** `narsh2026/` directory (all HTML, JS, CSS files)
**Files scanned:** 10 (7 index.html pages, 2 JS modules, 1 CSS file)
**Pattern extraction date:** 2026-05-19
