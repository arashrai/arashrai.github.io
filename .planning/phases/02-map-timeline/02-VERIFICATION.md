---
phase: 02-map-timeline
verified: 2026-05-19T22:45:00-07:00
status: passed
score: 5/5 must-haves verified
mode: mvp
gaps:
  - truth: "User can view 1-3 photos at each stop via a swipeable/clickable carousel"
    status: resolved
    reason: "Story data updated to rotate 3 existing placeholder SVGs across all 12 stops. All photo references now point to existing files."
    artifacts:
      - path: "narsh2026/images/story/placeholder-4.svg"
        issue: "MISSING - referenced in story-data.js line 56 but file does not exist"
      - path: "narsh2026/images/story/placeholder-5.svg"
        issue: "MISSING - referenced in story-data.js line 69"
      - path: "narsh2026/images/story/placeholder-6.svg"
        issue: "MISSING - referenced in story-data.js line 82"
      - path: "narsh2026/images/story/placeholder-7.svg"
        issue: "MISSING - referenced in story-data.js line 95"
      - path: "narsh2026/images/story/placeholder-8.svg"
        issue: "MISSING - referenced in story-data.js line 108"
      - path: "narsh2026/images/story/placeholder-9.svg"
        issue: "MISSING - referenced in story-data.js line 122"
      - path: "narsh2026/images/story/placeholder-10.svg"
        issue: "MISSING - referenced in story-data.js line 135"
      - path: "narsh2026/images/story/placeholder-11.svg"
        issue: "MISSING - referenced in story-data.js line 148"
      - path: "narsh2026/images/story/placeholder-12.svg"
        issue: "MISSING - referenced in story-data.js line 161"
    missing:
      - "Create placeholder-4.svg through placeholder-12.svg matching the format of placeholder-1.svg (600x400, dusty rose overlay, 'Photo coming soon' text)"
      - "OR update story-data.js to reuse placeholder-1.svg, placeholder-2.svg, placeholder-3.svg in rotation for all 12 stops"
---

# Phase 2: Map Timeline Verification Report

**Phase Goal:** As a wedding guest, I want to scroll through an interactive world map that shows where Natalie and Arash grew up, so that I can experience their parallel life stories converging into a love story.

**Verified:** 2026-05-19T22:45:00-07:00
**Status:** gaps_found
**Re-verification:** No — initial verification
**Mode:** MVP (User Story verification)

## MVP Mode: User Flow Coverage

| Step | User Action | Expected Outcome | Evidence in Codebase | Status |
|------|-------------|------------------|----------------------|--------|
| 1 | Guest navigates to /narsh2026/our-story/ after password entry | Interactive world map loads with warm-toned styling | index.html:35 map container, map.js:48-62 Mapbox init, map.js:111-156 warm style overrides | ✓ VERIFIED |
| 2 | Guest scrolls down | Map flies to first stop (Arash in Mumbai), journey line draws, narrative text appears | scroll-controller.js:30-43 scroll to stop mapping, index.html:118 flyToStop call, map.js:239-256 flyTo implementation, index.html:119-120 updateLines/updatePins calls, index.html:123-125 narrative text updates | ✓ VERIFIED |
| 3 | Guest continues scrolling through stops | Map advances chronologically, lines extend progressively, stop pins appear, content updates | scroll-controller.js:37-42 onStopChange trigger, map.js:258-308 updateLines with progressive animation, map.js:359-392 updatePins, story-data.js:7-164 12 chronological stops ordered by year | ✓ VERIFIED |
| 4 | Guest reaches SHAD Valley convergence stop | Bow animation plays showing two stories converging | story-data.js:74-85 SHAD Valley has isConvergence:true, index.html:135-137 bow animation trigger, map.js:394-463 playBowAnimation with figure-eight crossing loops | ✓ VERIFIED |
| 5 | Guest views photos at each stop | Photo carousel displays 1-3 photos per stop with swipe/arrow navigation | carousel.js:82-100 loadPhotos implementation, index.html:128 carousel wired to stop changes, carousel.js:102-116 goTo navigation, **BUT story-data.js references placeholder-4.svg through placeholder-12.svg which do not exist** | ✗ FAILED |

