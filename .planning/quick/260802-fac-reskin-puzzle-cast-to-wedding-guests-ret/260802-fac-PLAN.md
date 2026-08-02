---
phase: quick-260802-fac
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - narsh2026/puzzles/puzzle-data.js
autonomous: true
requirements: [QUICK-260802-fac]

must_haves:
  truths:
    - "The puzzle cast shows the 20 real wedding guests, first names only"
    - "The riddle reads as a stolen bouquet, not a stolen teddy bear"
    - "Index 4's clue renders 'flower girls' (not 'flowers girl') and 'coders'"
    - "Index 6's clue renders 'dancers'"
    - "No resolved clue contains a leftover '#' template token"
    - "The puzzle is still fully solvable: walking HINT_SEQUENCE in order flips all 20 cards with zero mistakes"
    - "Old in-progress saves are discarded (DATA_VERSION bumped)"
  artifacts:
    - path: "narsh2026/puzzles/puzzle-data.js"
      provides: "Reskinned cast, bouquet riddle, multi-word-safe profession resolver"
      min_lines: 300
      contains: "flower girl"
  key_links:
    - from: "resolveClue #PROF(S) branch"
      to: "the profession set derived from CHARACTERS"
      via: "longest-first regex alternation built at module scope"
      pattern: "#PROF\\(\\?S\\?\\)|PROFESSION_TOKEN"
---

<objective>
Reskin the Clues-style puzzle from the placeholder cast to the 20 real wedding
guests, retheme the stolen-teddy-bear riddle as a stolen bouquet, and fix
`resolveClue` so multi-word professions render correctly.

Purpose: The puzzle currently ships placeholder names ("Amy", "Bunty", "Tina")
and a teddy-bear riddle that has nothing to do with the wedding. The new cast
introduces two-word professions (`flower girl`, `maid of honor`) that the
existing `[a-z]+` profession matcher renders as "flowers girl".

Output: A single modified file, `narsh2026/puzzles/puzzle-data.js`, verified by
a throwaway Node `vm` harness that proves the deduction chain still solves.
</objective>

<execution_context>
@/Users/nataliefleury/programming/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@narsh2026/puzzles/puzzle-data.js

Verified by the orchestrator, do NOT recompute:

- The 11 criminal indices are `0,6,8,9,10,11,12,13,14,16,18`. Every `criminal`
  flag stays exactly as it is today, per index. The cast swap changes
  `name`, `profession`, and `emoji` ONLY.
- `paths`, `HINT_SEQUENCE`, `GRID_WIDTH`, `GRID_HEIGHT`, `COLS`, `DAILY_PUZZLES`
  and the whole `resolveClue` body except the `#PROF` branch are untouched.
- Professions are load-bearing in exactly TWO clues: index 4 and index 6.
  Every other profession label is decorative.
- The new grouping preserves both clue invariants:
  criminal `flower girl`s = {13,14} = 2, equals criminal `coder`s = {16,18} = 2;
  and `dancer`s {7,10,11} have a criminal directly below at 7->11 and 10->14
  but not 11->15, = exactly 2.
- No other file in the repo references the old names or old professions
  (checked across `puzzle.js`, `puzzle-ui.js`, `index.html`, `puzzle.css`).
  Both card faces render `character.emoji`, never `PROFESSION_EMOJI`.

Repo style: 2-space indent, double-quoted strings, semicolons, `const`.
Inside string literals use `--` for em-dashes, never the unicode character.
Leave the unicode em-dashes already present in comments alone.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reskin the cast, retheme the riddle, bump the data version</name>
  <files>narsh2026/puzzles/puzzle-data.js</files>
  <action>
Edit `narsh2026/puzzles/puzzle-data.js`. Transcribe the values below EXACTLY.
Do not improvise names, reword hints, or re-derive puzzle logic.

1. Header comment: delete the line that currently reads
   "NOTE: names/emojis are placeholders — to be replaced with family members later."
   It is now false. Leave the other four header lines unchanged.

