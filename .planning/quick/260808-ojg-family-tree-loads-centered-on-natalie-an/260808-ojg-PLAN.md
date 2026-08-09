---
phase: quick-260808-ojg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - narsh2026/our-people/graph.js
  - narsh2026/our-people/index.html
autonomous: false
requirements: [QUICK-OJG-01]

must_haves:
  truths:
    - "Opening the Family Tree view frames Natalie + Arash in the viewport, not the geometric center of the forest"
    - "Both members of the couple are fully visible with their marriage connector, on desktop and on a 375px-wide phone"
    - "At least one generation above the couple is visible so the framing reads as a family tree, not a portrait"
    - "Switching the family filter to Natalie's Family or Arash's Family frames that person"
    - "The user can still pan and zoom freely after the initial framing"
    - "Switching back to the Everyone view still restores the pan/zoom position it had before"
    - "Returning guests get the new graph.js instead of a cached copy"
  artifacts:
    - path: "narsh2026/our-people/graph.js"
      provides: "frameOnCouple() camera helper + call at end of renderFamilyTree + switchView restore guard"
      contains: "frameOnCouple"
    - path: "narsh2026/our-people/index.html"
      provides: "Refreshed ?v= cache-bust stamp on the four our-people assets"
  key_links:
    - from: "renderFamilyTree (graph.js)"
      to: "frameOnCouple"
      via: "final statement of the synchronous layout, after treeNodeData is populated"
      pattern: "frameOnCouple\\(\\)"
    - from: "frameOnCouple"
      to: "d3 zoom behavior"
      via: "svgEl.call(zoomBehavior.transform, transform)"
      pattern: "zoomBehavior\\.transform"
    - from: "switchView (graph.js)"
      to: "tree framing"
      via: "transform restore is skipped when entering tree view so it does not clobber frameOnCouple"
      pattern: "view === \"social\" && currentTransform"
---

<objective>
When the Family Tree view of the Our People page is shown, frame the camera on the
Natalie + Arash couple instead of on the horizontal center of the whole forest.

Purpose: `renderFamilyTree` centers the combined forest with
`centerShift = (width - totalWidth) / 2` (graph.js:1141). Natalie's forest is much
wider than Arash's, so the viewport center lands deep inside Natalie's extended
family and the couple is pushed off-screen to the right. Vertically the layout
starts at `topY = 90` and grows downward with no vertical framing at all, so the
couple's generation sits below the visible area too.

Output: A `frameOnCouple()` camera helper in graph.js, wired as the last step of
`renderFamilyTree`, plus a `switchView` guard so the stored transform restore does
not immediately undo it, plus a refreshed cache-bust stamp.
</objective>

<execution_context>
@/Users/nataliefleury/programming/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@narsh2026/our-people/graph.js
@narsh2026/our-people/index.html
</context>

<design_decisions>
These were resolved during planning. Do not relitigate them during execution.

**1. Pick a zoom level, do not just re-center.**
Re-centering alone is not enough on a phone. The couple pair spans roughly
`TREE_SIDE_GAP` (180) plus each side's `TREE_MEMBER_OFFSET` inner placement, so
around 250-320px, and each node has `NODE_RADIUS_TREE_COUPLE = 32`. On a 375px
viewport at scale 1.0 the pair is clipped. So compute a fit-to-couple scale, but
cap it at 1.0 — never zoom IN past the current default, or the result reads as
"zoomed into a face" instead of "the family tree, centered on us". Guest-facing
legibility is the goal; showing the whole tree is not.

**2. Re-frame every time the tree view is rendered, not only on page load.**
There is no URL/hash/localStorage state anywhere in graph.js or graph-ui.js
(verified — zero matches for `location`, `hash`, `searchParams`, `localStorage`).
The page always boots into the Everyone view (`renderSocialGraph()` at graph.js:178,
and the `Everyone` toggle button carries `aria-checked="true"` in index.html). The
ONLY way a guest reaches the Family Tree is by clicking the toggle, which routes
through `switchView("tree", filter)`. That call path is therefore the one the user
is actually complaining about, and it is what must be fixed.

**3. Hook point: the end of `renderFamilyTree`, synchronously.**
The tree layout is fully static — `renderFamilyTree` explicitly stops the force
simulation (graph.js:1108-1110) and computes every `px`/`py` synchronously, so
positions are final by the time the function returns. There is no settling to wait
for. In the non-reduced-motion path `renderFamilyTree` is itself invoked inside the
crossfade's `.on("end")` callback (graph.js:1079-1094), so a call at the end of
`renderFamilyTree` naturally lands after the fade-out and after the content swap.
Both call sites (`switchView` and `filterFamilyTree`) get the fix for free.

