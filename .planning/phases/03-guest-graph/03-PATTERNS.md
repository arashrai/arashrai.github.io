# Phase 3: Guest Graph - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 6 (5 new/rewrite + 1 modification)
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `narsh2026/our-people/index.html` | page-shell | request-response | `narsh2026/our-story/index.html` | exact |
| `narsh2026/our-people/guest-data.js` | data-module | static-data | `narsh2026/our-story/story-data.js` | exact |
| `narsh2026/our-people/graph.js` | visualization-module | event-driven | `narsh2026/our-story/map.js` | exact |
| `narsh2026/our-people/graph-ui.js` | ui-controller | event-driven | `narsh2026/our-story/scroll-controller.js` | role-match |
| `narsh2026/our-people/our-people.css` | page-styles | static | `narsh2026/our-story/our-story.css` | exact |
| `narsh2026/styles.css` | shared-styles | static | (self -- extend existing) | self-modify |

## Pattern Assignments

### `narsh2026/our-people/index.html` (page-shell, request-response)

**Analog:** `narsh2026/our-story/index.html`

**Head block pattern** (lines 1-14):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>Our People -- Narsh 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/narsh2026/styles.css">
    <link rel="stylesheet" href="/narsh2026/our-people/our-people.css">
  </head>
```
NOTE: Google Fonts link must add `600` weight for Source Sans 3 (node name labels need semibold). The analog only loads `wght@400`.

**Body class + auth-pending FOUC prevention** (line 15):
```html
  <body class="auth-pending">
```
Convention: All section pages use `body.auth-pending` which hides `<main>` until `applyTierVisibility()` removes it.

**Skip link pattern** (analog line 16):
```html
    <a href="#graph-canvas" class="skip-to-graph">Skip to guest graph</a>
```
Analog uses `<a href="#story-content" class="skip-map">Skip to story content</a>`. Same pattern, different target.

**Header/nav block** (lines 18-31 -- copy verbatim, change `class="active"` to Our People link):
```html
    <header class="site-header">
      <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon"></span>
      </button>
      <nav class="site-nav" id="site-nav">
        <a href="/narsh2026/our-story/">Our Story</a>
        <a href="/narsh2026/our-people/" class="active">Our People</a>
        <a href="/narsh2026/puzzles/">Puzzles</a>
        <a href="/narsh2026/schedule/">Schedule</a>
        <a href="/narsh2026/venue-travel/">Venue & Travel</a>
        <a href="/narsh2026/dress-code/">Dress Code</a>
      </nav>
    </header>
```
Verified: existing `our-people/index.html` (line 21) already has `class="active"` on the Our People link.

**CDN + script loading order** (lines 56-63):
```html
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"></script>
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script src="/narsh2026/our-story/story-data.js"></script>
    <script src="/narsh2026/our-story/map.js"></script>
    <script src="/narsh2026/our-story/scroll-controller.js"></script>
```
Pattern: CDN library first, then shared modules (auth, nav), then page-specific modules (data, visualization, UI). For Phase 3: D3.js CDN -> auth.js -> nav.js -> guest-data.js -> graph.js -> graph-ui.js.

**Inline init script pattern** (lines 64-78):
```html
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) {
        NARSH_AUTH.applyTierVisibility(tier);

        const loadingEl = document.getElementById("map-loading");
        const errorEl = document.getElementById("map-error");
        // ... DOM refs with El suffix ...

        const mapResult = NARSH_MAP.init("map");

        if (mapResult) {
          mapResult.then((map) => {
            if (!map) {
              if (loadingEl) loadingEl.classList.add("hidden");
              return;
            }
            if (loadingEl) loadingEl.classList.add("hidden");
            // ... wire up callbacks ...
          }).catch(() => {
            if (loadingEl) loadingEl.classList.add("hidden");
            if (errorEl) {
              errorEl.textContent = "The map couldn't load right now. Try refreshing the page.";
              errorEl.classList.remove("hidden");
            }
          });
        }
      }
    </script>
```
Phase 3 init will be simpler (D3 is synchronous, no Promise-based loading like Mapbox). Pattern: `requireAuth()` -> `applyTierVisibility()` -> `NARSH_GRAPH.init("graph-canvas")` -> `NARSH_GRAPH_UI.init()`.

---

### `narsh2026/our-people/guest-data.js` (data-module, static-data)

**Analog:** `narsh2026/our-story/story-data.js`

**IIFE module wrapper** (lines 1-4, 180-181):
```javascript
// Narsh 2026 — Story Data Module
// Chronological life stops for the interactive map timeline.

