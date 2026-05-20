# Phase 2: Map Timeline - Research

**Researched:** 2026-05-19
**Domain:** Interactive mapping, scroll-driven animation, static site CDN integration
**Confidence:** MEDIUM (web tools unavailable -- all findings based on training data, tagged [ASSUMED])

## Summary

This phase builds the emotional centerpiece of the wedding site: a scroll-driven interactive world map that visually tells the parallel life stories of Arash and Natalie converging. The primary technical challenges are: (1) integrating Mapbox GL JS as a CDN-loaded dependency on a static GitHub Pages site, (2) implementing a scroll-position-driven animation controller that pins the map in the viewport and progressively draws journey lines while flying between stops, (3) custom warm-toned map styling that makes teal/gold journey lines pop, and (4) a lightweight photo carousel for 1-3 images per stop.

Mapbox GL JS is the right choice for this phase. It provides native support for `flyTo` animations with configurable duration/easing, GeoJSON line layers with `line-dasharray` animation for progressive line drawing, custom map styles through Mapbox Studio, and CDN distribution without a build step. The free tier (50,000 map loads/month) is well within wedding website traffic expectations.

**Primary recommendation:** Use Mapbox GL JS v3.x via CDN with a scroll-position controller (tall invisible scroll container + `scroll` event listener) that maps scroll percentage to stop transitions, driving `flyTo`, line drawing, and content panel updates in a coordinated sequence.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Single chronological timeline -- all stops ordered by absolute time, regardless of whose story it is. Arash's stops draw a teal line, Natalie's draw a gold line.
- **D-02:** Progressive line drawing -- as the user scrolls, lines are drawn onto the map up to the current stop. Early stops show short lines; later stops show the full journey. The map pans/zooms to the active stop while both lines remain visible up to "now."
- **D-03:** After convergence (SHAD Valley), both teal and gold lines continue together -- they do NOT merge into a single line. They can briefly separate (e.g., during internships in different cities) and rejoin.
- **D-04:** At convergence (SHAD Valley), the two lines tie into a decorative bow animation. When traveling together, lines circle/intertwine playfully as they move between stops.
- **D-05:** Narrative text length varies by stop -- some are short blurbs (1-2 sentences), others are fuller paragraphs (3-5 sentences).
- **D-06:** The map and timeline bar are fixed/pinned in the viewport. Scrolling only changes: (1) the photo + text content panel, and (2) map annotations (lines, pins, animations).
- **D-07:** Responsive panel placement -- on wider screens, the photo/text panel sits above or beside the map. On constrained screens (mobile), cross-fade between map view and content view at each stop.
- **D-08:** Clickable timeline bar at the bottom of the viewport. Each stop appears as a dot/marker. Clicking jumps directly to that stop.
- **D-09:** Multiple photos per stop (1-3) displayed as a carousel/swipe component.
- **D-10:** Photo lightbox vs carousel-only -- Claude's discretion.
- **D-11:** Warm-toned custom map tiles -- aesthetics top priority, geographic accuracy secondary.
- **D-12:** Teal and gold are journey line colors (family wedding-day colors, not sunset palette).
- **D-13:** Stop markers are simple color-coded dots -- teal or gold.

### Claude's Discretion
- Map library selection (decided: Mapbox GL JS per UI-SPEC)
- Photo lightbox vs. carousel-only (based on available space per D-10)
- Exact warm map tile styling (tint intensity, label treatment, land/water colors)
- Line intertwining animation specifics
- Bow animation implementation details at convergence point

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TIME-01 | Interactive world map displays pins for each life chapter location | Mapbox GL JS circle layers for stop pins, GeoJSON point data source, color-coded by journey owner |
| TIME-02 | Scrolling advances the map between stops with smooth fly-to animations | Scroll controller maps position to stops, `map.flyTo()` with 2000ms duration, `moveend` callback chains |
| TIME-03 | Each stop shows a clickable photo slideshow (1-3 photos) | Vanilla JS carousel with CSS transforms, touch event handling for swipe, arrow button navigation |
| TIME-04 | Each stop displays narrative text explaining that phase of life | Content panel DOM swap on stop transition, data-driven from stops array, variable-length text support |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Map rendering + fly-to | Browser / Client | -- | Mapbox GL JS runs entirely client-side, WebGL canvas |
| Progressive line drawing | Browser / Client | -- | GeoJSON source manipulation + requestAnimationFrame |
| Scroll-driven animation control | Browser / Client | -- | Scroll events drive all state transitions |
| Photo carousel | Browser / Client | -- | DOM manipulation, CSS transforms, touch events |
| Content panel management | Browser / Client | -- | DOM content swaps driven by scroll state |
| Timeline bar | Browser / Client | -- | Interactive button row, fixed positioning |
| Map tile serving | CDN / Static | -- | Mapbox tile servers via access token |
| Photo assets | CDN / Static | -- | Repo-committed images served via GitHub Pages CDN |
| Auth guard | Browser / Client | -- | Existing NARSH_AUTH module, localStorage check |
| Custom map style | CDN / Static | -- | Mapbox Studio style URL, fetched at map init |

