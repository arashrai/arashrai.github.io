---
phase: 260803-tdv
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - narsh2026/our-people/build-guests.js
  - narsh2026/our-people/graph.js
  - narsh2026/our-people/guests.README.md
  - narsh2026/our-people/guest-data.js   # GENERATED — never hand-edit
  - narsh2026/our-people/index.html      # GENERATED cache-bust stamp only
autonomous: true
requirements: [R1-sibling-column, R2a-blood-spine, R2b-sibling-roots, R3-hygiene, R4-readme]

must_haves:
  truths:
    - "build-guests.js reads the `sibling` CSV column and resolves names with the existing warning style"
    - "Sibling links are bidirectional and transitive: three sibling sets collapse to two groups"
    - "Every pair inside a sibling set gets a `sibling` EDGE, and existing shared-parent sibling edges still emit"
    - "SIBLING_GROUPS is exported from guest-data.js and every id in it is a real guest"
    - "A sibling-only relative lands on the correct family side (floodSide traverses sibling links)"
    - "Arash's side renders fewer root lineages than the current 8"
    - "Neither side's non-hierarchy parent-edge count increases (natalie <= 1, arash <= 3)"
    - "Balbir Rai / Navi's grandparents / Isha's grandparents render as one contiguous block"
    - "No person becomes their own ancestor"
    - "The `...` junk row is skipped with a warning; the 14 empty-group rows get one summary warning"
    - "guests.README.md documents the `sibling` column"
  artifacts:
    - path: "narsh2026/our-people/build-guests.js"
      provides: "sibling parsing, sibling union-find, parent inference, SIBLING_GROUPS emit, hygiene warnings"
      contains: "SIBLING_GROUPS"
    - path: "narsh2026/our-people/guest-data.js"
      provides: "generated SIBLING_GROUPS + sibling edges"
      contains: "SIBLING_GROUPS"
    - path: "narsh2026/our-people/graph.js"
      provides: "blood-distance spine selection + virtual sibling-set roots in layoutSide"
      contains: "SIBLING_GROUPS"
    - path: "narsh2026/our-people/guests.README.md"
      provides: "sibling column documentation"
      contains: "sibling"
  key_links:
    - from: "narsh2026/our-people/build-guests.js"
      to: "guest-data.js return object"
      via: "SIBLING_GROUPS added to the module's returned object"
      pattern: "GROUPS, CITIES, GUESTS, EDGES, HOUSEHOLDS, MARRIAGES, SIBLING_GROUPS"
    - from: "narsh2026/our-people/graph.js layoutSide"
      to: "NARSH_GUESTS.SIBLING_GROUPS"
      via: "reads groups to build virtual roots"
      pattern: "NARSH_GUESTS\\.SIBLING_GROUPS"
---

<objective>
Teach the guest compiler the new `sibling` CSV column and cut crossing lines in the
family tree by giving `layoutSide` a deliberate spine and by nesting parentless
sibling root lineages under a single virtual root.

Purpose: Natalie added a `sibling` column to express siblings whose shared parents
are not in the data. Nothing reads it today, and Arash's side of the tree now renders
as 8 disconnected lineages laid out side by side — the source of the long crossing edges.

Output: `sibling` parsed into edges + sibling groups + side flooding; `SIBLING_GROUPS`
exported; `layoutSide` picks the bloodline spine and collapses parentless sibling roots
into one lineage; README documents the column; a structural harness proves it.
</objective>

<execution_context>
@/Users/nataliefleury/programming/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@narsh2026/our-people/build-guests.js
@narsh2026/our-people/guests.README.md
@.planning/HANDOFF-our-people.md
@./CLAUDE.md

Read only these ranges of the 1599-line graph.js:
- `graph.js:37-41` — layout constants
- `graph.js:1286-1424` — `layoutSide` (the only function you modify)
- `graph.js:1078-1279` — `renderFamilyTree` (read for contract only; DO NOT MODIFY)
</context>

<measured_baseline>
Run against the CURRENT generated `guest-data.js`. These are facts, not estimates.

