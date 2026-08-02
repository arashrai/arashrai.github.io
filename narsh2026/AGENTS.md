# Narsh 2026 — Architecture & Developer Guide

Welcome to the `narsh2026` codebase! This folder contains the wedding website for **Natalie Fleury & Arash Rai** (September 2026 in Kelowna, BC).

This site is built to be personality-forward, whimsical, and highly interactive. It goes beyond standard event logistics by offering a scrollytelling map of Natalie and Arash's journey, an interactive D3.js guest relationship graph, a custom logic puzzle game, animated ambient cats, and password-gated event details.

---

## 1. High-Level Architecture & Tech Stack

- **Hosting Platform**: GitHub Pages served via custom domain `arashrai.com/narsh2026/`.
- **No Build Step**: Native HTML5, CSS3, and modern ES6 JavaScript (IIFE modules, no bundler, no framework). Changes pushed to `main` deploy immediately.
- **External CDN Dependencies**:
  - [Mapbox GL JS v3.9.4](https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js) — Interactive 3D map for `our-story/`
  - [D3.js v7](https://cdn.jsdelivr.net/npm/d3@7) — Force-directed relationship graph & tree layout for `our-people/`
  - [Google Fonts](https://fonts.googleapis.com) — *Playfair Display* (headings) & *Source Sans 3* (body text)
- **Local Data & Scripts**: Node.js helper script `build-guests.js` compiles `guests.csv` into static `guest-data.js`.

---

## 2. Shared Core Modules & System Design

### 🔑 Authentication & Tier Gating ([`auth.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/auth.js))
Access to event details is gated behind a password form on the landing page ([`index.html`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/index.html)).
- **SHA-256 Hashing**: Passwords are hashed client-side via `crypto.subtle.digest("SHA-256", ...)`.
- **Two Access Tiers**:
  1. `"day2"`: Access to Saturday wedding events only (Anand Karaj & Reception).
  2. `"full"`: Access to all events, including Thursday pre-wedding celebrations (Mendi, Maiyan & Jago).
- **DOM Visibility Control**: Elements tagged with `data-tier="full"` are automatically hidden for `"day2"` guests via `NARSH_AUTH.applyTierVisibility(tier)`.
- **FOUC Prevention**: Subpages start with `class="auth-pending"` on `<body>` (which hides `<main>`), removed once authentication state is validated.
- **Session Persistence**: Saved in `localStorage` under `narsh-tier`.
- **Regenerating Hashes**:
  ```bash
  node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
  ```

### 🎨 Design System & Palette ([`styles.css`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/styles.css))
All styles share a cohesive **Sunset Warm Palette**:
- `--color-terracotta`: `#C2704F` (Primary accent & headings)
- `--color-golden`: `#D4A843` (Subtitles, borders & Arash journey line)
- `--color-dusty-rose`: `#C9928E` (Soft accents & node highlights)
- `--color-cream`: `#FFF8F0` (Global background)
- `--color-warm-white`: `#FFFDFB` (Card backgrounds)
- `--color-text-primary`: `#3D2B1F` / `--color-text-secondary`: `#6B4F3A`
- **Typography**: Heading (`Playfair Display`), Body (`Source Sans 3`).

### 📱 Responsive Navigation ([`nav.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/nav.js))
Provides an accessible mobile overlay navigation:
- Toggles `nav-open` on `<body>` with hamburger button `.nav-toggle`.
- Keyboard accessibility: closes on `Escape` key and handles initial focus trapping.

### 🐱 Ambient Cats ([`cats.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/cats.js) & [`cats.css`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/cats.css))
Renders two animated, interactive SVG cats (**Presto** the tuxedo cat and **Trino** the tortoiseshell cat):
- **Detailed SVG Vector Art**:
  - Soft ground shadow under both cats.
  - **Presto**: Tuxedo pattern, white chest bib & paw mittens, **signature black chin spot**, pink nose, terracotta collar with golden bell, one-eyed rescue detail (sparkling right eye, closed left eye stroke).
  - **Trino**: Split-face tortie (espresso left, warm orange right), tortie patches, amber flecks, both sparkling eyes open, dusty rose collar with silver tag.
  - Short, stubby legs with seamless hip/shoulder joints and soft pitter-patter gait (`-5deg` to `+5deg` leg swing).
- **Behavior State Machine**:
  - **Walking**: Wanders across screen dropping **alternating left/right pawprints** using perpendicular vector offset math.
  - **Sitting & Watching**: Pauses for 2.5–4s while swishing tail (`tail-swish`) and twitching ears (`ear-twitch`).
  - **Deep Sleep (Clean Loaf Pose)**: 10-second nap where standing legs hide (`display: none`), body flattens into a loaf, eyes close (`◡ ◡`), breathing pulse activates, and **floating `zZz` bubbles** rise above.
  - **Paw Grooming**: Pauses for 3.5–5s to raise its front paw up to its muzzle and lick its paw (`head-bob-groom`).
- **Interactions**:
  - **Hover**: Cat sits calmly and reveals a floating name badge (`Presto` / `Trino`) and heart prompt.
  - **Click**: Triggers a happy bounce animation with a floating heart (`❤️`).

---

## 3. Directory Structure & Feature Breakdown

```
narsh2026/
├── index.html            # Landing page & password gate form
├── auth.js               # Shared authentication module (SHA-256 & tier gating)
├── nav.js                # Accessible mobile header menu toggle
├── cats.js               # Presto & Trino ambient cat animation engine
├── cats.css              # Styling & keyframes for cats and pawprints
├── styles.css            # Global CSS variables, typography, and layout rules
├── AGENTS.md             # Architecture & developer guide (this file)
│
├── our-story/            # Interactive Scrollytelling Map
│   ├── index.html        # Scrollytelling layout container
│   ├── our-story.css     # Mapbox & story panel overlay layout
│   ├── story-data.js     # Chronological array of 8 life stops & photos
│   ├── map.js            # Mapbox GL initialization, lines, markers, flight paths
│   ├── scroll-controller.js # Scroll/intersection observer triggering map updates
│   ├── carousel.js       # Photo carousel inside the story card
│   └── timeline.js       # Bottom interactive timeline navigation bar
│
├── our-people/           # Guest Relationship Graph & Family Tree
│   ├── index.html        # D3 graph container & view toggle header
│   ├── our-people.css    # D3 node/edge styling & bottom sheet UI
│   ├── guests.csv        # SINGLE SOURCE OF TRUTH for guest data
│   ├── build-guests.js   # Node compilation script (guests.csv -> guest-data.js)
│   ├── guest-data.js     # Generated JSON data structure consumed by D3
│   ├── graph.js          # D3.js force simulation & SVG rendering engine
│   ├── graph-ui.js       # Search bar, group filter buttons & guest bottom sheet
│   └── guests.README.md  # Instructions for editing guest CSV data
│
├── puzzles/              # Interactive Logic Puzzle Game ("Clues by Narsh")
│   ├── index.html        # Puzzle interface
│   ├── puzzle.css        # Grid, cell states, stats panel styling
│   ├── puzzle-data.js    # Puzzle board configuration & clues definition
│   ├── puzzle.js         # Core puzzle validation & state solver logic
│   ├── puzzle-ui.js      # Rendering puzzle grid cells, timer, & controls
│   ├── presto-emoji.svg  # Custom Presto avatar SVG
│   └── trino-emoji.svg   # Custom Trino avatar SVG
│
├── schedule/             # Event Schedule Page
│   └── index.html        # Gated schedule (Sept 24 pre-wedding vs Sept 26 main day)
│
├── venue-travel/         # Locations & Accommodation Information
│   └── index.html        # Gurdwara, Hillcrest Farm, hotel block booking links
│
├── dress-code/           # Dress Code & Guidelines
│   └── index.html        # Anand Karaj Gurdwara guidance & general event attire
│
└── images/               # Image assets organized by section
    ├── couple-placeholder.svg
    ├── gc/               # Grand Cayman childhood photos
    ├── people/           # Guest avatar photos
    ├── proposal/         # Vancouver Island engagement photos
    ├── seattle/          # Seattle life photos
    ├── story/            # Life story photos
    └── uw/               # University of Waterloo co-op & study photos
```

---

## 4. Key Sub-System Details

### 🗺️ Scrollytelling Map ([`our-story/`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-story/))
1. **Data Source**: [`story-data.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-story/story-data.js) defines 8 chronological stops (`arash-amritsar`, `natalie-cayman`, `arash-auckland`, `arash-abbotsford`, `shad-valley`, `waterloo`, `seattle`, `proposal`).
2. **Flight Paths & Pins**: [`map.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-story/map.js) draws separate colored curved arcs for Arash (teal `#2A9D8F`) and Natalie (gold `#D4A843`).
3. **Convergence Moment**: At the `shad-valley` stop (where they met), a special bow animation joins both paths.
4. **Scroll Sync**: [`scroll-controller.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-story/scroll-controller.js) observes scroll progress to invoke `NARSH_MAP.flyToStop()`.

### 🕸️ Guest Relationship Graph ([`our-people/`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-people/))
1. **Workflow**:
   Edit [`guests.csv`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-people/guests.csv) → Run `node narsh2026/our-people/build-guests.js` → Generates [`guest-data.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/our-people/guest-data.js).
2. **View Modes**:
   - **Everyone (Social Graph)**: D3 force-directed layout clustering guests by social circles (`Natalie's Family`, `Arash's Family`, `College Friends`, `Meta Coworkers`, `Seattle Friends`). Couples are merged into shared household bubbles via `comes_with`.
   - **Family Tree Mode**: Computes generation levels from `parent` linkages. Solid lines indicate parentage, dashed lines indicate verified marriages/partnerships. Nodes are colored by side (Natalie gold, Arash teal).

### 🧩 Logic Puzzle Game ([`puzzles/`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/puzzles/))
1. **Concept**: Inspired by *Clues by Sam*. Features a grid of items/people where users deduce relationships based on a series of text clues.
2. **State & Storage**: [`puzzle.js`](file:///Users/arashrai/projects/arashrai.github.io/narsh2026/puzzles/puzzle.js) tracks current cell states (empty, check, cross), hints used, and completion status.

---

## 5. Guidelines for Future Agent Tasks

When modifying or expanding `narsh2026`:
- **Preserve Zero-Build Constraint**: Do not introduce webpack, Vite, npm build steps, or ES module `import`/`export` syntax unless specifically requested. All scripts rely on global IIFEs (`NARSH_AUTH`, `NARSH_CATS`, `NARSH_MAP`, `NARSH_GRAPH`, etc.).
- **Maintain Accessibility**: Ensure interactive components retain proper ARIA attributes (`aria-expanded`, `aria-live`, `role="img"`, skip links).
- **Check Access Tiers**: If adding pre-wedding details or sensitive venue notes, apply `data-tier="full"` so `"day2"` guests do not see them.
- **Update Guest CSV**: When adding or updating guests, always edit `guests.csv` and run `node build-guests.js`. Do not manually edit `guest-data.js`.
