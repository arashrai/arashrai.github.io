# Phase 4: Puzzle Page - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 5 (new/modified files)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `narsh2026/puzzles/index.html` | page-shell | request-response | `narsh2026/our-people/index.html` | exact |
| `narsh2026/puzzles/puzzle-data.js` | data-module | static | `narsh2026/our-people/guest-data.js` | exact |
| `narsh2026/puzzles/puzzle.js` | service (game logic) | event-driven + state machine | `narsh2026/our-people/graph.js` | role-match |
| `narsh2026/puzzles/puzzle-ui.js` | controller (UI) | event-driven | `narsh2026/our-people/graph-ui.js` | exact |
| `narsh2026/puzzles/puzzle.css` | config (styles) | static | `narsh2026/our-people/our-people.css` | exact |

## Pattern Assignments

### `narsh2026/puzzles/index.html` (page-shell, request-response)

**Analog:** `narsh2026/our-people/index.html`

**Page shell pattern** (full file, lines 1-71):
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
  <body class="auth-pending">
    <!-- ... page content ... -->
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script src="/narsh2026/our-people/guest-data.js"></script>
    <script src="/narsh2026/our-people/graph.js"></script>
    <script src="/narsh2026/our-people/graph-ui.js"></script>
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) {
        NARSH_AUTH.applyTierVisibility(tier);
        NARSH_GRAPH.init("graph-canvas");
        NARSH_GRAPH_UI.init();
      }
    </script>
  </body>
</html>
```

**Key patterns to replicate:**
1. `body class="auth-pending"` -- prevents FOUC; removed by `applyTierVisibility`
2. Google Fonts link includes `wght@400;600` for Source Sans 3 (needed for game UI bold elements)
3. Shared `styles.css` loaded before page-specific CSS
4. Script loading order: `auth.js` -> `nav.js` -> data module -> logic module -> UI module
5. Inline init script: `requireAuth()` -> `applyTierVisibility()` -> module `.init()` calls
6. Nav link with `class="active"` on the Puzzles entry (already correct in existing placeholder)

**Header/nav pattern** (lines 17-29):
```html
<header class="site-header">
  <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
    <span class="nav-toggle-icon"></span>
  </button>
  <nav class="site-nav" id="site-nav">
    <a href="/narsh2026/our-story/">Our Story</a>
    <a href="/narsh2026/our-people/">Our People</a>
    <a href="/narsh2026/puzzles/" class="active">Puzzles</a>
    <a href="/narsh2026/schedule/">Schedule</a>
    <a href="/narsh2026/venue-travel/">Venue & Travel</a>
    <a href="/narsh2026/dress-code/">Dress Code</a>
  </nav>
</header>
```

---

### `narsh2026/puzzles/puzzle-data.js` (data-module, static)

**Analog:** `narsh2026/our-people/guest-data.js`

**IIFE module shell** (lines 1-6, 520-534):
```javascript
// Narsh 2026 — Guest Data Module
// Placeholder guest list, typed edges, group definitions, households, and family trees
// for the interactive social graph on the Our People page.

const NARSH_GUESTS = (() => {
  "use strict";

  // ... private constants and data arrays ...

  return {
    GROUPS,
    CITIES,
    GUESTS,
    EDGES,
    HOUSEHOLDS,
    FAMILY_TREES,
    getGuestById,
    getGuestsByGroup,
    getGuestsByCity,
    searchGuests,
    getSocialNodes,
    getSocialEdges
  };
})();
```

**Static data arrays pattern** (lines 8-15, 26-39):
```javascript
const GROUPS = [
  { id: "arash-family", label: "Arash's Family", color: "#2A9D8F" },
  { id: "natalie-family", label: "Natalie's Family", color: "#D4A843" },
  // ...
];

const GUESTS = [
  {
    id: "natalie",
    name: "Natalie Fleury",
    photo: "/narsh2026/images/people/natalie.jpg",
    groups: ["natalie-family"],
    cities: ["seattle", "grand-cayman", "waterloo"],
    isCouple: true,
    funFact: "Can name every iguana species native to the Cayman Islands.",
    connectionToCouple: null,
    householdId: null,
    familyTree: { family: "natalie", parentId: null, generation: 0 }
  },
  // ...
];
```

**Lookup helper functions pattern** (lines 423-434):
```javascript
const getGuestById = (id) => GUESTS.find(g => g.id === id) || null;

const getGuestsByGroup = (groupId) => GUESTS.filter(g => g.groups.includes(groupId));

