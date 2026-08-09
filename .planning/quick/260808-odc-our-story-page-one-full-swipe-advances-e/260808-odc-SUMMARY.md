---
phase: 260808-odc
plan: 01
status: awaiting-device-verification
subsystem: ui

tags: [our-story, scroll, gestures, touch, wheel, overscroll-behavior, mapbox-timeline]

requires:
  - phase: 02-map-timeline
    provides: NARSH_SCROLL scroll-to-stop controller, timeline dots, story panel
provides:
  - "One-step-per-gesture layer inside NARSH_SCROLL (touch + wheel)"
  - "findScrollableAncestor/canScrollFurther helpers that hand a gesture to an inner story panel until it hits its boundary"
  - "overscroll-behavior: contain on both scrollable story containers"
affects: [our-story, map-timeline, any future scroll/gesture work on narsh2026]

tech-stack:
  added: []
  patterns:
    - "Gesture layer in FRONT of the scrollY->index mapping rather than replacing it"
    - "Mode locked once per gesture (pending/step/native/ignore) instead of re-decided per event"
    - "Inner scroller found by computed overflowY, not by hardcoded selector"

key-files:
  created: []
  modified:
    - narsh2026/our-story/scroll-controller.js
    - narsh2026/our-story/our-story.css
    - narsh2026/our-story/index.html

key-decisions:
  - "Route every gesture step through the existing scrollToStop() so targetIndex, the URL-bar-resize lock, instant setStop feedback, reduced-motion and the 1200ms safety release all keep working unchanged"
  - "Lock the gesture mode on the first touchmove past the 8px axis threshold and hold it for the whole drag — re-deciding mid-drag would chain a text panel's end into a story step in the same swipe, and browsers stop honoring preventDefault() once native scrolling has started"
  - "Restart the wheel idle timer on every wheel event including swallowed ones, so a momentum tail counts as one gesture"
  - "Left the raw Math.round(scrollY / perStop) mapping intact as the fallback for scrollbar drags, Page Down and anchor jumps"

patterns-established:
  - "Non-passive touchmove/wheel with conditional, event.cancelable-guarded preventDefault() (no touch-action: none, which would kill inner text scrolling)"

requirements-completed: [QUICK-260808-odc]

duration: 12min
completed: 2026-08-08
---

# Quick Task 260808-odc: One Full Swipe Advances Exactly One Story Stop

**Gesture layer inside NARSH_SCROLL converts one touch drag or one wheel gesture into exactly one `scrollToStop()` call, swallowing momentum, while long story blurbs still scroll natively inside their card.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2 of 3 complete (Task 3 is a blocking manual device check — see below)
- **Files modified:** 3

## Accomplishments

- One hard flick now maps to exactly one story stop: `touchend` steps by `+/-1` when vertical travel clears 40px and deliberately throws away everything past that threshold, so a violent flick and a gentle drag are identical.
- A trackpad momentum tail is swallowed: `wheelLocked` plus a 220ms idle timer that restarts on *every* wheel event (including the swallowed ones) means the lock only lifts once the trackpad genuinely goes quiet.
- Long narratives still read normally: `findScrollableAncestor()` locates the mobile `.stop-narrative` / desktop `.story-panel` by computed `overflowY` (no hardcoded selector) and the gesture is handed to the browser while that panel still has room in the drag's direction.
- Scroll chaining closed off with `overscroll-behavior: contain` on both scrollable story containers, so a panel hitting its end mid-swipe can no longer dump the remainder into the document and jump raw `scrollY` past several stops.
- Existing behavior preserved: horizontal drags stay with the photo carousel, pinch-zoom and the open nav menu are ignored, and the `Math.round(scrollY / perStop)` fallback plus the whole public API (`init` / `scrollToStop` / `getCurrentIndex`) are untouched.

## Task Commits

1. **Task 1: One-step-per-gesture layer in NARSH_SCROLL** — `8cd4000` (feat)
2. **Task 2: Contain inner overscroll + bump cache-bust versions** — `1cbac56` (fix)
3. **Task 3: Real-device verification** — NOT DONE (blocking manual checkpoint, see below)

## Files Created/Modified

- `narsh2026/our-story/scroll-controller.js` — Added four constants (`AXIS_LOCK_PX` 8, `SWIPE_STEP_PX` 40, `WHEEL_STEP_PX` 40, `WHEEL_IDLE_MS` 220), gesture state (`gestureMode`, `touchStartX/Y`, `touchDeltaY`, `gestureScrollerEl`, `wheelAccum`, `wheelLocked`, `wheelIdleTimer`), helpers `findScrollableAncestor` / `canScrollFurther` / `shouldIgnoreGesture` / `stepBy` / `resetTouchGesture`, handlers for `touchstart` / `touchmove` / `touchend` / `touchcancel` / `wheel`, and five listener registrations in `init()`. `handleScroll`, `handleResize`, `syncHeight`, `setStop`, `scrollToStop`, `clampIndex` and the return object are unchanged.
- `narsh2026/our-story/our-story.css` — `overscroll-behavior: contain` on `.story-panel .stop-narrative` (mobile block) and `.story-panel` (desktop block), with a why-comment on the mobile one.
- `narsh2026/our-story/index.html` — `our-story.css` and `scroll-controller.js` bumped to `?v=202608081900`. The other four `?v=` strings (story-data, map, carousel, timeline) untouched.

