---
phase: 02-map-timeline
plan: 02
subsystem: carousel, timeline, ui
tags: [touch-swipe, photo-carousel, timeline-bar, cross-fade, accessibility, wcag]

# Dependency graph
requires:
  - "02-01: Story data module, map module, scroll controller, page shell with empty mount points"
provides:
  - "NARSH_CAROUSEL IIFE with touch-swipe, arrow, and keyboard photo navigation (carousel.js)"
  - "NARSH_TIMELINE IIFE with clickable dots, active/visited states, and year labels (timeline.js)"
  - "Three 600x400 SVG placeholder images for carousel testing"
  - "Mobile cross-fade between map and content views (our-story.css)"
  - "Complete page wiring with carousel, timeline, and initial stop trigger (index.html)"
affects: [02-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [touch-swipe-carousel, timeline-dot-navigation, mobile-cross-fade, sr-only-announcements, 44px-tap-targets]

key-files:
  created:
    - narsh2026/our-story/carousel.js
    - narsh2026/our-story/timeline.js
    - narsh2026/images/story/placeholder-1.svg
    - narsh2026/images/story/placeholder-2.svg
    - narsh2026/images/story/placeholder-3.svg
  modified:
    - narsh2026/our-story/index.html
    - narsh2026/our-story/our-story.css

key-decisions:
  - "Used title attribute on dots for hover tooltip rather than CSS ::after pseudo-element for simplicity"
  - "Year labels shown at first stop, convergence stop, and last stop to avoid overcrowding"
  - "Mobile cross-fade triggers content view after 800ms delay to let map flyTo reach ~40%"
  - "Carousel arrows use CSS border-based chevrons rather than SVG icons to avoid additional files"
  - "let used for mutable IIFE-private state (consistent with Plan 02-01 convention)"

patterns-established:
  - "Touch swipe carousel: touchstart/touchmove/touchend with 50px threshold and translateX tracking"
  - "Timeline dot wrapper pattern for dots that need year labels"
  - "Mobile cross-fade via .mobile-show-content class toggled with setTimeout"
  - "Initial onStopChange(0, -1) call to populate first stop without scroll"

requirements-completed: [TIME-01, TIME-02, TIME-03, TIME-04]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 2 Plan 2: Photo Carousel, Timeline Bar, and Mobile Cross-Fade Summary

**Touch-swipe photo carousel with arrow/keyboard navigation, clickable timeline bar with active/visited dot states, mobile cross-fade transitions, and full page wiring**

## Performance

- **Duration:** 3 min 57s
- **Started:** 2026-05-20T05:10:56Z
- **Completed:** 2026-05-20T05:14:53Z
- **Tasks:** 2/2
- **Files modified:** 7 (5 created, 2 modified)

## Accomplishments

- Photo carousel module (NARSH_CAROUSEL) with touch swipe (50px threshold), prev/next arrow buttons, dot indicators, keyboard left/right navigation, and screen reader "Photo N of M" announcements via aria-live polite region
- Timeline bar module (NARSH_TIMELINE) with clickable button dots, active/visited CSS states, aria-current="step" for screen readers, and year labels at first, convergence, and last stops
- Three 600x400 SVG placeholder images with dusty rose overlay and "Photo coming soon" text in Playfair Display
- Mobile cross-fade CSS using .mobile-show-content class to alternate between map (opacity:1) and content (opacity:1) views at 300ms transition
- Updated index.html: carousel HTML structure populates empty #stop-carousel mount point, carousel.js and timeline.js scripts added, init script wires NARSH_CAROUSEL.init, NARSH_TIMELINE.init, loadPhotos in onStopChange, setActive/setVisited in onStopChange, and initial onStopChange(0, -1) trigger
- WCAG-compliant 44px tap targets on carousel arrows and timeline dots (using ::before pseudo-element for dots)
- Focus-visible rings (2px terracotta outline) on all interactive elements
- prefers-reduced-motion support: carousel transition set to "none", map/timeline transitions disabled

## Task Commits

1. **Task 1: Photo carousel module and placeholder images** - `4499eb6` (feat)
2. **Task 2: Timeline bar, mobile cross-fade, and page wiring** - `6bb1ed7` (feat)

## Files Created/Modified

- `narsh2026/our-story/carousel.js` - NARSH_CAROUSEL IIFE with init, loadPhotos, goTo; touch swipe, arrow click, keyboard navigation; updateUI with dot indicators and sr-only announcement
- `narsh2026/our-story/timeline.js` - NARSH_TIMELINE IIFE with init, setActive, setVisited; creates button.timeline-dot elements with aria-label and title; year labels at key stops
- `narsh2026/images/story/placeholder-1.svg` - 600x400 SVG placeholder with dusty rose overlay
- `narsh2026/images/story/placeholder-2.svg` - 600x400 SVG placeholder with dusty rose overlay
- `narsh2026/images/story/placeholder-3.svg` - 600x400 SVG placeholder with dusty rose overlay
- `narsh2026/our-story/index.html` - Added carousel HTML structure in #stop-carousel, carousel.js and timeline.js scripts, wired carousel/timeline in init script, added initial onStopChange(0, -1) and mobile cross-fade toggle
- `narsh2026/our-story/our-story.css` - Added carousel container/track/photo/arrow/dot/announce styles, timeline dot/wrapper/year styles, mobile cross-fade media query, reduced motion additions

## Decisions Made

- Used title attribute on timeline dots for hover tooltip (simpler than CSS pseudo-element tooltip)
- Year labels displayed at first stop (1997), convergence stop (SHAD Valley 2016), and last stop (2024) to keep timeline readable
- 800ms delay before showing content on mobile matches approximately 40% of map flyTo duration (2000ms)
- CSS border-based chevrons for carousel arrows avoid needing SVG icon files
- Continued using let for mutable IIFE-private state (consistent with Plan 02-01 deviation)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| story-data.js | all stops | Placeholder photo paths (/narsh2026/images/story/placeholder-N.svg) | Photos not yet curated per PROJECT.md. Carousel correctly loads and displays these placeholders. Real photos will replace them in a future content pass. |

These stubs do NOT prevent the plan's goal from being achieved. The carousel renders placeholders correctly and will work identically when real photos replace them.

## Issues Encountered

None.

## Next Plan Readiness

- Plan 02-03 can proceed with any remaining polish or optimization
- All four TIME requirements (TIME-01 through TIME-04) are fully delivered
- The Our Story page is feature-complete with map, scroll, carousel, timeline, and mobile support

## Self-Check: PASSED

All created files verified present. All commits verified in git log. No unexpected file deletions.

---
*Phase: 02-map-timeline*
*Completed: 2026-05-20*
