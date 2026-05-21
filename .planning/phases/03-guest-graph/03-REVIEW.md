---
phase: 03-guest-graph
reviewed: 2026-05-21T17:45:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - narsh2026/our-people/graph-ui.js
  - narsh2026/our-people/graph.js
  - narsh2026/our-people/guest-data.js
  - narsh2026/our-people/index.html
  - narsh2026/our-people/our-people.css
  - narsh2026/styles.css
findings:
  critical: 3
  warning: 4
  info: 0
  total: 7
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-21T17:45:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

The guest graph implementation consists of a data module (guest-data.js), a D3 force-simulation renderer (graph.js), and a UI controller (graph-ui.js), with supporting HTML and CSS. The code is generally well-structured with proper DOM element creation (no innerHTML), good accessibility attributes (ARIA roles, focus trapping, keyboard handlers), and respect for prefers-reduced-motion.

However, the review surfaced three critical bugs that cause incorrect runtime behavior: search fails for any guest who belongs to a household, the expand-node function corrupts module state when a node ID is not found in the simulation, and five family members are missing from the family tree view. Four additional warnings address edge label drift during simulation, a view-switch race condition, detail card rendering on an empty selection, and a minor event listener mismatch.

## Critical Issues

### CR-01: Search fails silently for guests in households

**File:** `narsh2026/our-people/graph.js:369-390` cross-ref `narsh2026/our-people/guest-data.js:429-433`
**Issue:** `searchGuests()` returns individual guest objects (e.g., `{id: "sam", ...}`). `zoomToNode("sam")` then searches `simulation.nodes()` for a node with `id === "sam"`, but households merge members into a single node (e.g., `{id: "household-sam"}`). The lookup on line 385 (`nodes.find((n) => n.id === nodeId)`) returns `undefined`, and the function returns early on line 386. The UI announces "1 guest(s) found" but nothing happens visually. This affects Sam Chen, Jordan Park, Elena Vasquez, Lily Tanaka, Deepak Rai, and Sunita Rai -- 6 of 26 guests (23%).

In tree view the same bug applies: `zoomToNode` searches `treeNodeData` which may not contain household-merged IDs, though tree view renders individual nodes so it may work there. The social view path is definitively broken.

**Fix:** `zoomToNode` (or `searchGuests`) needs to resolve individual guest IDs to their household node ID. For example, add a lookup in `zoomToNode`:
```javascript
// In zoomToNode, before the social-view lookup:
let resolvedId = nodeId;
const memberToNode = new Map();
visibleNodes.forEach((n) => {
  if (n.memberIds) {
    n.memberIds.forEach((m) => memberToNode.set(m, n.id));
  }
});
if (memberToNode.has(nodeId)) {
  resolvedId = memberToNode.get(nodeId);
}
// Then use resolvedId instead of nodeId for the node lookup
```

### CR-02: expandNode sets expandedNodeId before validating node exists, corrupting state

**File:** `narsh2026/our-people/graph.js:504-516`
**Issue:** On line 513, `expandedNodeId = nodeId` is set unconditionally. On line 515-516, if `expandedNode` is not found in `simulation.nodes()`, the function returns early. At this point, `expandedNodeId` is set to a stale ID that has no corresponding visual node. Subsequent calls to `collapseNode()` will fail to find the node (line 783-784), leaving `expandedNodeId` permanently set (the `expandedNodeId = null` on line 876 is inside the same function but after the node-not-found path). This prevents any future node expansion because the guard on line 506 (`if (expandedNodeId === nodeId) return`) or line 509 (`if (expandedNodeId) { collapseNode(); }`) will trigger incorrectly, and `collapseNode` will call `simulation.nodes().find(...)` which will fail, leaving the escape handler never attached but `expandedNodeId` never cleared.

Concretely: `collapseNode` on line 783 does `const expandedNode = nodes.find(...)`. If it returns undefined, line 785 is falsy so the entire visual reset block is skipped, but `expandedNodeId` IS set to null on line 876 and the collapse callback fires. So the state does eventually clear on collapse -- but the escape handler is never attached (line 656-661 was never reached in `expandNode`), so there is no way for the user to trigger the collapse, and the node highlighting (lines 593-648) ran against a non-existent node, setting all nodes to 0.25 opacity with no way to restore them except clicking the SVG background.

**Fix:** Move the assignment after validation:
```javascript
const expandNode = (nodeId) => {
  if (expandedNodeId === nodeId) return;
  if (expandedNodeId) {
    collapseNode();
  }

  const nodes = simulation.nodes();
  const expandedNode = nodes.find((n) => n.id === nodeId);
  if (!expandedNode) return;

  expandedNodeId = nodeId;  // Move AFTER the guard
  // ... rest of function
};
```

### CR-03: Five family members missing from family tree view

**File:** `narsh2026/our-people/guest-data.js:380-421`
**Issue:** The `FAMILY_TREES` hierarchy omits five guests who have `familyTree` metadata in the `GUESTS` array:
- `natalie-dad` (Marc Fleury) -- Natalie's father, has `familyTree: { family: "natalie", parentId: null, generation: 1 }`
- `natalie-grandpa` (Henri Fleury) -- Natalie's grandfather, has `familyTree: { family: "natalie", parentId: null, generation: 2 }`
- `arash-dad` (Vikram Rai) -- Arash's father, has `familyTree: { family: "arash", parentId: null, generation: 1 }`
- `arash-grandpa` (Rajan Rai) -- Arash's grandfather, has `familyTree: { family: "arash", parentId: null, generation: 2 }`
- `arash-aunt` (Sunita Rai) -- Arash's aunt by marriage, has `familyTree: { family: "arash", parentId: null, generation: 1 }`

