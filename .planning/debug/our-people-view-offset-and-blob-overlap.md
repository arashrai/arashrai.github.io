---
status: investigating
trigger: "Two bugs on the Our People page (narsh2026/our-people/). Both live in graph.js. BUG 1 - Everyone view is offset left after a round-trip through Family Tree (regression, diagnosis confirmed by user). BUG 2 - People overlap group blobs they don't belong to (needs investigation)."
created: 2026-08-08T00:00:00Z
updated: 2026-08-08T00:00:00Z
---

## Current Focus

hypothesis: (bug 2) nodes land geometrically inside convex hulls of groups they do not belong to, because groupClusterForce only targets the mean of a node's OWN group anchors and nothing repels a node from a foreign group's hull; the hull is a convex polygon over member positions plus 14px expansion, so any non-member sitting in that convex span reads as false Venn overlap
test: headless re-implementation of the exact d3 force simulation from renderSocialGraph, run to convergence against real guest-data.js, then point-in-polygon each node against every expanded hull it is not a member of
expecting: a non-zero count of (node, foreign group) containments if the hypothesis holds; zero would refute it
next_action: build /tmp/venn-probe.mjs harness loading /tmp/d3.min.js + guest-data.js and report containment counts

## Symptoms

expected:
  - bug 1: switching Everyone -> Family Tree -> Everyone leaves the Everyone view framed where the user left it
  - bug 2: a person is only drawn inside the blobs of groups they belong to
actual:
  - bug 1: returning to Everyone is offset to the left
  - bug 2: people appear inside group blobs they are not members of
errors: none (no console errors reported)
reproduction:
  - bug 1: load Our People, switch to Family Tree, switch back to Everyone
  - bug 2: load Our People in Everyone view, observe blob overlaps
started:
  - bug 1: after commit 78f5497 "frame the family tree camera on Natalie and Arash" (added frameOnCouple)
  - bug 2: aggravated after 98b89c2 (Natalie and Arash each gained 5 group memberships)

## Eliminated

## Evidence

- timestamp: t0
  checked: graph.js switchView (1062-1114), frameOnCouple (1128-1170)
  found: currentTransform is read at line 1073 from the LIVE zoom state; frameOnCouple applies its own transform via zoomBehavior.transform at the end of renderFamilyTree, so the live state after a tree render is T_tree. Next switch back to social captures and restores T_tree.
  implication: bug 1 root cause confirmed as described; fix is to persist the social transform separately.

- timestamp: t0
  checked: graph.js groupClusterForce (135-165), computeGroupAnchors (116-129), drawClusterRegions (470-526)
  found: force target for a node is the arithmetic mean of its own groups' anchors only. Hull is d3.polygonHull (CONVEX) over member positions, expanded 14px radially.
  implication: nothing in the model excludes non-members from a group's convex hull; needs numeric confirmation.

## Resolution

bug 1: RESOLVED
  root_cause: switchView read the camera from the LIVE zoom state at switch time.
    frameOnCouple overwrites that state with a transform built from family-tree
    layout coordinates, so the social -> tree -> social round trip replayed a
    tree-space transform against the force layout and pushed it off to the left.
  fix: added a dedicated `socialTransform` (graph.js:66), parked when LEAVING the
    social view (graph.js:1081) and restored on return. Guarded on the outgoing
    view so a tree -> tree re-render (family filter change) cannot clobber it.
    Stays null on first load, which correctly means identity / naturally centered.
  verification: code inspection + syntax check only. NOT confirmed in a live
    browser — the page sits behind the Supabase magic-link gate. Needs a manual
    toggle (Everyone -> Family Tree -> Everyone) to sign off.
  files_changed: [narsh2026/our-people/graph.js]

bug 2: STILL OPEN — not investigated in this session. The /tmp/venn-probe.mjs
  harness described in next_action was never built; hypothesis stands unconfirmed.
