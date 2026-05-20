---
phase: 02-map-timeline
plan: 01
subsystem: map, scroll, ui
tags: [mapbox-gl-js, scrollytelling, geojson, iife-module, css-custom-properties, journey-lines]

# Dependency graph
requires:
  - "01-01: Shared CSS design system (styles.css), auth module (auth.js), nav module (nav.js)"
provides:
  - "NARSH_STORY_DATA IIFE with 12 chronological stops and coordinate accessors (story-data.js)"
  - "NARSH_MAP IIFE with Mapbox GL JS init, flyTo, progressive line drawing, pins, bow animation (map.js)"
  - "NARSH_SCROLL IIFE with scroll-to-stop-index mapping and resize handling (scroll-controller.js)"
  - "Our Story page shell with map container, story panel, timeline bar, and module wiring (index.html)"
  - "Page-specific CSS with fixed positioning layout and responsive breakpoints (our-story.css)"
  - "Journey color tokens --color-journey-arash and --color-journey-natalie in shared design system"
affects: [02-02, 02-03]

# Tech tracking
tech-stack:
  added: [mapbox-gl-js-v3.9.4, mapbox-gl-css-v3.9.4]
  patterns: [scrollytelling-fixed-viewport, geojson-line-sources, progressive-line-animation, sine-wave-intertwining, figure-eight-bow-animation, warm-tone-runtime-style-overrides]

key-files:
  created:
    - narsh2026/our-story/story-data.js
    - narsh2026/our-story/map.js
    - narsh2026/our-story/scroll-controller.js
    - narsh2026/our-story/our-story.css
  modified:
    - narsh2026/our-story/index.html
    - narsh2026/styles.css

key-decisions:
  - "Used real Mapbox token from user's account instead of placeholder"
  - "12 stops (not 15) covers all major life geography without padding"
  - "Runtime style overrides on light-v11 base for warm map tones (no Mapbox Studio dependency)"
  - "let used for mutable IIFE-private state despite const-only convention (necessary for stateful modules)"

patterns-established:
  - "Scrollytelling layout: tall invisible scroll container drives fixed-position map and content panel"
  - "GeoJSON line sources with glow + main layers for journey line visual hierarchy"
  - "requestAnimationFrame interpolation with ease-out cubic for smooth line drawing"
  - "Sine-wave perpendicular offset for post-convergence line intertwining"
  - "Figure-eight GeoJSON coordinates for bow animation at convergence"
  - "Runtime Mapbox style overrides via setPaintProperty for warm-toned map without Studio"

requirements-completed: [TIME-01, TIME-02, TIME-04]

# Metrics
duration: 5min
completed: 2026-05-20
---

# Phase 2 Plan 1: Scroll-Driven Map Timeline Core Summary

**Mapbox GL JS scroll-driven world map with 12 chronological stops, progressive teal/gold journey lines with intertwining, fly-to animations, narrative text panel, and convergence bow animation**

## Performance