const NARSH_STORY_DATA = (() => {
  "use strict";
  // ... data and helper functions ...
  return { STOPS, getArashCoords, getNatalieCoords, getStopById };
})();
```
Phase 3 equivalent: `const NARSH_GUESTS = (() => { ... })();`

**Data array structure** (lines 7-163):
```javascript
  const STOPS = [
    {
      id: "arash-mumbai",
      owner: "arash",
      location: "Mumbai, India",
      coords: [72.8777, 19.0760],
      zoom: 5,
      year: 1997,
      narrative: "Born in the bustling heart of Mumbai...",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Arash in Mumbai" }
      ],
      isConvergence: false
    },
    // ... more entries
  ];
```
Pattern: Array of flat objects with string `id`, typed fields, root-relative paths for images.

**Helper function pattern** (lines 166-180):
```javascript
  const getArashCoords = () => {
    return STOPS.filter(s => s.owner === "arash" || s.owner === "both")
      .map(s => s.coords);
  };

  const getStopById = (id) => {
    return STOPS.find(s => s.id === id) || null;
  };

  return { STOPS, getArashCoords, getNatalieCoords, getStopById };
```
Pattern: Helper functions are arrow functions that filter/find on the data array. Return object exposes both raw data and helpers.

---

### `narsh2026/our-people/graph.js` (visualization-module, event-driven)

**Analog:** `narsh2026/our-story/map.js`

**IIFE module wrapper with private state** (lines 1-5, 29-33):
```javascript
// Narsh 2026 — Map Module
// Mapbox GL JS initialization, fly-to animations, progressive journey line drawing,
// stop pins, and bow animation for the Our Story page.