| side    | people | units | root lineages | non-hierarchy parent edges |
|---------|--------|-------|---------------|----------------------------|
| natalie | 31     | 26    | 2             | 1                          |
| arash   | 48     | 35    | 8             | 3                          |

Arash's 8 roots: `Balbir Rai` | `Upneet's grandpa` | `Navi's grandpa+grandma` |
`Isha's grandpa+grandma` | `Jasan's grandma+grandpa` | `Amrit's mom+dad` |
`Gurnoor Boparai` | `Jatinder's mom+dad`.

The 6 CSV rows using `sibling`, and their **actual** parent/spouse context:

| person              | sibling           | parent                          | comes_with     |
|---------------------|-------------------|---------------------------------|----------------|
| Kiran Kaur          | Upneet's mom      | (none)                          | Gurpreet Rai   |
| Balbir Rai          | Navi's grandpa    | (none)                          | (none)         |
| Upneet's mom        | Kiran Kaur        | (none)                          | Gurpreet Bala  |
| Navi's grandpa      | Balbir Rai        | (none)                          | (none)         |
| Isha's grandpa      | Balbir Rai        | (none)                          | (none)         |
| Gurinder Khangura   | Kiran Kaur        | Jasan's grandma, Jasan's grandpa| (none)         |

Transitive closure → two sets:
- **Set A** = `balbir-rai`, `navis-grandpa`, `ishas-grandpa` — no parents anywhere in the set.
- **Set B** = `kiran-kaur`, `upneets-mom`, `gurinder-khangura` — Gurinder has parents.

## Two measured corrections to the brief — read before you start

**(1) Merging inferred parents into `GUESTS[].parents` makes the tree WORSE.**
Simulated: propagating Set B's parents into `parents` leaves arash's roots at **8**
(no change) and raises non-hierarchy edges **3 → 6**, violating the acceptance gate.

Why: both parentless Set B members already sit in units that have a parent unit
*through their spouse* — `Kiran Kaur` is married to `Gurpreet Rai` (child of `Balbir Rai`),
and `Upneet's mom` is married to `Gurpreet Bala` (child of `Upneet's grandpa`). Neither
unit is a root, so inference cannot collapse a root; it only adds 3 cross-unit parent
links that can never sit on the spine, each drawn as a long solid line.

**Therefore:** inferred parents are emitted on a NEW `inferredParents` field, not merged
into `parents`. `parents` stays CSV-authored, so the drawn parentage lines and the unit
hierarchy are unchanged. `inferredParents` still feeds side flooding, sibling edges, the
cycle guard, and the informational note to Natalie.

**(2) Blood-distance spine selection alone changes nothing on today's data** (arash
non-hierarchy stays 3 either way) — the existing iteration order already happens to pick
the bloodline parent in every conflicting unit. Implement it anyway: it is the correct
rule and it protects against regressions as Natalie adds rows. Do NOT expect it to move
the numbers.

**(3) What actually drops the root count: virtual sibling roots.** Set A is three root
units that are genuinely siblings with no representable parents. Nesting them under one
*unrendered* virtual hierarchy node turns 3 root lineages into 1 → arash **8 → 6**, and
makes them contiguous by construction (a stronger guarantee than reordering).
</measured_baseline>

<tasks>

<task type="auto">
  <name>Task 1: Parse the sibling column, emit SIBLING_GROUPS, add hygiene warnings</name>
  <files>narsh2026/our-people/build-guests.js, narsh2026/our-people/guests.README.md</files>
  <action>
Edit `build-guests.js`. Follow CLAUDE.md style: 2-space indent, double quotes, semicolons,
`const` (the file already uses `let` inside the CSV parser loop — leave that alone).

**1a. Skip the junk row (R3).** In the first `rows.forEach` pass (~line 105), after
`const name = clean(col(r, "name"));` and the existing `if (!name) return;`, add a guard
that skips names containing no alphanumeric character — test with a regex for at least one
`[A-Za-z0-9]`. On skip, push a warning naming the literal cell value and telling Natalie to
delete the row. This catches the `...` row (CSV line 105).

