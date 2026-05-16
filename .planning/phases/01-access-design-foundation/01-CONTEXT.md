# Phase 1: Access & Design Foundation - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers three things: (1) a password-based tiered access gate replacing the current Supabase magic link system, (2) the visual design system (color palette, typography, spacing, component styles) that all future phases build on, and (3) a responsive multi-page shell with navigation linking all site sections.

</domain>

<decisions>
## Implementation Decisions

### Landing Page Personality
- **D-01:** Warm welcome approach — couple's names, a photo of Natalie & Arash, and a playful tagline displayed above the password field. The landing page should feel like arriving at a doorstep, not hitting a locked gate.
- **D-02:** Hero visual is a couple photo (use a placeholder image for now; real photo will be swapped in later).
- **D-03:** Tagline/copy tone is playful and fun — cheeky, personality-forward (e.g., "You're invited to the party"), not corporate or overly sentimental.

### Color Palette & Visual Style
- **D-04:** Sunset warm tones — terracotta, golden yellow, dusty rose, warm cream as the core palette. Earthy and romantic, like a golden hour.
- **D-05:** Playful personality expressed through subtle warmth — rounded corners, soft shadows, warm background colors, gentle hover effects. NOT through overt decoration like doodles or illustrations.
- **D-06:** No specific design references or inspiration sites to follow. The sunset warm + subtle warmth direction is sufficient guidance.

### Site Architecture & Navigation
- **D-07:** Multi-page structure — separate HTML files per section under `narsh2026/`. Each section gets its own page and URL.
- **D-08:** All six sections appear in navigation from day one: Our Story, Our People, Puzzles, Schedule, Venue & Travel, Dress Code. Unbuilt sections show a friendly "Coming soon" placeholder page.
- **D-09:** Section labels confirmed: "Our Story" (map timeline), "Our People" (guest graph), "Puzzles" (puzzle page), "Schedule" (events), "Venue & Travel" (logistics), "Dress Code" (attire guidance).

### Password System
- **D-10:** Single password field — auto-detects which tier based on which password was entered. Guests don't know there are two tiers.
- **D-11:** Access persists indefinitely via localStorage. Once a guest enters the correct password, they don't need to enter it again.
- **D-12:** Wrong password gets a playful nudge (e.g., "Hmm, that's not it — check your invitation!") matching the warm, fun tone.
- **D-13:** Use placeholder passwords during development (e.g., "day2guest" and "fullaccess"). Real passwords will be swapped in before launch.

### Claude's Discretion
- Post-password transition approach (smooth reveal vs page redirect — pick whichever works best for the multi-page static site)
- Typography selection (pick a font pairing that complements the sunset warm palette)
- Mobile navigation pattern (hamburger menu vs bottom tab bar vs other approach)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core project context, constraints (GitHub Pages, static-only, free hosting), two-tier guest model
- `.planning/REQUIREMENTS.md` — Full requirement list; Phase 1 covers ACC-01 through ACC-05
- `.planning/ROADMAP.md` — Phase goals and success criteria

### Existing Code
- `narsh2026/index.html` — Current Supabase-based gate page (will be replaced)
- `narsh2026/app.js` — Current Supabase auth logic (will be replaced)
- `index.html` — Arash's personal/resume page at root (do not modify)

### Codebase Analysis
- `.planning/codebase/STACK.md` — Current stack: plain HTML/CSS/JS, no build tools, CDN-loaded dependencies
- `.planning/codebase/STRUCTURE.md` — Current file layout (7 files total)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None significant — existing code is a minimal Supabase gate prototype that will be fully replaced

### Established Patterns
- No build step: edit HTML/JS directly, push to main, GitHub Pages auto-deploys
- System font stack in use (will be replaced with custom fonts per D-04/Claude's discretion)
- Inline `<style>` blocks per HTML file (no external stylesheets yet — Phase 1 should establish a shared CSS file)
- `.hidden` CSS class for show/hide toggling

### Integration Points
- `CNAME` file maps to arashrai.com — must not be modified
- Root `index.html` is Arash's personal page — wedding content lives under `narsh2026/`
- GitHub Pages serves from the `main` branch root

</code_context>

<specifics>
## Specific Ideas

- The landing page should feel like "arriving at a doorstep" — welcoming, not gatekeeping
- Two-tier system is invisible to guests — they just enter "their password" and get the right level of access
- Password hint copy should reference "your invitation" as the source of the password

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Access & Design Foundation*
*Context gathered: 2026-05-16*