Everything runs client-side. The only external dependency is Mapbox's tile server (accessed via the free API token). Photos are repo-committed static assets.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Mapbox GL JS | v3.x (latest) | Interactive WebGL map with fly-to animations, GeoJSON layers, custom styles | [ASSUMED] Best CDN-loadable map library for custom styling + smooth animations. Leaflet lacks native fly-to easing and WebGL tile rendering. MapLibre GL is an alternative but has smaller ecosystem for custom tile styles. |
| Mapbox GL CSS | v3.x (matches JS) | Required stylesheet for map controls and canvas | [ASSUMED] Must be loaded alongside the JS library |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | -- | Photo carousel is hand-built | Vanilla JS carousel for 1-3 photos is simpler than adding a library dependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Mapbox GL JS | MapLibre GL JS (open-source fork) | Free and open-source, but custom tile styling requires self-hosted tiles or third-party provider. Mapbox Studio integration is a significant advantage for warm-toned custom styles. [ASSUMED] |
| Mapbox GL JS | Leaflet | Lighter weight but no WebGL, poor fly-to animation quality, no native custom style support. Would require CSS filter hacks for warm tones. [ASSUMED] |
| Vanilla carousel | Swiper.js via CDN | Adds ~40KB for features we don't need (infinite loop, lazy loading, pagination variants). 1-3 photos per stop doesn't justify the dependency. [ASSUMED] |

**Installation (CDN -- no npm):**
```html
<!-- In <head> -->
<link href="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css" rel="stylesheet">

<!-- Before closing </body> -->
<script src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"></script>
```

**Version note:** The exact v3.x minor version should be verified at implementation time by checking `https://docs.mapbox.com/mapbox-gl-js/guides/install/`. Training data suggests v3.9.x is current as of early 2025, but this should be confirmed. [ASSUMED]

**Mapbox Access Token:**
- Free tier: 50,000 map loads/month [ASSUMED]
- Token is committed as a JS constant (not .env) since this is a public static site
- Token scoping: restrict to `arashrai.com` domain in Mapbox dashboard for security
- No server required -- token is used directly in client-side JS

## Architecture Patterns

### System Architecture Diagram

```
User scrolls page
       |
       v
[Scroll Controller] -----> reads scroll position
       |                    calculates active stop index
       |                    determines transition progress (0-1)
       |
       +---> [Map Controller]
       |       |
       |       +---> map.flyTo(stop.coords) -- smooth camera move
       |       +---> updateLine(stop.index) -- extend GeoJSON line
       |       +---> updatePins(stop.index) -- activate current pin
       |       +---> bow animation (if convergence stop)
       |
       +---> [Content Controller]
       |       |
       |       +---> swap heading text
       |       +---> swap narrative text
       |       +---> reset carousel to first photo
       |       +---> load stop's photo set
       |
       +---> [Timeline Controller]
               |
               +---> update active dot
               +---> update visited dots
               +---> sync scroll position
```

```
External Dependencies:
  Mapbox Tile Server <--- access token ---> [Mapbox GL JS in browser]
  GitHub Pages CDN <--- static files ---> [HTML/CSS/JS/Images]
```

### Recommended Project Structure

```
narsh2026/
  our-story/
    index.html          # Page shell: map container, content panel, timeline bar
    map.js              # NARSH_MAP module: Mapbox init, flyTo, line drawing, pins
    story-data.js       # NARSH_STORY_DATA: stops array with coords, text, photos
    scroll-controller.js # NARSH_SCROLL: scroll position -> stop transitions
    carousel.js         # NARSH_CAROUSEL: photo carousel component
    timeline.js         # NARSH_TIMELINE: bottom timeline bar controller
    our-story.css       # Page-specific styles (map layout, panel, timeline, carousel)
  images/
    story/              # Timeline stop photos (placeholder SVGs initially)
      placeholder-1.svg
      placeholder-2.svg
      placeholder-3.svg
  styles.css            # Existing shared design system (add new tokens here)
  auth.js               # Existing (no changes)
  nav.js                # Existing (no changes)
```

### Pattern 1: Scroll-Driven Animation Controller (Scrollytelling)

**What:** A tall invisible `<div>` creates scroll height proportional to the number of stops. The map, content panel, and timeline bar are `position: fixed`. Scroll position is mapped to a stop index, driving all animations.

**When to use:** When the viewport should remain fixed while content changes based on scroll position. This is the standard "scrollytelling" pattern used by NYT, The Pudding, and similar data journalism sites.