**1b. Read the column.** Add `siblingsRaw: splitMulti(col(r, "sibling"))` to the person
record `p` alongside `parentsRaw`. In the later `people.forEach` that resolves
`comesWithIds`/`parentIds`, add `p.siblingIds` resolved via
`resolveName(n, "sibling of \"" + p.name + "\"")`, filtered to drop nulls and self.

**1c. Sibling union-find (R1).** After the sibling ids are resolved and BEFORE the
"Edges" section, build a second, independent union-find over `p.siblingIds` (do NOT reuse
the household `parentUF` — that one is keyed to `comes_with`). Treat every link as
bidirectional. Collect components with 2+ members into `SIBLING_GROUPS`, an array of
arrays of guest ids. Sort each group's ids by CSV row order so output is deterministic,
and sort the groups by their first member's row index. Expect exactly two groups on the
current CSV.

**1d. Parent inference with a cycle guard (R1).** For each sibling group, compute the union
of all members' `parentIds`, minus any id that is itself in the group. Assign it to a new
`p.inferredParents` array on each member — but only the ids not already in that member's
`parentIds`. **Do NOT merge into `p.parentIds`** — see measured correction (1) above;
merging regresses the layout gate.

Guard against cycles before accepting each inferred link: write a helper that walks the
ancestor chain of a candidate parent over the combined `parentIds + inferredParents`
graph (iterative, with a visited set and a hard step cap) and returns true if the member
being assigned is reachable. If it is, skip that single link and push a warning naming
both people and saying the sibling link would make them their own ancestor. Members with
no parents anywhere in their group get an empty `inferredParents` — that is Set A and is
expected.

For each person that gained at least one inferred parent, push an informational note to
`warnings` in the existing style: name the person, the inferred parent name(s), and which
sibling the inference came through, so Natalie can see what was deduced for her.

**1e. Sibling edges (R1).** In the Edges section, after the existing shared-parent sibling
loop, add a second loop over `SIBLING_GROUPS` emitting `addEdge(a, b, "sibling")` for every
unordered pair inside each group. `addEdge` already dedupes by sorted-key + type, so the
two sources union cleanly. Do not remove or alter the shared-parent loop.

**1f. Sides (R1).** In `floodSide`, extend the `neighbors` array to include the person's
sibling ids and their `inferredParents`, plus the reverse: build a `siblingsOf` adjacency
map (mirrored, so one-directional CSV entries traverse both ways) the same way
`childrenOf` is built, and include `siblingsOf[x]` in `neighbors`. Also include children
implied by `inferredParents` by folding them into the existing `childrenOf` map
construction. This ensures a sibling-only relative lands on the right side.

**1g. Empty-group summary (R3).** After the people loop, collect every person whose
`groupsRaw` is empty and, if any exist, push ONE warning listing all their names
comma-separated (expect 14). Do not change the behaviour of ungrouped people.

**1h. Emit.** Add `const SIBLING_GROUPS = ${j(SIBLING_GROUPS)};` to the generated module
body next to `MARRIAGES`, and add `SIBLING_GROUPS` to the module's returned object
(`GROUPS, CITIES, GUESTS, EDGES, HOUSEHOLDS, MARRIAGES, SIBLING_GROUPS, ...`). Add
`inferredParents: p.inferredParents` to each record in the `GUESTS` map. Add a summary
line to the stderr report: `"  sibling sets: " + SIBLING_GROUPS.length`.

