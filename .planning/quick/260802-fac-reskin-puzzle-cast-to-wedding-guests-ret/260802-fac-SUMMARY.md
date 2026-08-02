---
phase: quick-260802-fac
plan: 01
subsystem: puzzles
tags: [content, reskin, clue-resolver, wedding-guests]
requires: []
provides:
  - "Wedding-guest puzzle cast (20 real first names, 9 professions)"
  - "Stolen-bouquet riddle theming"
  - "Multi-word-safe #PROF(S) clue resolver"
affects:
  - narsh2026/puzzles/puzzle-data.js
tech-stack:
  added: []
  patterns:
    - "Regex alternation derived from data at module scope, longest-first, regex-escaped"
key-files:
  created: []
  modified:
    - narsh2026/puzzles/puzzle-data.js
decisions:
  - "Derive the profession alternation from CHARACTERS, not PROFESSION_EMOJI, so the matcher and the cast cannot drift"
  - "Sort profession labels longest-first so no label that prefixes another can shadow it"
  - "Drop the witch special case as unreachable once matching is restricted to the known profession set"
  - "Bump DATA_VERSION to 5 to intentionally discard in-progress saves keyed to the old cast"
  - "Keep PROFESSION_EMOJI in sync and comment-mark it as dead code rather than deleting it"
metrics:
  duration: ~20m
  completed: 2026-08-02
---

# Quick Task 260802-fac: Reskin Puzzle Cast to Wedding Guests Summary

Replaced the placeholder puzzle cast with the 20 real wedding guests, rethemed the
stolen-teddy-bear riddle as a stolen bouquet, and made the `#PROF(S)` clue resolver
multi-word safe so `flower girl` pluralizes as `flower girls` instead of `flowers girl`.

## What Changed

Exactly one source file: `narsh2026/puzzles/puzzle-data.js`.

**Task 1 -- cast, riddle, data version**
- Deleted the now-false header line about names/emojis being placeholders.
- Grid comment starter line updated to `Aman (15)`.
- `DATA_VERSION` `"4"` -> `"5"`, with a comment noting the cast swap makes old
  saves meaningless so wiping in-progress games is intended.
- `IDENTITY_CLUE` -> `"The criminals stole something meant to be thrown"`.
- All 20 `name` / `profession` / `emoji` values swapped to the new cast.
- 7 flavor lines replaced (indices 1, 2, 3, 8, 9, 10, 16), 2 profession clues
  retargeted (indices 4 and 6). Index 17 left untouched as instructed.
- `PROFESSION_EMOJI` re-keyed to the 9 new professions with the two multi-word
  keys quoted, plus a comment recording that it is dead code today (defined and
  exported via `getEmoji`, never rendered -- both card faces read
  `character.emoji` directly).

**Task 2 -- multi-word profession resolver**
- Added a module-scope `PROFESSION_TOKEN` regex between `COLS` and `capitalize`.
  It derives the distinct professions from `CHARACTERS` (not from
  `PROFESSION_EMOJI`, so the two cannot drift), sorts longest-first so a label
  that prefixes another cannot shadow it, regex-escapes each label, joins with
  `|`, and compiles `new RegExp("#PROF(S?):(" + alternation + ")", "gi")`.
- `resolveClue` now uses that regex in place of `/#PROF(S?):([a-z]+)/gi`.
  Pluralization is still `label + "s"`.
- The `witch` -> `witches` special case is gone, with a comment stating it is
  unreachable once matching is restricted to the known profession set.
- Every other replace step and its ordering is byte-identical. `#PROF` still runs
  after `#BETWEEN` and before the `neighboring #NAME:x` step.

**Untouched, as required:** every `criminal` flag, every `paths` array, and the
whole of `HINT_SEQUENCE`. Confirmed mechanically -- filtering the diff for
`criminal:`, `paths:`, `requires:`, `sources:`, and `reveals:` lines returns
nothing on either side.

## The 20 Resolved Clues (as a player reads them on the cards)

Identity clue shown up front: **The criminals stole something meant to be thrown**