**Example:**
```javascript
// Source: Standard scrollytelling pattern [ASSUMED]
const NARSH_SCROLL = (() => {
  "use strict";

  const SCROLL_PER_STOP = window.innerHeight; // ~100vh per stop
  let currentStopIndex = -1;
  let onStopChange = null;

  const init = (stops, callback) => {
    onStopChange = callback;
    const scrollContainerEl = document.getElementById("scroll-container");
    // Total scroll height = number of stops * viewport height
    scrollContainerEl.style.height = (stops.length * SCROLL_PER_STOP) + "px";

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const newIndex = Math.min(
        Math.floor(scrollY / SCROLL_PER_STOP),
        stops.length - 1
      );
      if (newIndex !== currentStopIndex) {
        const previousIndex = currentStopIndex;
        currentStopIndex = newIndex;
        onStopChange(currentStopIndex, previousIndex);
      }
    }, { passive: true });
  };

  const scrollToStop = (index) => {
    window.scrollTo({
      top: index * SCROLL_PER_STOP,
      behavior: "smooth"
    });
  };

  return { init, scrollToStop };
})();
```

### Pattern 2: Progressive Line Drawing with GeoJSON

**What:** Two GeoJSON line sources (one teal, one gold) are added to the map. As stops advance, the line coordinates array is extended and the source is updated, creating the appearance of a line being drawn.

**When to use:** To progressively reveal a journey path as the user scrolls through stops.

**Example:**
```javascript
// Source: Mapbox GL JS GeoJSON source update pattern [ASSUMED]
const drawLineToStop = (map, lineId, coordinates, stopIndex) => {
  // coordinates is the full array of [lng, lat] for all stops on this journey
  // Slice to only include points up to current stop
  const visibleCoords = coordinates.slice(0, stopIndex + 1);

  const source = map.getSource(lineId);
  if (source) {
    source.setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: visibleCoords
      }
    });
  }
};

// Initial setup (inside map.on("load", ...))
map.addSource("line-arash", {
  type: "geojson",
  data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
});

map.addLayer({
  id: "line-arash",
  type: "line",
  source: "line-arash",
  paint: {
    "line-color": "#2A9D8F",
    "line-width": 3,
    "line-opacity": 1
  },
  layout: {
    "line-cap": "round",
    "line-join": "round"
  }
});
```

### Pattern 3: Smooth Line Animation with Interpolation

**What:** Instead of instantly snapping the line to the next stop, interpolate intermediate coordinates using `requestAnimationFrame` to create a smooth drawing effect over 1200ms.

**When to use:** For the progressive line drawing animation between stops (per UI-SPEC).

**Example:**
```javascript
// Source: requestAnimationFrame interpolation pattern [ASSUMED]
const animateLineSegment = (map, sourceId, fromCoords, toCoord, durationMs) => {
  const startTime = performance.now();
  const startLng = fromCoords[fromCoords.length - 1][0];
  const startLat = fromCoords[fromCoords.length - 1][1];
  const endLng = toCoord[0];
  const endLat = toCoord[1];

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    // Ease-out curve
    const eased = 1 - Math.pow(1 - progress, 3);

    const currentLng = startLng + (endLng - startLng) * eased;
    const currentLat = startLat + (endLat - startLat) * eased;

    const updatedCoords = [...fromCoords, [currentLng, currentLat]];
    map.getSource(sourceId).setData({
      type: "Feature",
      geometry: { type: "LineString", coordinates: updatedCoords }
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
```

### Pattern 4: Post-Convergence Intertwining Lines

**What:** After SHAD Valley, both lines follow the same route but with a sine-wave offset applied perpendicular to the travel direction, creating a braided/intertwined appearance.

**When to use:** For shared journey segments where both Arash and Natalie are traveling together.

**Example:**
```javascript
// Source: Geometric offset calculation [ASSUMED]
const generateInterleavedCoords = (baseCoords, amplitude, frequency, phase) => {
  // Generate offset coordinates perpendicular to travel direction
  return baseCoords.map((coord, i) => {
    if (i === 0) return coord;
    const prevCoord = baseCoords[i - 1];
    // Direction vector
    const dx = coord[0] - prevCoord[0];
    const dy = coord[1] - prevCoord[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return coord;
    // Perpendicular unit vector
    const px = -dy / len;
    const py = dx / len;
    // Sine offset
    const offset = Math.sin(i * frequency + phase) * amplitude;
    return [coord[0] + px * offset, coord[1] + py * offset];
  });
};

// Arash line: phase = 0
// Natalie line: phase = Math.PI (opposite phase = intertwined)
```

### Pattern 5: Mapbox Custom Style for Warm Tones

**What:** A custom Mapbox Studio style that renders land in warm cream/sand tones, water in warm tan (not blue), and minimizes labels -- making the map feel like part of the sunset palette.

**When to use:** At map initialization, via the `style` property.

