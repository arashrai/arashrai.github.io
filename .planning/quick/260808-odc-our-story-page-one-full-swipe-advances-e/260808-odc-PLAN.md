---
phase: 260808-odc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - narsh2026/our-story/scroll-controller.js
  - narsh2026/our-story/our-story.css
  - narsh2026/our-story/index.html
autonomous: false
requirements: [QUICK-260808-odc]

must_haves:
  truths:
    - "One full finger swipe on the Our Story page advances exactly one story stop, no matter how hard the flick"
    - "One trackpad/wheel gesture advances exactly one story stop, momentum tail swallowed"
    - "A long narrative blurb still scrolls natively inside the story card on mobile; the story only steps once that inner text is at its scroll boundary"
    - "A horizontal swipe still drives the photo carousel and does not change story stop"
    - "Timeline dots, prev/next arrows, keyboard arrows, the scroll-prompt fade, and the nav-peek header all still work"
    - "Returning guests get the new JS/CSS, not the cached files"
  artifacts:
    - path: "narsh2026/our-story/scroll-controller.js"
      provides: "Gesture layer: touchstart/touchmove/touchend/touchcancel + wheel, one step per gesture"
      contains: "passive: false"
    - path: "narsh2026/our-story/our-story.css"
      provides: "overscroll-behavior containment on the inner scrollable story text/panel"
      contains: "overscroll-behavior"
    - path: "narsh2026/our-story/index.html"
      provides: "Bumped cache-bust query strings for scroll-controller.js and our-story.css"
      contains: "scroll-controller.js?v=202608081900"
  key_links:
    - from: "narsh2026/our-story/scroll-controller.js gesture handlers"
      to: "scrollToStop()"
      via: "stepBy() calling the existing scrollToStop, which owns targetIndex"
      pattern: "stepBy"
    - from: "narsh2026/our-story/scroll-controller.js touchmove/wheel"
      to: "findScrollableAncestor()"
      via: "inner-scroller room check before taking over the gesture"
      pattern: "findScrollableAncestor"
---

<objective>
On `/narsh2026/our-story/`, make one full gesture advance exactly one story stop.

Today `handleScroll()` derives the active stop from raw `window.scrollY` (`Math.round(scrollY / perStop)`, scroll-controller.js:83). A momentum flick on a phone carries the scroll several viewport heights, so guests blow past two or three life moments in one swipe. The tall `#scroll-container` and the `scrollY -> index` mapping stay exactly as they are (they are what makes `scrollToStop()`, the dots, the arrows, and the keyboard work); we add a gesture layer *in front* of them that converts one touch drag or one wheel gesture into exactly one `scrollToStop(currentIndex +/- 1)` call and suppresses the momentum that follows.

Purpose: guests read the story one moment at a time instead of skipping to the middle of it.
Output: a gesture layer inside `NARSH_SCROLL`, overscroll containment on the inner story text, and bumped cache-bust versions.
</objective>

<execution_context>
@/Users/nataliefleury/programming/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nataliefleury/programming/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@narsh2026/our-story/scroll-controller.js
@narsh2026/our-story/our-story.css
@narsh2026/our-story/index.html
@narsh2026/our-story/carousel.js
@narsh2026/our-story/nav-peek.js

<house_rules>
- No build step, no bundler, no modules, no new dependency. Plain script tag, GitHub Pages static site.
- 2-space indent, double quotes, semicolons, `El` suffix for DOM element refs.
- CLAUDE.md says "const throughout". scroll-controller.js already uses module-scoped `let` for mutable state (`perStop`, `targetIndex`, `currentStopIndex`). Follow the file: `let` only for mutable module state, `const` for everything else.
- Every new block of logic gets a comment explaining *why*, matching the existing narrative comment style in this file (see the `targetIndex` comment at lines 11-18).
</house_rules>

<interfaces>
<!-- Existing contract inside scroll-controller.js the new code builds on. No exploration needed. -->

Module-private (already present):
- `let perStop` — current viewport height, resynced by `syncHeight()`
- `let currentStopIndex` — active stop, -1 before init settles
- `let targetIndex` — destination while a programmatic nav is in flight, -1 when free-scrolling
- `clampIndex(i)` — clamps to `[0, stopCount - 1]`
- `handleScroll()` — early-returns while `targetIndex >= 0`; otherwise `setStop(clampIndex(Math.round(scrollY / perStop)))`
- `reducedMotion` — set in `init()` from `prefers-reduced-motion`

