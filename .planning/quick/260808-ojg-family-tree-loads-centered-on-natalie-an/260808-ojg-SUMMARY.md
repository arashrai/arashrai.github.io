---
phase: 260808-ojg
plan: 01
status: awaiting-browser-verification
subsystem: ui

tags: [our-people, family-tree, d3, zoom, camera, framing, cache-bust]

requires:
  - phase: 03-guest-graph
    provides: renderFamilyTree layout, treeNodeData, d3 zoom behavior, switchView crossfade
provides:
  - "frameOnCouple() camera helper that points the tree viewport at the Natalie + Arash pair"
  - "switchView transform-restore guard scoped to view === \"social\""
  - "TREE_FOCUS_* framing constants (single-knob TREE_FOCUS_Y_FRAC)"
affects: [our-people, family-tree view, any future tree camera/resize work]

tech-stack:
  added: []
  patterns:
    - "Camera framing applied through zoomBehavior.transform (not innerGroupEl.attr) so d3 zoom state stays in sync"
    - "Instant transform application mid-crossfade instead of a d3 transition — also correct for prefers-reduced-motion with no second code path"
    - "Fit-to-target scale capped at 1.0 and clamped into the existing scaleExtent"

key-files:
  created: []
  modified:
    - narsh2026/our-people/graph.js
    - narsh2026/our-people/index.html

key-decisions:
  - "Cap the computed scale at TREE_FOCUS_SCALE_MAX = 1 — never zoom IN past the default, so the result reads as 'the family tree, centered on us' rather than 'zoomed into a face'"
  - "Hook at the end of renderFamilyTree rather than in switchView, so both call sites (switchView and filterFamilyTree) are fixed for free and the framing lands after the crossfade content swap"
  - "Focus point is the arithmetic mean of whichever of natalie/arash are present, so neither is clipped in favour of the other, and a one-sided family filter naturally frames that single person with no special-case code"
  - "Guard the stored-transform restore to view === \"social\" instead of clearing currentTransform — the Everyone view still restores its pan/zoom exactly as before"
  - "Hand-stamp the ?v= cache-bust rather than running build-guests.js, because guests.csv has uncommitted user edits that a build would have swept into this commit"

patterns-established:
  - "TREE_FOCUS_Y_FRAC as a single documented tuning knob for vertical framing (0.58, deliberately below center because the tree grows upward from the couple)"

requirements-completed: [QUICK-OJG-01]

duration: ~6min
completed: 2026-08-08
---

# Quick Task 260808-ojg: Family Tree Loads Centered on Natalie and Arash

**`frameOnCouple()` sets the d3 zoom transform so the Natalie + Arash midpoint lands at the horizontal center and 58% of the canvas height every time the Family Tree renders, at a fit-to-pair scale capped at 1.0, instead of the viewport sitting on the geometric middle of the whole forest.**

## Performance

- **Duration:** ~6 min
- **Tasks:** 2 of 3 complete (Task 3 is a blocking human-verify browser check — see Outstanding below)
- **Files modified:** 2

## Accomplishments

- The user's actual complaint is fixed at the root: `renderFamilyTree` centers the combined forest on `centerShift = (width - totalWidth) / 2`, and because Natalie's forest is much wider than Arash's, that midpoint lands deep inside Natalie's extended family with the couple pushed off to the right. The camera is now aimed at the couple instead, and the `centerShift` layout math is untouched.
- Vertical framing was previously nonexistent — the layout starts at `topY = 90` and grows downward with nothing pointing the viewport at any particular row. The couple's midpoint now lands at `height * 0.58`, keeping their parents' generation (`TREE_FOCUS_PAD_TOP = TREE_V_SPACING * 1.2`) in frame above them.
- Scale is computed to fit the pair rather than assumed: `min(width / requiredWidth, height / requiredHeight, 1)`, so on a 375px phone the pair shrinks to fit instead of clipping, while on desktop the cap keeps it at the familiar 1.0.
- The framing survives the crossfade. `switchView` previously restored the Everyone-view transform unconditionally in both the reduced-motion and crossfade branches, which would have instantly undone the new framing; both restores are now scoped to `view === "social"`.
- Family filters work with no extra code: `filterFamilyTree` re-renders through `renderFamilyTree`, and with only one of natalie/arash in `treeNodeData` the mean-of-present-nodes focus point collapses to that one person.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Frame the family tree camera on the couple | `78f5497` | `narsh2026/our-people/graph.js` |
| 2 | Bump the cache-bust stamp and run repo-hygiene checks | `2e03c2b` | `narsh2026/our-people/index.html` |

## Implementation Notes

**`frameOnCouple()` — graph.js:1124-1168**, defined immediately before `renderFamilyTree` and called as its final statement (graph.js:1390, after the `graph-desc` update).

- Bails and changes nothing if `svgEl`, `zoomBehavior`, or a non-empty `treeNodeData` is missing, or if neither `"natalie"` nor `"arash"` is present — so any data state that does not render the couple keeps today's behavior exactly.
- `"natalie"` / `"arash"` as literal ids follows the established convention already in this file (the couple connector at graph.js ~1305).
- Applied via `svgEl.call(zoomBehavior.transform, transform)` with **no** `.transition()`. Going through `zoomBehavior.transform` rather than setting `innerGroupEl.attr("transform", ...)` is required so d3's internal zoom state stays in sync and subsequent user pan/pinch continues from the new framing instead of jumping back.
- Transform composition mirrors the existing `zoomToNode` (graph.js ~537): `d3.zoomIdentity.translate(width / 2, height * TREE_FOCUS_Y_FRAC).scale(scale).translate(-focusX, -focusY)`.