| # | Guest | Profession | Role | Clue as rendered |
|---|-------|-----------|------|------------------|
| 0 | Gurpreet | yapper | criminal | There's an odd number of innocents neighboring Nemo |
| 1 | William | yapper | innocent | Give it back! She spent months choosing that. |
| 2 | Amritpal | lion | innocent | But the bride and groom stole my heart first -- go after them! |
| 3 | Jatinder | lion | innocent | Wait... it's not the centrepieces, is it? |
| 4 | Shawna | sweetie | innocent | There are as many criminal flower girls as there are criminal coders |
| 5 | Nicole | maid of honor | innocent | Sidney is a criminal |
| 6 | Sidney | muscle | criminal | 2 dancers have a criminal directly below them |
| 7 | Gurnoor | dancer | innocent | Only one row has exactly 2 criminals |
| 8 | Amrit | sweetie | criminal | We took it right out of her hands during the photos... |
| 9 | Kyle | joker | criminal | I was thinking about going for the rings, but this had better odds. |
| 10 | Sabrina | dancer | criminal | Whoever catches it is next, you know. We've simply improved our chances. |
| 11 | Stacey | dancer | criminal | There are exactly 2 innocents to the right of Shawna |
| 12 | Kiran | sweetie | criminal | Row 4 is the only row with exactly one innocent |
| 13 | Nemo | flower girl | criminal | Both innocents above David are connected |
| 14 | Mahi | flower girl | criminal | Spencer is one of 2 criminals in row 5 |
| 15 | Aman | muscle | innocent | I'm the only innocent to the right of Nemo |
| 16 | Matt | coder | criminal | We stole something that smells wonderful... |
| 17 | David | coder | innocent | I hear the criminals stole something... But what? |
| 18 | Spencer | coder | criminal | Only 1 of the 2 criminals neighboring Matt is Kiran's neighbor |
| 19 | Svetomir | muscle | innocent | There is only one innocent above Amrit |

Note that indices 5, 11, 13, 14, 15, 18 and 19 render guest names and positional
phrasing generated by the resolver from the new cast, so those lines read
differently from the raw `hint` templates in the source.

## Verification

`node --check narsh2026/puzzles/puzzle-data.js` -- passes.

`node /tmp/narsh-puzzle-verify.cjs` -- exits 0, all six assertion groups PASS.
The harness concatenates `puzzle-data.js` and `puzzle.js` into one script and
runs a single `vm.runInContext` (both modules bind their IIFE result with `const`,
which is lexical, so two separate runs would leave the second module unable to
see the first). `localStorage` is deliberately left undefined so the harness
always starts from a fresh game.

```
PASS  (a) CHARACTERS.length === 20
PASS  (b) criminal indices === [0,6,8,9,10,11,12,13,14,16,18]
PASS  (c) index 4 -> "flower girls" + "coders", no "flowers girl"
      There are as many criminal flower girls as there are criminal coders
PASS  (d) index 6 -> "dancers"
      2 dancers have a criminal directly below them
PASS  (e) no resolved clue contains a '#' token
PASS  (f) full HINT_SEQUENCE walk: 20/20 flipped, 0 mistakes, complete
```

(f) is the load-bearing one: it drives the real `NARSH_PUZZLE` engine, flips the
starter at index 15, then walks `HINT_SEQUENCE` in order asserting every
prerequisite is already flipped and every reveal returns `"correct"`. All 20
cards flip with zero mistakes and `isComplete()` is true, so the cast reskin did
not break the deduction chain.

Emoji integrity was checked by dumping codepoints for every emoji literal in the
file. Both ZWJ sequences survived intact: `🧚‍♀️` is `U+1F9DA U+200D U+2640 U+FE0F`
and `👨‍💻` is `U+1F468 U+200D U+1F4BB` at all three coder indices. The only
unicode em-dash in the file is the pre-existing one in the line 1 header comment;
every em-dash inside a string literal uses the repo's `--`.

`git diff --name-only` lists exactly one path: `narsh2026/puzzles/puzzle-data.js`.

## Deviations from Plan

**1. [Rule 3 - Blocking] Cross-realm array comparison in the harness**
- **Found during:** Task 3, first harness run
- **Issue:** Assertion (b) failed with `criminal indices drifted:
  [0,6,8,9,10,11,12,13,14,16,18]` -- the reported actual and expected values were
  character-identical. The cause is realm identity, not data: the array comes out
  of `DATA.CHARACTERS.map().filter()` inside the `vm` context and therefore
  carries the context's `Array.prototype`, which `assert.deepStrictEqual` rejects
  on prototype identity before it ever compares elements.
- **Fix:** Wrapped the expression in `Array.from(...)` to re-home the result into
  the host realm. The element comparison is still `deepStrictEqual` against the
  literal `[0,6,8,9,10,11,12,13,14,16,18]` -- the assertion was not weakened, and
  a genuine drift in criminal flags would still fail it.
- **Files modified:** `/tmp/narsh-puzzle-verify.cjs` only (throwaway, not committed)
- **Commit:** n/a -- harness is outside the repo

No changes were made to `puzzle-data.js` in response to a failing assertion. No
other deviations; the source edits are exactly as specified.

## Known Stubs

None.

## Self-Check: PASSED

- `narsh2026/puzzles/puzzle-data.js` -- FOUND, modified, `node --check` passes
- Commit `9440b4a` -- FOUND in `git log`
- Working tree clean after commit; only one file in the commit; zero deletions

## Commits

| Hash | Message |
|------|---------|
| 9440b4a | feat(quick-260802-fac): reskin puzzle cast to wedding guests, retheme as stolen bouquet |