**4. Vertical placement: slightly below center.**
The couple sits at or near the deepest generation, with ancestors above them.
Centering them exactly wastes the bottom half of the canvas on empty space. Placing
them at ~58% of canvas height puts more of the tree on screen while keeping them
clear of the bottom edge.

**5. Small-viewport overlays are not a problem, and this keeps it that way.**
`.graph-canvas` is a normal in-flow SVG (`our-people.css:139-146`); the header,
search, view toggle, and filter bar all sit ABOVE it in flow and never overlap it.
The only fixed overlay is `.pinch-hint` (`position: fixed; bottom: var(--space-lg)`,
our-people.css:189-193), which auto-hides after 3s. At 58% of a 400px min-height
canvas the couple sits ~168px above the bottom edge, well clear of it.

**6. Apply the transform instantly, not with a d3 transition.**
It is being applied mid-crossfade; an animated zoom on top of a fade looks broken.
Instant application is also automatically correct for `prefers-reduced-motion`
without a second code path.
</design_decisions>

<tasks>

<task type="auto">
  <name>Task 1: Frame the family tree camera on the couple</name>
  <files>narsh2026/our-people/graph.js</files>
  <action>
Three edits, all inside `narsh2026/our-people/graph.js`. Follow project conventions:
2-space indent, double quotes, semicolons, `const` (no `let`/`var`) for new bindings.

**Edit A — new constants.** Add these next to the existing `TREE_*` constants
(currently graph.js:37-41), with a one-line comment explaining the block frames the
tree camera on the couple:
- `TREE_FOCUS_SCALE_MAX` = 1 — hard cap; never zoom in past the default scale.
- `TREE_FOCUS_PAD_X` = 60 — horizontal breathing room either side of the pair.
- `TREE_FOCUS_PAD_TOP` = `TREE_V_SPACING * 1.2` — vertical room above the couple so
  their parents' generation stays in frame.
- `TREE_FOCUS_PAD_BOTTOM` = 80 — room below for the node name label.
- `TREE_FOCUS_Y_FRAC` = 0.58 — where in the canvas the couple's midpoint lands
  vertically. Comment that this is deliberately below center because the tree grows
  upward from the couple, and that it is the single knob to tweak if the framing
  feels off.

**Edit B — new `frameOnCouple` helper.** Define it as a module-level arrow const,
placed immediately BEFORE `renderFamilyTree` (which begins at graph.js:1106). It
takes no arguments and reads module state. Behavior:
1. Bail early and change nothing if `svgEl`, `zoomBehavior`, or a non-empty
   `treeNodeData` is missing.
2. Look up the entries with id `"natalie"` and `"arash"` in `treeNodeData`. Those
   literal ids are already the established convention in this file — see the couple
   connector at graph.js:1241-1242. Collect whichever are present into a focus list.
   If the list is empty, return without touching the transform (preserves today's
   behavior for any data state where neither is rendered).
3. Focus point = the arithmetic mean of the focus entries' `px` and of their `py`.
   With both present this is the midpoint of the marriage connector, so neither
   person is clipped in favour of the other. With one present (family filter set to
   just one side) it is simply that person.
4. Compute `spanX` = max `px` minus min `px` across the focus list (0 when there is
   only one), and `maxRadius` = the largest `radius` in the list.
5. `requiredWidth` = `spanX + maxRadius * 2 + TREE_FOCUS_PAD_X * 2`.
   `requiredHeight` = `TREE_FOCUS_PAD_TOP + maxRadius * 2 + TREE_FOCUS_PAD_BOTTOM`.
6. `scale` = the minimum of `width / requiredWidth`, `height / requiredHeight`, and
   `TREE_FOCUS_SCALE_MAX`; then clamp into `[0.3, 3]` to stay inside the zoom
   behavior's existing `scaleExtent` (graph.js:163) so d3 does not fight the value.
   If the result is not a finite number greater than 0 (degenerate canvas size),
   fall back to 1.
7. Build the transform with the same composition already used by `zoomToNode`
   (graph.js:537-540): `d3.zoomIdentity` translated by `width / 2` and
   `height * TREE_FOCUS_Y_FRAC`, then scaled, then translated by the negated focus
   point.
8. Apply it with `svgEl.call(zoomBehavior.transform, transform)` — no `.transition()`.
   Going through `zoomBehavior.transform` (rather than setting
   `innerGroupEl.attr("transform", ...)` directly) is required so d3's internal zoom
   state stays in sync and subsequent user pan/pinch continues from the new framing.