Public (already present, keep the same shape):
- `NARSH_SCROLL.init(stops, onStopChange)`
- `NARSH_SCROLL.scrollToStop(index)` — sets `targetIndex`, calls `setStop(index)` immediately for instant feedback, `window.scrollTo({ behavior: reducedMotion ? "auto" : "smooth" })`, releases the lock after 1200ms
- `NARSH_SCROLL.getCurrentIndex()`

Consumers that must keep working unchanged:
- index.html:117-119 — `NARSH_TIMELINE.init(STOPS, (index) => NARSH_SCROLL.scrollToStop(index))` (dots + prev/next arrows)
- index.html:197-207 — keydown Arrow handlers calling `NARSH_SCROLL.scrollToStop()`
- index.html:150-153 — `scrollState.firstScroll` fades `#scroll-prompt` inside `onStopChange`
- nav-peek.js:51 — `window.addEventListener("scroll", update, { passive: true })`

The only other touch listeners on the page are carousel.js:48-72 on `.carousel-track` (all `{ passive: true }`, horizontal-only). Mapbox is initialized fully non-interactive (map.js:60-67: `interactive: false, dragPan: false, scrollZoom: false, touchZoomRotate: false`), so the map never competes for a gesture.
</interfaces>

<hazards>
These are the ways this change breaks the page. Handle each one explicitly.

1. **The story text is itself scrollable.** On mobile `.story-panel .stop-narrative` is `overflow-y: auto; -webkit-overflow-scrolling: touch` (our-story.css:472-477). On desktop `.story-panel` is `overflow-y: auto; max-height: 82vh` (our-story.css:481-492). Several stops are multi-paragraph. Blanket `preventDefault()` makes long blurbs unreadable — the page would break for exactly the content it exists to show. The handler must let the browser scroll an inner panel that still has room in the gesture's direction, and only take over once that panel is at its boundary.

2. **`preventDefault()` needs a non-passive listener.** Every existing listener in this codebase is `{ passive: true }`. `touchmove` and `wheel` here MUST be registered `{ passive: false }` or the `preventDefault()` is a silent no-op and nothing changes. Register non-passive and call `preventDefault()` *conditionally*.

3. **Chrome/Safari stop honoring `preventDefault()` mid-gesture.** Once a touchmove has been let through and native scrolling starts, later touchmove events arrive with `cancelable === false`. Decide the gesture's mode on the *first* touchmove past the axis threshold, lock it for the rest of that gesture, and guard every `preventDefault()` with `if (event.cancelable)`.

4. **Diagonal drags.** A drag that is mostly horizontal belongs to the photo carousel. Compare `|dx|` vs `|dy|` before doing anything.

5. **Scroll chaining.** When an inner panel hits its end mid-gesture and we did *not* preventDefault, the browser chains the remaining scroll to the document — raw `scrollY` jumps and the original skipping bug reappears. `overscroll-behavior: contain` on the inner scrollers stops that (task 2).

6. **Do NOT reach for `touch-action: none` on body/main.** It would kill inner text scrolling outright. Conditional `preventDefault()` is the only approach that satisfies hazard 1.

7. **Cached files.** index.html cache-busts with `?v=YYYYMMDDHHMM`. Unbumped, returning guests keep the old scroll-controller.js and see no fix.
</hazards>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add a one-step-per-gesture layer to NARSH_SCROLL</name>
  <files>narsh2026/our-story/scroll-controller.js</files>
  <action>
Add gesture interception inside the existing `NARSH_SCROLL` IIFE. Do not change `handleScroll`, `handleResize`, `syncHeight`, `setStop`, `scrollToStop`, `clampIndex`, or the public return object — the raw `scrollY -> index` mapping stays as the fallback for anything we do not intercept (desktop scrollbar drag, Page Down, anchor jumps).

Constants (module scope, `const`):
- `AXIS_LOCK_PX = 8` — movement needed before we judge horizontal vs vertical intent.
- `SWIPE_STEP_PX = 40` — minimum vertical travel for a touch drag to count as a step.
- `WHEEL_STEP_PX = 40` — accumulated normalized wheel delta for one step.
- `WHEEL_IDLE_MS = 220` — quiet period with no wheel events before a new wheel gesture is allowed.

Mutable module state (`let`): `gestureMode` (null | "pending" | "step" | "native" | "ignore"), `touchStartX`, `touchStartY`, `touchDeltaY`, `gestureScrollerEl`, `wheelAccum`, `wheelLocked`, `wheelIdleTimer`.