**1i. README (R4).** In `guests.README.md`: add a `**sibling**` row to the Columns table
(optional; "*Family only.* Name a brother or sister when their shared parents aren't rows
in this file."; example `Navi's grandpa`). Under "What you DON'T need to fill in", amend the
existing **Siblings** bullet to note that same-`parent` people are still automatic and
`sibling` is only the fallback. In "How the Family Tree view works", add a short
**Sibling links** bullet stating: it is for siblings whose shared parents aren't in the
data; it is **transitive** (A↔B and B↔C makes all three siblings); **one direction is
enough**; parents known for any member are **inferred** for the whole set and the build
prints exactly what it deduced; and sibling sets with no parents at all are drawn as one
adjacent block in the tree.

Finally regenerate: `node narsh2026/our-people/build-guests.js`. `guest-data.js` and the
`?v=` stamp in `index.html` will change — that is expected. Never hand-edit either.
  </action>
  <verify>
    <automated>cd /Users/nataliefleury/programming/arashrai.github.io &amp;&amp; node narsh2026/our-people/build-guests.js 2>&amp;1 | tee /tmp/build.log; node -e 'const fs=require("fs");const NG=eval(fs.readFileSync("narsh2026/our-people/guest-data.js","utf8")+"\nNARSH_GUESTS");const ids=new Set(NG.GUESTS.map(g=>g.id));if(!Array.isArray(NG.SIBLING_GROUPS))throw new Error("SIBLING_GROUPS missing");if(NG.SIBLING_GROUPS.length!==2)throw new Error("expected 2 sibling sets, got "+NG.SIBLING_GROUPS.length);NG.SIBLING_GROUPS.flat().forEach(id=>{if(!ids.has(id))throw new Error("phantom id in SIBLING_GROUPS: "+id);});const sizes=NG.SIBLING_GROUPS.map(g=>g.length).sort();if(sizes.join()!=="3,3")throw new Error("expected two sets of 3, got "+sizes.join());if(NG.GUESTS.some(g=>/^[^A-Za-z0-9]+$/.test(g.name)))throw new Error("junk row not skipped");if(NG.GUESTS.length!==148)throw new Error("expected 148 guests after junk-row skip, got "+NG.GUESTS.length);console.log("task1 OK: guests="+NG.GUESTS.length+" siblingSets="+NG.SIBLING_GROUPS.length);'</automated>
  </verify>
  <done>
`SIBLING_GROUPS` exports two 3-member sets of real guest ids; guest count is 148 (junk row
skipped); build stderr shows the junk-row warning, the empty-group summary listing 14 names,
the inferred-parent notes for Set B, and the pre-existing `Bhupinder Boparai` unresolved-name
warning; README documents the column.
  </done>
</task>

<task type="auto">
  <name>Task 2: Deliberate spine + virtual sibling roots in layoutSide</name>
  <files>narsh2026/our-people/graph.js</files>
  <action>
Modify ONLY `layoutSide` (`graph.js:1286-1424`). Do not touch `renderFamilyTree`, the
drawing helpers, or any constant. This is a layout-ordering change.

**2a. Blood-distance spine (R2a).** Replace the `primaryParentUnit` loop
(`graph.js:1309-1319`), which takes whichever parent it finds first in iteration order.

First compute `bloodDist`: a BFS from `target` (`natalie` / `arash`) over undirected
parent↔child links restricted to this side. Build a `childrenOfId` map from
`inSideParents` the same way the existing `radj` block does, then BFS from `target`
recording hop counts. People not reached have no entry (treat as `Infinity`).

Then for each unit, gather every candidate `{ memberId, parentUnit }` pair across all its
members' `inSideParents` where `unitOf[p]` exists and differs from the unit. If there are
no candidates, `primaryParentUnit[u] = null` (unchanged root semantics — do not alter which
units are roots). Otherwise pick the candidate whose `memberId` has the smallest finite
`bloodDist`. Break ties, and resolve the all-`Infinity` case, with the existing behaviour:
the candidate that appears first in member iteration order — i.e. use a **stable** sort so
today's output is preserved when no blood signal exists.

Expected effect on current data: none of the measured numbers move. That is correct.
The rule exists so a married-in branch can never steal the trunk as rows are added.

**2b. Virtual sibling roots (R2b).** After `rootUnits` is computed and before the
`radj` / root-ordering block, group root units that belong to the same sibling set.

Read `NARSH_GUESTS.SIBLING_GROUPS` (guard for `undefined` so an older cached
`guest-data.js` degrades to today's behaviour rather than throwing). For each sibling
group, collect the distinct root units `u` such that some member of `u` is in that
sibling group **and** that member has no `inSideParents`. Only groups yielding 2+ such
root units qualify — on current data that is Set A (`Balbir Rai`, `Navi's grandpa+grandma`,
`Isha's grandpa+grandma`); Set B yields 0 because none of its members sit in root units.

For each qualifying group, create a virtual hierarchy node (use a sentinel key that cannot
collide with a guest id, e.g. `"__sibgroup-" + index`) whose children are those root units,
and replace those units in the top-level lineage list with the single virtual node. Order
the virtual node's children with the existing `orderEdge` helper so the subtree containing
the target still lands on the inner edge (Balbir's subtree leftmost for Arash).

Extend the existing `containsTarget` / `rootAncestor` / `radj` logic to treat a virtual node
as containing the target if any child does, so the target lineage is still ordered to the
inner edge across the side.

**2c. Render the virtual node as nothing.** In the `orderedRoots.forEach` block
(`graph.js:1387-1421`), the `build` recursion must yield the virtual node's children as its
`children`. When walking `root.each`, **skip emitting nodes for virtual entries** (no entry
in `unitMembers`). Because `d3.tree()` puts the virtual node at `d.y === 0` and pushes its
children to `d.y === TREE_V_SPACING`, subtract `TREE_V_SPACING` from every `d.y` in that
subtree so real people still start at `topY` and generations stay aligned with the other
root lineages. Leave the `minX`/`maxX`/`shift`/`cursorX` arithmetic otherwise as-is.

Do not change `TREE_H_SPACING`, `TREE_V_SPACING`, `TREE_ROOT_GAP`, `TREE_SIDE_GAP`, or
`TREE_MEMBER_OFFSET`.
  </action>
  <verify>
    <automated>cd /Users/nataliefleury/programming/arashrai.github.io &amp;&amp; node --check narsh2026/our-people/graph.js &amp;&amp; node -e 'const s=require("fs").readFileSync("narsh2026/our-people/graph.js","utf8");const body=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");if(!/NARSH_GUESTS\.SIBLING_GROUPS/.test(body))throw new Error("layoutSide does not read SIBLING_GROUPS");if(!/bloodDist/.test(body))throw new Error("blood-distance spine not implemented");if(/const TREE_V_SPACING = 160/.test(s)===false)throw new Error("layout constant changed");console.log("task2 OK");'</automated>
  </verify>
  <done>
`graph.js` parses; `layoutSide` reads `NARSH_GUESTS.SIBLING_GROUPS`, computes `bloodDist`,
and nests qualifying parentless sibling roots under an unrendered virtual node; layout
constants and `renderFamilyTree` are byte-identical to before.
  </done>
</task>

<task type="auto">
  <name>Task 3: Structural verification harness — before/after metrics + regression guard</name>
  <files>/tmp/verify-tree.js (throwaway, NOT committed)</files>
  <action>
This sandbox cannot launch a browser, so verification is structural. Write
`/tmp/verify-tree.js` (keep it out of the repo — the plan's committed file set is
build-guests.js, graph.js, guests.README.md, plus the two generated files).

The script must:

1. `eval` `narsh2026/our-people/guest-data.js` and grab `NARSH_GUESTS`.
2. Re-implement `layoutSide`'s unit/root computation exactly as shipped in Task 2:
   marriage union-find → units; `bloodDist` BFS from the side target; blood-distance
   `primaryParentUnit`; `rootUnits`; virtual sibling-root grouping from `SIBLING_GROUPS`.
   Keep it a faithful mirror — if it disagrees with `graph.js`, fix the mirror, not the gate.
3. For BOTH sides print `people`, `units`, **root lineages** (top-level entries after
   virtual grouping), and **non-hierarchy parent-edge count** (in-side cross-unit parent
   links whose parent unit is not the child unit's `primaryParentUnit`), alongside the
   hardcoded baseline below, as a before/after table.
4. Assert, exiting non-zero with a clear message on any failure:
   - `natalie`: roots &lt;= 2 and nonHierarchy &lt;= 1  (baseline 2 / 1)
   - `arash`: roots &lt;= 6 **and strictly &lt; 8**, nonHierarchy &lt;= 3  (baseline 8 / 3)
   - Set A's three units resolve to ONE top-level lineage (contiguity by construction)
   - no parentage cycle: walking `parents` ∪ `inferredParents` from every guest never
     revisits the start (iterative, visited set, step cap)
   - every id in `SIBLING_GROUPS` is a real guest id, and no id appears in two groups
   - all six regression marriages present in `MARRIAGES` (unordered pairs):
     Shawna↔William, Rosanne↔Steve, Glen↔Jennifer, Cindy↔Rene, Kendra↔Kyle,
     Amritpal↔Jatinder — resolve ids by name lookup, fail loudly if a name is missing
   - `natalie` and `arash` each sit in their side's inner-edge lineage: for the `natalie`
     side the target lineage is LAST in the ordered top-level list; for `arash` it is FIRST
   - `GUESTS[].parents` for the six sibling-column people is unchanged from CSV (proves
     inference did not leak into `parents` and regress the drawn lines)

Baseline constants to hardcode in the script:
`{ natalie: { people: 31, units: 26, roots: 2, nonHier: 1 }, arash: { people: 48, units: 35, roots: 8, nonHier: 3 } }`

Note in the printed output that `people` will read 148 total (147 across the two sides plus
non-family rows) because the `...` junk row is now skipped — a per-side people delta of at
most 1 on the natalie side is expected and not a failure. Assert `people` only as
`&gt;= baseline - 1`.

Run it and paste the table into the completion summary.
  </action>
  <verify>
    <automated>cd /Users/nataliefleury/programming/arashrai.github.io &amp;&amp; node /tmp/verify-tree.js</automated>
  </verify>
  <done>
`node /tmp/verify-tree.js` exits 0 and prints a before/after table showing arash root
lineages dropped from 8 to 6 with non-hierarchy edges still at 3, natalie unchanged at
2 / 1, and all cycle / SIBLING_GROUPS / marriage / inner-edge assertions passing.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| guests.csv → build-guests.js | Hand-authored by Natalie on a trusted machine; not user-submitted |
| guest-data.js → browser | Generated JSON literals embedded in a static script served over GitHub Pages |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260803-01 | Tampering | `guests.csv` names embedded into `guest-data.js` | mitigate | Emit exclusively via `JSON.stringify` (existing `j()` helper) — never string concatenation — so a quote or `</script>` in a name cannot break out |
| T-260803-02 | Denial of Service | sibling union-find / cycle guard / ancestor walk in `build-guests.js` | mitigate | All graph walks are iterative with a visited set and a hard step cap; a malformed self-referential sibling chain warns and skips instead of hanging the build |
| T-260803-03 | Information Disclosure | guest names, cities, fun facts in a public static file | accept | Pre-existing product decision; the page sits behind the `narsh2026` email gate and this change adds no new fields |
</threat_model>

<verification>
1. `node narsh2026/our-people/build-guests.js` — clean run, warnings include the junk row,
   the 14-name empty-group summary, the Set B inferred-parent notes, and the pre-existing
   `Bhupinder Boparai` unresolved-name warning.
2. `node --check narsh2026/our-people/graph.js` — parses.
3. `node /tmp/verify-tree.js` — exits 0, all gates green.
4. `git diff --stat` shows exactly: `build-guests.js`, `graph.js`, `guests.README.md`,
   `guest-data.js`, `index.html`. **`guests.csv` must NOT appear.**
</verification>

<success_criteria>
- `sibling` column parsed, transitive, one-direction-tolerant; unresolved names warn in the existing style
- `SIBLING_GROUPS` exported with two 3-member sets of real guest ids and wired into the module return object
- Sibling edges emitted for every in-set pair; shared-parent sibling edges still emitted
- Parent inference recorded on `inferredParents`, cycle-guarded, with a per-person informational note
- Sibling links feed `floodSide`
- Arash root lineages: **8 → 6**; non-hierarchy parent edges: natalie ≤ 1, arash ≤ 3
- Set A renders as one contiguous lineage; Natalie/Arash still at their inner edges
- All six regression marriages intact; `renderFamilyTree` and layout constants untouched
- README documents the column in both the table and the family-tree section
- `guests.csv` unmodified; `guest-data.js` regenerated, never hand-edited
</success_criteria>

<output>
After completion, create
`.planning/quick/260803-tdv-support-the-sibling-column-in-guests-csv/260803-tdv-SUMMARY.md`
including the before/after metrics table from Task 3.
</output>
