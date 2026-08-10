# Handoff — Narsh 2026 "Our People" page

_Prepared mid-session so a fresh Claude can continue. Latest commit at handoff: `ed9a183` on `master`._

## Project
Wedding website `arashrai.github.io` (static, GitHub Pages, deploys on push to `master`; live at arashrai.com/narsh2026/). The **Our People** page (`narsh2026/our-people/`) is an interactive D3 graph with two views: **Everyone** (force-directed social graph) and **Family Tree** (couple-based genealogy chart).

## Key files
- `narsh2026/our-people/guests.csv` — **source of truth** (hand-edited by Natalie).
- `narsh2026/our-people/build-guests.js` — compiler. Run `node narsh2026/our-people/build-guests.js` to regenerate `guest-data.js`. Also **stamps a `?v=YYYYMMDDHHMM` cache-bust** onto the script/style tags in `index.html` every run.
- `narsh2026/our-people/guest-data.js` — **generated, do not hand-edit**. Exports GROUPS, CITIES, GUESTS (each has `side`, `parents`, `groups`, `photo`, etc.), EDGES, HOUSEHOLDS, MARRIAGES.
- `narsh2026/our-people/graph.js` — rendering. `renderSocialGraph()` (~L154), `drawClusterRegions()` (~L346, draws group convex-hull blobs), `renderFamilyTree()` + `layoutSide()` (couple-based tree).
- `narsh2026/our-people/graph-ui.js` — filters/search/bottom-sheet.

## Data model / rules (already implemented)
- `parent` column = parentage (solid lines). `comes_with` = spouse.
- Family **sides** assigned by flooding parentage links out from `natalie` / `arash` (auto-includes untagged blood relatives); fallback to family-group tag.
- **MARRIAGES**: from shared-child OR any `comes_with` (even one-directional), excluding parent-child and siblings.
- Family tree = couple units (spouses adjacent, one dashed line between them, kids from the midpoint), couples share a generation row, Natalie edge-pulled right / Arash left so they're adjacent. Sibling order follows CSV row order; couple member order by which spouse's parent is further left.

## Environment caveats
- **Cannot render headlessly here** — `browser` CLI install is blocked and Chrome launch fails in this sandbox. Validate logic structurally with small Node scripts (eval the generated `guest-data.js`), then push for Natalie to view.
- `grep`/`search_files` behave oddly on this local repo; use `Read` for exact edit anchors.
- Bash cwd sometimes resets to `/Users/nataliefleury/programming`; use absolute paths or `cd` into the repo.
- Deploy = `git push origin master`. Cache-busting is automatic via build; Natalie no longer needs hard-refresh.

## OUTSTANDING REQUEST (do this next) — "Everyone" / social graph view
1. **Label each group blob.** Each colored cluster blob (e.g. "Stripe Coworkers") should show its group name **inside the blob**, in the blob's color but **slightly darker**. Likely in `drawClusterRegions()` — after computing each group's hull, place a `<text>` at the hull centroid (or the group's cluster anchor) with a darkened `group.color`.
2. **Keep non-members out of a group's blob (Venn-like).** Currently blobs are convex hulls of member positions and unrelated nodes can fall inside. Add a **group-clustering force** in `renderSocialGraph()`'s simulation: give each GROUP an anchor (e.g. arranged on a circle around center) and a custom force pulling each node toward the mean of ITS groups' anchors (multi-group people land in the overlap → intersections, which is desired). Reduce the current center gravity (`forceX/forceY` strength 0.05) so groups separate. Nodes with no group drift to center/periphery, not inside a blob. "As best you can" — perfect exclusion isn't guaranteed with convex hulls; strong separation is the goal. Consider padding hulls or using the anchor-based blob.

## Verified-good state (don't regress)
Family-tree: Natalie & Arash adjacent; couples on shared rows; Shawna⟷William, Rosanne⟷Steve, Glen⟷Jennifer, Cindy⟷Rene, Kendra⟷Kyle, Amritpal⟷Jatinder; William left of Shawna; Gabrielle & Kyle left of Ben & Serenity.