Helper `findScrollableAncestor(node)`: walk up from the event target. For each element node (`nodeType === 1`), read `getComputedStyle(el).overflowY`; return it if that is `"auto"` or `"scroll"` AND `el.scrollHeight - el.clientHeight > 1`. Stop and return `null` at `document.body` / `document.documentElement` — the document itself is the tall `#scroll-container` track we are deliberately taking over, not an "inner" scroller. This is what finds `.stop-narrative` on mobile and `.story-panel` on desktop without hardcoding either selector.

Helper `canScrollFurther(el, direction)`: `false` when `el` is null. For `"down"` return `el.scrollTop < el.scrollHeight - el.clientHeight - 1`; for `"up"` return `el.scrollTop > 1`. The 1px tolerance matters — fractional heights from device pixel ratio and text zoom mean these never land on exact integers.

Helper `shouldIgnoreGesture(event)`: return true when `document.body.classList.contains("nav-open")` (the mobile menu is open — nav.js:15) or when the target sits inside `.site-header` (`event.target.closest && event.target.closest(".site-header")`). Guard the `closest` call, the target may not be an Element.

Helper `stepBy(delta)`: return early if `currentStopIndex < 0`; otherwise `scrollToStop(clampIndex(currentStopIndex + delta))`. Going through `scrollToStop` is the point — it owns `targetIndex`, so the existing URL-bar-resize lock, the instant `setStop` feedback, `reducedMotion` behavior, and the 1200ms safety release all apply unchanged. At the first or last stop this re-snaps to the current stop, which is the correct "nothing beyond here" feel.

Touch handlers, all registered on `window` in `init()`:
- `touchstart` `{ passive: true }`: reset `touchDeltaY` to 0. If `event.touches.length > 1` or `shouldIgnoreGesture(event)`, set `gestureMode = "ignore"` and return (never fight a pinch). Otherwise record `touchStartX` / `touchStartY` from `event.touches[0]`, set `gestureScrollerEl = findScrollableAncestor(event.target)`, set `gestureMode = "pending"`.
- `touchmove` `{ passive: false }` — this is the listener that MUST be non-passive. Return immediately when `gestureMode` is `"ignore"` or `"native"`. Compute `dx` / `dy` against the start point and store `dy` in `touchDeltaY`. While `gestureMode === "pending"`: do nothing until `max(|dx|, |dy|) >= AXIS_LOCK_PX`; then decide once and lock — if `|dx| > |dy|` set `"ignore"` (horizontal, the carousel's gesture, and it stays the carousel's for the whole drag); else derive `direction` as `dy < 0 ? "down" : "up"` (finger moving up scrolls the page down) and set `"native"` when `canScrollFurther(gestureScrollerEl, direction)` is true, otherwise `"step"`. Once `gestureMode === "step"`, call `event.preventDefault()` on every touchmove, guarded by `if (event.cancelable)`. Comment why the mode is locked for the whole gesture: re-deciding mid-drag would let a text panel that just hit its end chain into a story step in the same swipe, which reads as a double action.
- `touchend` `{ passive: true }`: if `gestureMode === "step"` and `Math.abs(touchDeltaY) >= SWIPE_STEP_PX`, call `stepBy(touchDeltaY < 0 ? 1 : -1)`. Note that distance beyond the threshold is deliberately ignored — that is the whole fix. Then reset `gestureMode = null`, `gestureScrollerEl = null`, `touchDeltaY = 0`.
- `touchcancel` `{ passive: true }`: same reset, no step.

Wheel handler on `window`, `{ passive: false }`:
- Return when `event.ctrlKey` (trackpad pinch-zoom) or `shouldIgnoreGesture(event)`.
- `direction` = `event.deltaY > 0 ? "down" : "up"`. If `canScrollFurther(findScrollableAncestor(event.target), direction)`, return without preventing — the story card scrolls natively.
- Otherwise `if (event.cancelable) event.preventDefault();`.
- Normalize the delta by `deltaMode`: 0 is pixels, 1 is lines (multiply by 16), 2 is pages (multiply by `window.innerHeight`).
- Always restart the idle timer: `clearTimeout(wheelIdleTimer)` then `setTimeout` for `WHEEL_IDLE_MS` that clears `wheelLocked` and zeroes `wheelAccum`. Restarting on *every* event, including swallowed ones, is what makes a momentum tail count as one gesture — the lock does not lift until the trackpad genuinely goes quiet.
- If `wheelLocked`, return here (momentum swallowed).
- Zero `wheelAccum` when the new delta's sign differs from the accumulated sign (direction reversal starts a fresh gesture), then add the normalized delta. When `Math.abs(wheelAccum) >= WHEEL_STEP_PX`, call `stepBy(wheelAccum > 0 ? 1 : -1)`, set `wheelLocked = true`, and zero `wheelAccum`.

