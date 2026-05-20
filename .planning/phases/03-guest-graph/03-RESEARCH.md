# Phase 3: Guest Graph - Research

**Researched:** 2026-05-20
**Domain:** Interactive graph visualization (D3.js force-directed + hierarchical tree on static site)
**Confidence:** HIGH

## Summary

Phase 3 builds an interactive guest relationship visualization on the "Our People" page. The core challenge is implementing two distinct graph layouts -- a force-directed social network and a hierarchical family tree -- within a single page, with filtering, search, expand-in-place node interaction, and mobile touch support. All of this must work on a static GitHub Pages site with no build tools, loading D3.js v7 via CDN.

D3.js is the correct library choice. It natively provides both `d3-force` (force-directed simulation) and `d3-hierarchy` (tree layout) in a single CDN bundle, offers complete SVG control needed for photo-circle nodes with clip paths, and supports the expand-in-place interaction pattern through simulation manipulation. The project already demonstrates a successful CDN library integration pattern with Mapbox GL JS in Phase 2.

**Primary recommendation:** Use D3.js v7 via `cdn.jsdelivr.net/npm/d3@7` as a single script tag. Structure the code as three IIFE modules (`guest-data.js`, `graph.js`, `graph-ui.js`) following the Phase 2 pattern of `story-data.js` + `map.js` + `scroll-controller.js`. Implement the force-directed and tree layouts as two rendering modes within `graph.js`, driven by a shared data model in `guest-data.js`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Groups + typed edges -- guests belong to groups (both relationship-based and city-based), with key relationships getting explicit typed edges for emphasis.
- **D-02:** Large scale (80-150+ guests) -- graph needs clustering, smart zoom, and performance tuning.
- **D-03:** JSON data file committed to the repo (e.g., `guest-data.js`), matching the static site pattern established by `story-data.js` in Phase 2.
- **D-04:** Dual group dimensions -- each guest tagged with both a relationship group (e.g., "Arash's family", "College friends", "Meta coworkers") AND a city/location tag (e.g., "Seattle", "Waterloo", "India").
- **D-05:** Combined household nodes in social graph view -- couples/families attending together appear as a single node (e.g., "Sam & Jordan"). Individual nodes in family tree view.
- **D-06:** No explicit bride/groom side tagging -- the side is inferred from group membership.
- **D-07:** Start with placeholder data (~20-30 fake guests to validate the visualization). Real guest data will be populated later.
- **D-08:** All guests see the same graph regardless of auth tier (no tier-gated content on this page).
- **D-09:** Flat network layout -- no forced center on the couple. Natalie and Arash are nodes like everyone else, but with visual emphasis (larger size, distinct styling).
- **D-10:** Soft colored regions behind group clusters -- faint, rounded blobs of color that make group boundaries visually obvious even before filtering.
- **D-11:** Expand in place -- tapping/clicking a node grows it inline, revealing details. Surrounding nodes push outward.
- **D-12:** Flexible info display -- show whatever data exists for the guest. Only populated fields are shown.
- **D-13:** Search bar above the graph -- text input for finding and zooming to specific guests by name.
- **D-14:** Default tree view shows both families side by side, connected at the couple. Filter buttons allow showing just one family.
- **D-15:** Tree depth -- as deep as data allows. No fixed cutoff.
- **D-16:** Richer tree nodes -- bigger nodes in family tree view, always show name + photo.
- **D-17:** Individual nodes in family tree -- even couples who are combined into household nodes in the social graph appear as separate individuals in the family tree.
- **D-18:** Photo circle nodes -- circular nodes with profile photos (or warm-toned placeholder avatar/initials for guests without photos). All nodes get photo circles.
- **D-19:** Warm cream background -- same `--color-cream` (#FFF8F0) as the rest of the site.

### Claude's Discretion
- Graph visualization library selection (D3.js, vis.js, Cytoscape.js, or other) --> **Recommending D3.js v7** (see rationale below)
- Edge styling approach --> **Recommending thin lines with opacity-based typing** (see Edge Styling section)
- Connection highlighting behavior --> **Recommending dim-non-connected pattern** (see Connection Highlighting section)
- View switching UI pattern --> **Recommending segmented toggle** (see UI-SPEC alignment)
- Edge type labels for typed edges --> **Recommending labels-on-highlight-only** (see Edge Styling section)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GRAPH-01 | Force-directed network visualization shows connections between guests | D3 `d3-force` module provides `forceSimulation`, `forceLink`, `forceManyBody`, `forceCollide` for complete force-directed layout. Cluster regions via convex hull (`d3-polygon`). |
| GRAPH-02 | Family tree layout mode displays immediate family structure | D3 `d3-hierarchy` module provides `d3.tree()` and `d3.hierarchy()` for hierarchical tree layout. Supports arbitrary depth (D-15). |
| GRAPH-03 | Filters let guests view subsets by group (family, city, etc.) | Filter implementation by re-running simulation with filtered node/edge subsets. D3 enter/exit/update pattern handles node addition/removal with transitions. |
| GRAPH-04 | Core family member nodes display profile photos and names | SVG `<clipPath>` + `<image>` + `<text>` within `<g>` groups. D3 data binding to SVG elements. Initials fallback for missing photos. |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Graph data model (guests, edges, groups) | Static JS file (CDN/Static) | -- | Data is a committed JS file served as a static asset, no server |
| Force-directed layout computation | Browser / Client | -- | D3 force simulation runs entirely in the browser |
| Family tree layout computation | Browser / Client | -- | D3 hierarchy tree layout runs entirely in the browser |
| SVG rendering (nodes, edges, clusters) | Browser / Client | -- | All rendering is client-side SVG manipulation |
| Search / filter logic | Browser / Client | -- | In-memory filtering of the guest data array |
| Touch / zoom interaction | Browser / Client | -- | D3 zoom behavior handles pinch-zoom and pan |
| Auth guard | Browser / Client | -- | Existing NARSH_AUTH module checks localStorage |
| Photo assets | CDN / Static | -- | Images served from `narsh2026/images/` via GitHub Pages CDN |

## Project Constraints (from CLAUDE.md)

- **Hosting:** GitHub Pages (static files only, no server-side rendering)
- **No build tools:** No bundlers, no Node.js runtime, no transpilers
- **CDN only:** External libraries loaded via `<script>` tags from CDN
- **Code style:** `const` only (no `let`/`var`), double quotes, semicolons, 2-space indent
- **DOM refs:** Suffix `El` for element variables
- **IIFE module pattern:** `const MODULE_NAME = (() => { ... })()`
- **Root-relative paths:** `/narsh2026/...` for internal links and resources
- **CSS:** Phase-specific styles go in a separate CSS file (e.g., `our-people.css`), shared styles in `styles.css`
- **Google Fonts:** Playfair Display (headings) + Source Sans 3 (body) already loaded
- **Auth:** `NARSH_AUTH.requireAuth()` + `applyTierVisibility(tier)` on section pages

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| D3.js | v7 (latest v7.x) | Force-directed graph, tree layout, SVG manipulation, zoom/pan, transitions | Only library that provides both force-directed AND hierarchical tree layouts in a single CDN bundle with full SVG control. Industry standard for custom interactive visualizations. [ASSUMED -- v7 is the current major version as of training data; exact latest minor version not verified due to npm/web unavailability] |

### Supporting

No additional libraries needed. D3 v7's modular bundle includes all required sub-modules:

| D3 Sub-Module | Purpose | When Used |
|---------------|---------|-----------|
| d3-force | Force simulation (forceSimulation, forceLink, forceManyBody, forceCollide, forceCenter, forceX, forceY) | Social graph layout |
| d3-hierarchy | Tree layout (d3.hierarchy, d3.tree) | Family tree layout |
| d3-selection | DOM binding (selectAll, data, enter, exit, join) | All SVG element creation |
| d3-zoom | Pan and pinch-zoom (d3.zoom, transform) | Graph navigation on mobile and desktop |
| d3-transition | Animated state changes (duration, ease) | Expand-in-place, filter transitions, view switching |
| d3-polygon | Convex hull computation (d3.polygonHull) | Soft colored cluster regions |
| d3-shape | Line/path generators (d3.line, d3.curveBasis) | Tree branch lines, smoothed cluster region paths |
| d3-scale | Color/opacity mapping (d3.scaleOrdinal) | Cluster region color assignment |
| d3-ease | Easing functions | Animation timing |

[ASSUMED -- all sub-modules listed are included in the D3 v7 full bundle (`d3@7`). This is standard D3 bundling behavior but not verified against current CDN in this session.]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| D3.js | Cytoscape.js | Cytoscape has built-in graph model and layout algorithms but lacks SVG-level control for custom photo-circle nodes, expand-in-place animations, and soft cluster regions. Its tree layout is functional but less flexible. |
| D3.js | vis.js Network | vis.js has simpler API for basic network graphs but weak tree layout support, limited SVG customization, and the project is less actively maintained. |
| D3.js | Sigma.js | Sigma.js is WebGL-based (better for 10K+ nodes) but overkill for 80-150 nodes, and its canvas rendering makes SVG photo circles and accessibility harder. |
| D3.js | Force Graph (force-graph npm) | Wrapper around D3 force but adds abstraction that would fight the custom SVG requirements of this phase. |

**Installation:**
```html
<!-- In narsh2026/our-people/index.html, before local scripts -->
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
```

**Version verification:** npm registry was unavailable during research. D3 v7 is the current major version line. The CDN URL `d3@7` resolves to the latest v7.x minor/patch automatically. [ASSUMED -- exact latest version not verified]

## Architecture Patterns

### System Architecture Diagram

```
Guest Data (guest-data.js)
    |
    v
+-------------------+     +------------------+
| Graph Module      |     | UI Module        |
| (graph.js)        |<--->| (graph-ui.js)    |
|                   |     |                  |
| - Force simulation|     | - Search bar     |
| - Tree layout     |     | - View toggle    |
| - SVG rendering   |     | - Filter buttons |
| - Node expand     |     | - Bottom sheet   |
| - Cluster regions |     | - Pinch hint     |
| - Zoom/pan        |     |                  |
+-------------------+     +------------------+
    |                           |
    v                           v
+-----------------------------------------------+
| SVG Canvas (.graph-canvas)                     |
| - <g> zoom transform group                     |
|   - <g> cluster regions (background)           |
|   - <line> / <path> edges                      |
|   - <g> nodes (circle + image + text)          |
+-----------------------------------------------+
    |
    v
D3.js v7 (CDN) --- SVG in the DOM
```

Data flow:
1. `guest-data.js` loads as a global IIFE, exposing `NARSH_GUESTS` with guest list, edge list, group definitions, and family tree structure
2. `graph.js` consumes `NARSH_GUESTS` to build D3 force simulation or tree layout, renders SVG
3. `graph-ui.js` handles user interactions (search, filter, view toggle) and calls `graph.js` API to update the visualization
4. User interactions (tap, zoom, filter, search) modify simulation parameters or swap layouts
5. D3 transitions animate between states

### Recommended Project Structure

```
narsh2026/
  our-people/
    index.html          # Page shell: header, controls, SVG canvas, script loading
    our-people.css      # Phase-specific styles (controls, bottom sheet, graph overrides)
    guest-data.js       # NARSH_GUESTS IIFE: guest array, edge array, groups, family tree
    graph.js            # NARSH_GRAPH IIFE: D3 rendering, force sim, tree layout, zoom
    graph-ui.js         # NARSH_GRAPH_UI IIFE: search, filters, view toggle, expanded detail
  images/
    people/             # Guest profile photos (placeholder SVGs initially)
      placeholder.svg   # Default avatar placeholder
```

### Pattern 1: Guest Data Model (IIFE Data Module)

**What:** A structured JS data file following the `NARSH_STORY_DATA` pattern from Phase 2.
**When to use:** Loading guest data without a build step or fetch API.

```javascript
// Source: Project pattern from narsh2026/our-story/story-data.js [VERIFIED: codebase]
const NARSH_GUESTS = (() => {
  "use strict";

  const GROUPS = [
    { id: "arash-family", label: "Arash's Family", color: "#2A9D8F" },
    { id: "natalie-family", label: "Natalie's Family", color: "#D4A843" },
    { id: "college", label: "College Friends", color: "#C9928E" },
    { id: "meta", label: "Meta Coworkers", color: "#C2704F" }
  ];

  const CITIES = [
    { id: "seattle", label: "Seattle" },
    { id: "waterloo", label: "Waterloo" },
    { id: "india", label: "India" }
  ];

  // Each guest has: id, name, photo (optional), groups[], cities[],
  // funFact (optional), connectionToCouple (optional),
  // householdId (optional, for combining into household nodes),
  // familyTree (optional, for tree layout: { family, parentId, generation })
  const GUESTS = [
    {
      id: "natalie",
      name: "Natalie Fleury",
      photo: "/narsh2026/images/people/natalie.jpg",
      groups: ["natalie-family"],
      cities: ["seattle"],
      isCouple: true,
      familyTree: { family: "natalie", parentId: null, generation: 0 }
    },
    {
      id: "arash",
      name: "Arash Rai",
      photo: "/narsh2026/images/people/arash.jpg",
      groups: ["arash-family"],
      cities: ["seattle"],
      isCouple: true,
      familyTree: { family: "arash", parentId: null, generation: 0 }
    }
    // ... more guests
  ];

  // Typed edges for explicit relationships
  const EDGES = [
    { source: "natalie", target: "arash", type: "couple" },
    { source: "natalie", target: "sam", type: "best-friend" }
    // ... more edges
  ];

  // Household groupings for social graph combined nodes
  const HOUSEHOLDS = [
    { id: "household-1", members: ["sam", "jordan"], displayName: "Sam & Jordan" }
  ];

  // Family tree structure (for D3 hierarchy)
  const FAMILY_TREES = {
    natalie: { /* nested object for d3.hierarchy() */ },
    arash: { /* nested object for d3.hierarchy() */ }
  };

  const getGuestById = (id) => GUESTS.find(g => g.id === id) || null;
  const getGuestsByGroup = (groupId) => GUESTS.filter(g => g.groups.includes(groupId));
  const getGuestsByCity = (cityId) => GUESTS.filter(g => g.cities.includes(cityId));
  const searchGuests = (query) => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter(g => g.name.toLowerCase().includes(q));
  };

  return { GROUPS, CITIES, GUESTS, EDGES, HOUSEHOLDS, FAMILY_TREES,
           getGuestById, getGuestsByGroup, getGuestsByCity, searchGuests };
})();
```

### Pattern 2: D3 Force Simulation with Photo Nodes

**What:** Force-directed graph with SVG `<g>` nodes containing clipped circular photos.
**When to use:** Rendering the social graph view.

```javascript
// Source: D3.js d3-force API [ASSUMED -- based on training knowledge of D3 v7 API]
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("collide", d3.forceCollide().radius(d => d.radius + 8))
  .force("x", d3.forceX(width / 2).strength(0.05))
  .force("y", d3.forceY(height / 2).strength(0.05));

// Photo circle node with clip path
const defs = svg.append("defs");
nodes.forEach(node => {
  defs.append("clipPath")
    .attr("id", "clip-" + node.id)
    .append("circle")
    .attr("r", node.radius);
});

const nodeGroups = svg.selectAll(".node")
  .data(nodes)
  .join("g")
  .attr("class", "node")
  .attr("role", "button")
  .attr("tabindex", "0")
  .attr("aria-label", d => d.name);

// Photo or initials fallback
nodeGroups.each(function(d) {
  const g = d3.select(this);
  if (d.photo) {
    g.append("image")
      .attr("href", d.photo)
      .attr("width", d.radius * 2)
      .attr("height", d.radius * 2)
      .attr("x", -d.radius)
      .attr("y", -d.radius)
      .attr("clip-path", "url(#clip-" + d.id + ")");
  } else {
    g.append("circle")
      .attr("r", d.radius)
      .attr("fill", "#FFF8F0");
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .text(d.initials);
  }
  // Border circle
  g.append("circle")
    .attr("r", d.radius)
    .attr("fill", "none")
    .attr("stroke", d.isCouple ? "#C2704F" : "#C9928E")
    .attr("stroke-width", d.isCouple ? 3 : 2);
});
```

### Pattern 3: D3 Tree Layout for Family View

**What:** Hierarchical tree using `d3.tree()` with two root nodes connected at the couple.
**When to use:** Family tree view mode.

```javascript
// Source: D3.js d3-hierarchy API [ASSUMED -- based on training knowledge of D3 v7 API]

// Build hierarchy from nested data
const natalieRoot = d3.hierarchy(NARSH_GUESTS.FAMILY_TREES.natalie);
const arashRoot = d3.hierarchy(NARSH_GUESTS.FAMILY_TREES.arash);

// Create tree layout
const treeLayout = d3.tree().nodeSize([80, 120]);

// Compute positions
treeLayout(natalieRoot);
treeLayout(arashRoot);

// Offset Arash's tree to the right of Natalie's
const natalieWidth = /* compute from node positions */;
arashRoot.each(node => { node.x += natalieWidth + 100; });

// Draw branch lines with family-specific colors
const branchLine = d3.linkVertical()
  .x(d => d.x)
  .y(d => d.y);

svg.selectAll(".tree-branch")
  .data(natalieRoot.links().concat(arashRoot.links()))
  .join("path")
  .attr("class", "tree-branch")
  .attr("d", branchLine)
  .attr("stroke", d => d.source.data.family === "natalie" ? "#D4A843" : "#2A9D8F")
  .attr("stroke-width", 2)
  .attr("fill", "none");
```

### Pattern 4: Convex Hull Cluster Regions

**What:** Soft colored background regions behind each group cluster using `d3.polygonHull`.
**When to use:** Visual group boundaries in the social graph view (D-10).

```javascript
// Source: D3.js d3-polygon API [ASSUMED -- based on training knowledge]

const drawClusterRegions = (nodes, groups) => {
  groups.forEach(group => {
    const groupNodes = nodes.filter(n => n.groups.includes(group.id));
    if (groupNodes.length < 3) return; // Hull needs >= 3 points

    const points = groupNodes.map(n => [n.x, n.y]);
    const hull = d3.polygonHull(points);
    if (!hull) return;

    // Expand hull outward by padding
    const expanded = expandHull(hull, 24);

    svg.select(".cluster-regions")
      .append("path")
      .attr("d", smoothHullPath(expanded))
      .attr("fill", group.color)
      .attr("fill-opacity", 0.08)
      .attr("stroke", "none");
  });
};

// Smooth hull path with rounded corners using cardinal spline
const smoothHullPath = (points) => {
  const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(1));
  return line(points);
};
```

### Pattern 5: Expand-in-Place Node Interaction

**What:** Clicking a node grows it, pushes neighbors outward, and shows detail card.
**When to use:** Node detail reveal (D-11).

```javascript
// Source: D3 force simulation manipulation [ASSUMED -- based on training knowledge]

const expandNode = (nodeData) => {
  // Grow the node
  nodeData.radius = nodeData.expandedRadius;

  // Increase collision radius to push neighbors
  simulation.force("collide").radius(d =>
    d.id === nodeData.id ? nodeData.expandedRadius + 20 : d.radius + 8
  );

  // Reheat simulation to let nodes settle
  simulation.alpha(0.3).restart();

  // Dim non-connected nodes
  const connectedIds = new Set();
  connectedIds.add(nodeData.id);
  edges.forEach(e => {
    if (e.source.id === nodeData.id) connectedIds.add(e.target.id);
    if (e.target.id === nodeData.id) connectedIds.add(e.source.id);
  });

  svg.selectAll(".node")
    .transition().duration(200)
    .style("opacity", d => connectedIds.has(d.id) ? 1 : 0.25);

  svg.selectAll(".edge")
    .transition().duration(200)
    .style("opacity", d =>
      d.source.id === nodeData.id || d.target.id === nodeData.id ? 0.5 : 0.05
    );
};
```

### Pattern 6: Zoom and Pan with D3

**What:** D3 zoom behavior for desktop scroll-zoom and mobile pinch-zoom.
**When to use:** Graph navigation.

```javascript
// Source: D3.js d3-zoom API [ASSUMED -- based on training knowledge]

const zoom = d3.zoom()
  .scaleExtent([0.3, 3])
  .on("zoom", (event) => {
    innerGroup.attr("transform", event.transform);
  });

svg.call(zoom);

// Programmatic zoom to a node (for search results)
const zoomToNode = (node) => {
  const transform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(1.5)
    .translate(-node.x, -node.y);

  svg.transition()
    .duration(500)
    .call(zoom.transform, transform);
};
```

### Anti-Patterns to Avoid

- **Canvas rendering instead of SVG:** At 80-150 nodes, SVG performs fine and provides DOM-level accessibility (role, tabindex, aria attributes on each node). Canvas would require manual hit-testing and lose accessibility benefits.
- **Re-creating the entire SVG on filter change:** Use D3's enter/exit/update pattern (`.join()`) to add/remove only the changed nodes. Rebuilding the whole SVG causes visual flicker and loses zoom state.
- **Running force simulation indefinitely:** Set `simulation.alphaDecay(0.03)` so the simulation cools and stops. An always-running simulation burns CPU and makes the graph feel "jittery" after settling.
- **Separate D3 sub-module CDN imports:** Load the full `d3@7` bundle, not individual sub-modules. The full bundle is ~270KB gzipped but avoids version conflicts between sub-modules.
- **Using `<img>` tags inside SVG:** Use SVG `<image>` element with `href` attribute (not `src`). `<img>` tags don't work inside SVG elements.
- **Hardcoding pixel positions:** All positions should flow from the force simulation or tree layout. Hardcoded positions break when data changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Force-directed layout | Custom physics loop | `d3.forceSimulation()` with `forceLink`, `forceManyBody`, `forceCollide` | Stable, performant physics simulation with tunable parameters. Hand-rolling springs/repulsion is a multi-week project. |
| Hierarchical tree layout | Manual coordinate calculation | `d3.tree()` + `d3.hierarchy()` | Handles arbitrary depth, variable node sizes, and automatically computes non-overlapping positions. |
| Convex hull computation | Manual geometry | `d3.polygonHull()` | Correct convex hull in O(n log n). Edge cases (collinear points, < 3 points) are handled. |
| SVG zoom/pan with touch | Custom touch event handling | `d3.zoom()` | Handles mouse wheel, trackpad, touch pinch-zoom, momentum, scale limits. Touch gesture math is notoriously difficult. |
| SVG path smoothing | Manual bezier curves | `d3.line().curve(d3.curveCatmullRomClosed)` | Smooth curves through arbitrary points. Hand-rolling bezier control points for organic shapes is error-prone. |
| Data binding to DOM | Manual createElement loops | `d3.selectAll().data().join()` | Enter/update/exit pattern handles additions, removals, and updates efficiently with transitions. |

**Key insight:** D3's value in this phase is not just rendering -- it's the physics simulation, layout algorithms, and interaction primitives (zoom, drag, transitions) that would take weeks to hand-roll and would be buggier and less performant.

## Common Pitfalls

### Pitfall 1: Force Simulation Never Settles (Jittery Graph)
**What goes wrong:** The force-directed graph keeps jiggling after initial render, making it feel unstable and hard to interact with.
**Why it happens:** Default `alphaDecay` is 0.0228 which settles in ~300 ticks. If forces are poorly balanced (charge too strong, link distance too short), the simulation oscillates. Also, reheating alpha to 1.0 on every interaction restarts from scratch.
**How to avoid:** Use moderate force strengths (`charge: -200`, `link distance: 80`). When reheating for expand-in-place, use `alpha(0.3)` not `alpha(1)`. Set `alphaMin(0.001)` so it fully stops. Add `velocityDecay(0.4)` for faster settling.
**Warning signs:** Nodes still moving after 3+ seconds on initial render; nodes bounce when you click nearby.

### Pitfall 2: SVG Image Elements with CORS Issues
**What goes wrong:** Photo circle nodes show as broken images or empty circles.
**Why it happens:** SVG `<image>` elements are subject to CORS policies. If images are loaded from a different origin, or if the site has strict CSP headers, photos won't render.
**How to avoid:** All photos should be served from the same origin (`/narsh2026/images/people/`), which is the case for GitHub Pages. Use root-relative paths. Always implement the initials fallback so nodes are visible even if images fail. Add an `onerror` handler or test image loading.
**Warning signs:** Console shows CORS errors; photos work in dev but not on GitHub Pages.

### Pitfall 3: Mobile Touch Events Conflicting with D3 Zoom
**What goes wrong:** Tapping a node triggers zoom instead of expand, or pinch-zoom doesn't work because touch events are consumed.
**Why it happens:** D3 zoom captures all touch events on the SVG. Node click handlers must stop propagation to prevent zoom from intercepting taps.
**How to avoid:** Attach click/tap handlers on the node `<g>` elements with `event.stopPropagation()`. Use `d3.zoom().filter()` to exclude events on nodes from zoom behavior. On mobile, differentiate tap (< 200ms, < 10px movement) from pan (longer/more movement).
**Warning signs:** Nodes can't be tapped on mobile; zooming doesn't work; tapping background doesn't collapse expanded node.

### Pitfall 4: Convex Hull Fails with < 3 Points
**What goes wrong:** `d3.polygonHull()` returns `null` when a group has fewer than 3 members, causing "Cannot read property of null" errors.
**Why it happens:** Convex hull is undefined for fewer than 3 non-collinear points.
**How to avoid:** Guard: if group has 0-1 members, skip the region. If 2 members, draw an ellipse between them instead of a hull. If 3+, use hull. Also handle collinear points (hull returns null) by adding small random jitter to coincident positions.
**Warning signs:** Console errors on filter to a small group; cluster regions disappear for small groups.

### Pitfall 5: View Switch Loses Graph State
**What goes wrong:** Switching between social graph and family tree resets zoom level, loses search query, or causes a full-page flash.
**Why it happens:** Naive implementation destroys and recreates all SVG elements.
**How to avoid:** Keep both layouts' data computed. On view switch, crossfade between two `<g>` groups (one for social, one for tree). Preserve the zoom transform state. Maintain search input value across view switches.
**Warning signs:** Visible flash/jump when toggling views; zoom resets to default; search input clears.

### Pitfall 6: Performance Degrades at 150+ Nodes
**What goes wrong:** Force simulation takes too long to settle; interactions feel laggy.
**Why it happens:** Force simulation is O(n^2) for many-body forces. At 150 nodes with household combining, actual node count may be ~100-120, which is manageable, but if edges are dense (>300), link force iterations compound.
**How to avoid:** Limit link force iterations to 1 (`forceLink().iterations(1)`). Use Barnes-Hut approximation (D3's default for many-body). Consider pre-computing initial positions and starting simulation from those. Hide edge labels except on hover/expand.
**Warning signs:** Visible lag when filtering/unfiltering; force simulation takes > 5s to settle.

### Pitfall 7: Household Node Data Inconsistency
**What goes wrong:** Combined household nodes in social graph reference individual IDs in edges, breaking the link force.
**Why it happens:** The data model has individuals in `GUESTS` array but edges reference individual IDs. When combining into households, edge source/target IDs no longer match node IDs.
**How to avoid:** Transform the data before simulation: create a `socialNodes` array where household members are merged into one node, and remap edges to point to the household node ID. Keep the original individual data for tree view.
**Warning signs:** Edges don't render; console shows "node not found" warnings from D3 link force.

## Code Examples

### Example 1: Full Page Shell Structure

```html
<!-- Source: Project patterns from Phase 1/2 [VERIFIED: codebase] -->
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
    <a href="#graph-canvas" class="skip-to-graph">Skip to guest graph</a>
    <header class="site-header">
      <!-- same header/nav as other pages -->
    </header>
    <main class="graph-page">
      <h1>Our People</h1>
      <div class="graph-controls">
        <input type="search" class="graph-search" placeholder="Search for a guest..."
               aria-label="Search guests">
        <div class="view-toggle" role="radiogroup" aria-label="View mode">
          <button role="radio" aria-checked="true" class="view-btn active"
                  data-view="social">Everyone</button>
          <button role="radio" aria-checked="false" class="view-btn"
                  data-view="tree">Family Tree</button>
        </div>
      </div>
      <div class="filter-bar" role="group" aria-label="Filter by group">
        <!-- Filter buttons rendered by JS from NARSH_GUESTS.GROUPS -->
      </div>
      <div class="graph-loading" id="graph-loading">Drawing the connections...</div>
      <div class="graph-error hidden" id="graph-error"></div>
      <svg class="graph-canvas" id="graph-canvas" role="img"
           aria-label="Interactive guest relationship visualization"
           aria-describedby="graph-desc">
        <desc id="graph-desc"></desc>
      </svg>
      <div class="pinch-hint" id="pinch-hint">Pinch to zoom, tap a face to learn more</div>
      <div aria-live="polite" class="search-announce" id="search-announce"></div>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
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

### Example 2: IIFE Module Pattern for Graph Module

```javascript
// Source: Project pattern from narsh2026/our-story/map.js [VERIFIED: codebase]
const NARSH_GRAPH = (() => {
  "use strict";

  let svgEl = null;
  let simulation = null;
  let currentView = "social"; // "social" or "tree"
  let expandedNodeId = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const init = (containerId) => {
    svgEl = d3.select("#" + containerId);
    const width = svgEl.node().clientWidth;
    const height = svgEl.node().clientHeight;

    // Set viewBox for responsive scaling
    svgEl.attr("viewBox", [0, 0, width, height]);

    // Setup zoom
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        innerGroupEl.attr("transform", event.transform);
      });
    svgEl.call(zoomBehavior);

    // Inner group for zoom transform
    const innerGroupEl = svgEl.append("g").attr("class", "graph-inner");

    // Layer ordering: clusters (back) -> edges -> nodes (front)
    innerGroupEl.append("g").attr("class", "cluster-regions");
    innerGroupEl.append("g").attr("class", "edges");
    innerGroupEl.append("g").attr("class", "nodes");

    renderSocialGraph(innerGroupEl, width, height);
  };

  // ... renderSocialGraph, renderFamilyTree, expandNode, collapseNode,
  //     filterByGroup, zoomToNode, switchView ...

  return { init, switchView, filterByGroup, zoomToNode, expandNode, collapseNode };
})();
```

### Example 3: Font Weight 600 in Google Fonts Link

```html
<!-- IMPORTANT: The current Google Fonts link only loads weight 400.
     Node labels need weight 600 (semibold). Update the link: -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
