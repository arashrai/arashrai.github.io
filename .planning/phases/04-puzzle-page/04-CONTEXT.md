# Phase 4: Puzzle Page - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a standalone puzzle page with two sections: (1) a custom social deduction logic puzzle game replicating the Clues by Sam format, and (2) a curated links section pointing to favorite daily puzzles. The puzzle game is a 4×5 grid of characters where players deduce who is "criminal" vs "innocent" using logic clues revealed on correct guesses. The page lives at `narsh2026/puzzles/` (placeholder already exists with nav wired).

</domain>

<decisions>
## Implementation Decisions

### Puzzle Game Format
- **D-01:** Replicate the Clues by Sam game format — a 4-column × 5-row grid of 20 characters, each secretly criminal or innocent. Players click a character, guess their role, and correct guesses flip the card to reveal a logic clue about other characters. The source code from cluesbysam.com was analyzed to understand the full game mechanics.
- **D-02:** Keep criminal/innocent as the two roles — no wedding-themed role renaming. The game framing works well as-is.
- **D-03:** Use placeholder character names and puzzle data for now. The puzzle logic (clues, paths, solutions) will use a sample dataset. Real wedding guest data can be swapped in later.
- **D-04:** Characters display emoji faces based on their profession (e.g., 👮 for police, 👨‍🍳 for cook), with name and profession text below. Cards have front (unflipped) and back (flipped with clue) states.

### Game Features (Full Feature Set)
- **D-05:** Implement the complete feature set from Clues by Sam, not just core gameplay:
  - Color tagging system — players can mark cards with colored tags for note-taking (long-press or right-click to cycle colors, up to 7 colors including transparent)
  - Inspect/dim mode — toggle to dim processed cards so players can focus on unread clues
  - Progressive hint system — "Show hint" button highlights which cards to flip next, with escalating hint levels (hint → show more → hide hint)
  - Share results — emoji grid showing correct/mistake/hint usage, copyable text, timer display
  - Timer — tracks solve time, pauses when tab is hidden, displays on completion
  - Wrong guess warning — modal explaining the guess can't be logically deduced yet
- **D-06:** Puzzle state persists in localStorage so players can return to an in-progress game.

### Game Data Model
- **D-07:** Each character object contains: `criminal` (boolean), `profession` (string), `name` (string), `gender` (string), `hint` (clue text with template references like `#NAME:N`, `#BETWEEN:pair(X,Y)`), `paths` (arrays of card indices that must be flipped before this card is deducible), and optionally `orig_hint` (raw logic formula).
- **D-08:** Clue text supports template substitution — references to other characters by index (`#NAME:N`), grid positions (`#C:N` for columns), spatial relationships (`#BETWEEN:pair(X,Y)`), and self-references ("I" / "me" when the clue references the speaker).
- **D-09:** The hint system uses a pre-computed hint sequence — each entry specifies which cards must already be flipped, which cards serve as clue sources, and which new cards are revealed.

### Daily Puzzle Links
- **D-10:** Include a curated links section below the main puzzle with cards/tiles for each external puzzle:
  1. Clues by Sam — https://cluesbysam.com/
  2. Minute Cryptic — https://www.minutecryptic.com/
  3. Globle — https://globle-game.com/
  4. Wordle — https://www.nytimes.com/games/wordle/index.html
  5. FoodGuessr — https://www.foodguessr.com/
- **D-11:** The links list is designed to be expandable — more puzzles may be added later. Use a simple data-driven approach so new links can be added without code changes.

### Visual Style
- **D-12:** Match the warm wedding aesthetic — cream backgrounds (`--color-cream`), terracotta accents (`--color-terracotta`), Source Sans 3 + Playfair Display fonts, consistent with the rest of the Narsh 2026 site.
- **D-13:** Card styling adapts the Clues by Sam visual language (front/back card flip, color-coded criminal/innocent reveals, speech bubbles for correct guesses) but uses the site's warm color palette instead of the original's dark purple/peach theme.
- **D-14:** The page uses the shared auth guard, nav, and design system — same pattern as all other narsh2026 pages.

### Technical Approach
- **D-15:** Build as vanilla JS with IIFE modules (matching the project's established pattern — NARSH_PUZZLE, NARSH_PUZZLE_UI, etc.), NOT as a React app. The original Clues by Sam is React 19, but this project uses no framework. Replicate the game logic and UI in vanilla JS following the same IIFE patterns used by graph.js, map.js, etc.
- **D-16:** Puzzle data stored in a static JS module (puzzle-data.js) following the guest-data.js / story-data.js pattern — IIFE exporting the puzzle configuration object.
- **D-17:** No external dependencies beyond what's already in the project. The game rendering uses DOM manipulation, not canvas or SVG.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Game Reference
- The Clues by Sam source code was shared in conversation and analyzed for game mechanics, data model, UI patterns, and feature set. Key patterns: card grid component, modal dialogs for card inspection, color picker for tagging, hint system with progressive reveals, share results with emoji grid, localStorage state persistence, timer with visibility API pause/resume.

### Existing Codebase
- `narsh2026/puzzles/index.html` — Existing placeholder page with nav already wired and active class set
- `narsh2026/our-people/graph.js` — Analog for complex interactive JS module (IIFE pattern, private state, DOM manipulation, event handling)
- `narsh2026/our-people/graph-ui.js` — Analog for UI controller module (init pattern, event listeners, modal interactions)
- `narsh2026/our-people/guest-data.js` — Analog for static data module (IIFE pattern, data arrays, helper functions)
- `narsh2026/styles.css` — Shared design tokens (colors, spacing, typography, shadows)
- `narsh2026/auth.js` — Auth guard API (requireAuth, applyTierVisibility)

### Project Docs
- `.planning/PROJECT.md` — Core value, requirements, design language
- `.planning/REQUIREMENTS.md` — PUZZLE-01, PUZZLE-02 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Auth guard pattern (`NARSH_AUTH.requireAuth()` + `applyTierVisibility`) — same as all pages
- Nav component (`nav.js`) — shared across all pages
- CSS design tokens — `--color-cream`, `--color-terracotta`, `--color-warm-white`, `--color-text-primary`, `--font-body`, `--font-heading`, spacing and shadow variables
- Google Fonts links — Playfair Display + Source Sans 3 (add wght@600 for game UI elements)

### Established Patterns
- IIFE module pattern: `const NARSH_X = (() => { "use strict"; ... return { init, ... }; })();`
- Static data modules: arrays of objects with string IDs, helper functions for lookup/filter
- Page-specific CSS files alongside page HTML
- Inline init script after auth: `const tier = NARSH_AUTH.requireAuth(); if (tier) { ... }`
- `El` suffix for DOM reference variables

### Integration Points
- `narsh2026/puzzles/index.html` — rewrite placeholder with full puzzle page
- `narsh2026/styles.css` — add puzzle-specific CSS custom properties to `:root`
- Nav already has "Puzzles" link with correct href and active class handling

</code_context>

<specifics>
## Specific Ideas

- The game should feel like the Clues by Sam experience but visually integrated with the warm, personal wedding site aesthetic
- Characters will eventually be replaced with wedding guests and the couple's cats (Presto and Trino) — design the data model to make this swap easy
- The emoji profession icons from Clues by Sam (👮, 👨‍🍳, 🕵️, etc.) should be preserved as the character face display
- Clue text rendering supports rich template substitution (character names, grid positions, spatial relationships) — this logic must be replicated

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-puzzle-page*
*Context gathered: 2026-05-22*