2. In the grid-layout comment block, update the starter line from
   "Starter (auto-revealed): Tina (15)." to "Starter (auto-revealed): Aman (15)."

3. `DATA_VERSION`: change `"4"` to `"5"`. Add a short comment noting that the
   cast swap makes old saves meaningless, so wiping in-progress games is
   intended here.

4. `IDENTITY_CLUE`: change to `"The criminals stole something meant to be thrown"`.

5. `CHARACTERS`: rewrite `name`, `profession`, and `emoji` for all 20 entries,
   and replace the `hint` on the 7 rows marked NEW / RETARGET. Keep `criminal`
   and `paths` byte-identical to what is there today.

   | i  | criminal | name     | profession    | emoji | hint |
   |----|----------|----------|---------------|-------|------|
   | 0  | true     | Gurpreet | yapper        | 💬    | KEEP |
   | 1  | false    | William  | yapper        | 💬    | NEW |
   | 2  | false    | Amritpal | lion          | 🦁    | NEW |
   | 3  | false    | Jatinder | lion          | 🦁    | NEW |
   | 4  | false    | Shawna   | sweetie       | 🍬    | RETARGET |
   | 5  | false    | Nicole   | maid of honor | 🧚‍♀️  | KEEP |
   | 6  | true     | Sidney   | muscle        | 💪    | RETARGET |
   | 7  | false    | Gurnoor  | dancer        | 💃    | KEEP |
   | 8  | true     | Amrit    | sweetie       | 🍬    | NEW |
   | 9  | true     | Kyle     | joker         | 🃏    | NEW |
   | 10 | true     | Sabrina  | dancer        | 💃    | NEW |
   | 11 | true     | Stacey   | dancer        | 💃    | KEEP |
   | 12 | true     | Kiran    | sweetie       | 🍬    | KEEP |
   | 13 | true     | Nemo     | flower girl   | 🌸    | KEEP |
   | 14 | true     | Mahi     | flower girl   | 🌸    | KEEP |
   | 15 | false    | Aman     | muscle        | 💪    | KEEP |
   | 16 | true     | Matt     | coder         | 👨‍💻   | NEW |
   | 17 | false    | David    | coder         | 👨‍💻   | KEEP |
   | 18 | true     | Spencer  | coder         | 👨‍💻   | KEEP |
   | 19 | false    | Svetomir | muscle        | 💪    | KEEP |

   KEEP means the existing `hint` string stays byte-identical.

   The two RETARGET hints keep their sentence structure and only swap the
   profession tokens:
   - index 4: "There are as many criminal #PROFS:flower girl as there are criminal #PROFS:coder"
   - index 6: "2 #PROFS:dancer have a criminal directly below them"

   The NEW hints, verbatim:
   - index 1:  "Give it back! She spent months choosing that."
   - index 2:  "But the bride and groom stole my heart first -- go after them!"
   - index 3:  "Wait... it's not the centrepieces, is it?"
   - index 8:  "We took it right out of her hands during the photos..."
   - index 9:  "I was thinking about going for the rings, but this had better odds."
   - index 10: "Whoever catches it is next, you know. We've simply improved our chances."
   - index 16: "We stole something that smells wonderful..."

   Index 17 ("I hear the criminals stole something... But what?") is listed as
   part of the bouquet set but is UNCHANGED -- it is already the perfect setup
   line. Do not "fix" it. It is revealed 5th, so it must stay logic-free.

   Constraint on the flavor lines: every clue in this puzzle is truthful, so no
   flavor line may assert anything about guilt or grid position. The seven NEW
   lines above already satisfy this -- do not add detail that would.

