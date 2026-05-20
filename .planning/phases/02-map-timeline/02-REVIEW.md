---
phase: 02-map-timeline
reviewed: 2026-05-19T23:10:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - narsh2026/our-story/carousel.js
  - narsh2026/our-story/index.html
  - narsh2026/our-story/map.js
  - narsh2026/our-story/our-story.css
  - narsh2026/our-story/scroll-controller.js
  - narsh2026/our-story/story-data.js
  - narsh2026/our-story/timeline.js
  - narsh2026/styles.css
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-19T23:10:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

The map-timeline implementation is structurally sound with good accessibility considerations (skip link, aria-live carousel announcements, reduced-motion support, keyboard navigation). However, the review uncovered three critical issues: an XSS vulnerability via innerHTML with unescaped data, reliance on an undocumented private Mapbox API (`source._data`), and a race condition in concurrent line animations. Additionally, there are logic bugs in the scroll resize handler, missing null guards in map operations, and a bow animation that corrupts journey line data.

## Critical Issues

### CR-01: XSS via innerHTML — photo src and alt attributes are not escaped

**File:** `narsh2026/our-story/carousel.js:94-96`
**Issue:** `loadPhotos` builds image HTML via string concatenation into `innerHTML` without escaping `photo.src` or `photo.alt`. Although the current data source (`story-data.js`) contains hardcoded safe strings, this pattern is inherently unsafe. If photo data is ever loaded from a URL parameter, a CMS, user input, or any external source, an attacker could inject arbitrary HTML/JS via a crafted `alt` or `src` value (e.g., `" onerror="alert(1)`). The same pattern exists at line 128-131 for dot indicators (lower risk since no external data flows in).
**Fix:**
```javascript
const loadPhotos = (newPhotos) => {
  photos = newPhotos || [];
  currentIndex = 0;

  if (photos.length === 0) {
    if (containerEl) containerEl.style.display = "none";
    return;
  }

  if (containerEl) containerEl.style.display = "";

  if (trackEl) {
    trackEl.textContent = "";
    photos.forEach((photo) => {
      const img = document.createElement("img");
      img.className = "carousel-photo";
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = "lazy";
      trackEl.appendChild(img);
    });
  }

  updateUI();
};
```

### CR-02: Reliance on undocumented Mapbox private API `source._data`

**File:** `narsh2026/our-story/map.js:465-473`
**Issue:** `getExistingCoords` accesses `source._data`, which is an internal/private property of the Mapbox GL JS `GeoJSONSource` class. This property is not part of the public API and can be renamed, removed, or restructured in any minor or patch version of Mapbox GL JS. When this breaks (silently returning `[]`), the bow animation at the convergence stop will draw orphaned figure-eight loops without any of the existing journey lines, creating a visual glitch.
**Fix:** Track coordinates in module state instead of reading them back from the map source:
```javascript
// Add module-level state
let currentArashCoords = [];
let currentNatalieCoords = [];

// In setLineData, also store:
const setLineData = (sourceId, coords) => {
  if (sourceId === "line-arash") currentArashCoords = coords;
  if (sourceId === "line-natalie") currentNatalieCoords = coords;
  const source = mapInstance.getSource(sourceId);
  if (source) {
    source.setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coords.length > 0 ? coords : []
      }
    });
  }
};

// Replace getExistingCoords usage with the tracked state
const getExistingCoords = (sourceId) => {
  if (sourceId === "line-arash") return currentArashCoords;
  if (sourceId === "line-natalie") return currentNatalieCoords;
  return [];
};
```

### CR-03: Race condition — single `lineAnimationId` shared by two concurrent animations

**File:** `narsh2026/our-story/map.js:315-344`
**Issue:** `animateLastSegment` is called twice per stop change (once for "line-arash", once for "line-natalie"), but both calls write to the same `lineAnimationId` variable. The second call overwrites `lineAnimationId` set by the first call. When `updateLines` runs next and calls `cancelAnimationFrame(lineAnimationId)` at line 263, only the second animation is cancelled. The first animation continues running in the background, overwriting source data from the new stop's animation, which causes visual artifacts (flickering lines, coordinates snapping back to stale positions).
**Fix:** Use separate animation IDs per source, or cancel both before starting new ones:
```javascript
let lineAnimationIds = {};

// In updateLines, cancel all:
Object.values(lineAnimationIds).forEach(id => cancelAnimationFrame(id));
lineAnimationIds = {};

// In animateLastSegment, store per source:
const animateLastSegment = (sourceId, coords) => {
  if (coords.length < 2) {
    setLineData(sourceId, coords);
    return;
  }
  // ... same logic ...
  const step = (currentTime) => {
    // ... same logic ...
    if (progress < 1) {
      lineAnimationIds[sourceId] = requestAnimationFrame(step);
    }
  };
  lineAnimationIds[sourceId] = requestAnimationFrame(step);
};
```

## Warnings

### WR-01: Bow animation permanently corrupts journey line source data

**File:** `narsh2026/our-story/map.js:394-463`
**Issue:** `playBowAnimation` appends figure-eight coordinates directly to the existing line source data. These extra coordinates are never removed. If the user scrolls past the convergence stop and then scrolls back (triggering `updateLines` again), `updateLines` overwrites the source — so the corruption is temporary. But if the user stays on the convergence stop and scrolls back, or if `onStopChange` re-fires for the same index, the bow coordinates accumulate, growing the line geometry unboundedly. Additionally, `playBowAnimation` does not use `lineAnimationId`, so its `requestAnimationFrame` loop cannot be cancelled by `updateLines`, causing it to keep overwriting data even after the user has scrolled away.
**Fix:** Either draw the bow on a separate dedicated source/layer, or track and cancel the bow animation in `updateLines`:
```javascript
let bowAnimationId = null;

// At the top of updateLines:
if (bowAnimationId) {
  cancelAnimationFrame(bowAnimationId);
  bowAnimationId = null;
}

// In playBowAnimation, use bowAnimationId instead of bare requestAnimationFrame:
bowAnimationId = requestAnimationFrame(step);
```

