// Narsh 2026 — Guest data compiler
// Reads guests.csv (the human-editable source of truth) and generates
// guest-data.js (consumed by graph.js / graph-ui.js).
//
// Run from anywhere:  node narsh2026/our-people/build-guests.js
//
// The CSV is the ONLY thing you edit by hand. This script derives every
// id, edge, household bubble, and family tree. It prints a summary + any
// unresolved name references to stderr so typos are easy to catch.

"use strict";

const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const CSV_PATH = path.join(DIR, "guests.csv");
const OUT_PATH = path.join(DIR, "guest-data.js");

// ---------------------------------------------------------------------------
// Config: stable ids/colors for known groups; palette for anything new.
// ---------------------------------------------------------------------------
const GROUP_COLORS = {
  "Natalie's Family": "#D4A843",
  "Arash's Family": "#2A9D8F",
  "Meta Coworkers": "#C2704F",
  "Seattleite": "#6B8E9E",
  "Waterloo": "#A8763E",
  "Cayman Crew": "#C9928E",
  "Abby Friends": "#B07D62",
  "Stripe Coworkers": "#8E7CC3"
};
const FALLBACK_PALETTE = ["#7D9D8F", "#A87CA0", "#9E8E6B", "#6B9E8E", "#B5651D", "#8896C9"];

// Force these two to the ids graph.js hardcodes for the family-tree connector.
const FORCED_IDS = {
  "Natalie Fleury": "natalie",
  "Arash Rai": "arash"
};

// ---------------------------------------------------------------------------
// Tiny CSV parser (handles quoted fields with embedded commas + quotes).
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  return rows;
}

const clean = (s) => (s == null ? "" : String(s).trim());
const splitMulti = (s) => clean(s).split(",").map((v) => v.trim()).filter(Boolean);

