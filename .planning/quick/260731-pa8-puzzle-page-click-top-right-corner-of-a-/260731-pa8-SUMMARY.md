---
phase: 260731-pa8
plan: 01
subsystem: puzzles
tags: [interaction, accessibility, attribution, share-grid, localStorage]
requires:
  - narsh2026/puzzles/puzzle-data.js (DAILY_PUZZLES, CHARACTERS, DATA_VERSION "4")
  - NARSH_PUZZLE.cycleColorTag
provides:
  - .color-tag-hit corner click/tap target for the color marker
  - .puzzle-credit attribution line linking Clues by Sam
  - mistakesByCard per-card mistake tracking + NARSH_PUZZLE.getCardMistakes
  - accuracy-based share/completion emoji grid
affects:
  - narsh2026/puzzles/index.html
  - narsh2026/puzzles/puzzle.css
  - narsh2026/puzzles/puzzle-ui.js
  - narsh2026/puzzles/puzzle.js
tech-stack:
  added: []
  patterns:
    - Plain DOM APIs, no build step, no dependencies
    - aria-label "-- opens in new tab" house pattern for external links
    - Per-card state persisted as a plain object beside colorTags
key-files:
  created: []
  modified:
    - narsh2026/puzzles/puzzle.css
    - narsh2026/puzzles/puzzle-ui.js
    - narsh2026/puzzles/index.html
    - narsh2026/puzzles/puzzle.js
decisions:
  - Corner hit target is non-focusable and aria-hidden; adds zero tab stops
  - Credit line is static markup above the diegetic identity clue
  - Root cluesbysam.com URL rather than an unverified /tutorial deep link
  - DATA_VERSION left at "4" so in-progress guest saves survive
metrics:
  tasks_completed: 4
  tasks_total: 5
  commits: 3
  completed: 2026-07-31
---

# Quick Task 260731-pa8: Puzzle Page Corner Marker, Credit Line, Accuracy Grid Summary

Three independent puzzle-page improvements: a corner click/tap target that cycles a card's color marker, a Clues by Sam credit line pointing newcomers at its tutorial, and a completion/share emoji grid that encodes player accuracy instead of character roles.

## What Was Built

| Task | Change | Commit |
| ---- | ------ | ------ |
| 1+2 | `.color-tag-hit` corner target, CSS + `renderGrid` wiring, refreshed comments | `c65d190` |
| 3 | `.puzzle-credit` line in `index.html` + styling | `cf138cf` |
| 4 | `mistakesByCard` tracking + accuracy-based `generateShareText()` | `078b28f` |

### Task 1+2 — Corner color marker

`puzzle.css` gained a `.color-tag-hit` rule (30px square, 28px under 480px) anchored to the card's top-right with `border-radius: 0 var(--radius-md) 0 var(--radius-md)`, `touch-action: manipulation`, and `-webkit-tap-highlight-color: transparent`. A `.color-tag-hit:hover + .color-tag` affordance lives inside the existing `@media (hover: hover)` block (dot scales 1.25 and borders terracotta), neutralized in the reduced-motion block. `.color-tag` now transitions `transform` alongside its existing properties.

`renderGrid` creates `tagHitEl` as the immediately-preceding sibling of the `.color-tag` dot (required by the CSS `+` selector). Its click handler calls `stopPropagation()` first, returns early on flipped cards, then cycles via `NARSH_PUZZLE.cycleColorTag(i)`. A passive `touchstart` handler does nothing but `stopPropagation()`.

The `.color-tag` dot span is untouched, so the restore loop's `querySelector(".color-tag")` still resolves to exactly one dot per card — `.color-tag-hit` is a distinct class token and does not match that selector.

### Task 3 — Clues by Sam credit

A static `<p class="puzzle-credit">` between the `<h1>` and the identity clue reads: "Inspired by Clues by Sam -- new to this kind of puzzle? There's a tutorial over there." Styled as small centered secondary text with hover and `:focus-visible` states using only existing tokens.