### WR-02: Scroll resize handler loses original stop count on rounding error

**File:** `narsh2026/our-story/scroll-controller.js:46-51`
**Issue:** `handleResize` reverse-engineers the stop count from the container's computed pixel height using `Math.round(parseInt(...) / scrollPerStop)`. This is fragile: if `scrollPerStop` changes between the initial set and the resize event (e.g., due to virtual keyboard on mobile changing `window.innerHeight`), the rounded value can gain or lose a stop. The stop count should be stored as module state, not re-derived from pixel measurements.
**Fix:**
```javascript
let stopCount = 0;

const init = (stops, callback) => {
  stopCount = stops.length;
  // ...
  scrollContainerEl.style.height = (stopCount * scrollPerStop) + "px";
};

const handleResize = () => {
  scrollPerStop = window.innerHeight;
  if (scrollContainerEl) {
    scrollContainerEl.style.height = (stopCount * scrollPerStop) + "px";
  }
};
```

### WR-03: `goTo` with empty photos array causes `Math.min(index, -1)`, returning -1

**File:** `narsh2026/our-story/carousel.js:102-103`
**Issue:** When `photos` is empty (`photos.length === 0`), `photos.length - 1` is `-1`, so `Math.min(index, -1)` yields `-1`. `currentIndex` becomes `-1`, and `updateUI` at line 136 produces `"Photo 0 of 0"` announced to screen readers. The `translateX` computation becomes `translateX(100%)` which shifts the empty track. While `loadPhotos` hides the container when photos is empty, `goTo` can still be called externally (it is exported).
**Fix:**
```javascript
const goTo = (index) => {
  if (photos.length === 0) return;
  const clamped = Math.max(0, Math.min(index, photos.length - 1));
  // ...
};
```

### WR-04: Missing null guard on `mapInstance` in `getExistingCoords`

**File:** `narsh2026/our-story/map.js:465-473`
**Issue:** `getExistingCoords` calls `mapInstance.getSource(sourceId)` without first checking that `mapInstance` is non-null, unlike every other function in the module. If `playBowAnimation` fires after `mapInstance` is somehow nulled (e.g., cleanup on page navigation), this throws an uncaught `TypeError`.
**Fix:**
```javascript
const getExistingCoords = (sourceId) => {
  if (!mapInstance) return [];
  const source = mapInstance.getSource(sourceId);
  // ...
};
```

### WR-05: `requireAuth()` return value used synchronously but `null` return triggers redirect

**File:** `narsh2026/our-story/index.html:65-66`
**Issue:** `NARSH_AUTH.requireAuth()` sets `window.location.href` when there is no tier, but then returns `undefined` (not `null`, since the function has no explicit return on the redirect path). The calling code checks `if (tier)` which correctly treats `undefined` as falsy, so the rest of the page script does not execute. However, `window.location.href = ...` does not stop JavaScript execution immediately. The code continues to execute until the browser navigates, which means `NARSH_AUTH.applyTierVisibility(undefined)` could briefly run, calling `querySelectorAll` with the `undefined` tier. This is benign with the current `applyTierVisibility` implementation (it only checks `tier === "day2"`), but it is a latent logic gap.
**Fix:** Add an explicit `return null;` in `requireAuth` after the redirect, and in the inline script ensure the falsy check fully guards:
```javascript
const requireAuth = () => {
  const tier = getTier();
  if (!tier) {
    window.location.href = GATE_URL;
    return null;
  }
  return tier;
};
```

## Info

### IN-01: Convention violation — `let` used extensively; CLAUDE.md mandates `const` throughout

**File:** Multiple files (carousel.js:7-17, map.js:29-31, scroll-controller.js:7-11, timeline.js:7-8)
**Issue:** CLAUDE.md states "Variable declarations: `const` throughout (no `let` or `var`)". All four new modules use `let` for mutable module-level state inside IIFEs. This is technically appropriate (the variables genuinely need reassignment), which suggests the convention may need updating, but as written, this violates the stated project convention.
**Fix:** Either update CLAUDE.md to allow `let` for mutable state, or refactor to use `const` with object-property mutation:
```javascript
const state = { currentIndex: 0, photos: [], /* ... */ };
```

### IN-02: Magic number 50 for swipe threshold

**File:** `narsh2026/our-story/carousel.js:58`
**Issue:** The touch swipe threshold `50` (pixels) is a magic number. Named constant would improve readability.
**Fix:**
```javascript
const SWIPE_THRESHOLD = 50;
```

### IN-03: Mapbox GL JS loaded without `integrity` attribute

**File:** `narsh2026/our-story/index.html:56`
**Issue:** The Mapbox GL JS script tag loads from a third-party CDN (`api.mapbox.com`) without a `integrity` (SRI) attribute. If the CDN is compromised, arbitrary code could execute on the page. This is lower risk since Mapbox controls the CDN, but SRI is a defense-in-depth measure.
**Fix:**
```html
<script src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"
  integrity="sha384-<hash>"
  crossorigin="anonymous"></script>
```

---

_Reviewed: 2026-05-19T23:10:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