## Verification Run

Both automated gates printed `GATES_PASS`:

- Task 1: `node --check` passes; `passive: false` appears twice (touchmove, wheel); `findScrollableAncestor` 3x; `stepBy` 3x; `event.cancelable` 2x; `touchcancel` present; `return { init, scrollToStop, getCurrentIndex }` exactly once; `Math.round(scrollY / perStop)` exactly once.
- Task 2: `overscroll-behavior: contain` twice in CSS; both bumped `?v=` strings present exactly once; `map.js?v=202608052300` unchanged.

## OUTSTANDING: Task 3 — Real-device verification (blocking)

**Not performed.** This is momentum physics — desktop touch emulation does not reproduce iOS/Android fling behavior, so it cannot be verified headlessly or by static analysis. The code is committed and syntactically valid, but the behavioral claim above is unproven on hardware.

Run this checklist. Serve locally first:

```
python3 -m http.server 8000     # from the repo root
ipconfig getifaddr en0          # your laptop's LAN IP
```

Then open `http://<that-ip>:8000/narsh2026/` on your phone, log in, and go to Our Story.

On the phone:

1. Serve the site and open Our Story on a real phone (step above).
2. Flick up as hard as you can. Expect: exactly ONE stop advance (map flies to the next city, one timeline dot moves). It must not skip two or three.
3. Five hard flicks in a row, pausing briefly between each. Expect: five stops, in order.
4. Flick down. Expect: back exactly one stop.
5. Go to a stop with a long multi-paragraph blurb (Seattle or the convergence stop). Drag slowly on the TEXT. Expect: the text scrolls inside the card, the story stop does NOT change.
6. Keep dragging past the end of that text, then lift and drag again. Expect: the first drag stops at the end of the text without jumping stops; the second drag advances one stop.
7. Swipe left/right on the photo. Expect: carousel changes photo, story stop does NOT change.
8. Diagonal drag (mostly sideways, slightly up). Expect: no stop change.
9. Pinch-zoom the page. Expect: zoom works, no stop change.
10. Open the hamburger menu and drag over it. Expect: no stop change; menu links still work.
11. Tap a timeline dot, then the prev/next arrows. Expect: each moves exactly one stop / to the tapped stop, still reliable after the URL bar hides.
12. Reload at the top. Expect: "Scroll to follow our journey" still fades away on the first swipe.

On the laptop (trackpad):

13. Two-finger flick down hard on the map background. Expect: exactly one stop.
14. Repeated deliberate scrolls. Expect: one stop each.
15. Hover the story card with a long blurb and scroll. Expect: the card's text scrolls to its end and stops there; a fresh scroll gesture after that advances one stop.
16. Arrow keys / page navigation and the dots still work.
17. Turn on Reduce Motion (System Settings > Accessibility > Display) and repeat step 13. Expect: still exactly one stop, with an instant jump instead of a smooth scroll.

Report "approved", or which step misbehaved on which device and browser.

## Decisions Made

None beyond the plan — implemented as specified, including the constant values, the mode state machine, and the decision to keep the position-based mapping as the untouched fallback.

## Deviations from Plan

None — plan executed exactly as written for Tasks 1 and 2. Task 3 is a blocking human-verify checkpoint that the executor cannot perform; it is recorded above rather than skipped or claimed.

## Issues Encountered

- Another agent was concurrently editing `narsh2026/our-people/` and `.planning/` during this run. Scope was honored: only the three Our Story files were staged, individually, in each commit. The plan's Task 3 automated pre-gate (`git status --short | wc -l <= 4`) is not meaningful under that concurrency and was not used as a pass/fail signal; `node --check` was run and passes.
- Untracked `narsh2026/images/story/.DS_Store` exists in the working tree. Out of scope for this task (fixing it means touching `.gitignore`, a shared file). Deferred — worth a one-line `.gitignore` entry in a future cleanup.

## Known Stubs

None.

## Threat Flags

None. No network, storage, or auth surface is touched; the change is DOM event handling only. The plan's `T-260808-01` mitigation (bounding a momentum burst to one `scrollToStop()` call) is implemented via `wheelLocked` + `WHEEL_IDLE_MS`.

## Next Readiness

Code is committed on master and ready to push. Do not consider this task closed until the 17-step device pass above is run — the fix targets behavior that only appears on real touch hardware.

## Self-Check: PASSED

All three modified files exist; both task commits (`8cd4000`, `1cbac56`) are present in git history.

---
*Quick task: 260808-odc*
*Tasks 1-2 completed: 2026-08-08 — Task 3 outstanding*
