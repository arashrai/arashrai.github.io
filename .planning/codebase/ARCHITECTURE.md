# Architecture

> Mapped: 2026-05-14

## Pattern

**Static site with client-side auth gate.** No server, no build step, no routing framework. Two independent pages served by GitHub Pages.

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
User visits /narsh2026/
  → app.js checks URL for ?code= param
    → If present: exchange code for session via Supabase
  → app.js checks Supabase session
    → If authenticated: hide #gate, show #content
    → If not: show #gate (email form)
  → User submits email
    → Supabase sends magic link
    → User clicks link → redirected back with ?code=
    → Session established → content shown
```

## Entry Points

| Path | File | Description |
|------|------|-------------|
| `/` | `index.html` | Arash's personal/resume page |
| `/narsh2026/` | `narsh2026/index.html` | Wedding page (email-gated) |

## Abstractions

Minimal. The codebase uses vanilla DOM manipulation with no abstraction layers:
- Direct `document.getElementById()` for element references
- Inline async functions for auth flow
- CSS class toggling (`.hidden`) for view switching
