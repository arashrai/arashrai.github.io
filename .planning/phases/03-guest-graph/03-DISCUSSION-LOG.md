# Phase 3: Guest Graph - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 3-Guest Graph
**Areas discussed:** Guest data & relationships, Node interaction, Family tree view, Graph visual style

---

## Guest Data & Relationships

### How should guests be connected?

| Option | Description | Selected |
|--------|-------------|----------|
| Typed relationships | Each connection has a label like "college friend", "cousin" | |
| Group-based connections | Guests belong to groups, connections implied by shared membership | |
| Both — groups + some typed edges | Groups define most connections, key relationships get explicit typed edges | ✓ |

**User's choice:** Both — groups + some typed edges

### Roughly how many guests?

| Option | Description | Selected |
|--------|-------------|----------|
| Small (20-40) | Close circle only | |
| Medium (40-80) | Extended family and friend groups | |
| Large (80-150+) | Full guest list or close to it | ✓ |

**User's choice:** Large (80-150+)

### How should the guest data be stored?

| Option | Description | Selected |
|--------|-------------|----------|
| JSON file in the repo | Committed to repo, matches static site pattern | ✓ |
| Google Sheet → JSON export | More collaborative but adds export step | |
| You decide | Claude picks | |

**User's choice:** JSON file in the repo

### Graph centering?

| Option | Description | Selected |
|--------|-------------|----------|
| Couple-centered | All guests radiate from Natalie and Arash | |
| Flat network | No center, natural clustering | |
| Couple-centered with group clusters | Center + visible clusters | |

**User's choice:** Other — "Flat network but with visual cues emphasizing the bride and groom"

### Group categories?

| Option | Description | Selected |
|--------|-------------|----------|
| Relationship-based | Groups like "Arash's family", "College friends" | |
| City-based | Groups like "Seattle", "Waterloo" | |
| Both relationship + city | Each guest tagged with both dimensions | ✓ |

**User's choice:** Both relationship + city

### Couples/families representation?

| Option | Description | Selected |
|--------|-------------|----------|
| Individual nodes | Each person gets their own node | |
| Combined household nodes | Couple/family as one node | |
| You decide | Claude picks | |

**User's choice:** Other — "Combined household nodes in social graph, but individual nodes in family tree view. Friends/coworkers can be families."

### Bride/groom side tagging?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, tag bride/groom side | Extra field for filtering/color coding | |
| No, just use groups | Relationship groups already imply the side | ✓ |

**User's choice:** No, just use groups

### Placeholder or real data?

| Option | Description | Selected |
|--------|-------------|----------|
| Start with placeholder data | ~20-30 fake guests, swap real data later | ✓ |
| Real guests from the start | Populate actual guests during this phase | |

**User's choice:** Start with placeholder data

### Edge type labels?

| Option | Description | Selected |
|--------|-------------|----------|
| Family labels only | Typed edges just for family relationships | |
| Family + special bonds | Family + "best friend", "roommate", etc. | |
| You decide | Claude picks edge types | ✓ |

**User's choice:** You decide

### Tier visibility?

| Option | Description | Selected |
|--------|-------------|----------|
| All guests see the same graph | No tier-gated content | ✓ |
| Tier-aware content | Some guests hidden based on access tier | |

**User's choice:** All guests see the same graph

---

## Node Interaction

### What happens on tap/click?

| Option | Description | Selected |
|--------|-------------|----------|
| Detail card overlay | Floating card near the node | |
| Expand in place | Node grows inline, surrounding nodes push outward | ✓ |
| Side panel | Slide-in panel from edge of screen | |

**User's choice:** Expand in place

### What info shown on expand?

| Option | Description | Selected |
|--------|-------------|----------|
| Name + photo + groups | Clean and simple | |
| Name + photo + groups + fun fact | Personal one-liners, requires writing blurbs | |
| Name + photo + groups + connection to couple | How they know Natalie/Arash | |

**User's choice:** Other — "Whatever information we have on that person. Might be just basic or might be basic + fun fact + connection to couple."

### Connection highlighting?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, highlight connections | Connected nodes light up, non-connected dim | |
| No, just show info | Rest of graph stays as-is | |
| You decide | Claude picks | ✓ |

**User's choice:** You decide

### Search bar?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add a search bar | Text input for finding guests by name | ✓ |
| No, just browse and filter | Explore by panning, zooming, filtering | |
| You decide | Claude picks | |

**User's choice:** Yes, add a search bar

---

## Family Tree View

### Whose families?

| Option | Description | Selected |
|--------|-------------|----------|
| Both families side by side | Connected at the couple | |
| Toggle between families | Pick one family at a time | |
| Single combined tree | One tree rooted at couple | |

**User's choice:** Other — "Default view is both families side by side connected at the couple, but offer filters for 'Natalie's Family' and 'Arash's Family' to simplify."

### Tree depth?

| Option | Description | Selected |
|--------|-------------|----------|
| Parents + siblings | One generation up | |
| Grandparents + parents + siblings | Two generations up | |
| As deep as data allows | No fixed cutoff | ✓ |

**User's choice:** As deep as data allows

### View switching UI?

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle buttons above graph | Clear and discoverable | |
| Tabs | Tab bar with optional dropdown | |
| You decide | Claude picks | ✓ |

**User's choice:** You decide

### Family tree node detail?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, richer tree nodes | Bigger, always show name + photo | ✓ |
| Same as social graph | Expand on click, consistent behavior | |
| You decide | Claude picks | |

**User's choice:** Yes, richer tree nodes

---

## Graph Visual Style

### Node appearance?

| Option | Description | Selected |
|--------|-------------|----------|
| Photo circles | Circular nodes with profile photos or placeholder avatars | ✓ |
| Colored dots with labels | Simple colored circles with name labels | |
| Photo circles for key people, dots for others | Visual hierarchy with mixed node types | |

**User's choice:** Photo circles

### Edge appearance?

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle thin lines | Light, semi-transparent lines | |
| Styled by relationship type | Different line styles per connection type | |
| You decide | Claude picks for readability | ✓ |

**User's choice:** You decide

### Graph background?

| Option | Description | Selected |
|--------|-------------|----------|
| Warm cream (match site) | Same --color-cream as rest of site | ✓ |
| Dark/night mode canvas | Dark background, nodes pop | |
| You decide | Claude picks | |

**User's choice:** Warm cream (match site)

### Group cluster boundaries?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, soft colored regions | Faint rounded blobs behind clusters | ✓ |
| No, just proximity | Natural clustering, no visual boundary | |
| You decide | Claude picks | |

**User's choice:** Yes, soft colored regions

---

## Claude's Discretion

- Graph visualization library selection
- Edge styling approach
- Connection highlighting on node expand
- View switching UI pattern (social graph ↔ family tree)
- Edge type labels for typed edges

## Deferred Ideas

None — discussion stayed within phase scope
