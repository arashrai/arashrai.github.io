---
phase: 03-guest-graph
plan: 01
subsystem: ui
tags: [d3, force-directed-graph, svg, social-graph, visualization]

# Dependency graph
requires:
  - phase: 01-access-design-foundation
    provides: "CSS design system tokens, auth guard (NARSH_AUTH), nav module, page shell template"
  - phase: 02-map-timeline
    provides: "IIFE module pattern (NARSH_STORY_DATA, NARSH_MAP), CDN library loading, journey line colors"
provides:
  - "NARSH_GUESTS IIFE with 25 placeholder guests, typed edges, groups, cities, households, family trees, and social node merging helpers"
  - "NARSH_GRAPH IIFE with D3 force simulation, SVG photo-circle nodes, convex hull cluster regions, zoom/pan"
  - "NARSH_GRAPH_UI IIFE with filter button rendering and search/view toggle stubs"
  - "Complete Our People page shell with D3 CDN, auth guard, accessibility attributes"
  - "Graph visualization CSS custom properties in shared styles.css"
affects: [03-02, 03-03, 03-04]

# Tech tracking
tech-stack:
  added: [D3.js v7 via CDN]
  patterns: [force-directed graph, convex hull cluster regions, SVG clipPath photo nodes, IIFE data module for guest data]

key-files:
  created:
    - narsh2026/our-people/guest-data.js
    - narsh2026/our-people/graph.js
    - narsh2026/our-people/graph-ui.js
    - narsh2026/our-people/our-people.css
  modified:
    - narsh2026/our-people/index.html
    - narsh2026/styles.css

key-decisions:
  - "Used D3 .text() exclusively for DOM text insertion (never .html()) per threat model T-03-01"
  - "Household node merging via getSocialNodes/getSocialEdges with edge deduplication and same-household edge filtering"
  - "Cluster region drawing throttled to every 10 simulation ticks for performance"

patterns-established:
  - "Guest data IIFE pattern: NARSH_GUESTS with GROUPS, CITIES, GUESTS, EDGES, HOUSEHOLDS, FAMILY_TREES and helper functions"
  - "D3 graph IIFE pattern: NARSH_GRAPH with init(containerId), simulation management, SVG layer ordering (clusters/edges/nodes)"
  - "Graph UI IIFE pattern: NARSH_GRAPH_UI with dynamic filter button rendering from data module"
  - "Graph page CSS pattern: our-people.css with skip link, controls, canvas, loading/error states, pinch hint, responsive breakpoints, reduced motion"

requirements-completed: [GRAPH-01, GRAPH-04]

# Metrics
duration: 6min
completed: 2026-05-21
---

# Phase 03 Plan 01: Guest Graph Core Summary

**Force-directed social graph with 25 placeholder guests, D3 photo-circle nodes, typed edges, convex hull cluster regions, and zoom/pan on the Our People page**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-21T15:20:00Z
- **Completed:** 2026-05-21T15:26:03Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Guest data module with 25 placeholder guests across 5 relationship groups and 7 cities, with 22 typed edges, 3 household groupings, and dual family trees (3 generations each)
- D3 force-directed graph rendering with SVG photo-circle nodes (clipPath), initials fallback for guests without photos, couple emphasis (larger radius, terracotta border), and soft colored cluster regions via convex hull
- Complete page shell with D3 v7 CDN, search input, view toggle, filter bar (dynamically populated), accessibility attributes (ARIA roles, labels, keyboard navigation), and zoom/pan navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Guest data module, graph CSS, and design tokens** - `bf17a36` (feat)
2. **Task 2: D3 graph module, UI module, and page shell with full wiring** - `2b283f2` (feat)

## Files Created/Modified
- `narsh2026/our-people/guest-data.js` - NARSH_GUESTS IIFE: 25 guests, 5 groups, 7 cities, 22 edges, 3 households, 2 family trees, getSocialNodes/getSocialEdges helpers
- `narsh2026/our-people/graph.js` - NARSH_GRAPH IIFE: D3 force simulation, SVG rendering with photo nodes and initials fallback, cluster regions, zoom/pan, stubs for expand/filter/view-switch
- `narsh2026/our-people/graph-ui.js` - NARSH_GRAPH_UI IIFE: dynamic filter button rendering, search/view toggle event listener stubs
- `narsh2026/our-people/our-people.css` - Page-specific styles: skip link, graph controls, search input, view toggle, filter bar, canvas container, loading/error states, pinch hint, responsive breakpoints, reduced motion
- `narsh2026/our-people/index.html` - Complete page shell: D3 CDN, header/nav (Our People active), graph controls, SVG canvas with ARIA, inline init script wiring auth + graph + UI modules
- `narsh2026/styles.css` - Added graph visualization tokens to :root (--color-node-default, --color-node-couple, --color-cluster-opacity, --color-edge-default, --color-edge-highlight, --color-node-dim)

## Decisions Made
- Used D3's `.text()` method exclusively for all DOM text insertion -- never `.html()` or `innerHTML` -- per threat model T-03-01 (XSS mitigation)
- Implemented household node merging in `getSocialNodes()` with edge remapping in `getSocialEdges()` including deduplication and same-household edge filtering per D-05
- Throttled cluster region drawing to every 10 simulation ticks to prevent performance degradation during force simulation settling
- Used `document.createElement` with `textContent` for filter button rendering in graph-ui.js (not innerHTML) to maintain consistent XSS protection

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

All stubs are intentional and scoped to future plans:

| Stub | File | Line | Resolved By |
|------|------|------|-------------|
| Node expand on click | graph.js | 213 | Plan 02 |
| Node collapse on background click | graph.js | 228 | Plan 02 |
| switchView() | graph.js | 300 | Plan 03 |
| filterByGroup() | graph.js | 306 | Plan 02 |
| Search input handler | graph-ui.js | 26 | Plan 02 |
| View toggle handler | graph-ui.js | 36 | Plan 03 |
| Filter button handler | graph-ui.js | 48 | Plan 02 |

These stubs do not prevent the plan's goal (working force-directed graph with nodes, edges, clusters, zoom/pan) from being achieved.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Guest data module is ready for Plan 02 to add search, filter, and expand-in-place functionality
- Graph module exposes `switchView`, `filterByGroup`, `zoomToNode`, `expandNode`, `collapseNode` stubs ready for implementation
- UI module has event listener attachment points ready for Plan 02 search/filter and Plan 03 view toggle
- Family tree data structure (FAMILY_TREES with d3.hierarchy-compatible nested objects) ready for Plan 03 tree layout

## Self-Check: PASSED
- All 5 created files exist on disk
- All 2 task commits (bf17a36, 2b283f2) found in git log

---
*Phase: 03-guest-graph*
*Completed: 2026-05-21*
