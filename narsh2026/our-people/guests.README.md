# Guest list — how to fill in `guests.csv`

This CSV is the **single source of truth** for the "Our People" page. You fill in
plain, human facts about each guest — one row per person — and Claude compiles it
into `guest-data.js` (all the ids, relationship lines, household bubbles, family
trees, and generation math are generated for you).

Open `guests.csv` in Numbers, Excel, Google Sheets, or any editor. The current rows
are the old **placeholder** people — edit or delete them and add your real guests.

## Columns

| Column | Required | What it does | Example |
|---|---|---|---|
| **name** | ✅ | Full name. Shown on their bubble; the id is derived from it. | `Claire Fleury` |
| **group** | ✅ | Which cluster they belong to. One or more, comma-separated *inside quotes* if multiple. | `Natalie's Family` |
| **relationship** | ✅ | The line on their card describing their tie to you two. | `Natalie's mom` |
| **comes_with** | optional | Name of the spouse/partner they attend as a unit with → merges into one bubble. Only one of the pair needs it. | `Marc Fleury` |
| **parent** | optional | *Family only.* Name their parent (who is also a row). This one link is all Claude needs to build the whole tree. | `Rose Fleury` |
| **fun_fact** | optional | One playful sentence for their card. | `Makes the best rum cake in the Caribbean.` |
| **cities** | optional | Places they've lived, comma-separated *inside quotes*. Powers the future map feature. | `"Grand Cayman, Waterloo"` |
| **photo** | optional | Filename you'll drop into `images/people/`. Blank = nice initials placeholder. | `claire.jpg` |
| **special** | optional | Any extra cross-cluster link worth drawing a line for. Freeform — Claude translates it. | `college roommate of Priya Chakraborty` |

## What you DON'T need to fill in (Claude derives it)

- **Siblings** — anyone sharing the same `parent` becomes siblings automatically.
- **Generations / tree layout** — computed from the `parent` chain + `group`.
- **Which family tree** they belong to — inferred from `group`.
- **Stable ids, relationship edges, household wiring** — all generated.

So most family members only need: name, group, relationship, parent (+ a fun fact).
Most friends only need: name, group, relationship (+ comes_with for couples).

## Groups

These already exist (each has a color in the graph):

- `Natalie's Family`
- `Arash's Family`
- `College Friends`
- `Meta Coworkers`
- `Seattle Friends`

**Want a new group** (e.g. `Cayman Friends`, `Family Friends`)? Just type it in the
`group` column — Claude will add it with a color. A person can be in more than one:
`"Meta Coworkers, Seattle Friends"` (quote it because of the comma).

## CSV tips

- If a value contains a comma (city lists, some fun facts), wrap the whole value in
  double quotes: `"Mumbai, Auckland"`. Spreadsheet apps do this automatically.
- Leave optional cells blank — don't put `N/A` or `-`.
- Keep the header row exactly as-is.

## When you're done

Tell Claude "compile the guest list" and it will regenerate `guest-data.js` from this
file and (optionally) show you the graph before you commit.
