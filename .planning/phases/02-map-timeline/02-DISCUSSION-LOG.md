# Phase 2: Map Timeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 02-map-timeline
**Areas discussed:** Story structure, Map + text layout, Photo presentation, Map visual style

---

## Story Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Two parallel tracks → merge | Arash's stops and Natalie's stops shown side-by-side or alternating, with a clear visual convergence moment at SHAD Valley | |
| Single interleaved timeline | All stops in chronological order, color-coded per person | |
| Natalie first, then Arash, then together | Three distinct chapters — two origin stories then team-up | |
| Other (free text) | Chronological order with world map, teal line for Arash (family wedding color), gold for Natalie (family wedding color) | ✓ |

**User's choice:** Chronological order with teal (Arash) and gold (Natalie) journey lines on a world map. Lines represent family wedding-day colors.
**Notes:** User has a strong vision — lines as "strings" on the map showing paths, photos + text above the map, timeline along the bottom.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Progressive draw | Both lines drawn onto map as you scroll through time — early stops short, later stops long | ✓ |
| Fly-to with full lines | Both complete lines visible from start, camera flies to active stop | |
| You decide | Claude picks | |

**User's choice:** Progressive draw — lines grow as time advances.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lines merge into one | Teal and gold combine into single line after convergence | |
| Lines run together | Both lines continue side-by-side from SHAD Valley onward | ✓ |
| You decide | Claude picks | |

**User's choice:** Lines run together but never merge. They can separate briefly (internship cities). User wants lines to circle each other playfully when traveling together, and tie into a bow at SHAD Valley convergence.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Short blurbs (1-2 sentences) | Quick punchy captions | |
| Short paragraphs (3-5 sentences) | More storytelling depth | |
| Mix — varies by stop | Story dictates the length | ✓ |

**User's choice:** Mix — milestone moments get fuller treatment.

---

## Map + Text Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed map + scrolling panels | Map pinned in viewport, text/photo panels scroll over/alongside | |
| Flowing page sections | Map, text, photos all in normal page flow | |
| You decide | Claude picks | |
| Other (free text) | Map and timeline fixed; scrolling only changes photos/text and map annotations | ✓ |

**User's choice:** Map and timeline bar are fixed. Scrolling updates the content panel and map annotations (lines, pins, bow).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Floating card on map | Semi-transparent card overlaying the map | |
| Strip above the map | Dedicated strip above map area | |
| Side panel (desktop) / top (mobile) | Panel on side with map filling rest | |
| Other (free text) | Above/beside map when room, cross-fade on mobile | ✓ |

**User's choice:** Responsive — above or beside map on desktop (both visible), cross-fade between map and content on mobile.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Clickable stops | Each stop as a dot/marker, click to jump | ✓ |
| Progress indicator only | Simple bar showing scroll position | |
| You decide | Claude picks | |

**User's choice:** Clickable stops on the timeline bar.

---

## Photo Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side thumbnails | All photos visible at once in a row | |
| Carousel / swipe | One photo at a time with arrows/swipe | ✓ |
| You decide | Claude picks | |

**User's choice:** Carousel/swipe — one photo at a time.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lightbox overlay | Tap opens photo large in dark overlay | |
| Carousel is enough | No expand on click | |
| You decide | Claude judges based on space | ✓ |

**User's choice:** Claude's discretion based on available space.

---

## Map Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| Warm-toned custom map | Map tiles tinted with warm cream/gold tones | |
| Neutral map, warm overlays | Standard map with warm annotations | |
| You decide | Claude picks | |
| Other (free text) | Claude picks — aesthetics and warmth are top priority, not geographic accuracy | ✓ |

**User's choice:** Claude picks, prioritizing aesthetics. Teal and gold aren't warm colors so the map should compensate with warm tones. Geographic accuracy is secondary.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Color-coded dots | Simple circles in teal/gold at stops | ✓ |
| Labeled pins | Small pins with location names | |
| You decide | Claude picks | |

**User's choice:** Color-coded dots — minimal, clean.

---

## Claude's Discretion

- Map library selection (Mapbox GL JS, Leaflet, etc.)
- Photo lightbox vs carousel-only (based on available space)
- Warm map tile styling specifics
- Line intertwining/circling animation implementation
- Bow animation implementation at SHAD Valley

## Deferred Ideas

None — discussion stayed within phase scope.