Register all five listeners next to the existing `scroll` / `resize` registrations in `init()`, after the `scrollContainerEl` null guard. Leave the existing `scroll` and `resize` listeners `{ passive: true }` exactly as they are.
  </action>
  <verify>
    <automated>cd /Users/nataliefleury/programming/arashrai.github.io && node --check narsh2026/our-story/scroll-controller.js && grep -v '^\s*//' narsh2026/our-story/scroll-controller.js > /tmp/sc-nocomment.js && test "$(grep -c 'passive: false' /tmp/sc-nocomment.js)" -ge 2 && test "$(grep -c 'findScrollableAncestor' /tmp/sc-nocomment.js)" -ge 3 && test "$(grep -c 'stepBy' /tmp/sc-nocomment.js)" -ge 3 && test "$(grep -c 'event.cancelable' /tmp/sc-nocomment.js)" -ge 2 && test "$(grep -c 'touchcancel' /tmp/sc-nocomment.js)" -ge 1 && test "$(grep -c 'return { init, scrollToStop, getCurrentIndex }' /tmp/sc-nocomment.js)" -eq 1 && test "$(grep -c 'Math.round(scrollY / perStop)' /tmp/sc-nocomment.js)" -eq 1 && echo GATES_PASS</automated>
  </verify>
  <done>`node --check` passes; touchmove and wheel are registered `{ passive: false }`; the inner-scroller check gates both touch and wheel; every `preventDefault()` is guarded by `event.cancelable`; the public API and the existing `Math.round(scrollY / perStop)` fallback are untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Contain inner overscroll and bump both cache-bust versions</name>
  <files>narsh2026/our-story/our-story.css, narsh2026/our-story/index.html</files>
  <action>
In `narsh2026/our-story/our-story.css`, add `overscroll-behavior: contain;` to two rules:
1. `.story-panel .stop-narrative` inside the `@media (max-width: 767px)` block (currently at lines 472-477, next to `-webkit-overflow-scrolling: touch`).
2. `.story-panel` inside the `@media (min-width: 768px)` block (currently at lines 482-492, next to `overflow-y: auto`).

Add one comment above the mobile one explaining why: when the narrative reaches its end mid-swipe the browser would otherwise chain the leftover scroll to the document, jumping raw `scrollY` past several stops — the exact skipping this change removes. `contain` stops the chain at the panel.

In `narsh2026/our-story/index.html`, bump the two cache-bust query strings for the files this change touches, to `?v=202608081900`:
- line 13: `our-story.css?v=202608052300` becomes `our-story.css?v=202608081900`
- line 63: `scroll-controller.js?v=202608052200` becomes `scroll-controller.js?v=202608081900`

Leave every other `?v=` string alone (story-data.js, map.js, carousel.js, timeline.js are unchanged). Without this bump, returning guests keep the cached old files and see no fix at all.
  </action>
  <verify>
    <automated>cd /Users/nataliefleury/programming/arashrai.github.io && test "$(grep -c 'overscroll-behavior: contain' narsh2026/our-story/our-story.css)" -eq 2 && test "$(grep -c 'scroll-controller.js?v=202608081900' narsh2026/our-story/index.html)" -eq 1 && test "$(grep -c 'our-story.css?v=202608081900' narsh2026/our-story/index.html)" -eq 1 && test "$(grep -c 'map.js?v=202608052300' narsh2026/our-story/index.html)" -eq 1 && echo GATES_PASS</automated>
  </verify>
  <done>Both scrollable story containers declare `overscroll-behavior: contain`; index.html loads `scroll-controller.js?v=202608081900` and `our-story.css?v=202608081900`; the other four `?v=` strings are unchanged.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify one-swipe-one-stop on a real phone and a trackpad</name>
  <files>none (verification only)</files>
  <action>Run the manual pass below on a real touch device and on a laptop trackpad. This behavior cannot be proven by static checks: the bug is momentum physics, which desktop touch emulation does not reproduce. Report any step that misbehaves with the device and browser.</action>
  <what-built>
Gesture interception in `NARSH_SCROLL`: a touch drag or wheel gesture now snaps to exactly one stop via the existing `scrollToStop()`, ignoring momentum distance. Inner story text still scrolls natively until it hits its boundary, horizontal swipes still belong to the photo carousel, and both cache-bust versions are bumped.
  </what-built>
  <how-to-verify>