**Example:**
```javascript
// Source: Mapbox GL JS style spec [ASSUMED]
const map = new mapboxgl.Map({
  container: "map",
  // Option A: Mapbox Studio custom style URL (recommended)
  style: "mapbox://styles/YOUR_USERNAME/YOUR_STYLE_ID",
  // Option B: Inline style object (for full control without Studio)
  // style: { version: 8, sources: {...}, layers: [...] },
  center: [30, 25], // Mid-world view showing both continents
  zoom: 2,
  accessToken: MAPBOX_TOKEN,
  attributionControl: false, // Reposition attribution
  interactive: false // Disable user interaction -- scroll controls the map
});

// Add minimal attribution (required by Mapbox ToS)
map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
```

**Custom style approach (two options):**

1. **Mapbox Studio (recommended):** Create a custom style in Mapbox Studio starting from the "Light" base style. Override land, water, and label colors per UI-SPEC color direction. Export as a style URL. This is the most maintainable approach. [ASSUMED]

2. **Runtime style overrides:** After map loads, use `map.setPaintProperty()` to override individual layer colors. Works without Mapbox Studio but requires identifying all relevant layer IDs in the base style. More fragile. [ASSUMED]

### Anti-Patterns to Avoid

- **Scroll event without passive flag:** Always use `{ passive: true }` on scroll listeners. Without it, the browser cannot optimize scrolling and the page will feel janky. [ASSUMED]
- **Triggering flyTo on every scroll tick:** Debounce or gate flyTo calls so they only fire when the stop index actually changes. Multiple overlapping flyTo calls cause visual chaos. [ASSUMED]
- **Using map.setCenter() instead of flyTo():** `setCenter` is instant with no animation. Always use `flyTo` for smooth transitions. [ASSUMED]
- **Animating line drawing with setInterval:** Use `requestAnimationFrame` for smooth animation. `setInterval` is not synchronized with the browser's render cycle and causes stuttering. [ASSUMED]
- **Loading all carousel photos eagerly:** With ~15-20 stops x 1-3 photos each, loading all at once on page load causes unnecessary network traffic. Load photos for the current stop and prefetch the next stop's photos. [ASSUMED]
- **Making the map interactive (draggable/zoomable):** Per D-06, the map is driven by scroll, not user interaction. Disable `dragPan`, `scrollZoom`, `touchZoomRotate`, etc. to prevent conflicts with the scroll controller. [ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map rendering + tiles | Custom canvas/SVG world map | Mapbox GL JS | Tile management, projection, WebGL rendering, retina support are enormously complex |
| Fly-to camera animation | Custom camera interpolation | `map.flyTo()` | Mapbox's implementation handles great-circle arcs, zoom curves, and easing correctly |
| GeoJSON line rendering | Canvas path drawing | Mapbox line layers | GPU-accelerated, handles map projections, zoom levels, and retina automatically |
| Touch gesture handling | Custom touch event math | CSS `scroll-behavior: smooth` + passive scroll listener | Browser-native smooth scrolling is better than manual touch tracking for the scrollytelling pattern |
| Custom map tiles | Server-side tile generation | Mapbox Studio custom style | Studio provides visual editor, CDN hosting, and handles all zoom levels |

**Key insight:** The map is a means, not an end. The emotional impact comes from the story content and the progressive reveal. Every hour spent building custom map rendering is an hour not spent on the narrative experience. Mapbox handles the hard graphics problems so the code can focus on storytelling orchestration.

## Common Pitfalls

### Pitfall 1: Mapbox Token Exposed in Public Repo
**What goes wrong:** The Mapbox access token is committed to a public GitHub repo and anyone can use it, potentially burning through the free tier.
**Why it happens:** GitHub Pages requires all assets to be in the repo. No server-side environment variable option.
**How to avoid:** Restrict the token to `arashrai.com` in the Mapbox dashboard (URL restrictions). The token will only work on requests originating from that domain. Also set up usage alerts in Mapbox dashboard.
**Warning signs:** Unexpected usage spikes in Mapbox dashboard. [ASSUMED]

### Pitfall 2: WebGL Not Supported
**What goes wrong:** Mapbox GL JS requires WebGL. Some older mobile browsers or privacy-focused browsers may not support it.
**Why it happens:** WebGL is required for Mapbox GL JS's GPU-accelerated tile rendering.
**How to avoid:** Check for WebGL support before initializing the map. Show a graceful fallback message (per UI-SPEC: "Your browser doesn't support interactive maps..."). The UI-SPEC already specifies this error state.
**Warning signs:** Map container stays blank with no error message. [ASSUMED]

### Pitfall 3: Scroll Jank on Mobile
**What goes wrong:** Scroll-driven animations feel laggy on mobile devices, especially older phones.
**Why it happens:** Non-passive scroll event listeners block the browser's scroll compositor. Heavy per-frame computations (map updates, DOM changes) on every scroll tick.
**How to avoid:** (1) Use `{ passive: true }` on all scroll listeners. (2) Only trigger map/content updates on stop index changes, not on every scroll pixel. (3) Use `requestAnimationFrame` to batch visual updates. (4) Consider `IntersectionObserver` as an alternative to scroll listeners for stop detection.
**Warning signs:** Visible lag between finger movement and map response. [ASSUMED]

### Pitfall 4: FlyTo Interrupted by Rapid Scrolling
**What goes wrong:** User scrolls quickly through multiple stops, causing flyTo animations to queue up and fight each other.
**Why it happens:** `flyTo` is asynchronous (2000ms duration). If the user scrolls to the next stop before the current flyTo completes, animations overlap.
**How to avoid:** Cancel the in-progress flyTo by calling `map.stop()` before starting a new one. Or use `map.flyTo({ essential: true })` which cancels any ongoing animations. If the user scrolls through 3+ stops quickly, skip intermediate stops and fly directly to the final one.
**Warning signs:** Map appears to "bounce" between multiple destinations. [ASSUMED]

### Pitfall 5: GeoJSON Source Update Performance
**What goes wrong:** Updating GeoJSON source data on every animation frame causes performance issues.
**Why it happens:** `source.setData()` triggers a full re-parse of the GeoJSON data, which is expensive when called 60x/second.
**How to avoid:** For the line animation, maintain a single GeoJSON object and mutate it in place rather than creating new objects. Or use a fixed maximum number of interpolation points (e.g., add 20 intermediate points per segment). Avoid calling `setData()` more than necessary -- batch coordinate updates. [ASSUMED]

### Pitfall 6: Fixed Positioning Conflicts with Mobile Safari
**What goes wrong:** `position: fixed` elements (map, content panel, timeline bar) behave inconsistently on Mobile Safari, especially when the URL bar hides/shows.
**Why it happens:** Mobile Safari dynamically resizes the viewport when the URL bar collapses, causing fixed elements to resize/jump.
**How to avoid:** Use `height: 100dvh` (dynamic viewport height) instead of `100vh` for the map container. Use CSS `env(safe-area-inset-bottom)` for the timeline bar to account for the home indicator on iPhone X+.
**Warning signs:** Content jumps when scrolling starts on iOS Safari. [ASSUMED]

### Pitfall 7: Mapbox GL JS v3 License
**What goes wrong:** Mapbox GL JS v2+ changed to a proprietary license (not BSD). Some developers assume it's still open-source.
**Why it happens:** Mapbox changed the license starting with v2.0.
**How to avoid:** This is fine for our use case -- the free tier covers 50,000 map loads/month and a wedding website will be far below that. Just be aware that the source cannot be forked or self-hosted. If open-source is a requirement, use MapLibre GL JS instead (but lose Mapbox Studio styles).
**Warning signs:** N/A -- this is informational, not a runtime issue. [ASSUMED]

## Code Examples

### Example 1: Complete Map Initialization

```javascript
// Source: Mapbox GL JS standard initialization pattern [ASSUMED]
const NARSH_MAP = (() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.YOUR_TOKEN_HERE"; // Restricted to arashrai.com
  let mapInstance = null;

  const init = (containerId) => {
    // WebGL check
    if (!mapboxgl.supported()) {
      const containerEl = document.getElementById(containerId);
      containerEl.innerHTML = "<div class=\"map-error\">Your browser doesn't support interactive maps. Try a different browser for the full experience.</div>";
      return null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapInstance = new mapboxgl.Map({
      container: containerId,
      style: "mapbox://styles/YOUR_USERNAME/warm-narsh-style",
      center: [50, 25], // Mid-world view (shows India, Cayman, Canada)
      zoom: 1.8,
      attributionControl: false,
      dragPan: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
      keyboard: false,
      pitchWithRotate: false,
      dragRotate: false
    });

    mapInstance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    return new Promise((resolve) => {
      mapInstance.on("load", () => {
        setupLayers();
        resolve(mapInstance);
      });
    });
  };

  const setupLayers = () => {
    // Arash journey line
    mapInstance.addSource("line-arash", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-arash-glow",
      type: "line",
      source: "line-arash",
      paint: { "line-color": "#2A9D8F", "line-width": 6, "line-opacity": 0.3, "line-blur": 3 }
    });
    mapInstance.addLayer({
      id: "line-arash",
      type: "line",
      source: "line-arash",
      paint: { "line-color": "#2A9D8F", "line-width": 3, "line-opacity": 1 },
      layout: { "line-cap": "round", "line-join": "round" }
    });

    // Natalie journey line
    mapInstance.addSource("line-natalie", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-natalie-glow",
      type: "line",
      source: "line-natalie",
      paint: { "line-color": "#D4A843", "line-width": 6, "line-opacity": 0.3, "line-blur": 3 }
    });
    mapInstance.addLayer({
      id: "line-natalie",
      type: "line",
      source: "line-natalie",
      paint: { "line-color": "#D4A843", "line-width": 3, "line-opacity": 1 },
      layout: { "line-cap": "round", "line-join": "round" }
    });

    // Stop pins
    mapInstance.addSource("stops", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });
    mapInstance.addLayer({
      id: "stop-pins",
      type: "circle",
      source: "stops",
      paint: {
        "circle-radius": ["case", ["get", "active"], 6.5, 5],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFDFB"
      }
    });
  };

  const flyToStop = (coords, zoom) => {
    if (!mapInstance) return;
    mapInstance.stop(); // Cancel any in-progress animation
    mapInstance.flyTo({
      center: coords,
      zoom: zoom || 5,
      duration: 2000,
      essential: true
    });
  };

  const getMap = () => mapInstance;

  return { init, flyToStop, getMap, setupLayers };
})();
```

### Example 2: Story Data Structure

```javascript
// Source: Application-specific data model [ASSUMED]
const NARSH_STORY_DATA = (() => {
  "use strict";

  const STOPS = [
    {
      id: "arash-india",
      owner: "arash",         // "arash" | "natalie" | "both"
      location: "Mumbai, India",
      coords: [72.8777, 19.0760],
      zoom: 5,
      year: 1997,
      narrative: "Born in Mumbai, where the journey begins...",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Arash in Mumbai" }
      ],
      isConvergence: false
    },
    {
      id: "natalie-cayman",
      owner: "natalie",
      location: "Grand Cayman, Cayman Islands",
      coords: [-81.2546, 19.3133],
      zoom: 7,
      year: 1999,
      narrative: "Born in the Cayman Islands, where the Caribbean sun set the tone...",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Natalie in Grand Cayman" }
      ],
      isConvergence: false
    },
    // ... more stops ...
    {
      id: "shad-valley",
      owner: "both",
      location: "SHAD Valley, Canada",
      coords: [-80.5204, 43.4643], // Approximate Waterloo region
      zoom: 6,
      year: 2016, // Approximate
      narrative: "Two stories collide at SHAD Valley. This is where everything changed...",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Natalie and Arash at SHAD Valley" }
      ],
      isConvergence: true
    }
    // ... post-convergence stops with owner: "both" ...
  ];

  // Computed: separate coordinate arrays for each journey line
  const getArashCoords = () => {
    return STOPS.filter(s => s.owner === "arash" || s.owner === "both")
      .map(s => s.coords);
  };

  const getNatalieCoords = () => {
    return STOPS.filter(s => s.owner === "natalie" || s.owner === "both")
      .map(s => s.coords);
  };

  return { STOPS, getArashCoords, getNatalieCoords };
})();
```

### Example 3: Photo Carousel

```javascript
// Source: Vanilla JS carousel pattern [ASSUMED]
const NARSH_CAROUSEL = (() => {
  "use strict";

  let currentIndex = 0;
  let photos = [];
  let containerEl = null;
  let trackEl = null;

  const init = (container) => {
    containerEl = container;
    trackEl = containerEl.querySelector(".carousel-track");

    const prevEl = containerEl.querySelector(".carousel-prev");
    const nextEl = containerEl.querySelector(".carousel-next");

    if (prevEl) prevEl.addEventListener("click", () => goTo(currentIndex - 1));
    if (nextEl) nextEl.addEventListener("click", () => goTo(currentIndex + 1));

    // Touch swipe support
    let startX = 0;
    let deltaX = 0;
    trackEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
    }, { passive: true });

    trackEl.addEventListener("touchmove", (e) => {
      deltaX = e.touches[0].clientX - startX;
      trackEl.style.transform = "translateX(calc(-" + (currentIndex * 100) + "% + " + deltaX + "px))";
    }, { passive: true });

    trackEl.addEventListener("touchend", () => {
      if (Math.abs(deltaX) > 50) {
        goTo(deltaX > 0 ? currentIndex - 1 : currentIndex + 1);
      } else {
        goTo(currentIndex); // Snap back
      }
    });
  };

  const loadPhotos = (newPhotos) => {
    photos = newPhotos;
    currentIndex = 0;
    trackEl.innerHTML = photos.map((photo) =>
      "<img class=\"carousel-photo\" src=\"" + photo.src + "\" alt=\"" + photo.alt + "\" loading=\"lazy\">"
    ).join("");
    updateUI();
  };

  const goTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, photos.length - 1));
    trackEl.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    trackEl.style.transition = "transform 250ms ease";
    updateUI();
  };

  const updateUI = () => {
    const prevEl = containerEl.querySelector(".carousel-prev");
    const nextEl = containerEl.querySelector(".carousel-next");
    const dotsEl = containerEl.querySelector(".carousel-dots");

    if (prevEl) prevEl.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    if (nextEl) nextEl.style.visibility = currentIndex >= photos.length - 1 ? "hidden" : "visible";

    if (photos.length <= 1) {
      if (prevEl) prevEl.style.display = "none";
      if (nextEl) nextEl.style.display = "none";
      if (dotsEl) dotsEl.style.display = "none";
    } else {
      if (prevEl) prevEl.style.display = "";
      if (nextEl) nextEl.style.display = "";
      if (dotsEl) {
        dotsEl.style.display = "";
        dotsEl.innerHTML = photos.map((_, i) =>
          "<span class=\"carousel-dot" + (i === currentIndex ? " active" : "") + "\"></span>"
        ).join("");
      }
    }

    // Accessibility announcement
    const announceEl = containerEl.querySelector(".carousel-announce");
    if (announceEl && photos.length > 1) {
      announceEl.textContent = "Photo " + (currentIndex + 1) + " of " + photos.length;
    }
  };

  return { init, loadPhotos, goTo };
})();
```

### Example 4: Reduced Motion Support

```css
/* Source: WCAG 2.3.3 + prefers-reduced-motion pattern [ASSUMED] */
@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none !important;
  }

  .scroll-prompt {
    animation: none !important;
  }

  /* Map animations are handled in JS:
     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
       map.jumpTo(coords) instead of map.flyTo(coords)
     }
  */
}
```

### Example 5: Mobile Safari Viewport Fix

```css
/* Source: CSS dvh unit for mobile viewport [ASSUMED] */
.map-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh; /* Dynamic viewport height -- accounts for Safari URL bar */
  height: 100vh; /* Fallback for browsers without dvh support */
}

/* Timeline bar at bottom with safe area inset */
.timeline-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(48px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Leaflet for all web maps | Mapbox GL JS for animation-heavy maps | 2019+ | WebGL rendering enables smooth flyTo, custom styles, 60fps line animation |
| CSS scroll-snap for scrollytelling | Scroll listener with IntersectionObserver | 2020+ | scroll-snap doesn't support continuous position tracking needed for progressive animations |
| 100vh for full-height fixed elements | 100dvh (dynamic viewport height) | 2022+ (Safari 15.4) | Fixes the iOS URL bar resize issue that caused layout jumping |
| Mapbox GL JS v1 (BSD license) | Mapbox GL JS v3 (proprietary) | 2020 (v2) | Free tier still generous; MapLibre GL JS forked from v1 for open-source needs |
| Heavyweight carousel libraries (Slick, Owl) | Vanilla JS or lightweight (Swiper) | 2020+ | For 1-3 images, vanilla JS is simpler and smaller than any library |

**Deprecated/outdated:**
- **Mapbox.js (Leaflet wrapper):** Deprecated by Mapbox in favor of Mapbox GL JS. Do not use. [ASSUMED]
- **Stamen tiles (maps.stamen.com):** Stamen's free tile hosting ended. Tiles were migrated to Stadia Maps. Not relevant since we're using Mapbox tiles. [ASSUMED]
- **100vh on mobile:** Unreliable on iOS Safari. Use `100dvh` with `100vh` fallback. [ASSUMED]

## Assumptions Log

> All claims in this research are based on training data since web tools and npm registry were unavailable. Every factual claim is tagged [ASSUMED].

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mapbox GL JS latest is v3.x (~v3.9.x) | Standard Stack | CDN URL would be wrong; verify exact version at implementation time |
| A2 | Mapbox free tier is 50,000 map loads/month | Standard Stack, Pitfall 1 | May need to check current pricing; could have changed |
| A3 | Mapbox GL JS CDN URL format is `api.mapbox.com/mapbox-gl-js/v{version}/mapbox-gl.js` | Standard Stack | Implementation would fail if URL changed; easy to verify at implementation |
| A4 | `map.flyTo()` accepts `{ center, zoom, duration, essential }` and fires `moveend` event | Architecture Patterns | Core animation mechanism depends on this API |
| A5 | `source.setData()` on GeoJSON sources triggers full re-parse | Pitfall 5 | Performance optimization advice may be unnecessary or wrong |
| A6 | Mapbox GL JS v2+ uses proprietary license (not BSD) | Pitfall 7 | Legal concern; verify before deployment |
| A7 | `100dvh` is supported in Safari 15.4+ | Code Examples | Mobile layout fix depends on this; fallback to `100vh` if not |
| A8 | `mapboxgl.supported()` checks WebGL availability | Code Examples | Graceful degradation path depends on this function existing |
| A9 | MapLibre GL JS is the open-source fork of Mapbox GL JS v1 | Alternatives Considered | Alternative recommendation may be incorrect |
| A10 | Custom Mapbox Studio styles can be created starting from "Light" base | Architecture Patterns | Style creation workflow may differ |
| A11 | Mapbox token can be restricted to specific domains in the dashboard | Pitfall 1 | Security recommendation depends on this feature |

**Critical note for planner:** Given that ALL claims are [ASSUMED], the executor should verify the Mapbox GL JS CDN URL, version, and API surface at implementation time by checking `https://docs.mapbox.com/mapbox-gl-js/guides/install/` before writing any code. This is a low-risk verification step (just load the docs page) but is essential.

## Open Questions

1. **Mapbox Studio account setup**
   - What we know: A Mapbox account is needed for an access token and custom style creation
   - What's unclear: Whether Arash already has a Mapbox account, or one needs to be created. Whether Natalie or Arash will create the custom warm-toned style in Studio, or if Claude should generate a style JSON programmatically.
   - Recommendation: The planner should include a task for Mapbox account setup and token creation. Provide a programmatic style fallback (runtime paint property overrides) in case Mapbox Studio is not used.

2. **Exact stop list and coordinates**
   - What we know: PROJECT.md lists broad geography -- Arash (India, New Zealand, Canada), Natalie (Cayman Islands, childhood locations, Canada), Together (SHAD Valley, Waterloo, internship cities, Seattle). ~15-20 stops total.
   - What's unclear: The exact number of stops, which cities are included, and precise coordinates for each.
   - Recommendation: Define stops in a dedicated data file (`story-data.js`) so content can be iterated independently of code. Start with known stops and placeholder coordinates; refine later.

3. **Photo assets**
   - What we know: Photos are not yet curated. 1-3 per stop. Stored in repo at `narsh2026/images/`. Placeholder images are acceptable for MVP.
   - What's unclear: Whether SVG placeholders or solid-color div placeholders are preferred.
   - Recommendation: Use simple SVG placeholders with the stop location name, so the page is visually meaningful even before real photos. The carousel code should work identically with real or placeholder images.

4. **Bow animation complexity**
   - What we know: At SHAD Valley, teal and gold lines should tie into a decorative bow. UI-SPEC says lines cross over each other twice forming a bow shape over 1500ms.
   - What's unclear: Exact bow geometry. Should it be an SVG overlay positioned on the map, or a set of extra GeoJSON coordinates that form the bow shape?
   - Recommendation: Use extra GeoJSON coordinates that form two crossing loops near the convergence point. Simpler than SVG overlay positioning (which must stay in sync with map projection). The "bow" is really just two small loops in the line data, animated progressively.

5. **Header z-index interaction with fixed map**
   - What we know: The site header is `position: fixed` (from Phase 1 nav pattern), and the map will also be `position: fixed`.
   - What's unclear: Whether the header should overlay on top of the map (transparent background) or sit above it (opaque, with the map starting below the header).
   - Recommendation: Header sits above the map with opaque `--color-cream` background and a z-index higher than the map. Map container starts below header height. This matches the UI-SPEC layout diagrams.

## Project Constraints (from CLAUDE.md)

- **No build step:** External libs via CDN `<script>` tags only
- **IIFE module pattern:** `const NAME = (() => { ... })()`
- **const only, double quotes, semicolons, 2-space indentation**
- **El suffix** on DOM reference variables (mapEl, carouselEl, etc.)
- **Root-relative paths** for internal links (/narsh2026/styles.css)
- **Auth guard:** Pages must call `NARSH_AUTH.requireAuth()` at load
- **Nav module:** Pages load `nav.js` for shared hamburger navigation
- **Shared design system:** New CSS tokens go in `narsh2026/styles.css` :root block
- **GSD workflow:** Do not make direct repo edits outside a GSD workflow

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Mapbox GL JS | Map rendering | CDN-loaded (not local) | v3.x [ASSUMED] | MapLibre GL JS (open-source, but loses Mapbox Studio) |
| Mapbox Access Token | Tile loading | Requires account signup | N/A | None -- account is required |
| WebGL | Mapbox rendering | Browser-dependent | N/A | Graceful error message (per UI-SPEC) |
| GitHub Pages | Hosting | Yes (existing) | N/A | None |
| Google Fonts CDN | Typography | Yes (existing Phase 1) | N/A | System fonts |

**Missing dependencies with no fallback:**
- Mapbox access token -- requires creating a free Mapbox account. This is a prerequisite task before any map code can be tested.

**Missing dependencies with fallback:**
- None. All other dependencies are browser-built-in or CDN-loaded.

## Sources

### Primary (HIGH confidence)
- None available -- Context7, WebSearch, and WebFetch were all blocked by environment restrictions. NPM registry returned 503.

### Secondary (MEDIUM confidence)
- None available.

### Tertiary (LOW confidence -- training data only)
- Mapbox GL JS documentation (training data, not live-verified)
- Mapbox GL JS API reference (training data)
- CSS `dvh` unit specification (training data)
- IntersectionObserver API (training data)
- General scrollytelling patterns from NYT/The Pudding examples (training data)

**All findings in this document are tagged [ASSUMED] and should be verified at implementation time.**

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM -- Mapbox GL JS is well-established and very likely correct, but exact version number and CDN URL need verification
- Architecture: MEDIUM -- Scrollytelling pattern is well-documented and standard, but specific Mapbox API calls should be verified against current docs
- Pitfalls: MEDIUM -- Based on extensive training data about common Mapbox and scroll animation issues; specific details (e.g., `source.setData()` performance characteristics) should be verified
- Code examples: LOW -- Patterns are directionally correct but specific API signatures and method names should be verified against current Mapbox GL JS v3 documentation before implementation

**Research date:** 2026-05-19
**Valid until:** 2026-06-19 (30 days -- Mapbox GL JS is stable and unlikely to have breaking changes in this window)
