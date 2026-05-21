# Roadmap: Narsh 2026

**Created:** 2026-05-15
**Milestone:** v1.0
**Phases:** 5
**Mode:** Vertical MVP — each phase delivers a working end-to-end feature

---

### Phase 1: Access & Design Foundation
**Goal:** As a wedding guest, I want to enter a password to access the wedding website, so that I feel personally invited and can navigate to all the wedding information.
**Mode:** mvp
**Success Criteria**:
1. Guest can enter a password on the landing page and access gated content
2. Two different passwords unlock two tiers of content (Day 2 vs full)
3. Navigation menu is visible and links to placeholder sections
4. Landing page looks warm, playful, and on-brand (not default/unstyled)
5. All pages render correctly on mobile (iPhone SE width) and desktop

**Requirements:** ACC-01, ACC-02, ACC-03, ACC-04, ACC-05

**Plans:** 3 plans

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Walking skeleton: CSS design system, auth module, and landing page rewrite with password gate

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Navigation module and six section placeholder pages with auth guards

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-03-PLAN.md — Human verification of complete Phase 1 delivery

**UI hint:** yes

---

### Phase 2: Map Timeline
**Goal:** Build the scroll-driven interactive world map that tells Arash and Natalie's parallel life stories converging, with photo slideshows and narrative text at each stop.
**Mode:** mvp
**Success Criteria**:
1. World map displays with pins at all life chapter locations
2. Scrolling smoothly flies the map between stops in chronological order
3. Each stop displays narrative text describing that phase of life
4. Each stop shows a clickable photo slideshow (placeholder images acceptable)
5. Timeline works on mobile (touch scroll, readable text, tappable photos)

**Requirements:** TIME-01, TIME-02, TIME-03, TIME-04

**Plans:** 3 plans

Plans:
**Wave 1**
- [x] 02-01-PLAN.md — Core scroll-driven map with story data, fly-to animations, progressive line drawing, and narrative text panel

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-02-PLAN.md — Photo carousel, clickable timeline bar, mobile cross-fade, and placeholder images

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 02-03-PLAN.md — Human verification of complete Phase 2 delivery

**UI hint:** yes

---

### Phase 3: Guest Graph
**Goal:** Build the interactive guest relationship visualization combining a force-directed social graph with family tree layout, filterable by group, with photos on key nodes.
**Mode:** mvp
**Success Criteria**:
1. Force-directed graph renders with guest nodes and relationship edges
2. User can switch to family tree layout for immediate family view
3. Filters allow viewing subsets by group (family, city, relationship type)
4. Core family member nodes display profile photos and names
5. Graph is navigable on mobile (pinch-zoom, tap for details)

**Requirements:** GRAPH-01, GRAPH-02, GRAPH-03, GRAPH-04

**Plans:** 4 plans

Plans:
**Wave 1**
- [x] 03-01-PLAN.md — Social graph core: guest data module, D3 force-directed layout with photo-circle nodes, edges, cluster regions, zoom/pan, and page shell

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02-PLAN.md — Search by name, group filters, expand-in-place node details with connection highlighting, and mobile bottom sheet

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 03-03-PLAN.md — Family tree layout with dual-family side-by-side display, view toggle with crossfade, and family-specific filters

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 03-04-PLAN.md — Human verification of complete Phase 3 delivery

**UI hint:** yes

---

### Phase 4: Puzzle Page
**Goal:** Build a standalone puzzle page with a custom "Clues by Sam" style word-association puzzle and links to favorite daily puzzles.
**Mode:** mvp
**Success Criteria**:
1. Custom puzzle renders as an interactive grid of clue items
2. User can select items and check if they form a correct group
3. Correctly guessed groups are revealed with category name
4. Page includes curated links to favorite daily puzzles
5. Puzzle plays well on mobile (tap to select, clear feedback)

**Requirements:** PUZZLE-01, PUZZLE-02

**UI hint:** yes

---

### Phase 5: Info Pages
**Goal:** Build the practical information pages — event schedule (tier-aware), venue & travel details, and dress code guidance.
**Mode:** mvp
**Success Criteria**:
1. Event schedule page shows correct events based on guest tier (Day 2 vs full)
2. Venue page displays location, directions, hotel recommendations, and parking info
3. Dress code page provides clear guidance on what to wear
4. Info pages match the established warm, playful design language
5. All info pages are readable and well-laid-out on mobile

**Requirements:** INFO-01, INFO-02, INFO-03

**UI hint:** yes

---

## Coverage

| Requirement | Phase |
|-------------|-------|
| ACC-01 | 1 |
| ACC-02 | 1 |
| ACC-03 | 1 |
| ACC-04 | 1 |
| ACC-05 | 1 |
| TIME-01 | 2 |
| TIME-02 | 2 |
| TIME-03 | 2 |
| TIME-04 | 2 |
| GRAPH-01 | 3 |
| GRAPH-02 | 3 |
| GRAPH-03 | 3 |
| GRAPH-04 | 3 |
| PUZZLE-01 | 4 |
| PUZZLE-02 | 4 |
| INFO-01 | 5 |
| INFO-02 | 5 |
| INFO-03 | 5 |

**18/18 requirements mapped** ✓

---
*Roadmap created: 2026-05-15*
*Updated: 2026-05-17 — Phase 1 plans created*
*Updated: 2026-05-19 — Phase 2 plans created*
*Updated: 2026-05-20 — Phase 3 plans created*