Serve the site locally and open it on a real phone (a desktop emulator's touch simulation does not reproduce iOS/Android momentum, which is the whole bug):

1. From the repo root run `python3 -m http.server 8000`, find your laptop's LAN IP (`ipconfig getifaddr en0`), and open `http://<that-ip>:8000/narsh2026/` on your phone. Log in, then go to Our Story.

On the phone:
2. Flick up as hard as you can. Expect: the story advances exactly ONE stop (map flies to the next city, one timeline dot moves). It must not skip two or three.
3. Do five hard flicks in a row, pausing briefly between each. Expect: five stops, in order.
4. Flick down. Expect: back exactly one stop.
5. Go to a stop with a long multi-paragraph blurb (Seattle or the convergence stop). Drag slowly on the TEXT. Expect: the text scrolls inside the card, the story stop does NOT change.
6. Keep dragging past the end of that text, then lift and drag again. Expect: the first drag stops at the end of the text without jumping stops; the second drag advances one stop.
7. Swipe left/right on the photo. Expect: the carousel changes photo and the story stop does NOT change.
8. Try a diagonal drag (mostly sideways, slightly up). Expect: no stop change.
9. Pinch-zoom the page. Expect: zoom works, no stop change.
10. Open the hamburger menu and drag over it. Expect: no stop change; the menu links still work.
11. Tap a timeline dot, then the prev/next arrows. Expect: each moves exactly one stop / to the tapped stop, still reliable after the URL bar hides.
12. Reload at the top. Expect: "Scroll to follow our journey" still fades away on the first swipe.

On the laptop (trackpad):
13. Two-finger flick down hard on the map background. Expect: exactly one stop.
14. Repeated deliberate scrolls. Expect: one stop each.
15. Hover the story card with a long blurb and scroll. Expect: the card's text scrolls to its end and stops there; a fresh scroll gesture after that advances one stop.
16. Arrow keys / Page navigation and the dots still work.
17. Turn on Reduce Motion (System Settings > Accessibility > Display) and repeat step 13. Expect: still exactly one stop, with an instant jump instead of a smooth scroll.
  </how-to-verify>
  <resume-signal>Type "approved", or describe which step misbehaved and on what device/browser.</resume-signal>
  <verify>
    <automated>node --check narsh2026/our-story/scroll-controller.js && test "$(git status --short | wc -l | tr -d ' ')" -le 4 && echo READY_FOR_MANUAL</automated>
  </verify>
  <done>All 17 verification steps pass on a real phone and a trackpad, and the developer types "approved".</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user gesture -> window listeners | Untrusted-timing DOM events (touch, wheel) reach page JS. No network, storage, or auth surface is touched by this change. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260808-01 | Denial of Service | wheel handler on window | mitigate | `wheelLocked` plus the `WHEEL_IDLE_MS` timer bound a momentum burst to one `scrollToStop()` call, so a high-frequency wheel stream cannot spam smooth-scroll animations or Mapbox `flyTo` calls. |
| T-260808-02 | Denial of Service | non-passive touchmove/wheel listeners | accept | Non-passive listeners add main-thread work per event, but the handlers are arithmetic plus one `getComputedStyle` ancestor walk (max ~5 nodes, shallow DOM). Acceptable for a static page with no other main-thread contention. |
| T-260808-03 | Tampering | DOM event target used for ancestor walk | accept | `event.target` only selects which element scrolls natively; it never feeds a sink. Worst case is a gesture routed to the wrong scroller. No data crosses a boundary. |
</threat_model>

<verification>
- `node --check narsh2026/our-story/scroll-controller.js` passes.
- Task 1 and Task 2 automated gates both print `GATES_PASS`.
- No new files, no new script tags, no dependencies, no build step introduced: `git status --short` shows exactly the three modified files.
- Human verification checkpoint approved on a real phone and a trackpad.
</verification>

<success_criteria>
- One hard flick on a phone advances exactly one stop; five flicks advance five stops.
- One trackpad gesture advances exactly one stop; the momentum tail is swallowed.
- A long narrative still scrolls to its end inside the card without changing stop, and does not chain into a stop change in the same gesture.
- Horizontal swipes still drive the photo carousel; diagonal drags do not step.
- Timeline dots, prev/next arrows, keyboard arrows, the scroll-prompt fade, nav-peek, and the `targetIndex` URL-bar lock all behave as before.
- `prefers-reduced-motion` still yields an instant jump rather than a smooth scroll.
- Returning guests load the new files (both `?v=` strings bumped).
</success_criteria>

<output>
After completion, create `.planning/quick/260808-odc-our-story-page-one-full-swipe-advances-e/260808-odc-SUMMARY.md`
</output>