```

[VERIFIED: Current `our-people/index.html` only loads `Source+Sans+3:wght@400`. The UI-SPEC requires 600 weight for node name labels. The Google Fonts link must be updated.]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 v3/v4 selection pattern (`.enter().append()` + `.exit().remove()`) | D3 v7 `.join()` method | D3 v5+ (2018) | Simpler, less boilerplate for enter/update/exit |
| D3 separate module imports (`d3-force`, `d3-hierarchy`) | Single `d3@7` CDN bundle includes all modules | D3 v7 (2021) | One script tag gets everything |
| Manual SVG viewBox + resize listeners | CSS `width: 100%; height: auto` with viewBox | Always available, but pattern solidified with responsive SVG | Responsive graph without JS resize handlers |
| `xlink:href` for SVG images | `href` (without namespace) | SVG 2 spec, supported in all modern browsers | Simpler attribute, `xlink:href` deprecated |

**Deprecated/outdated:**
- `xlink:href` on SVG `<image>`: Use plain `href` instead. All modern browsers support it. D3's `.attr("href", ...)` does the right thing. [ASSUMED]
- D3 v3 `d3.layout.force()`: Replaced by `d3.forceSimulation()` in D3 v4+. [ASSUMED]
- `d3.event` global: Removed in D3 v7. Event is now passed as first argument to event handlers. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | D3 v7 is the current major version line and `d3@7` CDN URL resolves correctly | Standard Stack | Low -- D3 v7 has been stable since 2021; even if v8 exists, v7 CDN URL would still work |
| A2 | Full D3 v7 bundle includes d3-force, d3-hierarchy, d3-polygon, d3-zoom, d3-transition, d3-selection, d3-shape, d3-scale, d3-ease | Standard Stack | Medium -- if any module is excluded from the bundle, specific features would break. Verify with a test import. |
| A3 | `d3.polygonHull()` returns null for < 3 points or collinear points | Common Pitfalls | Low -- well-documented behavior, but should be tested |
| A4 | SVG `<image>` `href` attribute (without xlink namespace) works in all target browsers | State of the Art | Low -- standard since SVG 2, supported in Chrome 50+, Firefox 51+, Safari 12+ |
| A5 | D3 v7 passes event as first argument to handlers (no `d3.event` global) | State of the Art | Medium -- code that uses `d3.event` will silently fail. Verify during implementation. |
| A6 | `d3.forceSimulation` Barnes-Hut approximation handles 150 nodes adequately | Common Pitfalls | Low -- D3 force is routinely used with hundreds of nodes in production |
| A7 | D3 v7 bundle is ~270KB gzipped via CDN | Standard Stack | Low -- approximate size from training data; CDN may serve slightly different size |

## Open Questions

1. **Exact D3 v7 CDN version number**
   - What we know: `d3@7` resolves to latest v7.x on jsdelivr
   - What's unclear: Whether latest is 7.9.x or newer
   - Recommendation: The CDN URL `d3@7` auto-resolves; no action needed unless pinning is desired

2. **Placeholder photo SVG design**
   - What we know: Nodes without photos show initials on warm cream background
   - What's unclear: Whether to create a single generic avatar SVG or use pure CSS/SVG initials
   - Recommendation: Use inline SVG initials (circle + text) -- no additional file needed, consistent with the node rendering approach

3. **Family tree data structure for dual-root tree**
   - What we know: Both families displayed side by side, connected at the couple (D-14)
   - What's unclear: Whether to model as one tree with virtual root above both families, or two separate trees positioned side by side
   - Recommendation: Two separate `d3.hierarchy()` trees, each rooted at the eldest ancestor, positioned side by side with the couple nodes connected by a special "couple connector" path. This is simpler than a virtual root and matches the visual intent.

4. **Household node merging strategy for edges**
   - What we know: Household nodes combine multiple guests in social view (D-05)
   - What's unclear: When an edge targets one member of a household, should it point to the household node or be hidden?
   - Recommendation: Remap edges to the household node. If edge source and target are in the same household, hide the edge (internal household relationships are implicit).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| D3.js v7 (CDN) | Graph rendering | N/A (runtime CDN load) | v7.x | Error message: "The guest graph couldn't load. Try refreshing the page." |
| GitHub Pages | Hosting | Yes | -- | -- |
| Modern browser (SVG 2, ES6) | All rendering | Yes (target audience) | -- | Graceful degradation: show static guest list |

Step 2.6: No local tool dependencies. D3 is loaded at runtime via CDN. No build tools, no npm, no CLI tools needed.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (auth handled by existing NARSH_AUTH module) | Existing auth.js |
| V3 Session Management | No (localStorage tier, already implemented) | Existing pattern |
| V4 Access Control | Minimal -- D-08 says all tiers see same graph | NARSH_AUTH.requireAuth() gate |
| V5 Input Validation | Yes -- search input | Sanitize search query before DOM insertion; use `textContent` not `innerHTML` |
| V6 Cryptography | No | -- |

### Known Threat Patterns for Static Site + D3

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via search input | Tampering | Use `textContent` for DOM insertion, never `innerHTML`. D3's `.text()` method is safe. |
| Guest data exposure | Information Disclosure | All guest data is client-side by design (D-08). No private data in the graph. Fun facts and connections are intentionally public to all authenticated guests. |
| SVG injection via photo paths | Tampering | Photo paths are hardcoded in `guest-data.js` (not user-supplied). Use relative paths only. |

## Sources

### Primary (HIGH confidence)
- Project codebase files: `narsh2026/styles.css`, `narsh2026/auth.js`, `narsh2026/nav.js`, `narsh2026/our-story/story-data.js`, `narsh2026/our-story/map.js`, `narsh2026/our-story/index.html`, `narsh2026/our-people/index.html` -- verified patterns, conventions, and integration points [VERIFIED: codebase]
- `.planning/phases/03-guest-graph/03-CONTEXT.md` -- all locked decisions and discretion areas [VERIFIED: codebase]
- `.planning/phases/03-guest-graph/03-UI-SPEC.md` -- complete visual and interaction contract [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- D3.js API knowledge: `d3-force`, `d3-hierarchy`, `d3-zoom`, `d3-polygon`, `d3-selection`, `d3-transition` -- based on extensive training data for D3 v7, not verified against current docs in this session [ASSUMED]

### Tertiary (LOW confidence)
- D3 v7 exact version number and CDN bundle size [ASSUMED -- could not verify due to npm registry and web access being unavailable]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- D3.js is the clear best choice for this combination of requirements (force-directed + tree + SVG control + CDN). No serious alternative exists.
- Architecture: HIGH -- Module structure follows established Phase 2 patterns. Data model design follows established `story-data.js` pattern.
- Pitfalls: HIGH -- D3 force simulation pitfalls are well-documented in training data and directly relevant to this use case.
- D3 API specifics: MEDIUM -- Based on training knowledge, not verified against current docs. Core API is stable but minor details (parameter names, default values) should be verified during implementation.

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (D3 v7 API is stable; 30-day window appropriate)
