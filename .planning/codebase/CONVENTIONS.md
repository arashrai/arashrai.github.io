# Conventions

> Mapped: 2026-05-14

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