const searchGuests = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return GUESTS.filter(g => g.name.toLowerCase().includes(q));
};
```

**Secondary analog:** `narsh2026/our-story/story-data.js` (lines 1-181) -- simpler data module showing the minimal IIFE + STOPS array + helper pattern:
```javascript
const NARSH_STORY_DATA = (() => {
  "use strict";

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
    // ...
  ];

  const getStopById = (id) => {
    return STOPS.find(s => s.id === id) || null;
  };

  return { STOPS, getArashCoords, getNatalieCoords, getStopById };
})();
```

**For puzzle-data.js, adapt these patterns to:**
- `CHARACTERS[]` array (20 objects with `criminal`, `profession`, `name`, `gender`, `hint`, `paths`)
- `HINT_SEQUENCE[]` array (pre-computed hint steps)
- `PROFESSION_EMOJI` map (profession string -> emoji)
- `DAILY_PUZZLES[]` array (links section data)
- Helper functions: `getCharacter(index)`, `getEmoji(profession)`, `getTotalCharacters()`

---

### `narsh2026/puzzles/puzzle.js` (service / game-logic, event-driven + state machine)

**Analog:** `narsh2026/our-people/graph.js`

**IIFE shell with private state** (lines 7-9, 28-56):
```javascript
const NARSH_GRAPH = (() => {
  "use strict";

  // Private state
  let svgEl = null;
  let simulation = null;
  let currentView = "social";
  let expandedNodeId = null;
  let zoomBehavior = null;
  // ...

  // Callbacks for UI module (set by graph-ui.js during init)
  let onNodeExpandCallback = null;
  let onNodeCollapseCallback = null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

**Init function pattern** (lines 84-152):
```javascript
const init = (containerId) => {
  svgEl = d3.select("#" + containerId);
  const containerNode = svgEl.node();
  if (!containerNode) return;

  width = containerNode.clientWidth;
  height = containerNode.clientHeight;
  // ... setup ...
};
```

**Public API return pattern** (lines 1340-1353):
```javascript
return {
  init,
  switchView,
  filterByGroup,
  filterFamilyTree,
  zoomToNode,
  expandNode,
  collapseNode,
  getSimulation: () => simulation,
  getCurrentView: () => currentView,
  set onNodeExpand(cb) { onNodeExpandCallback = cb; },
  set onNodeCollapse(cb) { onNodeCollapseCallback = cb; }
};
```

**Key patterns for puzzle.js to adapt:**
1. Private state variables at top of IIFE (lines 28-56) -- adapt to `flippedCards`, `mistakes`, `hintsUsed`, `colorTags`, `timerStart`, `elapsedMs`, `gameComplete`
2. `init()` as primary entry point taking data module reference
3. Setter callbacks for UI module communication (`set onNodeExpand(cb)`)
4. Return object exposing public API methods

**localStorage pattern from auth.js** (lines 30-44):
```javascript
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
    // Private browsing fallback: tier persists only for this page load
  }
};
```

**Adapt for puzzle state persistence:** Use `JSON.stringify`/`JSON.parse` with `try/catch` wrapping. Include version number for schema evolution.

---

### `narsh2026/puzzles/puzzle-ui.js` (controller / UI, event-driven)

**Analog:** `narsh2026/our-people/graph-ui.js`

**IIFE shell with DOM references** (lines 5-16):
```javascript
const NARSH_GRAPH_UI = (() => {
  "use strict";

  let searchInputEl = null;
  let filterBarEl = null;
  let viewToggleEl = null;
  let searchAnnounceEl = null;
  let activeFilters = [];
  let currentView = "social";
  let activeFamilyFilter = "both";
  let debounceTimer = null;
  let bottomSheetEl = null;
  let previousFocusEl = null;
```

**Init function -- DOM lookups + event wiring** (lines 19-69):
```javascript
const init = () => {
  searchInputEl = document.getElementById("graph-search");
  filterBarEl = document.getElementById("filter-bar");
  viewToggleEl = document.getElementById("view-toggle");
  searchAnnounceEl = document.getElementById("search-announce");
  bottomSheetEl = document.getElementById("bottom-sheet");

  // Render filter buttons from NARSH_GUESTS.GROUPS
  if (filterBarEl) {
    renderGroupFilterButtons();
  }

  // Search input listener with 300ms debounce
  if (searchInputEl) {
    searchInputEl.addEventListener("input", () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleSearch, 300);
    });
  }

  // View toggle click listeners
  if (viewToggleEl) {
    const viewBtns = viewToggleEl.querySelectorAll(".view-btn");
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        handleViewSwitch(view);
      });
    });
  }

  // Register expand/collapse callbacks with graph module
  NARSH_GRAPH.onNodeExpand = onNodeExpand;
  NARSH_GRAPH.onNodeCollapse = onNodeCollapse;

  // Bottom sheet event wiring
  initBottomSheetEvents();
};
```

**DOM element creation pattern** (lines 236-310, renderBottomSheet):
```javascript
const renderBottomSheet = (guestData) => {
  const contentEl = bottomSheetEl.querySelector(".bottom-sheet-content");
  if (!contentEl) return;

  // Clear previous content
  contentEl.textContent = "";

  // Photo or initials
  const photoWrapEl = document.createElement("div");
  photoWrapEl.className = "bottom-sheet-photo";

  if (guestData.photo) {
    const imgEl = document.createElement("img");
    imgEl.src = guestData.photo;
    imgEl.alt = guestData.name;
    imgEl.className = "bottom-sheet-img";
    photoWrapEl.appendChild(imgEl);
  }
  contentEl.appendChild(photoWrapEl);

  // Name
  const nameEl = document.createElement("div");
  nameEl.className = "bottom-sheet-name";
  nameEl.textContent = guestData.name;
  contentEl.appendChild(nameEl);
};
```

**Key DOM patterns:**
- Always use `textContent` (never `innerHTML`) for user/data-driven content -- security pattern
- `El` suffix for DOM reference variables: `searchInputEl`, `filterBarEl`, `bottomSheetEl`
- `document.createElement` + `className` + `textContent` + `appendChild` for dynamic content
- Null-guard all `getElementById` calls before attaching listeners
- Delegated click handling on container elements (lines 52-63)

**Button rendering with ARIA pattern** (lines 312-329):
```javascript
const renderGroupFilterButtons = () => {
  // "All" button (active by default)
  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.setAttribute("data-group", "all");
  allBtn.setAttribute("aria-pressed", "true");
  allBtn.textContent = "All";
  filterBarEl.appendChild(allBtn);

  // One button per group
  NARSH_GUESTS.GROUPS.forEach((group) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.setAttribute("data-group", group.id);
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = group.label;
    filterBarEl.appendChild(btn);
  });
};
```

**Focus trap pattern for modals** (lines 349-386):
```javascript
const initBottomSheetEvents = () => {
  if (!bottomSheetEl) return;

  const closeBtn = bottomSheetEl.querySelector(".bottom-sheet-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      NARSH_GRAPH.collapseNode();
    });
  }

  // Trap focus inside bottom sheet when open
  bottomSheetEl.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      NARSH_GRAPH.collapseNode();
      return;
    }

    // Focus trap
    if (event.key === "Tab" && bottomSheetEl.classList.contains("open")) {
      const focusableEls = bottomSheetEl.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }
  });
};
```

**Minimal return** (line 388):
```javascript
return { init };
```

---

### `narsh2026/puzzles/puzzle.css` (config / styles, static)

**Analog:** `narsh2026/our-people/our-people.css`

**Page-specific CSS pattern** (lines 1-60):
```css
/* Our People -- Page-Specific Styles */
/* Guest graph visualization: controls, canvas, expanded nodes */

/* Skip link for keyboard/screen reader users */
.skip-to-graph {
  position: absolute;
  top: -100px;
  /* ... */
}

/* Graph page layout */
.graph-page {
  padding: var(--space-md);
}

/* Graph controls container */
.graph-controls {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

/* Search input */
.graph-search {
  flex: 1;
  max-width: 320px;
  min-height: 44px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-dusty-rose);
  background: var(--color-warm-white);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: var(--font-body);
  color: var(--color-text-primary);
}
```

**Key CSS patterns to replicate:**
1. File header comment: `/* Puzzles -- Page-Specific Styles */`
2. Use design tokens from `styles.css` `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`
3. `min-height: 44px` on interactive elements (touch target size)
4. `font-size: 16px` on inputs (prevents iOS zoom)
5. `var(--color-warm-white)` for card backgrounds
6. `var(--color-dusty-rose)` for borders
7. `var(--color-terracotta)` for focus/accent states
8. `var(--font-body)` and `var(--font-heading)` for typography

---

## Shared Patterns

### Authentication Guard
**Source:** `narsh2026/auth.js` (lines 46-52) + `narsh2026/puzzles/index.html` (existing placeholder, lines 34-38)
**Apply to:** `narsh2026/puzzles/index.html`
```javascript
const tier = NARSH_AUTH.requireAuth();
if (tier) {
  NARSH_AUTH.applyTierVisibility(tier);
  // Initialize puzzle modules here
}
```
**Note:** The existing placeholder already has auth wired. The rewrite must preserve `body class="auth-pending"` and the same script loading order.

### IIFE Module Declaration
**Source:** All JS modules in the codebase
**Apply to:** `puzzle-data.js`, `puzzle.js`, `puzzle-ui.js`
```javascript
const NARSH_MODULE_NAME = (() => {
  "use strict";

  // Private state and functions

  return { /* public API */ };
})();
```

### localStorage with try/catch
**Source:** `narsh2026/auth.js` (lines 30-44)
**Apply to:** `puzzle.js` (game state persistence)
```javascript
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ /* state */ }));
  } catch {
    // Private browsing fallback
  }
};
```

### DOM Element Naming (El Suffix)
**Source:** `narsh2026/our-people/graph-ui.js` (lines 8-16), `narsh2026/our-people/graph.js` (lines 28-29)
**Apply to:** `puzzle-ui.js`
```javascript
let searchInputEl = null;
let filterBarEl = null;
let bottomSheetEl = null;
```
All DOM reference variables use the `El` suffix convention.

### textContent (never innerHTML)
**Source:** `narsh2026/our-people/graph-ui.js` (lines 259, 265, 279 -- `nameEl.textContent = guestData.name`, etc.)
**Apply to:** All DOM rendering in `puzzle-ui.js`
```javascript
// CORRECT:
nameEl.textContent = guestData.name;

// NEVER:
nameEl.innerHTML = guestData.name;  // XSS risk
```
This is critical for clue text rendering. Even though puzzle data is author-controlled, maintain the project's `textContent` convention throughout.

### CSS Design Tokens
**Source:** `narsh2026/styles.css` (lines 1-55)
**Apply to:** `puzzle.css`

Key tokens:
```css
/* Colors */
--color-terracotta: #C2704F;     /* accent, focus states */
--color-cream: #FFF8F0;          /* page background */
--color-warm-white: #FFFDFB;     /* card backgrounds */
--color-text-primary: #3D2B1F;   /* main text */
--color-text-secondary: #6B4F3A; /* secondary text */
--color-dusty-rose: #C9928E;     /* borders, subtle elements */

/* Typography */
--font-heading: "Playfair Display", Georgia, serif;
--font-body: "Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 48px;

/* Shape */
--radius-sm: 6px;
--radius-md: 12px;
--shadow-soft: 0 2px 8px rgba(61, 43, 31, 0.08);
--shadow-medium: 0 4px 16px rgba(61, 43, 31, 0.12);

/* Motion */
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
```

### Keyboard Accessibility
**Source:** `narsh2026/our-people/graph.js` (lines 274-280), `narsh2026/our-people/graph-ui.js` (lines 349-386)
**Apply to:** `puzzle-ui.js` (card interactions, modals)
```javascript
// Keyboard handler for interactive elements
nodeEls.on("keydown", (event, d) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.stopPropagation();
    expandNode(d.id);
  }
});
```
- All clickable elements must be keyboard-accessible (Enter/Space to activate)
- Modals must trap focus and close on Escape
- Use `role`, `aria-label`, `aria-pressed`, `aria-expanded` attributes

### Reduced Motion Awareness
**Source:** `narsh2026/our-people/graph.js` (line 61)
**Apply to:** `puzzle-ui.js` (card flip animation)
```javascript
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
Use this to skip or shorten CSS transitions for users who prefer reduced motion.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All 5 files have strong analogs in the existing codebase |

The puzzle game is novel in terms of game mechanics (card flip, deducibility checks, hint sequencing, template substitution, share results, timer), but the structural patterns -- IIFE modules, DOM manipulation, localStorage persistence, event handling, CSS styling -- all have direct analogs. The game-specific logic (state machine, clue resolution, color tags) is new domain logic that should follow the coding conventions extracted above but does not need a structural analog.

---

## Metadata

**Analog search scope:** `narsh2026/our-people/`, `narsh2026/our-story/`, `narsh2026/auth.js`, `narsh2026/styles.css`, `narsh2026/puzzles/index.html`
**Files scanned:** 8
**Pattern extraction date:** 2026-05-25
