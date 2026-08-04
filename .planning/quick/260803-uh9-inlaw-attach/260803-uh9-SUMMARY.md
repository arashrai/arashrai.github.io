---
phase: 260803-uh9
plan: 01
subsystem: our-people-family-tree
tags: [family-tree, layout, d3, guest-data]
requires: [narsh2026/our-people/guests.csv]
provides: [spouse-side-inheritance, in-law-lineage-nesting, layout-only-link-suppression]
affects: [narsh2026/our-people/graph.js, narsh2026/our-people/build-guests.js]
tech-stack:
  added: []
  patterns: [fixpoint-inheritance, layout-only-hierarchy-edge, guarded-reorder]
key-files:
  created: []
  modified:
    - narsh2026/our-people/build-guests.js
    - narsh2026/our-people/graph.js
    - narsh2026/our-people/guest-data.js
    - narsh2026/our-people/index.html
decisions:
  - "The in-law connector is a non-hierarchy PARENT edge, not a cross-tree marriage — there are zero cross-tree marriages in the data"
  - "Fallback (b) is guarded on the inner-edge terminal slot; both of today's d=0 candidates are correctly rejected, so root ordering is unchanged"
  - "A virtual sibling-group node is never nested — it only works as a TOP node because yShift is keyed on it"
metrics:
  tasks: 3
  commits: 2
  completed: 2026-08-03
---

# Quick Task 260803-uh9: In-law Attachment and Spouse Side Summary

Married-in guests now inherit their spouse's family side, and an in-law root lineage nests
inside the tree it married into at the generation the link implies — layout only, no false
parentage line.

## Did Natalie get preference (a)?

**Yes — preference (a) was achieved.** Amrit's mom + Amrit's dad are now nested INSIDE
Arash's tree, hanging under Balbir Rai at generation 1, exactly as asked. This did **not**
fall back to (b).

Fallback (b) exists in the code but did not move anything:

| side | candidate | d | outcome |
|---|---|---|---|
| arash | `Balbir Rai -> Amritpal Rai` | 0 | never became a fallback candidate — its root `R` is the virtual sibling-group node, which can only be a TOP node, so it is skipped at candidate discovery |
| natalie | `Mary Fleury -> William Fleury` | 0 | reached fallback (b) and was **REJECTED** by the inner-edge guard — moving Mary right of Sidney would have put Mary's tree on the inner edge and broken Natalie/Arash adjacency |

Net effect on both sides: root ordering is byte-identical to before. That is the correct
result, not a bug.

## Generation rows (Arash's side)

| Person | Generation |
|---|---|
| Balbir Rai | 0 |
| **Amrit's mom** | **1** |
| **Amrit's dad** | **1** |
| **Rani Kaur** | **1** |
| **Gurpreet Rai** | **1** |
| **Amritpal Rai** | **1** |
| Amrit Kaur | 2 |

Amrit's mom and Rani Kaur land on the same generation row — the hard assertion Natalie asked
for. Amrit's mom/dad also share that row with Gurpreet Rai and Amritpal Rai.

## Before / after metrics

| side | people | units | lineages | nonHier |
|---|---|---|---|---|
| natalie | 31 -> **32** | 26 | 2 -> **2** | 1 -> **1** |
| arash | 48 | 35 | 5 -> **4** | 3 -> **3** |

Reproduces the plan's simulated table exactly.

## Root ordering (left -> right as rendered)

**natalie — unchanged:**
- before: `Mary Fleury` || `Sidney Morehouse`
- after: `Mary Fleury` || `Sidney Morehouse`

**arash — Amrit's lineage removed from the top level (it is now nested):**
- before: `Jatinder's mom + Jatinder's dad` || `VIRT[Balbir Rai / Navi's grandpa + Navi's grandma / Isha's grandpa + Isha's grandma]` || `Amrit's mom + Amrit's dad` || `Upneet's grandpa (?)` || `Jasan's grandma + Jasan's grandpa`
- after: `Jatinder's mom + Jatinder's dad` || `VIRT[Balbir Rai / Navi's grandpa + Navi's grandma / Isha's grandpa + Isha's grandma]` || `Upneet's grandpa (?)` || `Jasan's grandma + Jasan's grandpa`

## Attachments made

One attachment total across both sides:

```
[arash] "Amrit's mom + Amrit's dad" -> under "Balbir Rai" at d=1
        (via Amrit's mom -> Amrit Kaur; 2 tied candidates)
```

Both Amrit's mom and Amrit's dad produce a `d = 1` candidate onto the same anchor, so the
tie is broken by CSV row order and one `console.info` line prints in the browser telling
Natalie a choice was made.

## What changed

**`build-guests.js` (R1)** — the MARRIAGES construction is split into a `marriagePairs`
filter and the record `.map`, with a capped fixpoint inheritance pass between them. A guest
who married in has no parentage link, so `floodSide` never reached them and `layoutSide`
(which filters on `side`) dropped them from the tree entirely. Now a sideless partner
inherits their spouse's side, transitively, converging in 2 rounds on today's data. A
marriage whose partners are on *different* sides warns (deduped per pair) instead of
guessing. Each inheritance prints an `FYI —` note; a `sides inherited:` count joins the
stderr summary.

Result: `Svetomir Milanovic` -> natalie, via `Nicole Fleury`. They form one couple unit at
generation 2, so natalie's unit count stays 26 while headcount goes 31 -> 32.