### Task 4 — Accuracy-based share grid

`mistakesByCard` is declared beside `colorTags`, incremented in the `guessRole` incorrect branch, serialized in `saveState()`, restored via `saved.mistakesByCard || {}`, reset to `{}` in both the fresh-init branch and `reset()`, and exposed as `getCardMistakes`. The `generateShareText()` tile expression changed from `characters[i].criminal` to `(mistakesByCard[i] || 0) > 0`; header, footer, and 4-per-row breaks are byte-identical.

## Required Findings

**Accessibility decision.** The hit target is a `<span>` with `aria-hidden="true"` and no `tabindex` — deliberately not focusable. One target per card would roughly double the page's tab stops for a secondary note-taking affordance, and the card's own `role="button"` / `tabindex="0"` / Enter-Space path to the guess dialog had to stay unchanged. Keyboard-only users keep the pre-existing route to color cycling: focus the card and press the context-menu key (or Shift+F10), which dispatches `contextmenu` on the untouched card handler. Net a11y change: zero regressions, no new tab stops, no new labels.

**Flipped-card finding.** A flipped card's front face is back-facing under `backface-visibility: hidden`, so browsers already exclude it from hit testing. Both guards were added anyway so the behavior is explicit rather than browser-dependent: CSS `.puzzle-card.flipped .color-tag-hit { pointer-events: none; }` and a JS `cardEl.classList.contains("flipped")` early return.

**Instructions-copy finding.** No user-facing text anywhere in the repo mentions right-click or long-press — the only matches were three code comments (`puzzle.js:9`, `puzzle-ui.js` contextmenu, `puzzle-ui.js` touchstart). All three were updated to name the corner interaction as primary with right-click/long-press as alternates. Discoverability is carried by the `title="Click to cycle color marker"` tooltip; no on-page instructional copy was invented.

**Credit-line placement rationale.** Placed above the identity clue because that clue is *diegetic* — the in-fiction opening clue populated from `NARSH_PUZZLE_DATA.IDENTITY_CLUE`. Meta/attribution text belongs grouped with the title rather than interrupting the narrative beat right where the player starts. Second reason: `.puzzle-identity-clue:empty { display: none; }` means a credit line placed after it would inherit awkward stacked spacing when no clue is set. Static markup rather than JS injection because the copy has no data dependency, it inherits the same auth gating as the rest of `<main>`, and injection would tie page chrome to `NARSH_PUZZLE_UI.init()`. The anchor points at the root `https://cluesbysam.com/` — an unverifiable `/tutorial` deep link that 404s would be worse than one extra click, and the copy already says what to look for.

**Clues by Sam now appears twice on the page by design** — the new credit line at the top and the original `DAILY_PUZZLES` card in the bottom "Daily Puzzles We Love" directory (`puzzle-data.js:224`, unmodified). This duplication is intentional: credit where a confused newcomer will see it, directory listing where people browse. Do not "clean it up."

**Auto-revealed starter renders green by construction.** `autoRevealStarterCard()` calls `guessRole(starterIndex, character.criminal)` — always the correct answer — so it always takes the `isCorrect` branch and can never increment `mistakesByCard`. No special-casing, no fourth emoji, no skip. The harness asserts this explicitly.

**`getCardMistakes` is exported but not yet consumed by any UI code.** The share grid reads the module-local `mistakesByCard` directly. The accessor exists so a future UI feature can read per-card data without a second refactor.

**Legacy-save tradeoff.** `DATA_VERSION` deliberately left at `"4"`. `loadState()` gates only on version, never on object shape, so bumping to `"5"` would return null for every existing save and wipe every guest's in-progress game — flipped cards, timer, color markers. Destroying real progress to fix a cosmetic grid on an already-finished game is the worse trade. Instead, a pre-existing save without the key defaults to `{}` and renders an all-green grid while line 2 of the share text still prints the true global count, so the grid and header visibly disagree rather than silently lying. State self-heals on the next reset. Verified by a supplementary harness run (see below).

