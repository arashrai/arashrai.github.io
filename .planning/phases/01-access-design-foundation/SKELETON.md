# Walking Skeleton -- Narsh 2026

**Phase:** 1
**Generated:** 2026-05-17

## Capability Proven End-to-End

A wedding guest can enter a password on the landing page, get access to the site with tier-appropriate content visibility, and navigate to six section pages -- all styled with the warm sunset design system and deployed via GitHub Pages.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | None -- vanilla HTML/CSS/JS | Project constraint: no build step, no frameworks; edit files, push to main, GitHub Pages deploys |
| Data layer | localStorage | No server-side runtime; localStorage stores the guest tier ("day2" or "full") indefinitely per D-11 |
| Auth | Client-side SHA-256 password hashing via Web Crypto API | "Polite lock" UX feature, not a security boundary; SHA-256 obscures passwords in source; appropriate for wedding site |
| Deployment target | GitHub Pages (main branch, arashrai.com/narsh2026/) | Already configured with CNAME; zero-cost, auto-deploys on push |
| Directory layout | `narsh2026/` root with subdirectory-per-section (`our-story/index.html`, etc.) | Clean URLs via GitHub Pages directory index; each section is a separate HTML file per D-07 |
| Styling | Single shared `styles.css` with CSS custom properties | Design system consistency across 7+ pages; replaces per-page inline `<style>` blocks |
| Typography | Playfair Display (heading) + Source Sans 3 (body) via Google Fonts CDN | Warm, celebratory serif + clean readable sans-serif; complements sunset palette |
| Navigation | Hamburger overlay (mobile) + horizontal bar (desktop) | 6 nav items too many for tab bar; hamburger is standard for 5+ links |

## Stack Touched in Phase 1

- [x] Project scaffold -- no framework init needed; existing repo structure with `narsh2026/` directory
- [x] Routing -- 7 HTML pages with directory-based URLs served by GitHub Pages
- [x] Persistence -- localStorage read/write for tier storage (no database in this project)
- [x] UI -- password form with SHA-256 validation, gate/welcome toggle, responsive navigation
- [x] Deployment -- `git push origin main` auto-deploys via GitHub Pages (already configured)

## Out of Scope (Deferred to Later Slices)

- Timeline map content and interactivity (Phase 2)
- Guest relationship graph visualization (Phase 3)
- Puzzle page interactive content (Phase 4)
- Event schedule with tier-aware content, venue details, dress code guidance (Phase 5)
- Real couple photo (placeholder used; photo swapped in later)
- Real passwords (placeholder "day2guest" / "fullaccess" swapped before launch)
- Favicon update (existing favicon works, not blocking any requirements)
- Dark mode (only light theme implemented; `color-scheme` declaration removed)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Interactive world map timeline with scroll-driven fly-to animations and photo slideshows
- Phase 3: Force-directed guest graph with family tree layout and group filters
- Phase 4: Custom word-association puzzle game and curated puzzle links
- Phase 5: Tier-aware event schedule, venue/travel info, and dress code guidance pages
