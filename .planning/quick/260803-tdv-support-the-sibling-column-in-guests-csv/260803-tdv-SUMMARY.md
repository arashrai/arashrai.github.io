---
phase: 260803-tdv
plan: 01
subsystem: our-people
completed: 2026-08-03
commits:
  - f848282  feat(260803-tdv) sibling column -> groups, edges, inferred parents
  - 72b9bbf  fix(260803-tdv) blood-distance spine + virtual sibling roots
  - 9db36db  fix(260803-tdv) keep name-less rows that participate in the tree
status: complete
---

# 260803-tdv: Support the `sibling` column in guests.csv — Summary

The `sibling` column is now read, transitive, one-direction-tolerant, and wired into
edges, side flooding and parent inference. `layoutSide` picks the bloodline spine by
blood distance and nests parentless sibling root lineages under an unrendered virtual
node. **Arash's side drops from 8 root lineages to 6 with no increase in non-hierarchy
parent edges**, and Natalie's side is unchanged. All gates pass.

## Before / after metrics

Baseline measured on the pre-change `guest-data.js`; after measured by `/tmp/verify-tree.js`
(a faithful mirror of the shipped `layoutSide`).

| side    | people   | units    | root lineages | non-hierarchy parent edges |
|---------|----------|----------|---------------|----------------------------|
| natalie | 31 -> 31 | 26 -> 26 | 2 -> **2** ✅ | 1 -> 1 ✅                  |
| arash   | 48 -> 48 | 35 -> 35 | 8 -> **6** ✅ | 3 -> 3 ✅                  |

Total guests: 149 -> 149 (unchanged — see "The `...` row is kept, not dropped" below).

**Arash top-level lineages (6, left to right):**
`Jatinder's mom+dad` | `[virtual: Balbir Rai | Navi's grandpa+grandma | Isha's grandpa+grandma]`
| `Amrit's mom+dad` | `Upneet's grandpa` | `Jasan's grandma+grandpa` | `Gurnoor Boparai`

**Natalie top-level lineages (2, left to right):** `Mary Fleury` | `Sidney Morehouse`

Remaining non-hierarchy parent edges (unchanged from baseline, all pre-existing):
- natalie: `William Fleury <- Mary Fleury`
- arash: `Amritpal Rai <- Balbir Rai`, `Amrit Kaur <- Amrit's mom`, `Amrit Kaur <- Amrit's dad`

## Inferred parents — please sanity-check these

Two people gained parents deduced from a sibling link. These are recorded on the new
`inferredParents` field and are **never drawn as parentage lines** — they only feed side
flooding and the cycle guard.

| person       | inferred parent(s)                | deduced via sibling link to |
|--------------|-----------------------------------|-----------------------------|
| Kiran Kaur   | Jasan's grandma, Jasan's grandpa  | Gurinder Khangura           |
| Upneet's mom | Jasan's grandma, Jasan's grandpa  | Gurinder Khangura           |

Both are members of sibling set B (`Kiran Kaur`, `Upneet's mom`, `Gurinder Khangura`);
Gurinder is the only member with parents in the CSV, so hers apply to the whole set.
Sibling set A (`Balbir Rai`, `Navi's grandpa`, `Isha's grandpa`) has no parents anywhere,
so nothing was inferred for it — that set is what the virtual root node groups.

The build prints both of these to stderr on every run, so Natalie sees the deduction.

## The `...` row is kept and flagged, not dropped

The plan's R3 called for skipping rows whose name has no letters or numbers, to remove
the `...` row at `guests.csv:105`. **Implementing that as written caused a real
regression, so the action was changed from skip to keep-and-warn.**

`...` is not junk. She is a real member of Natalie's family whose name simply hasn't been
filled in: child of `Rene Fleury` (line 105), and parent of `Katelyn Henry` (line 6) and
`Natreisha Henry` (line 7). Dropping the row severed `Rene Fleury -> ... -> Katelyn /
Natreisha`, turning that married pair into a third detached lineage — natalie went 2 -> 3
root lineages. Confirmed by counterfactual: with the skip disabled and every other change
in place, natalie stayed at 2 and arash still dropped to 6.

Deleting a real person from the guest list to tidy a placeholder name is a worse outcome
than the placeholder showing in the UI, so the rule is now **participation-based**:

- A name-less row that has a `parent`, `comes_with`, or `sibling`, or that any other row
  names in one of those columns, is **kept and compiled normally**, plus a warning naming
  its exact position in the tree.
- A name-less row with no family links at all is genuinely inert and is still **skipped**,
  with a warning to delete it.

The detection logic (name contains no `[A-Za-z0-9]`) is unchanged; only the action.
Both branches were exercised against a synthetic CSV: `---` with no links was skipped,
`...` with a parent was kept and flagged.

The warning Natalie now sees:

> Row "..." has no real name — they are Rene Fleury's child and Katelyn Henry /
> Natreisha Henry's parent. They're kept so that lineage stays connected; give them a
> name in guests.csv so the tree reads properly.

`guests.csv` was not modified. Guest count stays at 149, not 148 — the plan's Task 1
assertion of 148 was updated accordingly.

## Gates