**Edit C — call it, and stop `switchView` from clobbering it.**
- Add `frameOnCouple();` as the final statement of `renderFamilyTree`, after the
  `graph-desc` textContent update (currently graph.js:1319-1322).
- In `switchView`, the stored-transform restore currently runs unconditionally in
  both branches: graph.js:1071 (`reducedMotion` path) and graph.js:1088 (crossfade
  path). Change BOTH conditions from `if (currentTransform && zoomBehavior)` to
  `if (view === "social" && currentTransform && zoomBehavior)` and add a short
  comment that tree view is exempt because `renderFamilyTree` has just framed the
  camera on the couple and restoring the social transform would immediately undo it.
  Returning to the Everyone view still restores its position exactly as today.

Do NOT change `zoomToNode`, `filterByGroup`, `renderSocialGraph`, `layoutSide`, the
`centerShift` math, or anything outside these three edits. Do NOT add a resize
handler (none exists today; out of scope). Do NOT touch `guest-data.js`,
`guests.csv`, `build-guests.js`, or anything under `narsh2026/our-story/` — another
agent is concurrently editing our-story.

Note for free: `filterFamilyTree` (graph.js:1836-1847) re-renders through
`renderFamilyTree`, so switching to "Natalie's Family" or "Arash's Family" will
frame that single person via step 3's one-entry path. That is intended — do not add
special-case code for it.
  </action>
  <verify>
    <automated>node --check narsh2026/our-people/graph.js && /usr/bin/grep -c "frameOnCouple" narsh2026/our-people/graph.js | /usr/bin/grep -qE "^[2-9]$" && [ "$(/usr/bin/grep -c 'view === "social" \&\& currentTransform' narsh2026/our-people/graph.js)" = "2" ] && /usr/bin/grep -q "zoomBehavior.transform, transform" narsh2026/our-people/graph.js && echo OK</automated>
  </verify>
  <done>`node --check` passes; `frameOnCouple` is defined and called; both `switchView` restore sites are guarded to `view === "social"`; the transform is applied through `zoomBehavior.transform`.</done>
</task>

<task type="auto">
  <name>Task 2: Bump the cache-bust stamp and run repo-hygiene checks</name>
  <files>narsh2026/our-people/index.html</files>
  <action>
`graph.js` changed, so returning guests will replay a stale cached copy unless the
`?v=` query string is refreshed. Normally `build-guests.js` stamps this
automatically (build-guests.js:657-668), but **do NOT run `node build-guests.js`
here**: `narsh2026/our-people/guests.csv` currently has 2 uncommitted line edits
that have not been built into `guest-data.js`, and running the build would sweep
those unrelated data changes into this commit. Hand-stamp instead.

In `narsh2026/our-people/index.html`, replace every occurrence of the current stamp
`?v=202608081739` with `?v=<NEW>`, where `<NEW>` is the current local time in the
exact `YYYYMMDDHHMM` zero-padded format that build-guests.js:661 produces. There are
four occurrences: our-people.css (line 12), guest-data.js (line 59), graph.js
(line 60), graph-ui.js (line 61). All four must carry the SAME new value, matching
what the build script would have written, so a later real build is a clean no-op on
this line pattern.

Then run the hygiene checks in `<verify>`. The `git status` assertion exists because
another agent is concurrently editing `narsh2026/our-story/` — this task must leave
those files, and the pre-existing `guests.csv` modification, completely untouched.
  </action>
  <verify>
    <automated>NEW=$(/usr/bin/grep -oE 'graph\.js\?v=[0-9]+' narsh2026/our-people/index.html | /usr/bin/grep -oE '[0-9]+$'); test -n "$NEW" && [ "$NEW" != "202608081739" ] && echo "$NEW" | /usr/bin/grep -qE '^[0-9]{12}$' && [ "$(/usr/bin/grep -c "?v=$NEW" narsh2026/our-people/index.html)" = "4" ] && [ "$(/usr/bin/grep -c '202608081739' narsh2026/our-people/index.html)" = "0" ] && [ -z "$(git status --porcelain narsh2026/our-story/ narsh2026/our-people/guest-data.js narsh2026/our-people/build-guests.js | /usr/bin/grep -v 'our-story/index.html\|our-story/our-story.css')" ] && echo OK</automated>
  </verify>
  <done>All four our-people asset URLs in index.html carry an identical fresh 12-digit `?v=` stamp; the old stamp is gone; `guest-data.js`, `build-guests.js`, and the our-story working tree are unmodified beyond the two files the other agent already had in flight.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Browser check the family tree framing</name>
  <what-built>