6. `PROFESSION_EMOJI`: re-key to the 9 new professions so it is not silently
   wrong. Quote the two multi-word keys. Use the per-profession emoji from the
   cast table:
   yapper 💬, lion 🦁, sweetie 🍬, "maid of honor" 🧚‍♀️, muscle 💪,
   dancer 💃, joker 🃏, "flower girl" 🌸, coder 👨‍💻.
   Add a comment recording that this map is dead code today: it is defined and
   exported (via `getEmoji`) but never rendered, because both card faces read
   `character.emoji` directly. It is kept in sync so a future consumer does not
   inherit stale data.
  </action>
  <verify>
    <automated>node --check narsh2026/puzzles/puzzle-data.js</automated>
  </verify>
  <done>
`node --check` passes. All 20 characters carry a real guest first name, the 9
new professions, and matching emoji. `DATA_VERSION` is `"5"`. `IDENTITY_CLUE`
mentions something meant to be thrown. No `criminal` flag or `paths` array
changed. The placeholder NOTE line is gone.
  </done>
</task>

<task type="auto">
  <name>Task 2: Make the profession resolver multi-word safe</name>
  <files>narsh2026/puzzles/puzzle-data.js</files>
  <action>
The `#PROF(S)` branch in `resolveClue` currently matches with a blind letter run:

    s = s.replace(/#PROF(S?):([a-z]+)/gi, (M, x, v) =>
      v == "witch" ? "witches" : v + (x ? "s" : ""));

`[a-z]+` stops at the space, so `#PROFS:flower girl` renders "flowers girl".

Replace the blind letter run with an alternation built from the actual
profession set:

1. Between `PROFESSION_EMOJI` and `capitalize`, add a module-scope const that
   derives the distinct professions from `CHARACTERS` (not from
   `PROFESSION_EMOJI`, so the two cannot drift), sorts them longest-first so no
   profession that prefixes another can shadow it, regex-escapes each label with
   `/[.*+?^${}()|[\]\\]/g` -> `"\\$&"`, joins with `|`, and compiles
   `new RegExp("#PROF(S?):(" + alternation + ")", "gi")`.

2. Use that regex in `resolveClue`. Pluralization stays `label + "s"`, so
   "flower girl" -> "flower girls" and "coder" -> "coders".

3. Drop the `witch` special case entirely. Add a comment stating it is
   unreachable once matching is restricted to the known profession set.

4. Keep the surrounding explanatory comment accurate and keep the ordering of
   every other replace step in `resolveClue` exactly as it is -- the `#PROF`
   step must still run after `#BETWEEN` and before the `neighboring #NAME:x`
   step.
  </action>
  <verify>
    <automated>node --check narsh2026/puzzles/puzzle-data.js</automated>
  </verify>
  <done>
`resolveClue` matches professions against a longest-first alternation derived
from `CHARACTERS`. No `[a-z]+` profession matcher and no `witch` branch remain.
  </done>
</task>

<task type="auto">
  <name>Task 3: Prove the reskin with a Node vm harness</name>
  <files>/tmp/narsh-puzzle-verify.cjs</files>
  <action>
Write a throwaway harness at `/tmp/narsh-puzzle-verify.cjs` -- outside the repo,
so nothing but `puzzle-data.js` changes.

Harness construction:

- `require("fs")`, `require("vm")`, `require("assert")`.
- Read `narsh2026/puzzles/puzzle-data.js` and `narsh2026/puzzles/puzzle.js`.
  Concatenate them into ONE script string, then append an export trailer:
  `globalThis.DATA = NARSH_PUZZLE_DATA; globalThis.GAME = NARSH_PUZZLE;`
  Both modules declare their IIFE result with `const`, which is lexical, so two
  separate `runInContext` calls would leave the second module unable to see the
  first and the globals undefined. One concatenated script, one
  `vm.runInContext`.
- Context stubs, otherwise `puzzle.js` throws at its top-level
  `document.addEventListener("visibilitychange", ...)`:
  - `performance: { now: () => Date.now() }`
  - `document: { addEventListener: () => {}, hidden: false }`
  - `window: {}`
  - `console`
  Leave `localStorage` UNDEFINED on purpose -- `saveState` / `loadState` /
  `clearState` each wrap it in try/catch and swallow the ReferenceError, which
  also guarantees the harness starts from a fresh game rather than a stale save.

