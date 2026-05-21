---
phase: 03-guest-graph
plan: 03
subsystem: ui
tags: [family-tree, d3-hierarchy, d3-tree, view-switching, crossfade, tree-layout]

# Dependency graph
requires:
  - phase: 03-guest-graph
    plan: 01
    provides: "NARSH_GUESTS data module with FAMILY_TREES, NARSH_GRAPH with switchView stub, page shell with view toggle HTML"
  - phase: 03-guest-graph
    plan: 02
    provides: "Search, filter, expand-in-place, bottom sheet, connection highlighting"
provides:
  - "renderFamilyTree with d3.hierarchy and d3.tree for side-by-side dual family layout"
  - "switchView with 400ms crossfade transition (200ms out + 200ms in) between social and tree views"
  - "filterFamilyTree for isolating Natalie's or Arash's family tree"
  - "Family-colored tree branches (gold #D4A843 for Natalie, teal #2A9D8F for Arash)"
  - "Couple connector dashed line (terracotta #C2704F) between Natalie and Arash"
  - "handleViewSwitch swaps filter bar between group filters and family filters"
  - "handleFamilyFilterClick with Both Families / Natalie's Family / Arash's Family buttons"
  - "Tree-specific CSS: .tree-branch, .couple-connector, .tree-node, .graph-inner crossfade"
affects: [03-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [d3.hierarchy for tree data structure, d3.tree for hierarchical layout, d3.linkVertical for branch paths, side-by-side dual tree positioning with offset computation, crossfade view transition via opacity]

key-files:
  created: []
  modified:
    - narsh2026/our-people/graph.js
    - narsh2026/our-people/graph-ui.js
    - narsh2026/our-people/our-people.css

key-decisions:
  - "Used d3.linkVertical for tree branch rendering with family-specific stroke colors"
  - "Tree nodes use expandTreeNode/collapseTreeNode (separate from social graph expand/collapse) because tree layout is static (no simulation reheat needed)"
  - "Crossfade implemented via D3 transition on innerGroupEl opacity rather than CSS class toggle, for consistent timing control"
  - "Family filter buttons rendered with data-family attribute (not data-group) to distinguish from social graph group filters"
  - "All family member names rendered via D3 .text() method (never .html()) per threat model T-03-08"

patterns-established:
  - "Dual tree layout pattern: compute each tree independently with d3.tree, calculate widths from node positions, offset second tree by first tree width + gap, center combined width in viewport"
  - "View switch pattern: fade out innerGroupEl, clear SVG groups, render new view, fade in -- preserves zoom transform across switches"
  - "Filter bar swap pattern: clear filterBarEl.textContent, render new button set (group or family) based on currentView"

requirements-completed: [GRAPH-02]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 03 Plan 03: Family Tree Layout and View Switching Summary

**Hierarchical family tree view with d3.hierarchy and d3.tree, side-by-side dual family layout, family-colored branch lines, couple connector, crossfade view transitions, and family filter buttons**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-21T15:41:11Z
- **Completed:** 2026-05-21T15:45:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Family tree rendering using d3.hierarchy and d3.tree with NODE_RADIUS_TREE (26px) and NODE_RADIUS_TREE_COUPLE (32px), always showing name + photo per D-16
- Side-by-side dual family layout: Natalie's tree on the left, Arash's tree on the right, with 120px gap and automatic centering in the viewport
- Family-colored tree branch lines using d3.linkVertical: gold (#D4A843) for Natalie's family, teal (#2A9D8F) for Arash's family
- Dashed couple connector line (terracotta #C2704F, stroke-dasharray 6 4) linking Natalie and Arash nodes
- Individual tree nodes for all family members even if they are household-merged in the social graph (per D-17)
- View switching with 400ms crossfade transition (200ms fade out, clear, render, 200ms fade in) or instant swap when reducedMotion is active
- Zoom transform preserved across view switches
- Family filter buttons ("Both Families", "Natalie's Family", "Arash's Family") replace group filter buttons when in tree view
- Search works in tree view (zoomToNode finds nodes in treeNodeData array and zooms with pulse)
- Tree node expand-in-place shows detail card below the node (desktop) or bottom sheet (mobile)
- Tree-specific CSS: .tree-branch (stroke-width 2, rounded caps), .couple-connector (dashed), .tree-node (cursor pointer, focus-visible outline), .graph-inner (crossfade transition), reduced motion overrides

## Task Commits

Each task was committed atomically:

1. **Task 1: Family tree layout rendering and view switching** - `4e64aa3` (feat)
2. **Task 2: Tree view CSS, crossfade polish, and accessibility refinements** - `fbae1c6` (feat)

## Files Created/Modified
- `narsh2026/our-people/graph.js` - Major update: renderFamilyTree with d3.hierarchy/d3.tree, drawTreeBranches with d3.linkVertical, drawTreeNodes with individual guest lookup, switchView with crossfade transition, filterFamilyTree, expandTreeNode/collapseTreeNode for tree-specific expand-in-place, updated zoomToNode for both views, clearSvgContent helper, treeNodeData tracking
- `narsh2026/our-people/graph-ui.js` - Major update: handleViewSwitch with toggle button state management and filter bar swapping, handleFamilyFilterClick with family filter active state, renderFamilyFilterButtons (Both Families/Natalie's Family/Arash's Family), renderGroupFilterButtons (renamed from renderFilterButtons for clarity)
- `narsh2026/our-people/our-people.css` - Added: .tree-branch (stroke-width 2, fill none, stroke-linecap round), .couple-connector (stroke-dasharray 6 4), .tree-node (cursor pointer), .tree-node:focus-visible (outline), .tree-node .node-label (font-size 14px, font-family), .tree-node .node-initials (font-family), .graph-inner (transition opacity 200ms), .graph-inner.fading (opacity 0), reduced motion additions for .graph-inner/.tree-branch/.tree-node/.couple-connector

## Decisions Made
- Used d3.linkVertical for tree branch rendering with per-family stroke colors, providing clean vertical parent-child paths
- Separated tree node expansion (expandTreeNode/collapseTreeNode) from social graph expansion because tree layout uses static positions (no force simulation to reheat)
- Crossfade implemented via D3 transition on innerGroupEl opacity (not CSS class) for precise timing control and callback-based content swap
- Family filter buttons use data-family attribute to distinguish from social graph's data-group attribute
- All text rendered via D3 .text() and DOM textContent per threat model T-03-08

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all stubs from Plans 01 and 02 (switchView, view toggle handler) are now resolved by this plan.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both social graph and family tree views are fully functional with view switching
- All four plan requirements complete (GRAPH-01 through GRAPH-04 from Plans 01-03, with GRAPH-02 completed in this plan)
- Plan 04 (performance and polish) can proceed with both views in place

## Self-Check: PASSED
- All 3 modified files exist on disk
- Both task commits (4e64aa3, fbae1c6) found in git log

---
*Phase: 03-guest-graph*
*Completed: 2026-05-21*