`frameOnCouple()` in graph.js now sets the d3 zoom transform so the Natalie + Arash
midpoint lands at the horizontal center and ~58% of the canvas height whenever the
Family Tree view renders, at a fit-to-pair scale capped at 1.0. `switchView` no
longer restores the Everyone-view transform when entering the tree. The `?v=` stamp
in index.html was refreshed so this actually reaches a browser.

No test runner exists in this repo, so the automated gates above only prove the file
parses and the wiring strings are present. The visual result cannot be self-certified
by an agent — it needs your eyes.
  </what-built>
  <how-to-verify>
Serve the site locally (e.g. `python3 -m http.server 8000` from the repo root) and
open `http://localhost:8000/narsh2026/our-people/`. Hard-refresh (Cmd+Shift+R).

1. Desktop, default state: click **Family Tree**. You and Arash should be centered
   horizontally, sitting a bit below the vertical middle, with the dashed marriage
   connector between you fully visible and at least the generation above you in view.
   Neither of you should be clipped by an edge.
2. Filters: click **Natalie's Family** — you should be framed. Click
   **Arash's Family** — Arash should be framed. Click **Both Families** — back to
   the pair.
3. Pan and zoom: drag and scroll/pinch around the tree. It should move normally with
   no snap-back.
4. Round trip: click **Everyone**, pan somewhere distinctive, click **Family Tree**
   (should re-frame on you two), then click **Everyone** again — it should return to
   where you left the Everyone view, not reset.
5. Search: type a guest name while in Family Tree view. The existing zoom-to-node
   behavior should still fire and pulse the node.
6. Phone: open DevTools responsive mode at iPhone SE width (375px), or load it on
   your actual phone. Both of you must still fit side by side with breathing room,
   and neither should be hidden under the "Pinch to zoom" hint at the bottom.
7. Reduced motion: enable macOS System Settings > Accessibility > Display > Reduce
   motion, reload, and switch to Family Tree. It should snap straight to the
   couple-centered framing with no animation and no intermediate wrong position.

If the vertical placement feels off (too much dead space below you, or your parents'
row cut off at the top), the single knob is `TREE_FOCUS_Y_FRAC` in graph.js — lower
it toward 0.5 to move you up, raise it toward 0.7 to move you down.
  </how-to-verify>
  <resume-signal>Type "approved", or describe what looks wrong (and at which viewport width)</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none crossed | This change is a client-side SVG camera transform computed entirely from already-rendered, already-trusted layout coordinates. No new input, network call, storage, or DOM-from-string sink is introduced. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-OJG-01 | Information disclosure | `frameOnCouple` reading `treeNodeData` | accept | Only positions already rendered on screen are read; `treeHidden` guests are already excluded upstream in `layoutSide` (graph.js:1333) and never enter `treeNodeData`. No new exposure. |
| T-OJG-02 | Denial of service | Degenerate scale math (zero-width canvas, NaN) | mitigate | Clamp `scale` into the existing `scaleExtent` `[0.3, 3]` and fall back to 1 when the computed value is not finite and greater than 0. |
| T-OJG-03 | Tampering | Stale cached `graph.js` served after deploy | mitigate | Task 2 refreshes the `?v=` cache-bust stamp on all four our-people assets, matching build-guests.js's format. |
</threat_model>

<verification>
Automated (agent-runnable):
- `node --check narsh2026/our-people/graph.js` exits 0.
- `frameOnCouple` appears at least twice in graph.js (definition plus call site).
- `view === "social" && currentTransform` appears exactly twice in graph.js.
- `zoomBehavior.transform, transform` appears in graph.js.
- index.html contains exactly four identical fresh 12-digit `?v=` stamps and zero
  occurrences of `202608081739`.
- `git status --porcelain` shows no modification to `guest-data.js`,
  `build-guests.js`, or any our-story file beyond the two the other agent already
  had in flight.

Outstanding — requires a human, cannot be self-certified by an agent:
- The 7-step browser checklist in Task 3, including the 375px phone width and the
  `prefers-reduced-motion` case.
</verification>

<success_criteria>
- Entering the Family Tree view frames Natalie and Arash, not the middle of
  Natalie's extended family.
- Both are fully visible with their connector at desktop and 375px widths.
- Family filters frame the selected side's couple member.
- Pan, zoom, search zoom-to-node, the Everyone-view transform restore, and
  `prefers-reduced-motion` all behave exactly as before.
- Only `narsh2026/our-people/graph.js` and `narsh2026/our-people/index.html` are
  modified by this plan.
</success_criteria>

<output>
After completion, create
`.planning/quick/260808-ojg-family-tree-loads-centered-on-natalie-an/260808-ojg-SUMMARY.md`
</output>
</content>
</invoke>