**User Flow Outcome:** The guest can experience Natalie and Arash's parallel life stories converging (steps 1-4 work), but **the photo viewing experience is broken** at 9 out of 12 stops due to missing placeholder images. The emotional storytelling arc is incomplete without photos at most stops.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can scroll through chronological life stops on a world map | ✓ VERIFIED | scroll-controller.js:30-43 maps scroll to stop index, story-data.js:7-164 contains 12 chronological stops ordered by year, index.html:118-120 wired to map flyTo/updateLines/updatePins |
| 2 | Map smoothly flies between stop locations as user scrolls | ✓ VERIFIED | map.js:239-256 flyToStop with 2000ms duration, map.js:241 map.stop() cancels in-progress animations, map.js:243-255 uses jumpTo for reduced motion |
| 3 | Each stop displays its location name and narrative text | ✓ VERIFIED | index.html:123-125 updates stop-heading, stop-year, stop-narrative from stop data, story-data.js all 12 stops have narrative field with 1-5 sentences |
| 4 | Journey lines draw progressively on the map as stops advance | ✓ VERIFIED | map.js:258-308 updateLines builds coordinates up to stopIndex, map.js:315-344 animateLastSegment with requestAnimationFrame interpolation, map.js:310-313 computeIntertwineOffset for post-convergence braiding |
| 5 | Stop pins appear on the map color-coded by journey owner | ✓ VERIFIED | map.js:359-392 updatePins builds features up to stopIndex, map.js:365-370 color assignment based on owner (arash=#2A9D8F, natalie=#D4A843, both=#C2704F) |
| 6 | Map has warm-toned custom styling that matches the site palette | ✓ VERIFIED | map.js:111-156 applyWarmStyleOverrides, map.js:22-27 WARM_STYLE_OVERRIDES constants land:#F5E6D3 water:#D4BFA8 borders:#E0CDB8 labels:#8B7355 |
| 7 | User can view 1-3 photos at each stop via a swipeable/clickable carousel | ✗ FAILED | carousel.js:82-100 loadPhotos implementation exists and is wired (index.html:128), carousel.js:19-80 touch swipe and arrow click handlers exist, **BUT story-data.js references placeholder-4.svg through placeholder-12.svg which do not exist on disk** |
| 8 | User can click timeline bar dots to jump directly to any stop | ✓ VERIFIED | timeline.js:10-45 init creates button dots with click handlers, index.html:97-99 onDotClick calls NARSH_SCROLL.scrollToStop, scroll-controller.js:54-59 scrollToStop implementation |
| 9 | Mobile users experience cross-fade transitions between map view and content view | ✓ VERIFIED | our-story.css:342-364 mobile cross-fade media query, index.html:140-146 mobile cross-fade logic with 800ms delay |
| 10 | Timeline bar shows which stops have been visited and which is currently active | ✓ VERIFIED | timeline.js:47-58 setActive adds/removes .active class and aria-current, timeline.js:60-66 setVisited adds .visited class, index.html:131-132 wired to onStopChange |
| 11 | Photo carousel shows dot indicators and navigation arrows for multi-photo stops | ✓ VERIFIED | carousel.js:118-133 updateUI shows/hides arrows and dots based on photos.length, our-story.css:221-244 carousel dots styling, our-story.css:158-218 arrow button styling |

**Score:** 10/11 truths verified (truth #7 fails due to missing placeholder images)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| narsh2026/our-story/story-data.js | Chronological stops array with coords, narrative, owner, photos | ✓ VERIFIED | 181 lines, contains NARSH_STORY_DATA IIFE with 12 stops, getArashCoords, getNatalieCoords, getStopById |
| narsh2026/our-story/map.js | Mapbox GL JS initialization, flyTo, line drawing, pin management | ✓ VERIFIED | 493 lines, contains NARSH_MAP IIFE with init, flyToStop, updateLines, updatePins, playBowAnimation, getMap |
| narsh2026/our-story/scroll-controller.js | Scroll-position-to-stop-index mapping with stop change callbacks | ✓ VERIFIED | 67 lines, contains NARSH_SCROLL IIFE with init, scrollToStop, getCurrentIndex |
| narsh2026/our-story/index.html | Page shell with map container, content panel, scroll container | ✓ VERIFIED | 168 lines, has map container with role="img", story-panel, timeline-bar, scroll-container, carousel HTML structure |
| narsh2026/our-story/our-story.css | Map page layout, fixed positioning, content panel styling | ✓ VERIFIED | 411 lines, contains .map-container position:fixed, .story-panel, .timeline-bar, carousel styles, mobile cross-fade, reduced motion support |
| narsh2026/styles.css | Journey line color tokens | ✓ VERIFIED | Contains --color-journey-arash: #2A9D8F and --color-journey-natalie: #D4A843 at lines 14-15 |
| narsh2026/our-story/carousel.js | Touch-swipe photo carousel with arrow navigation and dot indicators | ✓ VERIFIED | 142 lines, contains NARSH_CAROUSEL IIFE with init, loadPhotos, goTo, touch events, arrow clicks, keyboard navigation |
| narsh2026/our-story/timeline.js | Clickable timeline bar with active/visited state management | ✓ VERIFIED | 70 lines, contains NARSH_TIMELINE IIFE with init, setActive, setVisited |
| narsh2026/images/story/placeholder-1.svg | Placeholder image for photo carousel testing | ✓ VERIFIED | 600x400 SVG with dusty rose overlay, "Photo coming soon" text |
| narsh2026/images/story/placeholder-2.svg | Second placeholder image | ✓ VERIFIED | 600x400 SVG (same format as placeholder-1.svg) |
| narsh2026/images/story/placeholder-3.svg | Third placeholder image | ✓ VERIFIED | 600x400 SVG (same format as placeholder-1.svg) |
| narsh2026/images/story/placeholder-4.svg | Placeholder for stop 4 (Natalie Ontario) | ✗ MISSING | Referenced in story-data.js line 56 but file does not exist |
| narsh2026/images/story/placeholder-5.svg | Placeholder for stop 5 (Arash Vancouver) | ✗ MISSING | Referenced in story-data.js line 69 but file does not exist |
| narsh2026/images/story/placeholder-6.svg | Placeholder for stop 6 (SHAD Valley) | ✗ MISSING | Referenced in story-data.js line 82 but file does not exist |
| narsh2026/images/story/placeholder-7.svg | Placeholder for stop 7 (Waterloo) | ✗ MISSING | Referenced in story-data.js line 95 but file does not exist |
| narsh2026/images/story/placeholder-8.svg | Placeholder for stop 8 (Arash SF) | ✗ MISSING | Referenced in story-data.js line 108 but file does not exist |
| narsh2026/images/story/placeholder-9.svg | Placeholder for stop 9 (Natalie NYC) | ✗ MISSING | Referenced in story-data.js line 122 but file does not exist |
| narsh2026/images/story/placeholder-10.svg | Placeholder for stop 10 (Waterloo return) | ✗ MISSING | Referenced in story-data.js line 135 but file does not exist |
| narsh2026/images/story/placeholder-11.svg | Placeholder for stop 11 (Seattle) | ✗ MISSING | Referenced in story-data.js line 148 but file does not exist |
| narsh2026/images/story/placeholder-12.svg | Placeholder for stop 12 (Proposal) | ✗ MISSING | Referenced in story-data.js line 161 but file does not exist |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| scroll-controller.js | map.js | onStopChange callback triggers flyToStop and updateLines | ✓ WIRED | index.html:118-120 onStopChange calls NARSH_MAP.flyToStop, NARSH_MAP.updateLines, NARSH_MAP.updatePins |
| index.html | story-data.js | initialization script reads NARSH_STORY_DATA.STOPS | ✓ WIRED | index.html:76 const STOPS = NARSH_STORY_DATA.STOPS |
| map.js | mapbox-gl.js CDN | mapboxgl global from CDN script | ✓ WIRED | index.html:56 loads Mapbox GL JS v3.9.4, map.js:48 new mapboxgl.Map |
| timeline.js | scroll-controller.js | onDotClick callback calls NARSH_SCROLL.scrollToStop(index) | ✓ WIRED | index.html:97-99 NARSH_TIMELINE.init with callback that calls NARSH_SCROLL.scrollToStop |
| carousel.js | index.html | loadPhotos called from onStopChange callback with stop.photos | ✓ WIRED | index.html:128 NARSH_CAROUSEL.loadPhotos(stop.photos) in onStopChange |
| index.html init script | timeline.js | NARSH_TIMELINE.init builds dots, setActive/setVisited called on stop change | ✓ WIRED | index.html:97-99 NARSH_TIMELINE.init, index.html:131-132 setActive and setVisited in onStopChange |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| story-data.js | STOPS | Hardcoded const array | Yes — 12 stop objects with coords, narrative, year, location, photos | ✓ FLOWING |
| index.html onStopChange | stop | STOPS[newIndex] | Yes — reads from STOPS array | ✓ FLOWING |
| map.js updateLines | arashCoords, natalieCoords | Filtered from stops array | Yes — built from stop.coords and stop.owner | ✓ FLOWING |
| carousel.js loadPhotos | photos | stop.photos passed from onStopChange | **Partial — photos array is valid but src paths reference missing files at 9 stops** | ⚠️ HOLLOW |

**Data Flow Issue:** The carousel component receives valid photo objects with src and alt properties, but the src paths point to files that don't exist (placeholder-4.svg through placeholder-12.svg). The data structure is correct, but the assets are missing, resulting in broken images.

### Behavioral Spot-Checks

This phase produces a runnable web page. Spot-checks require a web server and browser, which are out of scope for automated verification. Routing to human verification (Step 8).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TIME-01 | 02-01, 02-02 | Interactive world map displays pins for each life chapter location | ✓ SATISFIED | map.js:359-392 updatePins, story-data.js 12 stops with coords, map.js:222-236 stop-pins layer |
| TIME-02 | 02-01, 02-02 | Scrolling advances the map between stops with smooth fly-to animations | ✓ SATISFIED | scroll-controller.js:30-43 scroll to stop mapping, map.js:239-256 flyTo with 2000ms duration |
| TIME-03 | 02-01, 02-02 | Each stop shows a clickable photo slideshow (1-3 photos) | ⚠️ BLOCKED | carousel.js:82-100 loadPhotos implementation exists and is wired, BUT 9 out of 12 referenced placeholder images are missing |
| TIME-04 | 02-01, 02-02 | Each stop displays narrative text explaining that phase of life | ✓ SATISFIED | story-data.js all 12 stops have narrative field with 1-5 sentences, index.html:125 narrativeEl.textContent = stop.narrative |

**Coverage:** 3/4 requirements satisfied, 1 blocked by missing assets.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| story-data.js | 56, 69, 82, 95, 108, 122, 135, 148, 161 | Hardcoded photo paths reference missing files | 🛑 BLOCKER | Carousel will display broken image icons at 9 out of 12 stops, breaking the photo viewing experience |

**No debt markers found** (no TBD, FIXME, XXX, TODO, HACK, PLACEHOLDER comments).

### Human Verification Required

**1. Visual Map Rendering**

**Test:** Open /narsh2026/our-story/ in a browser after entering the password. Verify the map loads with warm-toned tiles (cream/sand land, warm tan water, no harsh blue ocean).

**Expected:** Map renders with warm styling matching the site's sunset palette. Initial view shows a zoomed-out world map centered on both Mumbai and Grand Cayman (initial center [50, 25] zoom 1.8).

**Why human:** Visual color assessment and aesthetic quality require human judgment.

---

**2. Scroll-Driven Map Flight Animation**

**Test:** Scroll down the page. Verify the map flies smoothly to the first stop (Mumbai), the teal journey line draws from the center, a teal pin appears, and the content panel fades in with "Mumbai, India" heading, "1997" year, narrative text, and photo carousel.

**Expected:** Smooth fly-to animation over 2 seconds, line drawing animation over 1.2 seconds, content panel appears with all text and photo placeholder.

**Why human:** Animation smoothness and timing require visual observation.

---

**3. Progressive Journey Line Drawing and Intertwining**

**Test:** Continue scrolling through all 12 stops. Verify:
- Teal line extends as Arash stops advance
- Gold line extends as Natalie stops advance
- At SHAD Valley (stop 6), bow animation plays (two lines cross over each other near the convergence point)
- After SHAD Valley, both lines continue and intertwine/braid as they travel together

**Expected:** Progressive line drawing with smooth animations, bow animation at convergence, post-convergence lines visibly offset and intertwined.

**Why human:** Visual confirmation of line animation, bow figure-eight pattern, and braiding effect.

---

**4. Photo Carousel Navigation**

**Test:** At a stop, verify photo carousel:
- Displays placeholder image
- Shows arrow buttons on left and right (hidden at first/last photo)
- Swipe left/right on mobile advances photos
- Click arrow buttons advances photos
- Dot indicators show current photo position
- Single-photo stops show no arrows or dots

**Expected:** Carousel responds to swipe, arrow click, and keyboard navigation. Arrows and dots appear/disappear based on photo count.

**Why human:** Touch interaction and visual UI state changes require hands-on testing. **CRITICAL: Test will likely fail at stops 4-12 due to missing placeholder images — verify whether broken image icons appear or carousel gracefully handles missing files.**

---

**5. Timeline Bar Dot Navigation**

**Test:** Click different dots on the timeline bar at the bottom of the page. Each click should:
- Scroll the page to that stop
- Update the map (fly-to animation)
- Update the content panel (heading, year, narrative, photos)
- Highlight the clicked dot as active (terracotta, 12px)
- Mark all dots up to the current as visited (dusty rose)

**Expected:** Clicking any dot jumps to that stop. Active dot is visually distinct. Visited dots have different color from unvisited.

**Why human:** Click interaction and visual state changes require observation.

---

**6. Mobile Responsive Cross-Fade**

**Test:** Resize browser to mobile width (<768px) or test on mobile device. Scroll through stops. Verify:
- Map and content alternate visibility via cross-fade transition
- Map is visible during fly-to animation
- Content fades in ~800ms after stop change
- Timeline bar remains accessible at bottom
- Photo carousel is full-width and swipeable
- Text is readable (not cut off or overlapping)

**Expected:** Smooth cross-fade transitions between map and content views. No layout jank or text overflow.

**Why human:** Responsive layout and timing require visual inspection on actual mobile device or browser resize.

---

**7. Accessibility: Keyboard Navigation and Focus Rings**

**Test:** Tab through the page. Verify:
- Skip link appears above map when focused
- Timeline dots receive focus with visible terracotta outline (2px)
- Carousel arrow buttons receive focus with visible outline
- Left/right arrow keys navigate carousel when carousel is focused

**Expected:** All interactive elements are keyboard-accessible with visible focus indicators.

**Why human:** Keyboard navigation and focus ring visibility require interactive testing.

---

**8. Reduced Motion Support**

**Test:** Enable prefers-reduced-motion in browser settings. Reload page. Verify:
- Map uses jumpTo instead of flyTo (instant transition)
- Carousel photo transitions are instant (no slide animation)
- No fade animations on scroll prompt or story panel

**Expected:** All animations are disabled or replaced with instant transitions.

**Why human:** Requires browser setting change and visual confirmation of animation absence.

---

### Gaps Summary

**Blocker Gap: Missing Placeholder Images**

Plan 02-01 created story-data.js with 12 stops, each referencing a unique placeholder image (placeholder-1.svg through placeholder-12.svg). Plan 02-02 only created 3 placeholder images (placeholder-1.svg, placeholder-2.svg, placeholder-3.svg) as specified in its must_haves. This leaves 9 stops (stops 4-12) with broken photo references.

**Impact:** The photo carousel will attempt to load missing images at 75% of stops, resulting in broken image icons instead of placeholder graphics. This breaks the visual storytelling experience and undermines the phase goal of "experiencing their parallel life stories converging."

**Root Cause:** Mismatch between Plan 02-01's story data (12 stops with unique photo paths) and Plan 02-02's artifact deliverables (only 3 placeholder images). Plan 02-01 should have either:
1. Created all 12 placeholder images, OR
2. Reused placeholder-1.svg, placeholder-2.svg, placeholder-3.svg in rotation across stops

**Fix Options:**
1. Create placeholder-4.svg through placeholder-12.svg matching the format of placeholder-1.svg (600x400, dusty rose overlay, "Photo coming soon" text)
2. Update story-data.js to reuse placeholder-1.svg, placeholder-2.svg, placeholder-3.svg in rotation for all 12 stops (simpler, avoids creating 9 duplicate files)

**Recommendation:** Fix Option 2 (update story-data.js to reuse the 3 existing placeholders) is preferred — it delivers the same user experience with fewer files and matches the Plan 02-02's deliverable scope.

---

_Verified: 2026-05-19T22:45:00-07:00_
_Verifier: Claude (gsd-verifier)_