Assertions, all of them:

(a) `DATA.CHARACTERS.length === 20`.

(b) The criminal indices are unchanged: the indices where `criminal` is true,
    in ascending order, deep-equal `[0,6,8,9,10,11,12,13,14,16,18]`.

(c) `DATA.resolveClue(DATA.CHARACTERS[4].hint, DATA.CHARACTERS, 4)` contains the
    literal `"flower girls"`, contains `"coders"`, and does NOT contain
    `"flowers girl"`.

(d) `DATA.resolveClue(DATA.CHARACTERS[6].hint, DATA.CHARACTERS, 6)` contains
    `"dancers"`.

(e) For every index 0..19, the resolved clue contains no `"#"` character --
    proving no template token was left unsubstituted by the new profession
    labels or the new flavor text.

(f) THE IMPORTANT ONE -- the deduction chain still solves, driven through the
    real engine rather than a reimplementation:
    - `GAME.init(DATA)`.
    - Flip the starter: `GAME.guessRole(15, DATA.CHARACTERS[15].criminal)` must
      return `result === "correct"` (index 15 has `paths: [[]]`, so it is
      deducible from nothing).
    - Walk `DATA.HINT_SEQUENCE` in order. For each entry, first assert every
      index in `entry.requires` is already in `GAME.getFlippedCards()`, then for
      each index in `entry.reveals` call
      `GAME.guessRole(idx, DATA.CHARACTERS[idx].criminal)` and assert
      `result === "correct"`. A `"not-deducible"` result means the reskin broke
      the chain.
    - Afterwards assert `GAME.getFlippedCards().size === 20`,
      `GAME.getMistakes() === 0`, and `GAME.isComplete() === true`.

On success print a per-assertion PASS line and exit 0. Any failing assertion
must throw and exit non-zero.

Run it from the repo root. If any assertion fails, fix `puzzle-data.js` -- do
not weaken the harness.
  </action>
  <verify>
    <automated>node /tmp/narsh-puzzle-verify.cjs</automated>
  </verify>
  <done>
`node /tmp/narsh-puzzle-verify.cjs` exits 0 with all six assertion groups (a)
through (f) reported as PASS. In particular (f) confirms all 20 cards flip
correct in HINT_SEQUENCE order with zero mistakes, so the cast reskin did not
break the deduction chain.
  </done>
</task>

</tasks>

<threat_model>
No new trust boundary. This is a static, client-side data file with no user
input, no network call, and no storage write beyond the existing
`localStorage` game save. The only regex constructed at runtime is built from a
hardcoded profession set and is regex-escaped, so there is no injection surface.
No STRIDE threats applicable.
</threat_model>

<verification>
1. `node --check narsh2026/puzzles/puzzle-data.js`
2. `node /tmp/narsh-puzzle-verify.cjs` exits 0
3. `git diff --name-only` lists exactly one path:
   `narsh2026/puzzles/puzzle-data.js`
</verification>

<success_criteria>
- Only `narsh2026/puzzles/puzzle-data.js` is modified.
- All 20 cards use real guest first names and the 9 new professions.
- The riddle reads as a stolen bouquet; the 7 rewritten flavor lines are
  verbatim and assert nothing about guilt or position.
- Index 4 resolves with "flower girls" and "coders"; index 6 with "dancers".
- No resolved clue leaks a `#` token.
- The full HINT_SEQUENCE walk flips all 20 cards correct, zero mistakes.
- `DATA_VERSION` is `"5"`; `PROFESSION_EMOJI` is re-keyed and comment-marked as
  dead code.
</success_criteria>

<output>
After completion, create
`.planning/quick/260802-fac-reskin-puzzle-cast-to-wedding-guests-ret/260802-fac-SUMMARY.md`
</output>