const NARSH_MAP = (() => {
  "use strict";
```

**Module-level constants for colors and animation durations** (lines 9-20):
```javascript
  const FLY_DURATION = 2000;
  const LINE_DRAW_DURATION = 1200;
  const BOW_DURATION = 1500;
  const INTERTWINE_AMPLITUDE = 0.3;

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";
```
Phase 3: Define node radii, simulation force strengths, animation durations, and group colors as module-level constants.

**Private mutable state with let, null initialization** (lines 29-32):
```javascript
  let mapInstance = null;
  let reducedMotion = false;
  let lineAnimationId = null;
  const lastCoords = { "line-arash": [], "line-natalie": [] };
```
Phase 3 equivalent: `let svgEl = null;`, `let simulation = null;`, `let currentView = "social";`, `let expandedNodeId = null;`

**Reduced motion detection** (line 35):
```javascript
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
Same pattern applies -- check once in `init()`, use throughout.

**init() function pattern** (lines 34-109):
```javascript
  const init = (containerId) => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Capability check
    if (!mapboxgl.supported()) {
      const errorEl = document.getElementById("map-error");
      if (errorEl) {
        errorEl.textContent = "Your browser doesn't support interactive maps...";
        errorEl.classList.remove("hidden");
      }
      return Promise.resolve(null);
    }

    // Library initialization
    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapInstance = new mapboxgl.Map({ container: containerId, ... });

    // ... setup layers, return promise ...
  };
```
Phase 3 equivalent: `init(containerId)` -> check D3 availability -> select SVG element -> setup zoom behavior -> create layer groups -> render initial view. D3 is synchronous, so no Promise wrapper needed.

**Layer ordering pattern** (lines 159-238 -- setupLayers):
```javascript
  const setupLayers = () => {
    // Background layers first (glow lines)
    mapInstance.addSource("line-arash", { ... });
    mapInstance.addLayer({ id: "line-arash-glow", ... });
    mapInstance.addLayer({ id: "line-arash", ... });
    // ... then foreground layers (pins)
    mapInstance.addLayer({ id: "stop-pins", ... });
  };
```
Phase 3 equivalent: SVG group ordering: cluster-regions (back) -> edges (middle) -> nodes (front). Same layering principle.

**Return object with public API** (line 487):
```javascript
  return { init, flyToStop, updateLines, updatePins, playBowAnimation, getMap };
```
Phase 3: `return { init, switchView, filterByGroup, zoomToNode, expandNode, collapseNode };`

---

### `narsh2026/our-people/graph-ui.js` (ui-controller, event-driven)

**Analog:** `narsh2026/our-story/scroll-controller.js`

**IIFE module wrapper** (lines 1-6, 65-66):
```javascript
// Narsh 2026 — Scroll Controller Module
// Maps scroll position to stop index changes for the map timeline.

const NARSH_SCROLL = (() => {
  "use strict";

  let scrollPerStop = window.innerHeight;
  let currentStopIndex = -1;
  let onStopChange = null;
  let scrollContainerEl = null;
  let reducedMotion = false;
```
Phase 3 equivalent: `const NARSH_GRAPH_UI = (() => { ... })();` with private state for search query, active filters, current view mode.

**init() with callback registration + event listener setup** (lines 13-28):
```javascript
  const init = (stops, callback) => {
    onStopChange = callback;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollContainerEl = document.getElementById("scroll-container");
    if (!scrollContainerEl) return;

    // Set scroll container height to create scroll distance
    scrollContainerEl.style.height = (stops.length * scrollPerStop) + "px";

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Trigger initial state
    handleScroll();
  };
```
Phase 3: `init()` wires up search input listener, view toggle click handlers, filter button click handlers. Calls `NARSH_GRAPH` API methods (e.g., `NARSH_GRAPH.filterByGroup()`, `NARSH_GRAPH.switchView()`).

**Event handler pattern** (lines 30-44):
```javascript
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const newIndex = Math.max(0, Math.min(
      Math.floor(scrollY / scrollPerStop),
      /* bound */ - 1
    ));

    if (newIndex !== currentStopIndex) {
      const previousIndex = currentStopIndex;
      currentStopIndex = newIndex;
      if (onStopChange) {
        onStopChange(currentStopIndex, previousIndex);
      }
    }
  };
```
Pattern: State comparison, only act on change, call registered callback or sibling module's API.

**Return object** (line 65):
```javascript
  return { init, scrollToStop, getCurrentIndex };
```
Phase 3: `return { init };` (graph-ui.js is a consumer of NARSH_GRAPH, not consumed by other modules).

---

### `narsh2026/our-people/our-people.css` (page-styles, static)

**Analog:** `narsh2026/our-story/our-story.css`

**File header comment** (lines 1-2):
```css
/* Our Story — Page-Specific Styles */
/* Scroll-driven map timeline layout with fixed positioning */
```
Phase 3: `/* Our People — Page-Specific Styles */` + `/* Guest graph visualization: controls, canvas, expanded nodes */`

**Skip link pattern** (lines 5-17):
```css
.skip-map {
  position: absolute;
  top: -100px;
  left: var(--space-md);
  background: var(--color-cream);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  z-index: 200;
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.skip-map:focus {
  top: var(--space-sm);
  outline: 2px solid var(--color-terracotta);
  outline-offset: 2px;
}
```
Phase 3: Same pattern with `.skip-to-graph` class.

**Loading state pattern** (lines 45-57):
```css
.map-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  z-index: 2;
  background: var(--color-cream);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
}
```
Phase 3: `.graph-loading` follows this pattern.

**Error state pattern** (lines 60-74):
```css
.map-error {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  text-align: center;
  max-width: 320px;
  z-index: 2;
  background: var(--color-cream);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
}
```
Phase 3: `.graph-error` follows this pattern.

**Focus-visible pattern** (lines 214-218):
```css
.carousel-prev:focus-visible,
.carousel-next:focus-visible {
  outline: 2px solid var(--color-terracotta);
  outline-offset: 2px;
}
```
Phase 3: Apply to all interactive elements (filter buttons, view toggles, search input, graph nodes).

**Desktop responsive breakpoint** (lines 367-387):
```css
@media (min-width: 768px) {
  .story-panel {
    /* desktop overrides */
  }
}
```
Phase 3: Same breakpoint for graph controls, canvas sizing.

**Reduced motion** (lines 389-410):
```css
@media (prefers-reduced-motion: reduce) {
  .scroll-prompt {
    transition: none;
  }
  /* ... all animated elements ... */
}
```
Phase 3: Disable D3 transitions, filter animation transitions.

**CSS custom property usage** -- all styles reference `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--font-*)`, `var(--shadow-*)`, `var(--transition-*)` tokens from `styles.css`. No hardcoded values for any shared design token.

---

### `narsh2026/styles.css` (shared-styles, modification)

**Modification scope:** Add graph-specific CSS custom properties to the `:root` block if needed (e.g., graph node sizes, cluster region opacity). Avoid page-specific rules in the shared file -- those go in `our-people.css`.

**Existing custom property block** (lines 4-43):
```css
:root {
  /* Colors — Sunset Warm Palette (D-04) */
  --color-terracotta: #C2704F;
  --color-golden: #D4A843;
  --color-dusty-rose: #C9928E;
  --color-cream: #FFF8F0;
  --color-warm-white: #FFFDFB;
  --color-text-primary: #3D2B1F;
  --color-text-secondary: #6B4F3A;

  /* Journey Line Colors (family wedding-day colors, not sunset palette) */
  --color-journey-arash: #2A9D8F;
  --color-journey-natalie: #D4A843;

  /* Typography */
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif;
  /* ... more tokens ... */
}
```
Potential additions: Graph-specific colors for groups (college, meta coworkers) if not handled inline by D3. The journey line colors (`--color-journey-arash`, `--color-journey-natalie`) are already defined and should be reused for Arash's family vs Natalie's family visual distinction in the graph.

---

## Shared Patterns

### Authentication Guard
**Source:** `narsh2026/auth.js` (lines 46-52) + `narsh2026/our-story/index.html` (lines 64-66)
**Apply to:** `narsh2026/our-people/index.html` inline init script
```javascript
// In auth.js:
const requireAuth = () => {
  const tier = getTier();
  if (!tier) {
    window.location.href = GATE_URL;
  }
  return tier;
};

// In page init script:
const tier = NARSH_AUTH.requireAuth();
if (tier) {
  NARSH_AUTH.applyTierVisibility(tier);
  // ... page-specific init ...
}
```
Decision D-08 says all tiers see the same graph, so no tier-gated content within the graph. But the auth guard (`requireAuth()`) is still needed to prevent unauthenticated access.

### IIFE Module Pattern
**Source:** `narsh2026/our-story/map.js` (lines 5-6, 487), `narsh2026/our-story/story-data.js` (lines 4-5, 181)
**Apply to:** All three new JS files (`guest-data.js`, `graph.js`, `graph-ui.js`)
```javascript
const MODULE_NAME = (() => {
  "use strict";
  // ... private state ...
  // ... private functions ...
  // ... public API ...
  return { publicFn1, publicFn2 };
})();
```
Convention: `const` only, double quotes, semicolons, 2-space indentation. Module name is `NARSH_` prefixed and SCREAMING_SNAKE_CASE.

### Reduced Motion Detection
**Source:** `narsh2026/our-story/map.js` (line 35), `narsh2026/our-story/scroll-controller.js` (line 15)
**Apply to:** `graph.js` (controls D3 transitions), `graph-ui.js` (controls filter animations)
```javascript
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
Check once in `init()`, store in module-level variable, use to conditionally skip animations.

### DOM Reference Naming
**Source:** `narsh2026/our-story/index.html` (lines 69-76)
**Apply to:** All JS files
```javascript
const loadingEl = document.getElementById("map-loading");
const errorEl = document.getElementById("map-error");
const panelEl = document.getElementById("story-panel");
```
Convention: All DOM element references use the `El` suffix.

### Error Display Pattern
**Source:** `narsh2026/our-story/index.html` (lines 167-172)
**Apply to:** `narsh2026/our-people/index.html` inline init script
```javascript
if (errorEl) {
  errorEl.textContent = "The map couldn't load right now. Try refreshing the page.";
  errorEl.classList.remove("hidden");
}
```
Pattern: Use `textContent` (not `innerHTML`) for error messages. Toggle `.hidden` class. Keep error messages user-friendly and suggest refresh.

### CSS Token Usage
**Source:** `narsh2026/our-story/our-story.css` (throughout)
**Apply to:** `narsh2026/our-people/our-people.css`
```css
/* Always use design tokens, never hardcode */
color: var(--color-text-secondary);          /* not #6B4F3A */
font-family: var(--font-body);               /* not "Source Sans 3" */
padding: var(--space-md) var(--space-lg);     /* not 16px 24px */
border-radius: var(--radius-md);             /* not 12px */
box-shadow: var(--shadow-soft);              /* not 0 2px 8px ... */
transition: opacity var(--transition-normal); /* not 250ms ease */
```

### CDN Library Loading
**Source:** `narsh2026/our-story/index.html` (line 56)
**Apply to:** `narsh2026/our-people/index.html`
```html
<!-- CDN library BEFORE local scripts -->
<script src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"></script>
<script src="/narsh2026/auth.js"></script>
```
Phase 3: D3.js CDN tag goes first, before auth.js and all local scripts.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All Phase 3 files have direct analogs in the Phase 2 codebase |

Every file in Phase 3 maps cleanly to an existing analog from Phase 2 (Our Story). The module structure (`data.js` + `visualization.js` + `ui-controller.js` + `page.css` + `index.html`) is an exact structural mirror. The main difference is the visualization library (D3.js instead of Mapbox GL JS), but the IIFE module pattern, init flow, state management, and CSS conventions are identical.

---

## Metadata

**Analog search scope:** `narsh2026/` directory tree
**Files scanned:** 8 (our-story/index.html, our-story/story-data.js, our-story/map.js, our-story/scroll-controller.js, our-story/our-story.css, our-people/index.html, styles.css, auth.js)
**Pattern extraction date:** 2026-05-20