## Deviations from Plan

None affecting code. Plan executed as written.

One plan-gate defect found and *not* worked around:

**[Gate defect] Task 3's final verification command asserts the wrong number.**
- **Gate:** `grep -c 'Clues by Sam' narsh2026/puzzles/puzzle-data.js` expected to equal `1`.
- **Actual:** `3`, both before and after this work. The file contains two prose comments mentioning Clues by Sam (`puzzle-data.js:4` and `:240`) in addition to the `DAILY_PUZZLES` entry at `:224`. The planner counted only the data entry.
- **Resolution:** No production code was changed to satisfy it. The gate's *intent* — "the DAILY_PUZZLES entry is untouched" — was verified two stronger ways instead: `git diff --quiet 24b9f03 -- narsh2026/puzzles/puzzle-data.js` confirms the file is byte-identical to the plan's base commit, and `grep -c 'name: "Clues by Sam"'` returns exactly `1`. Both pass.

Unrelated tooling note: piping `git` output into `wc -l` in this environment picks up an extra wrapper line, so file-unchanged assertions should use `git diff --quiet` exit status rather than a line count.

## Verification Results

All plan gates pass (paths run from the worktree root rather than the plan's hard-coded main-repo path):

| Gate | Result |
| ---- | ------ |
| `.color-tag-hit` occurrences in CSS (>=5) | PASS 6 (5 rules + 1 comment mention; the rules alone clear the bar) |
| CSS flipped + 28px mobile guards | PASS |
| `node --check` on `puzzle-ui.js` and `puzzle.js` | PASS |
| `color-tag-hit` in UI JS (>=1) | PASS 1 |
| `"contextmenu"` listeners (==1) | PASS |
| `"touchstart"` listeners (==2) | PASS |
| `cycleColorTag` call sites (>=3) | PASS 3 |
| card `tabindex` intact | PASS |
| credit copy / link hygiene / placement order | PASS |
| `.puzzle-credit` CSS rules (>=4) | PASS 5 |
| DAILY_PUZZLES entry untouched | PASS (via corrected assertion — see deviation above) |
| `mistakesByCard` wiring (>=7) | PASS 8 |
| old role-based tile expression removed | PASS |
| `DATA_VERSION` still `"4"` | PASS |
| **Node `vm` accuracy harness** | **PASS — exactly 1 red tile at mis-guessed index 14, starter green, `getCardMistakes` correct** |

The harness was run unmodified and reported 1 red tile (not 11), confirming the fix took.

Supplementary check beyond the plan, covering the must_have "a save written before this change still loads": a second `vm` run seeded `localStorage` with a pre-change save (`version: "4"`, `mistakes: 3`, no `mistakesByCard`). Result: loads without throwing, renders an all-green grid, header still reports "3 mistakes", and legacy `colorTags` survive.

Changes are confined to the four planned files: `index.html` (+1), `puzzle-ui.js` (+34/-2), `puzzle.css` (+72/-1), `puzzle.js` (+27/-3). No new files, no dependencies, no build step.

## Known Stubs

None.

## Threat Flags

None. No new network endpoints, auth paths, file access, or schema changes at a trust boundary beyond what the plan's threat register already covers. The one new outbound link carries `rel="noopener noreferrer"` (T-pa8-04/05 mitigations applied); the new hit element is built with `document.createElement` and static literal attributes only, no `innerHTML` and no interpolated data (T-pa8-03 mitigation applied).

## Outstanding: Task 5 — Human Verification (blocking checkpoint)

Tasks 1-4 are complete and committed. Task 5 is a `checkpoint:human-verify` and has **not** been self-approved. A human must run the following in a browser.

Serve locally and open the auth-gated puzzle page:
1. `cd /Users/nataliefleury/programming/arashrai.github.io && python3 -m http.server 8000`
2. Visit `http://localhost:8000/narsh2026/puzzles/` and authenticate.

**Desktop — corner marker**
3. Hover a card's top-right corner: the dot grows slightly and borders terracotta, cursor stays a pointer, a "Click to cycle color marker" tooltip appears after a beat.
4. Left-click the corner repeatedly: the dot cycles red -> orange -> yellow -> green -> blue -> purple -> cleared. The guess dialog must NEVER open from these clicks.
5. Click the CENTER of the same card: the Criminal/Innocent dialog opens as before. Dismiss it.
6. Right-click the card center: the dot still cycles.
7. Tab to a card and press Enter: the dialog opens. Tab again: focus moves to the NEXT CARD, not to a corner target.
8. Reload: the colors you set are still there.
9. Flip a card by answering its dialog, then click its top-right corner: nothing happens.

**Desktop — Clues by Sam credit**
10. The credit line sits directly under "Clues by Narsh", above the italic identity clue, reading "Inspired by Clues by Sam -- new to this kind of puzzle? There's a tutorial over there."
11. It reads as a quiet secondary line, comfortably centered at both wide and narrow widths.
12. Hover the link (colour shifts, underline clear), then click: `https://cluesbysam.com/` opens in a NEW tab with the puzzle page intact behind it.
13. Tab to the link: terracotta focus ring appears. With VoiceOver (Cmd+F5) it announces "Clues by Sam -- opens in new tab".
14. At the bottom, the original Clues by Sam card in "Daily Puzzles We Love" is still present and working. (Duplication is intentional — say so if it feels redundant to you.)

**Desktop — completion grid** (slowest check; budget a full playthrough)
15. Start a fresh game. Play to completion, deliberately guessing WRONG on exactly two cards you can identify by position (e.g. row 1 card 2, row 3 card 3), everything else right first try.
16. On "Case Closed!", the grid shows red at exactly those two positions (row-major, 4 per row) and green everywhere else.
17. Direction sanity check: a card you know was a CRIMINAL that you got right first try must be GREEN. Under the old behavior it was red. If criminals are still red, the change did not take.
18. The stats line still reports true totals. Two wrong guesses on the SAME card = 2 mistakes but 1 red tile, which is expected.
19. Click "Share Results" (flips to "Copied!"), paste somewhere: the pasted grid matches the modal preview exactly.
20. Reload with the game complete: modal reappears, grid unchanged.

**Legacy-save check** (automated equivalent already passes; this confirms it in a real browser)
21. With a completed game, open DevTools -> Application -> Local Storage -> `narsh-puzzle-state`. Delete just the `"mistakesByCard"` key, save, reload.
22. The page loads normally and the modal renders an ALL-GREEN grid with no console errors, even though the stats line reports your real mistake count. Confirm that documented mismatch reads as tolerable rather than alarming.

**Mobile** (DevTools device toolbar with touch emulation, or a real phone)
23. Tap the top-right corner: the color advances by exactly ONE step per tap (a double-jump would mean long-press suppression failed).
24. Press and HOLD the corner ~1s, release: still exactly one step.
25. Press and hold the card CENTER ~1s: the color cycles via long-press.
26. Tap the card center: the guess dialog opens.
27. The corner target is comfortable to hit at phone width without swallowing the card.
28. The credit line wraps to at most two lines at phone width and does not push the grid uncomfortably far down.

Resume signal: "approved", or describe what misbehaved including the numbered step.

## Self-Check: PASSED

- `narsh2026/puzzles/puzzle.css` — FOUND (modified)
- `narsh2026/puzzles/puzzle-ui.js` — FOUND (modified)
- `narsh2026/puzzles/puzzle.js` — FOUND (modified)
- `narsh2026/puzzles/index.html` — FOUND (modified)
- Commit `c65d190` — FOUND
- Commit `cf138cf` — FOUND
- Commit `078b28f` — FOUND