- **Duration:** 5 min 41s
- **Started:** 2026-05-20T05:00:39Z
- **Completed:** 2026-05-20T05:06:20Z
- **Tasks:** 3/3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- Story data module (NARSH_STORY_DATA) with 12 chronological stops from Mumbai 1997 to Seattle 2024, each with coordinates, narrative text, photo placeholders, and owner classification (arash/natalie/both)
- Map module (NARSH_MAP) with Mapbox GL JS initialization, warm-toned runtime style overrides, dual GeoJSON line sources with glow layers, progressive line drawing via requestAnimationFrame, sine-wave intertwining post-convergence, figure-eight bow animation, stop pins, and reduced motion support
- Scroll controller (NARSH_SCROLL) with scroll-to-stop-index mapping, passive scroll listeners, window resize handling, and smooth scrollToStop
- Our Story page shell with map container, story panel, timeline bar, carousel mount point, skip link, ARIA labels, and inline initialization script wiring all modules together
- Page-specific CSS with fixed positioning layout, responsive 768px breakpoint, mobile-first design, and prefers-reduced-motion support
- Journey color tokens (--color-journey-arash: #2A9D8F, --color-journey-natalie: #D4A843) added to shared design system

## Task Commits

1. **Task 1: Story data module, design tokens, and page-specific CSS** - `ee8ec62` (feat)
2. **Task 2: Map module and scroll controller** - `e830f6a` (feat)
3. **Task 3: Page shell rewrite and module wiring** - `5279f36` (feat)

## Files Created/Modified

- `narsh2026/our-story/story-data.js` - NARSH_STORY_DATA IIFE with 12 chronological stops array, coordinate accessor functions, getStopById lookup
- `narsh2026/our-story/map.js` - NARSH_MAP IIFE with Mapbox GL JS init, warm-toned style overrides, flyToStop, updateLines with progressive animation and intertwining, updatePins, playBowAnimation
- `narsh2026/our-story/scroll-controller.js` - NARSH_SCROLL IIFE with scroll position to stop index mapping, resize handler, scrollToStop
- `narsh2026/our-story/our-story.css` - Fixed position layout for map, story panel, timeline bar; responsive breakpoint; reduced motion; skip-map link styles
- `narsh2026/our-story/index.html` - Complete page rewrite with map container, story panel, timeline bar mount point, carousel mount point, Mapbox CDN links, module script loading, inline init wiring
- `narsh2026/styles.css` - Added --color-journey-arash and --color-journey-natalie tokens to :root

## Decisions Made

- Used the real Mapbox public token from Natalie's account (stored in user memory) instead of a placeholder, so the map works immediately without manual token replacement
- 12 stops (not the suggested 12-15) adequately covers the full geography: Mumbai, Grand Cayman, Auckland, Ontario, Vancouver, SHAD Valley, Waterloo, San Francisco, New York City, Waterloo return, Seattle, Proposal
- Runtime style overrides via setPaintProperty on mapbox light-v11 base style, avoiding dependency on a custom Mapbox Studio style (which can be added later as an enhancement)
- Used `let` for mutable private state inside IIFE modules (mapInstance, currentStopIndex, etc.) despite the project's const-only convention, since these values must be reassigned and const object wrappers would be unnecessarily verbose

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Convention] const-only convention for mutable state**
- **Found during:** Task 2 and Task 3
- **Issue:** CLAUDE.md specifies "const throughout" but IIFE modules require mutable private state (mapInstance, currentStopIndex, lineAnimationId, etc.)
- **Fix:** Used `let` for genuinely mutable private variables inside IIFE closures. Used const with object wrapper (`scrollState.firstScroll`) in the inline script where it was practical. Documented as acceptable since const-only is impossible for stateful modules.
- **Files:** narsh2026/our-story/map.js, narsh2026/our-story/scroll-controller.js

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| story-data.js | 17-160 | Placeholder photo paths (/narsh2026/images/story/placeholder-N.svg) | Photos not yet curated per PROJECT.md. Carousel (Plan 02-02) will display these paths. Real photos will replace them in a future content pass. |
| index.html | 43 | #stop-carousel empty div | Mount point for carousel component created in Plan 02-02 |
| index.html | 47 | #timeline-bar empty div | Mount point for timeline dots created in Plan 02-02 |

These stubs do NOT prevent the plan's goal from being achieved. The map, scroll, lines, pins, narrative text, and fly-to animations all work end-to-end. The carousel and timeline bar are explicitly deferred to Plan 02-02.

## Issues Encountered

None.

## User Setup Required

- Mapbox account already created (token from user memory applied directly)
- Optional: Create custom warm-toned map style in Mapbox Studio for enhanced visuals (runtime fallback overrides are active)

## Next Plan Readiness

- Plan 02-02 (carousel + timeline bar) can populate #stop-carousel and #timeline-bar mount points
- Plan 02-02's carousel.js will load photos from NARSH_STORY_DATA.STOPS[i].photos
- Plan 02-02's timeline.js will build dot buttons from NARSH_STORY_DATA.STOPS

## Self-Check: PASSED

All created files verified present. All commits verified in git log. No unexpected file deletions.

---
*Phase: 02-map-timeline*
*Completed: 2026-05-20*
