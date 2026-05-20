# Phase 3: Guest Graph - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the interactive guest relationship visualization on the "Our People" page (`narsh2026/our-people/`). It combines a force-directed social graph with a family tree layout mode, filterable by group (relationship and city), with profile photos on nodes. Guests can search for specific people and tap nodes to expand details in place.

</domain>

<decisions>
## Implementation Decisions

### Guest Data Structure
- **D-01:** Groups + typed edges — guests belong to groups (both relationship-based and city-based), with key relationships getting explicit typed edges for emphasis.
- **D-02:** Large scale (80-150+ guests) — graph needs clustering, smart zoom, and performance tuning.
- **D-03:** JSON data file committed to the repo (e.g., `guest-data.js`), matching the static site pattern established by `story-data.js` in Phase 2.
- **D-04:** Dual group dimensions — each guest tagged with both a relationship group (e.g., "Arash's family", "College friends", "Meta coworkers") AND a city/location tag (e.g., "Seattle", "Waterloo", "India").
- **D-05:** Combined household nodes in social graph view — couples/families attending together appear as a single node (e.g., "Sam & Jordan"). Individual nodes in family tree view.
- **D-06:** No explicit bride/groom side tagging — the side is inferred from group membership (e.g., "Arash's family" implies groom's side).
- **D-07:** Start with placeholder data (~20-30 fake guests to validate the visualization). Real guest data will be populated later.
- **D-08:** All guests see the same graph regardless of auth tier (no tier-gated content on this page).

### Graph Layout
- **D-09:** Flat network layout — no forced center on the couple. Natalie and Arash are nodes like everyone else, but with visual emphasis (larger size, distinct styling) that makes them naturally prominent.
- **D-10:** Soft colored regions behind group clusters — faint, rounded blobs of color that make group boundaries visually obvious even before filtering.

### Node Interaction
- **D-11:** Expand in place — tapping/clicking a node grows it inline, revealing details. Surrounding nodes push outward to make room.
- **D-12:** Flexible info display — show whatever data exists for the guest. Some guests may have name + photo + groups only; others may also have a fun fact and/or connection to the couple. The data model supports all fields, but only populated fields are shown.
- **D-13:** Search bar above the graph — text input for finding and zooming to specific guests by name. Essential at 80-150+ scale.

### Family Tree View
- **D-14:** Default tree view shows both families side by side, connected at the couple (Natalie & Arash). Filter buttons allow showing just "Natalie's Family" or "Arash's Family" for a simplified view.
- **D-15:** Tree depth — as deep as data allows. No fixed cutoff. Could include parents, grandparents, aunts, uncles, cousins, etc.
- **D-16:** Richer tree nodes — in family tree view, nodes are bigger and always show name + photo (not just on click), since there are fewer nodes and more visual space.
- **D-17:** Individual nodes in family tree — even couples who are combined into household nodes in the social graph appear as separate individuals in the family tree.

### Visual Style
- **D-18:** Photo circle nodes — circular nodes with profile photos (or warm-toned placeholder avatar/initials for guests without photos). All nodes get photo circles, not just core family members.
- **D-19:** Warm cream background — same `--color-cream` (#FFF8F0) as the rest of the site. Consistent feel across pages.

### Claude's Discretion
- Graph visualization library selection (D3.js, vis.js, Cytoscape.js, or other — pick what best supports force-directed layout, family tree layout, expand-in-place interaction, clustering, and works via CDN on a static site)
- Edge styling (thin lines, styled by relationship type, or other approach — optimize for readability at 80-150+ nodes)
- Connection highlighting when a node is expanded (whether connected nodes/edges should highlight or dim non-connected nodes)
- View switching UI pattern (toggle buttons, tabs, etc. — whatever works best on both mobile and desktop)
- Edge type labels for typed edges (family labels like sibling/parent/cousin + meaningful bonds like best friend, roommate, introduced-us, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core project context, constraints (GitHub Pages, static-only, free hosting), guest tiers, design direction
- `.planning/REQUIREMENTS.md` — Full requirement list; Phase 3 covers GRAPH-01 through GRAPH-04
- `.planning/ROADMAP.md` — Phase goals and success criteria

### Prior Phase Context (carries forward)
- `.planning/phases/01-access-design-foundation/01-CONTEXT.md` — Design system decisions (D-04 sunset palette, D-05 subtle warmth, D-07 multi-page structure), established patterns
- `.planning/phases/02-map-timeline/02-CONTEXT.md` — Journey line colors (teal = Arash, gold = Natalie, family wedding-day colors), Mapbox integration pattern, CDN library loading

### Existing Code (built in Phases 1 & 2)
- `narsh2026/styles.css` — Shared CSS design system with color tokens, typography, spacing, shadows
- `narsh2026/auth.js` — Auth module (requireAuth, applyTierVisibility) — Our People page needs auth guard
- `narsh2026/nav.js` — Navigation toggle module — Our People page uses shared nav
- `narsh2026/our-people/index.html` — Current placeholder page (will be replaced with the guest graph)
- `narsh2026/our-story/story-data.js` — Example of the JS data file pattern used in Phase 2 (reference for guest-data.js structure)

### Codebase Analysis
- `.planning/codebase/STACK.md` — Current stack: plain HTML/CSS/JS, no build tools
- `.planning/codebase/STRUCTURE.md` — Current file layout
- `.planning/codebase/CONVENTIONS.md` — Code style conventions (const only, double quotes, IIFE modules, El suffix)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `narsh2026/styles.css` — CSS custom properties (:root tokens) for colors, fonts, spacing, shadows. Graph page styles should use these tokens. Includes journey line colors (`--color-journey-arash: #2A9D8F`, `--color-journey-natalie: #D4A843`) which could be reused for family-specific graph elements.
- `narsh2026/auth.js` — NARSH_AUTH.requireAuth() and applyTierVisibility(tier) for auth guard on the Our People page.
- `narsh2026/nav.js` — Shared hamburger nav module. Our People page already loads this.
- `narsh2026/our-story/story-data.js` — Pattern for structured data files (const STORY_DATA = [...]).

### Established Patterns
- No build step: external JS libraries must be loaded via CDN `<script>` tags
- IIFE module pattern for JS (`const NARSH_AUTH = (() => { ... })()`)
- Root-relative paths for all internal links (`/narsh2026/styles.css`, `/narsh2026/auth.js`)
- El suffix on DOM references (graphEl, nodeEl, etc.)
- const only, double quotes, semicolons, 2-space indentation
- Section page template: auth-pending body class, shared header/nav, script loading order

### Integration Points
- `narsh2026/our-people/index.html` — currently a placeholder, will be completely rewritten
- Auth guard must remain (NARSH_AUTH.requireAuth at page load)
- Nav must remain (shared header, nav.js loaded)
- Graph library will be the second external dependency (after Mapbox in Phase 2)

</code_context>

<specifics>
## Specific Ideas

- Household nodes in the social graph (couples/families as one node) but individual nodes in the family tree — the data model needs to support both representations
- Family tree default view is both families side by side connected at the couple, with filter buttons to isolate one family
- The teal/gold journey line colors from Phase 2 could potentially be reused for Arash's family vs Natalie's family visual distinction in the graph
- Fun facts and connection-to-couple descriptions are optional per guest — the expanded node view gracefully handles missing fields
- Soft colored cluster regions should feel warm and organic, not like rigid bounding boxes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 3-Guest Graph*
*Context gathered: 2026-05-19*