**`graph.js` (R2)** — `layoutSide` gained `unitDepth`/`unitTop` (virtual top node seeded at
-1, real top node at 0, matching the render loop's `yShift`), in-law candidate discovery over
non-hierarchy parent edges, deterministic selection, anchor resolution with a cycle guard,
the guarded fallback reorder, and a returned `suppressedPairs` set.
`renderFamilyTree` merges those sets and filters `parentPos` through them before the
married-parents midpoint search.

## Corrections to the original brief (both approved in the plan, both confirmed against data)

1. **The connector is a parent edge, not a marriage.** `layoutSide` union-finds every
   same-side marriage into one couple unit, so a married pair always lives in exactly one
   tree — scanning all 42 marriages returns zero cross-tree marriages. The real connector is
   a non-hierarchy CSV parent edge, and the depth formula is `d = d_child - 1 - d_parent`.
   For Amrit: `2 - 1 - 0 = 1`.
2. **Fallback (b) is guarded.** Unguarded it would have moved Mary Fleury onto natalie's
   inner edge. The guard rejects any reorder that changes the inner-edge terminal entry.

Also confirmed: Arash's target lineage is `Jatinder's mom + dad`, not Balbir's tree.

## Verification

No browser and no d3 CDN in this sandbox, so verification is structural. `/tmp/uh9-verify.js`
(throwaway, not committed) evals the generated `guest-data.js` and mirrors the shipped
`layoutSide` end to end — union-find, blood distance, primary parent unit, virtual sibling
grouping, unit depth, candidate discovery, anchor + cycle guard, apply, rebuild, root
ordering, guarded fallback.

Gates asserted, all green:

- natalie people 32 / units 26 / lineages 2 / nonHier <= 1; arash people 48 / units 35 /
  lineages 4 / nonHier <= 3 (checked against both the pre- and post-attachment parent map)
- exactly one attachment total: Amrit's parents under Balbir Rai at `d = 1`, 2 tied candidates
- `unitDepth[Amrit's mom] === unitDepth[Rani Kaur]`; Balbir 0; Amrit Kaur 2
- **no false connector:** no member of a nested unit lists a member of its anchor unit in
  `parents`; `balbir-rai` absent from both `amrits-mom.parents` and `amrits-dad.parents`;
  `suppressedPairs` is exactly `{balbir-rai|amrits-mom, balbir-rai|amrits-dad}`
- **real connector kept:** `amrit-kaur.parents` still contains both Amrit's mom and dad, and
  neither pair is in `suppressedPairs` — that line still draws, now short instead of cross-tree
- no hierarchy cycle from any unit on either side (iterative, visited set, 1000-step cap)
- Svetomir: `side === "natalie"`, in Nicole's unit, unit size 2
- inner edges: natalie's target lineage LAST, arash's FIRST in `orderedRoots`
- root ordering matches the measured baseline on both sides
- six regression marriages present: Shawna Morehouse<->William Fleury, Rosanne Fleury<->Steve
  Blumer, Glen Antle<->Jennifer Reimer, Cindy Fleury<->Rene Fleury, Kendra Kusick<->Kyle
  Francis, Amritpal Rai<->Jatinder Kaur
- William left of Shawna — the left/right swap is decided at render time from `px`, so the
  harness asserts the structural equivalent: William and Shawna are one couple unit, and
  William's first in-tree parent lineage sits at a strictly smaller `orderedRoots` index than
  Shawna's (Mary Fleury's tree is left of Sidney Morehouse's), which is what drives the swap
- sibling-group contiguity: arash still has exactly one virtual top node with 3 group roots

Also run: `node narsh2026/our-people/build-guests.js` (clean, pre-existing warnings unchanged,
one new FYI, `sides inherited: 1`) and `node --check narsh2026/our-people/graph.js`.

## Deviations from Plan

None. Two harness-only corrections were made while writing `/tmp/uh9-verify.js` (not repo
code): the six regression marriages had to be resolved by full name because first names are
ambiguous in this data (two Shawnas, two Kyles, three Jatinders), and the `people` "before"
column is taken from the measured baseline table rather than recomputed, since Task 1 had
already changed the generated data by the time the harness runs. No gate was weakened and no
generated output was hand-edited.

## Files

- Changed: `narsh2026/our-people/build-guests.js`, `narsh2026/our-people/graph.js`
- Regenerated by the build: `narsh2026/our-people/guest-data.js`,
  `narsh2026/our-people/index.html` (cache-bust stamp only)
- `narsh2026/our-people/guests.csv` — **unmodified**, as required

## Commits

- `587a579` feat(260803-uh9): a sideless spouse inherits their partner's family side
- `206713c` feat(260803-uh9): nest in-law root lineages at the right generation

## Self-Check: PASSED

All four modified files exist on disk; both commits (`587a579`, `206713c`) are present in
`git log`. `git diff --name-only` against the plan base lists exactly the four expected files
and does not include `guests.csv`.

## Follow-up for Natalie

Neither change can be seen without a browser. When this lands, load
`/narsh2026/our-people/` and switch to Family Tree to confirm visually that Amrit's parents
sit on Rani Kaur's row inside Arash's tree and that Svetomir appears next to Nicole. Push is
left to the orchestrator — this repo has a second contributor, so pull and resolve locally
before pushing.