| Gate | Result |
|---|---|
| natalie root lineages == 2 | ✅ 2 |
| arash root lineages strictly < 8 (target 6) | ✅ 6 |
| non-hierarchy parent edges natalie <= 1 | ✅ 1 |
| non-hierarchy parent edges arash <= 3 | ✅ 3 |
| no parentage cycles (over `parents` ∪ `inferredParents`) | ✅ |
| every id in SIBLING_GROUPS is a real guest, no id in two groups | ✅ |
| Shawna↔William marriage | ✅ |
| Rosanne↔Steve marriage | ✅ |
| Glen↔Jennifer marriage | ✅ |
| Cindy↔Rene marriage | ✅ |
| Kendra↔Kyle marriage | ✅ |
| Amritpal↔Jatinder marriage | ✅ |
| William still left of Shawna | ✅ (lineage index 0 vs 1) |
| Natalie's lineage last on her side (inner edge) | ✅ index 1 of 2 |
| Arash's lineage first on his side (inner edge) | ✅ index 0 of 6 |
| Set A resolves to ONE top-level lineage | ✅ the virtual node |
| `parents[]` of the six sibling-column people unchanged from CSV | ✅ |
| guest count 149 (placeholder kept) | ✅ |

`node /tmp/verify-tree.js` exits 0.

## Approved deviations, as implemented

1. **Inferred parents go on `inferredParents`, not `parents`.** Confirmed correct:
   `parents[]` for all six sibling-column people is byte-identical to the CSV, and
   arash's non-hierarchy parent edges stayed at 3 rather than rising to 6.
2. **Blood-distance spine selection changed no numbers.** As predicted. Both of Arash's
   parents (Amritpal, Jatinder) sit at blood distance 1, so the stable tie-break preserves
   the existing choice; same for Natalie (Shawna/William). Shipped as a correctness guard.
3. **Root reduction comes from the virtual node**, not reordering. Arash's three Set A
   root units now hang off `__sibgroup-1`, one hierarchy, contiguous by construction.

## Other deviations

**[Rule 1 — bug] R3 changed from skip to keep-and-warn.** Documented in full above.
The plan's measured baseline anticipated a people delta from dropping the row but not
the lost hierarchy link. Caught by the plan's own `natalie roots <= 2` gate, diagnosed,
and corrected with coordinator approval in commit `9db36db`.

## Changes

**`narsh2026/our-people/build-guests.js`**
- Name-less-row handling: keep-and-warn when the row participates in the tree, skip only
  when it is fully unlinked
- `siblingsRaw` / `siblingIds` parsing with the existing `resolveName` warning style
- Independent sibling union-find; `SIBLING_GROUPS` sorted deterministically by CSV row order
- Parent inference onto `inferredParents`, cycle-guarded by an iterative ancestor walk
  (visited set, 10k step cap) with a per-person informational note
- Sibling edges for every in-set pair, on top of the untouched shared-parent loop
- `floodSide` traverses inferred parents plus a mirrored `siblingsOf` adjacency map
- One summary warning for the 14 empty-`group` rows
- Emits `SIBLING_GROUPS` and `inferredParents`; stderr reports `sibling sets: 2`

**`narsh2026/our-people/graph.js`** — `layoutSide` only (`renderFamilyTree` and all
`TREE_*` constants untouched; every diff hunk falls inside `layoutSide`)
- `bloodDist` BFS from the side's couple member over in-side parent↔child links
- `primaryParentUnit` now ranks candidates by blood distance with a stable index tie-break
- Virtual sibling-root grouping (`__sibgroup-N`), `topRoots` / `topAncestor` /
  `nodeContainsTarget` threading through the radj + root-ordering block
- Virtual nodes are skipped when emitting people; their subtree's `y` is pulled up by
  `TREE_V_SPACING` so real people still start at `topY`

**`narsh2026/our-people/guests.README.md`** — `sibling` row in the Columns table, amended
Siblings bullet, and a Sibling links bullet covering transitivity, one-direction, parent
inference and the contiguous-block behaviour.

**Generated (never hand-edited):** `guest-data.js`, `index.html` cache-bust stamp.

`guests.csv` was not modified.

## Verification

- `node narsh2026/our-people/build-guests.js` — clean, 149 guests, 2 sibling sets,
  13 warnings including the `...` keep-and-flag note, the 14-name empty-group summary,
  both inferred-parent notes, and the pre-existing `Bhupinder Boparai` unresolved-name
  warning. The two `Unresolved name "..."` warnings are gone now that the row is kept.
- `node --check narsh2026/our-people/graph.js` — parses.
- Task 1 automated verify (with 148 updated to 149) — passes.
- Task 2 automated verify — passes.
- `node /tmp/verify-tree.js` — exits 0, all gates green. Harness is throwaway, not committed.
- `git diff --stat` vs the plan baseline: `build-guests.js`, `graph.js`,
  `guests.README.md`, `guest-data.js`, `index.html`. `guests.csv` absent, as required.

**No browser verification was possible** (Chrome launch blocked in this sandbox). The
d3 CDN is also unreachable, so the actual `d3.tree()` coordinates could not be simulated;
the virtual node's geometry (children pulled up one generation, contiguous x-range by
construction) is verified by reasoning and by the structural mirror, not by execution.
Natalie should eyeball Arash's side once deployed.

## Self-Check: PASSED

- `narsh2026/our-people/build-guests.js` — FOUND
- `narsh2026/our-people/graph.js` — FOUND
- `narsh2026/our-people/guests.README.md` — FOUND
- `narsh2026/our-people/guest-data.js` — FOUND
- `narsh2026/our-people/index.html` — FOUND
- commit `f848282` — FOUND
- commit `72b9bbf` — FOUND
- commit `9db36db` — FOUND
