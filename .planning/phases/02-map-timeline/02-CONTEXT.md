# Phase 2: Map Timeline - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the interactive, scroll-driven world map on the "Our Story" page (`narsh2026/our-story/`). Two journey lines — teal (Arash) and gold (Natalie) — are progressively drawn across a warm-toned world map as the user scrolls through chronological life stops. Each stop displays a photo carousel and narrative text. A clickable timeline bar at the bottom shows all stops. The lines run together after the couple meets, with a bow-tying animation at the convergence point.

</domain>

<decisions>
## Implementation Decisions

### Story Structure
- **D-01:** Single chronological timeline — all stops ordered by absolute time, regardless of whose story it is. Arash's stops draw a teal line, Natalie's draw a gold line.
- **D-02:** Progressive line drawing — as the user scrolls, lines are drawn onto the map up to the current stop. Early stops show short lines; later stops show the full journey. The map pans/zooms to the active stop while both lines remain visible up to "now."
- **D-03:** After convergence (SHAD Valley), both teal and gold lines continue together — they do NOT merge into a single line. They can briefly separate (e.g., during internships in different cities) and rejoin.
- **D-04:** At convergence (SHAD Valley), the two lines tie into a decorative bow animation. When traveling together, the lines circle/intertwine playfully as they move between stops.
- **D-05:** Narrative text length varies by stop — some are short blurbs (1-2 sentences), others are fuller paragraphs (3-5 sentences). The story dictates the length, with milestone moments like SHAD Valley getting more text.

### Map + Text Layout
- **D-06:** The map and timeline bar are fixed/pinned in the viewport. Scrolling only changes: (1) the photo + text content panel, and (2) map annotations (lines, pins, animations).
- **D-07:** Responsive panel placement — on wider screens, the photo/text panel sits above or beside the map (both visible simultaneously). On constrained screens (mobile), cross-fade between map view and content view at each stop.
- **D-08:** Clickable timeline bar at the bottom of the viewport. Each stop appears as a dot/marker. Clicking a dot jumps directly to that stop (scrolls + updates map + content). Shows the full journey at a glance.

### Photo Presentation
- **D-09:** Multiple photos per stop (1-3) displayed as a carousel/swipe component. One photo visible at a time with arrows or swipe to advance. Dot indicators show count.
- **D-10:** Whether tapping a photo opens a lightbox overlay or uses the carousel size as-is — Claude's discretion, based on available space in the layout.

### Map Visual Style
- **D-11:** Warm-toned custom map tiles — aesthetics and the overall warm feel are the top priority, geographic accuracy is secondary. The map should feel like part of the sunset palette, not a standard cartographic tool.
- **D-12:** Teal and gold are the journey line colors (representing Arash's and Natalie's family wedding-day colors, not the site's sunset palette). The warm map should make these lines visually pop.
- **D-13:** Stop markers are simple color-coded dots — teal for Arash's stops, gold for Natalie's. Minimal and clean, letting the lines be the visual star.

### Claude's Discretion
- Map library selection (Mapbox GL JS, Leaflet, or other — pick what best supports progressive line drawing, smooth fly-to, and warm-toned custom tiles on a static site)
- Photo lightbox vs. carousel-only (based on available space per D-10)
- Exact warm map tile styling (tint intensity, label treatment, land/water colors)
- Line intertwining animation specifics (how the circling/wrapping motion works technically)
- Bow animation implementation details at the convergence point

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core project context, constraints (GitHub Pages, static-only, free hosting), timeline geography details (Arash and Natalie's life stops), photo storage decision (repo-committed)
- `.planning/REQUIREMENTS.md` — Full requirement list; Phase 2 covers TIME-01 through TIME-04
- `.planning/ROADMAP.md` — Phase goals and success criteria

### Phase 1 Context (carries forward)
- `.planning/phases/01-access-design-foundation/01-CONTEXT.md` — Design system decisions (D-04 sunset palette, D-05 subtle warmth, D-07 multi-page), established patterns

### Existing Code (built in Phase 1)
- `narsh2026/styles.css` — Shared CSS design system with color tokens, typography, spacing
- `narsh2026/auth.js` — Auth module (requireAuth, applyTierVisibility) — Our Story page needs auth guard
- `narsh2026/nav.js` — Navigation toggle module — Our Story page uses shared nav
- `narsh2026/our-story/index.html` — Current placeholder page (will be replaced with the map timeline)

### Codebase Analysis
- `.planning/codebase/STACK.md` — Current stack: plain HTML/CSS/JS, no build tools
- `.planning/codebase/STRUCTURE.md` — Current file layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `narsh2026/styles.css` — CSS custom properties (:root tokens) for colors, fonts, spacing, shadows. New map page styles should use these tokens.
- `narsh2026/auth.js` — NARSH_AUTH.requireAuth() and applyTierVisibility(tier) for auth guard on the Our Story page.
- `narsh2026/nav.js` — Shared hamburger nav module. Our Story page already loads this.
- Section page template pattern — established in Phase 1 (auth-pending body class, shared header/nav, script loading order).

### Established Patterns
- No build step: external JS libraries must be loaded via CDN `<script>` tags
- IIFE module pattern for JS (const NARSH_AUTH = (() => { ... })())
- Root-relative paths for all internal links (/narsh2026/styles.css, /narsh2026/auth.js)
- El suffix on DOM references (mapEl, carouselEl, etc.)
- const only, double quotes, semicolons, 2-space indentation

### Integration Points
- `narsh2026/our-story/index.html` — currently a placeholder, will be completely rewritten
- Auth guard must remain (NARSH_AUTH.requireAuth at page load)
- Nav must remain (shared header, nav.js loaded)
- Map library will be the first external dependency beyond the design system fonts

</code_context>

<specifics>
## Specific Ideas

- Journey lines are family wedding colors: teal for Arash's family, gold for Natalie's family — these are NOT the sunset palette colors, they're meaningful family identifiers
- At SHAD Valley (where Natalie and Arash met), the two lines tie into a decorative bow — a "found each other" visual moment
- When traveling together post-convergence, lines playfully circle/intertwine each other as they move to the next destination
- Lines can briefly separate (different internship cities) then rejoin — they are never permanently merged
- The feel should be like watching two lives play out on a globe, converging into a love story
- Timeline geography from PROJECT.md: Arash (India → New Zealand → Canada/SHAD Valley/Waterloo), Natalie (Cayman Islands → childhood locations → Canada/SHAD Valley/Waterloo), Together (SHAD Valley → Waterloo → internship cities → Seattle)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 2-Map Timeline*
*Context gathered: 2026-05-19*
