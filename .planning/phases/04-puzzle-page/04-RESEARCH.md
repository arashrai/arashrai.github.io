# Phase 4: Puzzle Page - Research

**Researched:** 2026-05-25
**Domain:** Interactive logic puzzle game (Clues by Sam clone) + curated daily puzzle links
**Confidence:** HIGH

## Summary

Phase 4 builds a standalone puzzle page at `narsh2026/puzzles/` with two sections: (1) a custom social deduction logic puzzle replicating the Clues by Sam game format -- a 4x5 grid of characters where players deduce criminal vs innocent roles by flipping cards to reveal logic clues, and (2) a curated links section for favorite daily puzzles. The placeholder page already exists with nav wiring and auth guard in place.

The game is the most interactive feature on the site -- more complex than the map timeline or guest graph in terms of game state management, but simpler in rendering (DOM-based, no SVG/Canvas/D3). The core challenge is faithfully replicating Clues by Sam's game logic (card dependencies, clue template substitution, hint sequence, color tagging, share results) in vanilla JS using the project's established IIFE module pattern. No external dependencies are needed.

**Primary recommendation:** Structure as three IIFE modules (puzzle-data.js, puzzle.js, puzzle-ui.js) following the graph.js/graph-ui.js pattern exactly. The data module exports the puzzle configuration, the core module manages game state and logic, and the UI module handles DOM rendering and user interaction. All CSS goes in a page-level puzzle.css file.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Replicate the Clues by Sam game format -- 4x5 grid of 20 characters, each criminal or innocent. Players click a character, guess their role, correct guesses flip the card to reveal a logic clue.
- **D-02:** Keep criminal/innocent as the two roles -- no wedding-themed role renaming.
- **D-03:** Use placeholder character names and puzzle data for now. Real wedding guest data can be swapped in later.
- **D-04:** Characters display emoji faces based on profession, with name and profession text below. Cards have front/back states.
- **D-05:** Full feature set: color tagging, inspect/dim mode, progressive hints, share results, timer, wrong guess warning.
- **D-06:** Puzzle state persists in localStorage.
- **D-07:** Character data model: criminal, profession, name, gender, hint, paths, optionally orig_hint.
- **D-08:** Clue text supports template substitution (#NAME:N, #C:N, #BETWEEN:pair(X,Y), self-references).
- **D-09:** Hint system uses pre-computed hint sequence.
- **D-10:** Five curated daily puzzle links: Clues by Sam, Minute Cryptic, Globle, Wordle, FoodGuessr.
- **D-11:** Links list is data-driven for easy expansion.
- **D-12:** Match warm wedding aesthetic (cream backgrounds, terracotta accents, Playfair Display + Source Sans 3).
- **D-13:** Card styling adapts Clues by Sam visual language but uses the site's warm color palette.
- **D-14:** Uses shared auth guard, nav, and design system.
- **D-15:** Build as vanilla JS with IIFE modules (NARSH_PUZZLE, NARSH_PUZZLE_UI, etc.), NOT React.
- **D-16:** Puzzle data in static JS module (puzzle-data.js) following guest-data.js pattern.
- **D-17:** No external dependencies. DOM manipulation only, no canvas or SVG.

### Claude's Discretion
- D-15 (confirmed): Vanilla JS with IIFE modules
- D-16 (confirmed): Static data module pattern
- D-17 (confirmed): No external dependencies

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PUZZLE-01 | Custom "Clues by Sam" style puzzle as standalone page | Full game mechanics documented: 4x5 grid, criminal/innocent roles, card flip, clue templates, color tags, inspect mode, hints, share results, timer, localStorage persistence. Architecture patterns section provides module structure, data model, and state machine. |
| PUZZLE-02 | Links to favorite daily puzzles | Five links specified (D-10), data-driven approach (D-11). Simple array of objects rendered as styled cards/tiles below the main puzzle. |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Puzzle game logic (state, validation, hints) | Browser / Client | -- | Pure client-side game -- no server, no API. All state in JS memory + localStorage. |
| Card grid rendering & interactions | Browser / Client | -- | DOM manipulation with CSS transitions for card flip, selection, dimming. |
| Clue template substitution | Browser / Client | -- | String processing on puzzle data at render time. |
| Color tagging system | Browser / Client | -- | UI overlay on cards, persisted in localStorage game state. |
| Timer | Browser / Client | -- | `performance.now()` + Visibility API for pause/resume. |
| Share results | Browser / Client | -- | Generates emoji text, uses `navigator.clipboard.writeText()`. |
| Puzzle data storage | Static / CDN | -- | Static JS file served by GitHub Pages. No database. |
| Daily puzzle links | Static / CDN | -- | Static data rendered as link cards. No API calls. |
| Auth guard | Browser / Client | -- | Existing `NARSH_AUTH.requireAuth()` pattern -- already wired in placeholder. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (ES2020+) | N/A | Game logic, DOM manipulation, state management | Project convention (D-15, D-17) -- no frameworks, no build step |
| CSS3 | N/A | Card flip animations, grid layout, responsive design | Project convention -- page-level CSS files |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| NARSH_AUTH (auth.js) | existing | Auth guard + tier visibility | Page load -- already present in placeholder |
| nav.js | existing | Navigation component | Page load -- already present in placeholder |
| styles.css | existing | Shared design tokens | All styling -- import as first stylesheet |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS | React (original Clues by Sam uses React 19) | React would require a build step, CDN dependency, and break the project's no-framework convention. The game logic is not complex enough to justify a framework -- it is fundamentally a state machine with DOM updates. |
| CSS card flip | JS-animated flip (GSAP, anime.js) | CSS `transform: rotateY(180deg)` with `backface-visibility` is sufficient and requires zero dependencies. |
| localStorage | IndexedDB | Overkill for a single JSON blob of game state. localStorage is already used for auth tier. |

**Installation:**
```bash
# No installation needed -- zero external dependencies
```

## Architecture Patterns

### System Architecture Diagram

```
User Interaction
      |
      v
[puzzle-ui.js (NARSH_PUZZLE_UI)]
  - Card click/tap handler
  - Long-press/right-click for color tags
  - Inspect mode toggle
  - Hint button handler
  - Share results button
  - Modal rendering (card inspect, wrong guess warning, game complete)
      |
      v
[puzzle.js (NARSH_PUZZLE)]
  - Game state machine (in-progress / complete)
  - Flipped cards set, mistakes count, hints used
  - guessRole(cardIndex) -> correct/incorrect/already-flipped
  - checkDeducible(cardIndex) -> can this card be logically deduced?
  - getNextHint() -> hint sequence entry
  - getClueText(cardIndex) -> rendered clue with template substitution
  - Timer (start, pause on visibilitychange, stop)
  - Color tag state per card
  - Save/load state to/from localStorage
      |
      v
[puzzle-data.js (NARSH_PUZZLE_DATA)]
  - CHARACTERS[0..19]: { criminal, profession, name, gender, hint, paths }
  - HINT_SEQUENCE[]: { requires, sources, reveals }
  - Template helpers: resolveClue(hint, characters)
  - Profession emoji map
      |
      v
[localStorage: "narsh-puzzle-state"]
  - { flipped: [...], mistakes: number, hintsUsed: number,
      colorTags: {...}, elapsedMs: number, dimmedCards: [...] }
```

### Recommended Project Structure
```
narsh2026/puzzles/
  index.html           # Page shell (rewrite existing placeholder)
  puzzle.css           # All puzzle-specific styles
  puzzle-data.js       # NARSH_PUZZLE_DATA IIFE -- characters, hints, templates
  puzzle.js            # NARSH_PUZZLE IIFE -- game state and logic
  puzzle-ui.js         # NARSH_PUZZLE_UI IIFE -- DOM rendering and interaction
```

### Pattern 1: IIFE Module with Private State
**What:** Immediately-invoked function expression returning a public API object, with private variables and functions enclosed.
**When to use:** Every JS module in this project.
**Example:**
```javascript
// Source: narsh2026/our-people/graph.js (verified in codebase)
const NARSH_PUZZLE = (() => {
  "use strict";

  // Private state
  let flippedCards = new Set();
  let mistakes = 0;
  let hintsUsed = 0;
  let colorTags = {};
  let timerStart = 0;
  let elapsedMs = 0;
  let gameComplete = false;

  const STORAGE_KEY = "narsh-puzzle-state";

  const init = (puzzleData) => {
    // Load saved state or start fresh
    const saved = loadState();
    if (saved) {
      restoreState(saved);
    }
    // ...
  };

  const guessRole = (cardIndex, guessedCriminal) => {
    // Returns { correct: boolean, clueText: string|null }
  };

  const saveState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        flipped: Array.from(flippedCards),
        mistakes,
        hintsUsed,
        colorTags,
        elapsedMs: getElapsed(),
        dimmedCards: Array.from(dimmedCards)
      }));
    } catch {
      // Private browsing fallback
    }
  };

  return { init, guessRole, saveState, /* ... */ };
})();
```

### Pattern 2: Static Data Module
**What:** IIFE exporting puzzle configuration as structured data arrays with helper functions.
**When to use:** puzzle-data.js -- mirrors guest-data.js and story-data.js patterns.
**Example:**
```javascript
// Source: narsh2026/our-people/guest-data.js pattern (verified in codebase)
const NARSH_PUZZLE_DATA = (() => {
  "use strict";

  const CHARACTERS = [
    {
      criminal: false,
      profession: "police",
      name: "Alice",
      gender: "female",
      hint: "I know that #NAME:5 is innocent.",
      paths: [[0]],
      orig_hint: null
    },
    // ... 19 more characters
  ];

  const HINT_SEQUENCE = [
    { requires: [], sources: [], reveals: [0, 3] },
    { requires: [0, 3], sources: [0], reveals: [5] },
    // ...
  ];

  const PROFESSION_EMOJI = {
    police: "\u{1F46E}",
    cook: "\u{1F468}‍\u{1F373}",
    detective: "\u{1F575}️",
    doctor: "\u{1F468}‍⚕️",
    // ...
  };

  const getCharacter = (index) => CHARACTERS[index] || null;
  const getEmoji = (profession) => PROFESSION_EMOJI[profession] || "\u{1F464}";
  const getTotalCharacters = () => CHARACTERS.length;

  return {
    CHARACTERS,
    HINT_SEQUENCE,
    PROFESSION_EMOJI,
    getCharacter,
    getEmoji,
    getTotalCharacters
  };
})();
```

### Pattern 3: Clue Template Substitution
**What:** Replaces template tokens in hint strings with resolved values at render time.
**When to use:** When displaying a flipped card's clue text.
**Example:**
```javascript
// Source: CONTEXT.md D-08 (analyzed from Clues by Sam source)
const resolveClue = (hintText, characters, speakerIndex) => {
  let resolved = hintText;

  // #NAME:N -> character name at index N
  resolved = resolved.replace(/#NAME:(\d+)/g, (match, idx) => {
    const char = characters[parseInt(idx, 10)];
    return char ? char.name : match;
  });

  // #C:N -> column number (1-based) for character at index N
  resolved = resolved.replace(/#C:(\d+)/g, (match, idx) => {
    const col = (parseInt(idx, 10) % 4) + 1;
    return "column " + col;
  });

  // #BETWEEN:pair(X,Y) -> "between NAME_X and NAME_Y"
  resolved = resolved.replace(/#BETWEEN:pair\((\d+),(\d+)\)/g, (match, x, y) => {
    const charX = characters[parseInt(x, 10)];
    const charY = characters[parseInt(y, 10)];
    return "between " + (charX ? charX.name : "?") + " and " + (charY ? charY.name : "?");
  });

  // Self-references (I/me when clue references the speaker)
  // These are already baked into the hint text per the data model

  return resolved;
};
```

### Pattern 4: Card Flip CSS
**What:** Pure CSS 3D card flip using `perspective`, `transform-style: preserve-3d`, and `backface-visibility`.
**When to use:** For the front/back card states in the puzzle grid.
**Example:**
```css
/* [ASSUMED] -- standard CSS 3D flip pattern, widely documented */
.puzzle-card {
  perspective: 800px;
  cursor: pointer;
}

.puzzle-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.puzzle-card.flipped .puzzle-card-inner {
  transform: rotateY(180deg);
}

.puzzle-card-front,
.puzzle-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-md);
}

.puzzle-card-back {
  transform: rotateY(180deg);
}
```

### Pattern 5: Timer with Visibility API
**What:** Tracks elapsed play time, pauses when the browser tab is hidden.
**When to use:** Game timer per D-05.
**Example:**
```javascript
// [ASSUMED] -- standard Visibility API pattern
let timerStart = 0;
let accumulated = 0;
let running = false;

const startTimer = () => {
  timerStart = performance.now();
  running = true;
};

const pauseTimer = () => {
  if (running) {
    accumulated += performance.now() - timerStart;
    running = false;
  }
};

const resumeTimer = () => {
  if (!running) {
    timerStart = performance.now();
    running = true;
  }
};

const getElapsed = () => {
  if (running) return accumulated + (performance.now() - timerStart);
  return accumulated;
};

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseTimer();
  else resumeTimer();
});
```

### Anti-Patterns to Avoid
- **React-ifying vanilla JS:** Do NOT use virtual DOM patterns, component lifecycle methods, or JSX-like structures. This is imperative DOM manipulation with event listeners.
- **Over-abstracting the data model:** The puzzle data is a static array of 20 objects. Do not build a class hierarchy or ORM around it.
- **Canvas/SVG for the grid:** The grid is a simple 4x5 layout of DOM elements. CSS Grid handles this perfectly. Canvas or SVG would add complexity without benefit.
- **Inline styles in JS:** Use CSS classes for all styling. Toggle classes for state changes (`.flipped`, `.selected`, `.dimmed`, `.criminal`, `.innocent`). Do not set `element.style.backgroundColor = ...` except in the foreignObject pattern used by graph.js (which is a D3 constraint, not applicable here).
- **Separate modal.js module:** The modals (card inspect, wrong guess, game complete) are simple enough to live inside puzzle-ui.js. Do not create a separate modal abstraction.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card flip animation | JS-based frame-by-frame animation | CSS 3D transforms (`rotateY` + `backface-visibility`) | Hardware-accelerated, zero JS overhead, well-supported across all modern browsers |
| Clipboard access | Custom clipboard polyfill | `navigator.clipboard.writeText()` | Built into all modern browsers. Falls back gracefully (catch the error, show "copy failed"). |
| Timer pause on tab switch | `setInterval` + manual tracking | `document.visibilitychange` event + `performance.now()` | Built-in browser API, no drift, no battery drain from interval polling. |
| Responsive grid layout | Manual column calculations | CSS Grid (`grid-template-columns: repeat(4, 1fr)`) | CSS Grid handles the 4-column layout natively with gap, alignment, and responsive breakpoints. |
| Long-press detection | Complex touch state machine | `contextmenu` event + `setTimeout`-based long press (300ms `touchstart` with `touchend` cancel) | Two event listeners instead of a full gesture recognizer. |
| JSON state serialization | Custom binary format | `JSON.stringify` / `JSON.parse` with localStorage | The state object is tiny (< 1KB). JSON is the standard for localStorage. |

**Key insight:** This phase has zero external dependencies by design. Every feature maps to a built-in browser API or CSS capability. The complexity is in game logic (state machine, hint sequencing, template substitution), not in rendering technology.

## Common Pitfalls

### Pitfall 1: Card Path Dependencies
**What goes wrong:** A player flips a card before the prerequisite cards are flipped, making the clue unverifiable. The game becomes unsolvable or confusing.
**Why it happens:** The `paths` array on each character defines which cards must be flipped first to logically deduce this card's role. If the UI allows guessing any card without checking deducibility, players get frustrated by unverifiable guesses.
**How to avoid:** Before processing a guess, check if any path in the character's `paths` array is fully satisfied (all cards in the path are already flipped). If no path is satisfied, show the "wrong guess warning" modal explaining the guess cannot be logically deduced yet. Do NOT reveal whether the guess was correct -- that would break the puzzle.
**Warning signs:** Players reporting that "the game told me I was wrong but I was right" -- this means you revealed the answer on a non-deducible guess instead of showing the deducibility warning.

### Pitfall 2: Template Substitution Edge Cases
**What goes wrong:** Clue text renders with raw template tokens (`#NAME:5`) instead of resolved names, or resolves to the wrong character.
**Why it happens:** Off-by-one errors in character index references, missing template patterns, or templates within templates.
**How to avoid:** Write the template resolver with a clear regex for each pattern. Test with the full sample dataset. Handle the case where an index is out of bounds gracefully (return the raw token rather than crashing).
**Warning signs:** Any `#` character appearing in rendered clue text.

### Pitfall 3: localStorage Corruption
**What goes wrong:** Saved game state becomes invalid (e.g., after a data model change), causing the game to crash on load.
**Why it happens:** Schema evolution -- if the puzzle data changes (new characters, different order), saved state indices become invalid.
**How to avoid:** Include a version number in the saved state. On load, if the version does not match the current puzzle data version, discard saved state and start fresh. Wrap all localStorage reads in try/catch.
**Warning signs:** Console errors on page load after any puzzle data change.

### Pitfall 4: Mobile Touch Events vs Click
**What goes wrong:** Card selection feels laggy on mobile (300ms click delay), or long-press for color tags conflicts with native browser context menu.
**Why it happens:** Mobile browsers add a 300ms delay before firing `click` to distinguish taps from double-taps. Long-press triggers the native context menu.
**How to avoid:** Use `touchstart`/`touchend` for tap detection (but still support `click` for desktop). For long-press, use a 300ms `setTimeout` on `touchstart`, cancel on `touchmove` or `touchend`. Call `event.preventDefault()` on `contextmenu` to suppress the native menu on mobile. Ensure the viewport meta tag includes `width=device-width` (already present in placeholder).
**Warning signs:** Double-firing of card actions, native context menu appearing over color picker.

### Pitfall 5: CSS Perspective and Backface on iOS Safari
**What goes wrong:** Card flip animation does not hide the front face, showing both sides simultaneously on iOS Safari.
**Why it happens:** Safari requires `backface-visibility: hidden` on BOTH the front and back faces, AND `-webkit-backface-visibility` for older versions. Additionally, `transform-style: preserve-3d` must be on the direct parent of the faces.
**How to avoid:** Always set `backface-visibility: hidden` on both `.puzzle-card-front` and `.puzzle-card-back`. Include the `-webkit-` prefix. Test on Safari/iOS early.
**Warning signs:** Both card sides visible during or after the flip animation on Safari.

### Pitfall 6: Share Results Clipboard API
**What goes wrong:** The share/copy button silently fails on some browsers.
**Why it happens:** `navigator.clipboard.writeText()` requires a secure context (HTTPS) and user activation (must be called from a click handler). Some older browsers do not support it.
**How to avoid:** Always call clipboard write from within a click event handler. GitHub Pages serves over HTTPS, so secure context is satisfied. Wrap in try/catch and show a user-visible fallback message ("Copied!" on success, "Copy failed -- select the text manually" on error). Optionally show the emoji text in a selectable textarea as fallback.
**Warning signs:** No feedback after clicking the share button.

## Code Examples

### Page Shell (index.html rewrite)
```html
<!-- Source: existing placeholder (narsh2026/puzzles/index.html) + our-people pattern -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>Puzzles -- Narsh 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/narsh2026/styles.css">
    <link rel="stylesheet" href="/narsh2026/puzzles/puzzle.css">
  </head>
  <body class="auth-pending">
    <header class="site-header">
      <a href="/narsh2026/" class="site-logo">Narsh 2026</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon"></span>
      </button>
      <nav class="site-nav" id="site-nav">
        <a href="/narsh2026/our-story/">Our Story</a>
        <a href="/narsh2026/our-people/">Our People</a>
        <a href="/narsh2026/puzzles/" class="active">Puzzles</a>
        <a href="/narsh2026/schedule/">Schedule</a>
        <a href="/narsh2026/venue-travel/">Venue & Travel</a>
        <a href="/narsh2026/dress-code/">Dress Code</a>
      </nav>
    </header>
    <main class="puzzle-page">
      <h1>Puzzles</h1>
      <section class="puzzle-game" id="puzzle-game" aria-label="Clues puzzle game">
        <!-- Game UI rendered by puzzle-ui.js -->
      </section>
      <section class="daily-puzzles" id="daily-puzzles" aria-label="Daily puzzle links">
        <h2>Daily Puzzles We Love</h2>
        <!-- Links rendered by puzzle-ui.js from data -->
      </section>
    </main>
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script src="/narsh2026/puzzles/puzzle-data.js"></script>
    <script src="/narsh2026/puzzles/puzzle.js"></script>
    <script src="/narsh2026/puzzles/puzzle-ui.js"></script>
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) {
        NARSH_AUTH.applyTierVisibility(tier);
        NARSH_PUZZLE.init(NARSH_PUZZLE_DATA);
        NARSH_PUZZLE_UI.init();
      }
    </script>
  </body>
</html>
```

### Game State Machine (Core Logic)
```javascript
// Source: CONTEXT.md D-01, D-05, D-06, D-07 (game mechanics from analyzed source)
const guessRole = (cardIndex, guessedCriminal) => {
  if (flippedCards.has(cardIndex)) return { result: "already-flipped" };
  if (gameComplete) return { result: "game-over" };

  const character = puzzleData.CHARACTERS[cardIndex];
  if (!character) return { result: "invalid" };

  // Check if the card is deducible (any path fully flipped)
  const isDeducible = character.paths.some((path) =>
    path.every((idx) => flippedCards.has(idx))
  );

  // If not deducible, show warning -- do NOT reveal answer
  if (!isDeducible) {
    return { result: "not-deducible" };
  }

  const isCorrect = (guessedCriminal === character.criminal);

  if (isCorrect) {
    flippedCards.add(cardIndex);
    const clueText = resolveClue(character.hint, puzzleData.CHARACTERS, cardIndex);

    // Check for game completion
    if (flippedCards.size === puzzleData.CHARACTERS.length) {
      gameComplete = true;
      pauseTimer();
    }

    saveState();
    return { result: "correct", clueText, criminal: character.criminal };
  } else {
    mistakes++;
    saveState();
    return { result: "incorrect" };
  }
};
```

### Color Tag Cycling
```javascript
// Source: CONTEXT.md D-05 (color tagging system)
const COLOR_TAG_CYCLE = [
  "transparent", // no tag (default)
  "#E74C3C",     // red
  "#F39C12",     // orange
  "#F1C40F",     // yellow
  "#2ECC71",     // green
  "#3498DB",     // blue
  "#9B59B6",     // purple
];

const cycleColorTag = (cardIndex) => {
  const current = colorTags[cardIndex] || 0;
  const next = (current + 1) % COLOR_TAG_CYCLE.length;
  colorTags[cardIndex] = next;
  saveState();
  return COLOR_TAG_CYCLE[next];
};
```

### Share Results Emoji Grid
```javascript
// Source: CONTEXT.md D-05 (share results feature)
const generateShareText = () => {
  const elapsed = getElapsed();
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const timeStr = minutes + ":" + String(seconds).padStart(2, "0");

  let grid = "";
  for (let i = 0; i < puzzleData.CHARACTERS.length; i++) {
    const char = puzzleData.CHARACTERS[i];
    if (char.criminal) {
      grid += "\u{1F7E5}"; // red square
    } else {
      grid += "\u{1F7E9}"; // green square
    }
    if ((i + 1) % 4 === 0 && i < puzzleData.CHARACTERS.length - 1) {
      grid += "\n";
    }
  }

  return "Clues Puzzle\n"
    + "\u{23F1}️ " + timeStr + " | "
    + "❌ " + mistakes + " mistake(s) | "
    + "\u{1F4A1} " + hintsUsed + " hint(s)\n\n"
    + grid;
};
```

### Daily Puzzle Links Data
```javascript
// Source: CONTEXT.md D-10, D-11
const DAILY_PUZZLES = [
  { name: "Clues by Sam", url: "https://cluesbysam.com/", emoji: "\u{1F50D}", description: "Social deduction logic puzzle" },
  { name: "Minute Cryptic", url: "https://www.minutecryptic.com/", emoji: "\u{1F4DD}", description: "Quick cryptic crossword clue" },
  { name: "Globle", url: "https://globle-game.com/", emoji: "\u{1F30E}", description: "Guess the country by proximity" },
  { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", emoji: "\u{1F7E9}", description: "The classic word game" },
  { name: "FoodGuessr", url: "https://www.foodguessr.com/", emoji: "\u{1F355}", description: "Guess the food origin" }
];
```

### CSS Grid Layout for 4x5 Card Grid
```css
/* [ASSUMED] -- standard CSS Grid pattern */
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 480px) {
  .puzzle-grid {
    gap: var(--space-xs);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `onclick` attribute in HTML | `addEventListener` in JS | Long-standing best practice | Separation of concerns, multiple listeners, proper event delegation |
| `document.execCommand("copy")` | `navigator.clipboard.writeText()` | 2020+ | Modern async clipboard API, better error handling |
| Manual touch delay removal | `touch-action: manipulation` CSS | 2016+ | Removes 300ms click delay on mobile without JS hacks |
| `-webkit-transform` prefixes | Unprefixed `transform` | 2015+ | All modern browsers support unprefixed 3D transforms |
| `var` declarations | `const` / `let` | ES2015+ | Block scoping, immutability by default -- project uses `const` throughout |

**Deprecated/outdated:**
- `document.execCommand("copy")`: Deprecated in favor of Clipboard API. Still works but should not be used for new code.
- `<marquee>`, `<blink>`: Obviously not applicable but mentioned for completeness in game context.

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS 3D card flip pattern (`perspective` + `rotateY` + `backface-visibility`) works reliably across modern browsers including mobile Safari | Pattern 4: Card Flip CSS | Low -- this is an extremely well-established CSS pattern. If wrong, fallback is a simple class toggle with no animation. |
| A2 | `touch-action: manipulation` removes 300ms click delay on mobile | State of the Art | Low -- widely supported. Fallback: use `touchstart`/`touchend` for immediate response. |
| A3 | Clues by Sam color tag cycle has 7 colors including transparent | Code Examples (Color Tag) | Medium -- exact colors were inferred from CONTEXT.md D-05 which says "up to 7 colors including transparent". Actual hex values are placeholder. The planner should use the wedding palette colors if preferred. |
| A4 | The share results emoji grid uses red/green squares | Code Examples (Share Results) | Low -- this is a standard pattern from Wordle-style share results. The exact emoji can be adjusted. |
| A5 | CSS Grid `repeat(4, 1fr)` with small gap works well for mobile card sizing | CSS Grid Layout | Low -- 4 columns on mobile may need cards to be quite small. Responsive behavior at very narrow widths (< 320px) may need a 2-column fallback. |

## Open Questions

1. **Sample puzzle dataset**
   - What we know: CONTEXT.md D-03 says "use placeholder character names and puzzle data." D-07 defines the data model. The user shared the Clues by Sam source code during discussion.
   - What's unclear: Whether the executor should create a custom sample puzzle with consistent paths/hints, or if specific sample data was provided during discussion.
   - Recommendation: Create a complete, self-consistent sample puzzle with 20 characters, valid paths, and working hint sequence. This is non-trivial game design work -- each clue must be logically sound and the hint sequence must provide a valid solve path. The executor may need to keep it simple (e.g., use a known-good puzzle configuration from a Clues by Sam daily puzzle as a template).

2. **Exact color tag palette**
   - What we know: D-05 specifies "up to 7 colors including transparent." D-12/D-13 say to use the warm wedding palette.
   - What's unclear: Whether color tags should use the wedding palette colors or standard game colors.
   - Recommendation: Use distinguishable game colors (red, orange, yellow, green, blue, purple) since these are functional note-taking markers, not decorative. The wedding palette does not have enough distinct hues for 6 differentiable marker colors.

3. **"Wrong guess" vs "incorrect guess" distinction**
   - What we know: D-05 mentions "Wrong guess warning -- modal explaining the guess can't be logically deduced yet." Separately, incorrect guesses (where the guess IS deducible but wrong) should increment the mistake counter.
   - What's unclear: Whether an incorrect deducible guess should also show a modal, or just flash the card red and increment mistakes.
   - Recommendation: Two distinct feedback paths: (a) non-deducible guess shows a modal with explanation, (b) incorrect deducible guess shows a brief visual error state (card shakes, red flash) and increments mistakes. No modal for incorrect guesses -- keep the flow fast.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). This phase is pure HTML/CSS/JS with zero external tools, services, or runtimes. The site deploys to GitHub Pages via git push -- no build step, no CLI tools, no package manager.

## Security Domain

> Security enforcement is enabled (default). However, this phase has a minimal security surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Auth is handled by existing NARSH_AUTH module -- no changes in this phase |
| V3 Session Management | No | No server sessions -- localStorage persistence for game state only |
| V4 Access Control | No | Auth guard already wired in placeholder page |
| V5 Input Validation | Marginal | No user text input -- all interaction is click/tap on predefined elements. localStorage reads are parsed with try/catch. |
| V6 Cryptography | No | No encryption needed |

### Known Threat Patterns for Static Site + localStorage

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage tampering (player edits game state) | Tampering | Accept the risk -- this is a fun puzzle, not a competitive system. No prizes, no leaderboard. Tampering only affects the player's own experience. |
| XSS via puzzle data | Tampering | Puzzle data is static, author-controlled. Use `textContent` (not `innerHTML`) when rendering clue text. The existing codebase uses `textContent` throughout -- maintain this pattern. |
| Clipboard API abuse | Information Disclosure | Only writes (never reads) clipboard. Writes pre-formatted text, not user data. No risk. |

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- narsh2026/our-people/graph.js, graph-ui.js, guest-data.js (IIFE module pattern, private state, DOM manipulation, event handling, data module pattern)
- **Codebase analysis** -- narsh2026/our-story/story-data.js (static data module pattern with STOPS array)
- **Codebase analysis** -- narsh2026/styles.css (design tokens, responsive breakpoints, component patterns)
- **Codebase analysis** -- narsh2026/auth.js (localStorage pattern with try/catch, auth guard API)
- **Codebase analysis** -- narsh2026/puzzles/index.html (existing placeholder page structure)
- **Codebase analysis** -- narsh2026/our-people/index.html (page shell pattern: fonts, stylesheets, script loading order, init script)

### Secondary (MEDIUM confidence)
- **CONTEXT.md** -- Phase 4 discussion decisions D-01 through D-17 (game mechanics, data model, features, visual style, technical approach)
- **DISCUSSION-LOG.md** -- Confirms full feature set selection, puzzle format, daily links list

### Tertiary (LOW confidence)
- Web tools unavailable for this session (internet mode disabled). Could not verify Clues by Sam source code directly. All game mechanic claims are based on the CONTEXT.md analysis which states the source code was reviewed during the discussion phase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external dependencies, follows established codebase patterns exactly
- Architecture: HIGH -- three-module structure mirrors the proven graph.js / graph-ui.js / guest-data.js pattern
- Pitfalls: HIGH -- common browser API gotchas (Safari backface, mobile touch, clipboard) are well-documented
- Game logic: MEDIUM -- the path/deducibility system and template substitution are faithful to CONTEXT.md descriptions, but the exact Clues by Sam source was not independently verified in this session

**Research date:** 2026-05-25
**Valid until:** 2026-07-25 (60 days -- stable domain, no moving targets, zero external dependencies)
