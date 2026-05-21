---
phase: 03-guest-graph
plan: 02
subsystem: ui
tags: [search, filter, expand-in-place, bottom-sheet, connection-highlighting, d3-transitions]

# Dependency graph
requires:
  - phase: 03-guest-graph
    plan: 01
    provides: "NARSH_GUESTS data module, NARSH_GRAPH with stubs for filter/expand/collapse, NARSH_GRAPH_UI with event listener stubs, page shell"
provides:
  - "handleSearch with 300ms debounce, zoom-to-node with pulse animation"
  - "handleFilterClick with multi-group toggle, All/specific mutual exclusion"
  - "filterByGroup using D3 enter/exit/update pattern with preserved zoom state"
  - "expandNode with radius growth, collision reheat, connection highlighting, desktop detail card"
  - "collapseNode with radius/opacity restore, edge label cleanup, Escape/background-click close"
  - "Mobile bottom sheet with slide-up animation, focus trap, close button"
  - "Expanded detail card CSS, bottom sheet CSS, dimmed node states, edge label styles"
affects: [03-03, 03-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [D3 enter/exit/update via .join(), foreignObject detail cards, mobile bottom sheet with focus trap, debounced search, connection highlighting via opacity transitions]

key-files:
  created: []
  modified:
    - narsh2026/our-people/graph-ui.js
    - narsh2026/our-people/graph.js
    - narsh2026/our-people/our-people.css
    - narsh2026/our-people/index.html

key-decisions:
  - "Used D3 .join() for enter/exit/update on filter changes instead of destroying and recreating SVG elements -- preserves zoom transform and avoids visual flicker"
  - "Desktop detail card uses foreignObject with createElement+textContent for XSS safety (T-03-05)"
  - "Mobile bottom sheet placed outside <main> in index.html for correct fixed positioning and z-index stacking"
  - "Search debounce at 300ms prevents rapid-fire zoom animations (T-03-07)"

patterns-established:
  - "D3 filter pattern: filterByGroup creates new visibleNodes/visibleEdges arrays, remaps edge references, updates simulation with alpha(0.3) reheat"
  - "Expand-in-place pattern: grow node radius, increase collision force, build connectedIds Set, dim non-connected to 0.25, highlight connected edges to 0.5 opacity"
  - "Bottom sheet pattern: graph module publishes expand/collapse events via setter callbacks, UI module renders bottom sheet content and manages focus trap"

requirements-completed: [GRAPH-03]

# Metrics
duration: 5min
completed: 2026-05-21
---

# Phase 03 Plan 02: Search, Filter, and Expand Interactions Summary

**Debounced search with zoom-to-node pulse, multi-group filtering via D3 enter/exit/update, expand-in-place with connection highlighting, desktop detail cards, and mobile bottom sheet**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-21T15:30:41Z
- **Completed:** 2026-05-21T15:36:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Search handler with 300ms debounce finds guests by name via NARSH_GUESTS.searchGuests, zooms to first match with D3 transform, and applies pulse animation (scale 1.2x to 1.0x) on the target node's border circle
- Filter buttons toggle group visibility with mutual exclusion between "All" and specific groups, supporting multiple simultaneous group filters; D3 enter/exit/update pattern via .join() handles node/edge add/remove with 200ms fade transitions while preserving zoom transform state
- Expand-in-place interaction grows node radius to 40px (48px couple), increases collision force radius, reheats simulation with alpha(0.3), dims non-connected nodes to 0.25 opacity, highlights connected edges to 0.5 opacity with 2px stroke width, and shows edge type labels at midpoints
- Desktop detail card via foreignObject shows guest name (17px semibold), groups (14px comma-separated), connectionToCouple and funFact (14px, only if present) -- all text inserted via textContent, never innerHTML
- Mobile bottom sheet with slide-up animation (transform translateY), 40vh max-height, close button (44x44px), photo/initials circle (64px), focus trap with Tab cycling and Escape close, focus return to triggering node on collapse
- Escape key and SVG background click both trigger collapseNode, restoring all node/edge opacities and removing detail cards and edge labels

## Task Commits

Each task was committed atomically:

1. **Task 1: Search and filter functionality** - `bbfd39d` (feat)
2. **Task 2: Expand-in-place with detail cards, bottom sheet, and CSS** - `95bb04b` (feat)

## Files Created/Modified
- `narsh2026/our-people/graph-ui.js` - Complete rewrite: handleSearch with 300ms debounce, handleFilterClick with All/specific mutual exclusion, onNodeExpand/onNodeCollapse callbacks for mobile bottom sheet, renderBottomSheet with photo/initials/name/groups/fields, focus trap and Escape handling
- `narsh2026/our-people/graph.js` - Major update: filterByGroup with D3 .join() enter/exit/update, zoomToNode with pulse animation, expandNode with radius growth/collision reheat/connection highlighting/desktop detail card via foreignObject, collapseNode with full state restore, Escape/background-click handlers, onNodeExpand/onNodeCollapse callback setters
- `narsh2026/our-people/our-people.css` - Added: .expanded-detail (desktop inline card), .bottom-sheet (fixed position slide-up panel with open state), .bottom-sheet-close (44x44px button), .bottom-sheet-photo/img/initials/name/groups/field-label/field-value styles, .node.dimmed (opacity 0.25 transition), .edge-label (11px pointer-events none), reduced motion overrides
- `narsh2026/our-people/index.html` - Added div#bottom-sheet with role="dialog", aria-label="Guest details", close button, and .bottom-sheet-content container

## Decisions Made
- Used D3 `.join()` for enter/exit/update on filter changes instead of destroying and recreating SVG elements -- avoids the anti-pattern identified in RESEARCH.md and preserves zoom transform state
- Desktop detail card uses foreignObject with createElement + textContent for XSS safety per threat model T-03-05
- Mobile bottom sheet placed outside `<main>` for correct fixed positioning and z-index stacking context
- Search debounce at 300ms prevents rapid-fire D3 zoom transitions that could overwhelm the browser per T-03-07
- Edge references are remapped to actual node objects on each filter change to keep D3 forceLink simulation working with filtered subsets

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| Stub | File | Line | Resolved By |
|------|------|------|-------------|
| switchView() | graph.js | 854 | Plan 03 |
| View toggle handler | graph-ui.js | 43 | Plan 03 |

These stubs do not prevent the plan's goal (search, filter, and expand-in-place interactions) from being achieved.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Search, filter, and expand-in-place interactions are fully wired and functional
- View toggle stubs remain for Plan 03 to implement family tree view switching
- Graph module API is complete: init, switchView, filterByGroup, zoomToNode, expandNode, collapseNode
- Bottom sheet HTML and CSS are ready for reuse by future plans if needed

## Self-Check: PASSED
- All 4 modified files exist on disk
- Both task commits (bbfd39d, 95bb04b) found in git log

---
*Phase: 03-guest-graph*
*Completed: 2026-05-21*