The `familyTree` property on each guest is never consumed by the rendering code (confirmed: grep shows zero references in graph.js or graph-ui.js). The actual tree is built exclusively from `FAMILY_TREES`. These five guests appear in the social graph but vanish in the family tree view.

Additionally, the tree roots are the grandmothers only (Rose Fleury, Anita Rai), with no representation of the grandfathers, creating a single-lineage tree that misrepresents the family structure.

**Fix:** Add the missing members to the `FAMILY_TREES` hierarchy. For example, make the grandparent generation a couple node or add separate roots:
```javascript
natalie: {
  id: "natalie-grandparents",
  name: "Rose & Henri Fleury",
  children: [
    {
      id: "natalie-parents",
      name: "Claire & Marc Fleury",
      children: [
        { id: "natalie", name: "Natalie Fleury", children: [] },
        { id: "natalie-brother", name: "Luc Fleury", children: [] }
      ]
    },
    { id: "natalie-aunt", name: "Sophie Laurent", children: [] }
  ]
}
```
Or add each missing person as a sibling/spouse node in the hierarchy. The `familyTree` metadata on individual guests should either be consumed by the tree builder (to auto-generate the hierarchy) or removed to avoid confusion.

## Warnings

### WR-01: Edge labels do not update position during simulation ticks

**File:** `narsh2026/our-people/graph.js:625-648`
**Issue:** When a node is expanded, edge type labels (e.g., "couple", "parent", "best-friend") are appended at the midpoint of connected edges based on current node positions (`src.x`, `src.y`, `tgt.x`, `tgt.y`). However, the simulation is reheated on line 528 (`simulation.alpha(ALPHA_REHEAT).restart()`), causing nodes to continue moving. The `onTick` handler (line 323-344) updates edge line positions but does not update edge label positions. The labels remain frozen at their initial coordinates while the edges drift, causing visual misalignment.

**Fix:** Either (a) add edge label position updates inside `onTick`, or (b) defer label rendering until the simulation has mostly settled (e.g., on `alphaMin` or after a fixed delay), or (c) lower the reheat alpha so node movement is negligible.

### WR-02: View switch crossfade has no transition cancellation guard

**File:** `narsh2026/our-people/graph.js:910-931`
**Issue:** `switchView` uses a 200ms fade-out transition with an `on("end")` callback that clears and re-renders content. If the user clicks the view toggle rapidly (e.g., double-click), a second `switchView` call starts while the first fade-out is still running. The first `on("end")` callback fires after the second call has already set up new content, corrupting the SVG state by clearing and re-rendering over the second view's content. D3 transitions on the same element cancel the previous transition, but the `on("end")` callback of the cancelled transition may still fire (D3 v6+ fires "end" only for non-interrupted transitions, but this depends on the D3 version loaded from CDN).

**Fix:** Add a guard variable or use `transition.interrupt()`:
```javascript
let viewSwitchId = 0;
const switchView = (view, familyFilter) => {
  const thisSwitch = ++viewSwitchId;
  // ... in the on("end") callback:
  .on("end", () => {
    if (thisSwitch !== viewSwitchId) return; // stale transition
    // ... proceed with render
  });
};
```

### WR-03: showDesktopDetailCard called outside targetNodeEl emptiness check

**File:** `narsh2026/our-people/graph.js:650-653`
**Issue:** `showDesktopDetailCard(expandedNode, targetNodeEl)` on line 652 is called outside the `if (!targetNodeEl.empty())` block (lines 544-580). If the DOM element for the node somehow does not exist (race condition, filter timing), `targetNodeEl` is an empty D3 selection. `showDesktopDetailCard` calls `targetNodeEl.append(...)` on an empty selection, which is a no-op in D3 but indicates the detail card silently fails to render with no user feedback or error.

**Fix:** Move the `showDesktopDetailCard` call inside the `if (!targetNodeEl.empty())` block:
```javascript
if (!targetNodeEl.empty()) {
  // ... existing visual updates ...
  
  if (window.innerWidth >= 768) {
    showDesktopDetailCard(expandedNode, targetNodeEl);
  }
}
```

### WR-04: Pinch hint timeout does not properly cancel the once listener

**File:** `narsh2026/our-people/graph.js:122-131`
**Issue:** `hideHint` is registered as a `touchstart` listener with `{ once: true }` (line 130) and also scheduled via `setTimeout` after 3 seconds (line 129). When `setTimeout` fires first, line 127 calls `removeEventListener("touchstart", hideHint)` to clean up the touch listener. However, the listener was added with `{ once: true }`, and browsers internally wrap `once` listeners. The `removeEventListener` call may not match the wrapped listener, leaving the `once` listener active. On the next touch, `hideHint` fires again (harmlessly, since `classList.add` is idempotent). The inverse path (touch fires first) works correctly because `once: true` auto-removes the listener, and `setTimeout` firing later is also idempotent.

**Fix:** Use a flag or `clearTimeout` approach instead:
```javascript
let hintTimer = null;
const hideHint = () => {
  hintEl.classList.add("hidden");
  if (hintTimer) clearTimeout(hintTimer);
};
hintTimer = setTimeout(hideHint, 3000);
document.addEventListener("touchstart", hideHint, { once: true });
```

---

_Reviewed: 2026-05-21T17:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