**New constants — graph.js:43-55**, alongside the existing `TREE_*` block: `TREE_FOCUS_SCALE_MAX` (1), `TREE_FOCUS_PAD_X` (60), `TREE_FOCUS_PAD_TOP` (`TREE_V_SPACING * 1.2`), `TREE_FOCUS_PAD_BOTTOM` (80), `TREE_FOCUS_Y_FRAC` (0.58).

**`switchView` guards — graph.js:1087 (reduced-motion path) and graph.js:1106 (crossfade path)**, both now `if (view === "social" && currentTransform && zoomBehavior)` with a comment explaining the tree exemption.

**Cache-bust — index.html lines 12, 59, 60, 61** all moved from `?v=202608081739` to `?v=202608081747`, the identical 12-digit local-time stamp `build-guests.js:661` would have produced, so a later real build is a clean no-op on this line pattern.

Not touched, per plan: `zoomToNode`, `filterByGroup`, `renderSocialGraph`, `layoutSide`, the `centerShift` math. No resize handler was added (none exists today; out of scope).

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Verification

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-OJG-01 | accept | Confirmed. `frameOnCouple` only reads `px`/`py`/`radius` from `treeNodeData`, which `layoutSide` already builds with `treeHidden` guests filtered out. No new exposure. |
| T-OJG-02 | mitigate | Implemented. `scale` falls back to 1 when `Number.isFinite(fitScale) && fitScale > 0` is false (zero-size canvas, NaN), and is otherwise clamped into `[0.3, 3]` to match the zoom behavior's `scaleExtent`. |
| T-OJG-03 | mitigate | Implemented. All four our-people asset URLs carry the fresh stamp; zero occurrences of the old one remain. |

## Verification

Automated gates — all passing:

- `node --check narsh2026/our-people/graph.js` exits 0.
- `frameOnCouple` appears 2+ times in graph.js (definition + call site).
- `view === "social" && currentTransform` appears exactly twice.
- `zoomBehavior.transform, transform` present.
- index.html has exactly four identical fresh 12-digit `?v=` stamps and zero occurrences of `202608081739`.
- `git status --porcelain` clean for `guest-data.js`, `build-guests.js`, and all of `narsh2026/our-story/`.
- Post-commit `git diff --diff-filter=D` on both commits: no file deletions.

Scope hygiene confirmed: the only files committed by this task are `narsh2026/our-people/graph.js` and `narsh2026/our-people/index.html`. The user's concurrent in-flight work (`narsh2026/our-people/guests.csv`, the untracked `kendra.jpg` / `kyle.jpg`, `.planning/config.json`, `.planning/HANDOFF-our-people.md`, `.planning/phases/`) is untouched and still uncommitted. `node build-guests.js` was deliberately **not** run.

## OUTSTANDING — Task 3: Human Browser Verification (blocking)

No test runner exists in this repo and an agent cannot drive a real browser here, so the automated gates above only prove the file parses and the wiring strings are present. **The visual result has not been confirmed and is not self-certified.** This is why `status` is `awaiting-browser-verification` rather than `complete`.

Serve locally (`python3 -m http.server 8000` from the repo root), open `http://localhost:8000/narsh2026/our-people/`, hard-refresh (Cmd+Shift+R), then:

1. **Desktop default:** click **Family Tree**. You and Arash centered horizontally, a bit below the vertical middle, dashed marriage connector fully visible, at least the generation above you in view, neither of you clipped by an edge.
2. **Filters:** **Natalie's Family** frames you; **Arash's Family** frames Arash; **Both Families** returns to the pair.
3. **Pan and zoom:** drag and scroll/pinch — moves normally, no snap-back.
4. **Round trip:** **Everyone** -> pan somewhere distinctive -> **Family Tree** (re-frames on you two) -> **Everyone** again returns to where you left it, not reset.
5. **Search:** type a guest name while in Family Tree view — zoom-to-node still fires and pulses the node.
6. **Phone:** DevTools responsive mode at iPhone SE width (375px), or a real phone. Both of you fit side by side with breathing room, neither hidden under the "Pinch to zoom" hint.
7. **Reduced motion:** enable macOS System Settings > Accessibility > Display > Reduce motion, reload, switch to Family Tree — snaps straight to the couple-centered framing, no animation, no intermediate wrong position.

If the vertical placement feels off (too much dead space below you, or your parents' row cut off at the top), the single knob is `TREE_FOCUS_Y_FRAC` at **graph.js:55** — lower toward 0.5 moves you up, raise toward 0.7 moves you down.

## Self-Check: PASSED

- `narsh2026/our-people/graph.js` — FOUND, `frameOnCouple` defined at :1128 and called at :1390
- `narsh2026/our-people/index.html` — FOUND, four `?v=202608081747` stamps
- Commit `78f5497` — FOUND in git log
- Commit `2e03c2b` — FOUND in git log
