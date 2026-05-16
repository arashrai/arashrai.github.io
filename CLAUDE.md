<!-- GSD:project-start source:PROJECT.md -->
## Project

**Narsh 2026 — Wedding Website**

A fun, personality-forward wedding website for Natalie Fleury & Arash Rai's September 2026 wedding. More than logistics — it tells the story of two people growing up across the world and finding each other, helps guests meet each other before the big day, and wraps it all in warmth, whimsy, and a love of puzzles.

**Core Value:** Guests feel a personal, heartfelt connection to Natalie and Arash's story — the site isn't a formality, it's an experience.

### Constraints

- **Hosting**: GitHub Pages (static files only, no server-side rendering)
- **Domain**: arashrai.com (CNAME already configured)
- **Budget**: Free hosting, minimize paid services
- **Content**: Photos are a future task — site structure should work with placeholders
- **Timeline**: No hard deadline, ship incrementally before September 2026
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
| Language | Usage | Files |
|----------|-------|-------|
| HTML | Page structure and inline CSS | `index.html`, `narsh2026/index.html` |
| JavaScript | Client-side auth logic | `narsh2026/app.js` |
| CSS | Inline in `<style>` tags | Embedded in both HTML files |
## Runtime
- **Platform**: Static site — no server-side runtime
- **Hosting**: GitHub Pages (via `CNAME` → `arashrai.com`)
- **CDN**: jsdelivr.net for Supabase JS SDK
## Frameworks & Libraries
| Library | Version | Source | Purpose |
|---------|---------|--------|---------|
| @supabase/supabase-js | v2 (latest via CDN) | `narsh2026/index.html:86` | Auth (magic link OTP) |
## Configuration
| File | Purpose |
|------|---------|
| `CNAME` | GitHub Pages custom domain → `arashrai.com` |
## Key Patterns
- **No build step**: Edit HTML/JS directly, push to `main`, GitHub Pages deploys automatically
- **System font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Inline styles**: All CSS lives in `<style>` blocks within each HTML file (no external stylesheets)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- **Indentation**: 2 spaces (HTML and JS)
- **Quotes**: Double quotes in HTML attributes, double quotes in JS strings
- **Semicolons**: Yes (JS)
- **Variable declarations**: `const` throughout (no `let` or `var`)
- **DOM references**: Suffix `El` for element variables (e.g., `gateEl`, `formEl`, `emailEl`)
## CSS Patterns
- **Inline styles**: All CSS in `<style>` blocks per page (no external stylesheets)
- **Color scheme**: `color-scheme: light dark` declared but only light colors defined
- **Layout**: `max-width` centered container with `margin: auto`
- **Typography**: System font stack, tight letter-spacing on headings (`-0.02em`)
- **Spacing**: Consistent use of `margin: 0 0 Npx 0` pattern
- **Interaction states**: `:hover` / `:focus` on links, `:disabled` on buttons
## JavaScript Patterns
- **No modules**: Single script file, no imports/exports
- **Async/await**: Used throughout for Supabase calls
- **IIFE**: Main flow wrapped in `(async () => { ... })()` at `app.js:84-87`
- **Error handling**: Checks `error` return from Supabase, shows message in status div
- **Guard clause**: Early return pattern in `exchangeIfCodePresent()` when no code param
## HTML Patterns
- **Semantic elements**: `<main>` used as primary container
- **Accessibility**: `lang="en"`, `autocomplete="email"`, `required` on inputs
- **CDN loading**: External scripts loaded before local scripts (Supabase SDK → app.js)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern
## Pages
### Root (`/`) — Arash's Personal Page
- `index.html` — Static resume/bio page
- No JavaScript, no interactivity
- Links to GitHub, LinkedIn, resume PDF
### Wedding Subpage (`/narsh2026/`) — Email-Gated Wedding Page
- `narsh2026/index.html` — HTML structure with login form and gated content
- `narsh2026/app.js` — Supabase auth logic
- **Gate pattern**: Two `<div>` containers (`#gate` and `#content`), toggled via `.hidden` CSS class based on auth state
## Data Flow
```
```
## Entry Points
| Path | File | Description |
|------|------|-------------|
| `/` | `index.html` | Arash's personal/resume page |
| `/narsh2026/` | `narsh2026/index.html` | Wedding page (email-gated) |
## Abstractions
- Direct `document.getElementById()` for element references
- Inline async functions for auth flow
- CSS class toggling (`.hidden`) for view switching
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