function toId(name) {
  return clean(name)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Parse rows -> people records
// ---------------------------------------------------------------------------
const raw = fs.readFileSync(CSV_PATH, "utf8");
const rows = parseCSV(raw);
const header = rows.shift().map((h) => h.trim());
const col = (r, name) => {
  const idx = header.indexOf(name);
  return idx >= 0 ? clean(r[idx]) : "";
};

const warnings = [];

// First pass: names, ids, and a name->id lookup (case-insensitive, trimmed).
const people = [];
const idCounts = {};
const nameToId = new Map();

rows.forEach((r) => {
  const name = clean(col(r, "name"));
  if (!name) return;
  let id = FORCED_IDS[name] || toId(name) || "guest";
  if (!FORCED_IDS[name]) {
    if (idCounts[id]) { idCounts[id]++; id = id + "-" + idCounts[id]; }
    else { idCounts[id] = 1; }
  }
  const p = {
    id,
    name,
    groupsRaw: splitMulti(col(r, "group")),
    relationship: clean(col(r, "relationship")),
    comesWithRaw: splitMulti(col(r, "comes_with")),
    parentsRaw: splitMulti(col(r, "parent")),
    funFact: clean(col(r, "fun_fact")),
    citiesRaw: splitMulti(col(r, "cities")),
    photo: clean(col(r, "photo")),
    special: clean(col(r, "special"))
  };
  people.push(p);
  nameToId.set(name.toLowerCase(), id);
});

const resolveName = (name, context) => {
  const key = clean(name).toLowerCase();
  if (nameToId.has(key)) return nameToId.get(key);
  warnings.push(`Unresolved name "${name}" referenced in ${context} — no matching guest row.`);
  return null;
};

// ---------------------------------------------------------------------------
// Groups & cities
// ---------------------------------------------------------------------------
const groupLabelToId = new Map();
const GROUPS = [];
let fallbackIdx = 0;
const ensureGroup = (label) => {
  if (groupLabelToId.has(label)) return groupLabelToId.get(label);
  const id = toId(label);
  const color = GROUP_COLORS[label] || FALLBACK_PALETTE[fallbackIdx++ % FALLBACK_PALETTE.length];
  groupLabelToId.set(label, id);
  GROUPS.push({ id, label, color });
  return id;
};

const cityLabelToId = new Map();
const CITIES = [];
const ensureCity = (label) => {
  if (cityLabelToId.has(label)) return cityLabelToId.get(label);
  const id = toId(label);
  cityLabelToId.set(label, id);
  CITIES.push({ id, label });
  return id;
};

people.forEach((p) => {
  p.groups = p.groupsRaw.map(ensureGroup);
  p.cities = p.citiesRaw.map(ensureCity);
  p.isCouple = p.id === "natalie" || p.id === "arash";
  p.parentIds = p.parentsRaw
    .map((n) => resolveName(n, `parent of "${p.name}"`))
    .filter((pid) => pid && pid !== p.id);
  p.comesWithIds = p.comesWithRaw
    .map((n) => resolveName(n, `comes_with of "${p.name}"`))
    .filter((cid) => cid && cid !== p.id);
});

// ---------------------------------------------------------------------------
// Households: union-find over comes_with pairs
// ---------------------------------------------------------------------------
const parentUF = {};
const find = (x) => { while (parentUF[x] !== x) { parentUF[x] = parentUF[parentUF[x]]; x = parentUF[x]; } return x; };
const union = (a, b) => { parentUF[find(a)] = find(b); };
people.forEach((p) => { parentUF[p.id] = p.id; });
people.forEach((p) => p.comesWithIds.forEach((cid) => union(p.id, cid)));

const compMembers = {};
people.forEach((p) => {
  const root = find(p.id);
  (compMembers[root] = compMembers[root] || []).push(p.id);
});

const byId = new Map(people.map((p) => [p.id, p]));
const firstName = (id) => (byId.get(id) ? byId.get(id).name.split(" ")[0] : id);
const householdOf = new Map(); // memberId -> householdId
const HOUSEHOLDS = [];
Object.values(compMembers).forEach((members) => {
  if (members.length < 2) return;
  // Keep couple (natalie/arash) out of households so they render as solo bubbles.
  if (members.includes("natalie") || members.includes("arash")) return;
  const hid = "household-" + members.slice().sort()[0];
  const names = members.map(firstName);
  const displayName = names.length === 2
    ? names.join(" & ")
    : names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
  HOUSEHOLDS.push({ id: hid, members, displayName });
  members.forEach((m) => householdOf.set(m, hid));
});

// ---------------------------------------------------------------------------
// Edges: couple, parent, sibling
// ---------------------------------------------------------------------------
const EDGES = [];
const edgeSeen = new Set();
const addEdge = (a, b, type) => {
  if (!a || !b || a === b) return;
  const key = [a, b].sort().join("--") + ":" + type;
  if (edgeSeen.has(key)) return;
  edgeSeen.add(key);
  EDGES.push({ source: a, target: b, type });
};

// Couple centerpiece
if (byId.has("natalie") && byId.has("arash")) addEdge("natalie", "arash", "couple");

// Parent edges
people.forEach((p) => p.parentIds.forEach((pid) => addEdge(p.id, pid, "parent")));

// Sibling edges (share at least one parent)
const childrenByParent = {};
people.forEach((p) => p.parentIds.forEach((pid) => {
  (childrenByParent[pid] = childrenByParent[pid] || []).push(p.id);
}));
Object.values(childrenByParent).forEach((kids) => {
  for (let i = 0; i < kids.length; i++)
    for (let j = i + 1; j < kids.length; j++)
      addEdge(kids[i], kids[j], "sibling");
});

// ---------------------------------------------------------------------------
// Family trees (natalie / arash sides). Single-parent selection; wrap a
// forest under a synthetic side-root so the tree view never crashes.
// ---------------------------------------------------------------------------
function buildTree(familyGroupId, sideLabel, sideKey) {
  const members = people.filter((p) => p.groups.includes(familyGroupId));
  if (!members.length) return { id: sideKey + "-family-root", name: sideLabel, children: [] };
  const memberIds = new Set(members.map((m) => m.id));
  const firstParentInFamily = (p) => p.parentIds.find((pid) => memberIds.has(pid)) || null;
  const kidsOf = {};
  members.forEach((m) => {
    const fp = firstParentInFamily(m);
    if (fp) (kidsOf[fp] = kidsOf[fp] || []).push(m.id);
  });
  const node = (id) => ({ id, name: byId.get(id).name, children: (kidsOf[id] || []).map(node) });
  const roots = members.filter((m) => !firstParentInFamily(m)).map((m) => m.id);
  if (roots.length === 1) return node(roots[0]);
  return { id: sideKey + "-family-root", name: sideLabel, children: roots.map(node) };
}

const FAMILY_TREES = {
  natalie: buildTree(groupLabelToId.get("Natalie's Family"), "Natalie's Family", "natalie"),
  arash: buildTree(groupLabelToId.get("Arash's Family"), "Arash's Family", "arash")
};

// ---------------------------------------------------------------------------
// Assemble GUESTS records
// ---------------------------------------------------------------------------
const PEOPLE_IMG_DIR = path.join(DIR, "..", "images", "people");
const photoPath = (file) => {
  if (!file) return null;
  if (fs.existsSync(path.join(PEOPLE_IMG_DIR, file))) return "/narsh2026/images/people/" + file;
  warnings.push(`Photo "${file}" not found in images/people/ — using initials fallback until it's added.`);
  return null;
};

const GUESTS = people.map((p) => ({
  id: p.id,
  name: p.name,
  photo: photoPath(p.photo),
  groups: p.groups,
  cities: p.cities,
  isCouple: p.isCouple,
  funFact: p.funFact || null,
  connectionToCouple: p.relationship || null,
  householdId: householdOf.get(p.id) || null,
  familyTree: null
}));

// ---------------------------------------------------------------------------
// Emit guest-data.js
// ---------------------------------------------------------------------------
const j = (v) => JSON.stringify(v, null, 2).replace(/\n/g, "\n  ");
const out = `// Narsh 2026 — Guest Data Module
// AUTO-GENERATED by build-guests.js from guests.csv — do not edit by hand.
// To change guests, edit guests.csv and re-run: node narsh2026/our-people/build-guests.js

const NARSH_GUESTS = (() => {
  "use strict";

  const GROUPS = ${j(GROUPS)};

  const CITIES = ${j(CITIES)};

  const GUESTS = ${j(GUESTS)};

  const EDGES = ${j(EDGES)};

  const HOUSEHOLDS = ${j(HOUSEHOLDS)};

  const FAMILY_TREES = ${j(FAMILY_TREES)};

  const getGuestById = (id) => GUESTS.find(g => g.id === id) || null;
  const getGuestsByGroup = (groupId) => GUESTS.filter(g => g.groups.includes(groupId));
  const getGuestsByCity = (cityId) => GUESTS.filter(g => g.cities.includes(cityId));
  const searchGuests = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return GUESTS.filter(g => g.name.toLowerCase().includes(q));
  };

  const getSocialNodes = () => {
    const householdMap = new Map();
    HOUSEHOLDS.forEach(h => { h.members.forEach(m => householdMap.set(m, h)); });
    const processed = new Set();
    const socialNodes = [];
    GUESTS.forEach(guest => {
      if (processed.has(guest.id)) return;
      const household = householdMap.get(guest.id);
      if (household) {
        household.members.forEach(m => processed.add(m));
        const members = household.members.map(m => getGuestById(m)).filter(Boolean);
        const allGroups = [...new Set(members.flatMap(m => m.groups))];
        const allCities = [...new Set(members.flatMap(m => m.cities))];
        const photo = members.find(m => m.photo)?.photo || null;
        const isCouple = members.some(m => m.isCouple);
        socialNodes.push({
          id: household.id, name: household.displayName, photo,
          groups: allGroups, cities: allCities, isCouple,
          memberIds: household.members, isHousehold: true
        });
      } else {
        processed.add(guest.id);
        socialNodes.push({
          id: guest.id, name: guest.name, photo: guest.photo,
          groups: guest.groups, cities: guest.cities, isCouple: guest.isCouple,
          memberIds: [guest.id], isHousehold: false
        });
      }
    });
    return socialNodes;
  };

  const getSocialEdges = (socialNodes) => {
    const nodeIdSet = new Set(socialNodes.map(n => n.id));
    const memberToNodeId = new Map();
    socialNodes.forEach(n => { n.memberIds.forEach(m => memberToNodeId.set(m, n.id)); });
    const edgeSet = new Set();
    const remapped = [];
    EDGES.forEach(edge => {
      const sourceId = memberToNodeId.get(edge.source) || edge.source;
      const targetId = memberToNodeId.get(edge.target) || edge.target;
      if (sourceId === targetId) return;
      if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;
      const key = [sourceId, targetId].sort().join("--");
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      remapped.push({ source: sourceId, target: targetId, type: edge.type });
    });
    return remapped;
  };

  return {
    GROUPS, CITIES, GUESTS, EDGES, HOUSEHOLDS, FAMILY_TREES,
    getGuestById, getGuestsByGroup, getGuestsByCity, searchGuests,
    getSocialNodes, getSocialEdges
  };
})();
`;

fs.writeFileSync(OUT_PATH, out);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.error("Wrote " + path.relative(process.cwd(), OUT_PATH));
console.error("  guests:     " + GUESTS.length);
console.error("  groups:     " + GROUPS.map((g) => g.label).join(", "));
console.error("  households: " + HOUSEHOLDS.length);
console.error("  edges:      " + EDGES.length + " (couple/parent/sibling)");
console.error("  couple in data: natalie=" + byId.has("natalie") + " arash=" + byId.has("arash"));
if (warnings.length) {
  console.error("\n  " + warnings.length + " warning(s):");
  [...new Set(warnings)].forEach((w) => console.error("   - " + w));
} else {
  console.error("  no unresolved references ✓");
}
