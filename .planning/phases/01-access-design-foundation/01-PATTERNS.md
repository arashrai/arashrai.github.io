# Phase 1: Access & Design Foundation - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 10 (new or modified)
**Analogs found:** 5 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `narsh2026/index.html` (modify) | page | request-response | `narsh2026/index.html` (existing) | exact |
| `narsh2026/styles.css` (new) | config | N/A | `narsh2026/index.html` inline `<style>` block | partial |
| `narsh2026/auth.js` (new) | utility | event-driven | `narsh2026/app.js` | role-match |
| `narsh2026/nav.js` (new) | utility | event-driven | `narsh2026/app.js` | partial |
| `narsh2026/our-story/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |
| `narsh2026/our-people/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |
| `narsh2026/puzzles/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |
| `narsh2026/schedule/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |
| `narsh2026/venue-travel/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |
| `narsh2026/dress-code/index.html` (new) | page | request-response | `narsh2026/index.html` (existing) | role-match |

## Pattern Assignments

### `narsh2026/index.html` (page, request-response) -- MODIFY

**Analog:** `narsh2026/index.html` (existing, to be rewritten in place)

This file is being rewritten from a Supabase magic-link gate into a password gate with warm visual design. The existing file provides the structural pattern (gate div / content div toggle, form with status message, `<main>` wrapper). The Supabase CDN script and email form will be removed; a password input and new visual design will replace them.

**HTML structure pattern** (lines 1-7, 68-69):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>Narsh 2026</title>
    <!-- ... -->
  </head>
  <body>
    <main>
```

**Gate/content toggle pattern** (lines 70-83):
```html
<div id="gate">
  <h1>Narsh 2026</h1>
  <p>Enter your email to get access.</p>
  <form id="login-form">
    <input id="email" type="email" placeholder="you@example.com" autocomplete="email" required>
    <button id="submit" type="submit">Send link</button>
  </form>
  <div id="status" class="status"></div>
</div>

<div id="content" class="hidden">
  <h1>Coming soon</h1>
  <p>Thanks for confirming your email. Details are on the way.</p>
</div>
```

**What to keep:**
- `lang="en"` on `<html>`
- `<meta charset>` and `<meta viewport>` tags
- Gate div / content div structural approach (two mutually exclusive sections)
- `<main>` as primary container
- Status/feedback element with `aria-live="polite"` (add this attribute -- existing doesn't have it)

**What to change:**
- Remove Supabase CDN `<script>` tag (line 86)
- Remove `<script src="./app.js">` (line 87), replace with `auth.js` and `nav.js`
- Remove inline `<style>` block (lines 8-66), replace with `<link>` to `styles.css`
- Replace email input with password input
- Add hero image placeholder, couple's names, playful tagline (D-01, D-02, D-03)
- Add Google Fonts `<link>` tags with `preconnect`
- Add `class="auth-pending"` on `<body>` to prevent FOUC
- Add `<header>` with navigation for the authenticated/welcome view
- Add welcome content for post-password view

---

### `narsh2026/styles.css` (config, N/A) -- NEW

**Analog:** Inline `<style>` in `narsh2026/index.html` (lines 8-66)

The existing inline styles establish project conventions for CSS. The new `styles.css` will extract these into a shared file and expand them into a full design system with CSS custom properties.

**Existing CSS convention patterns** (`narsh2026/index.html` lines 8-66):
```css
/* Naming: plain class names, no BEM, no prefixes */
.hidden {
  display: none;
}

/* Layout pattern: max-width centered container */
main {
  max-width: 560px;
  margin: 96px auto;
  padding: 0 24px;
}

/* Typography: heading with tight letter-spacing */
h1 {
  font-size: 32px;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

/* Spacing: consistent margin-bottom pattern */
p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

/* Form elements: border-radius, consistent padding */
input[type="email"] {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

button {
  padding: 10px 14px;
  border: 1px solid #0b57d0;
  background: #0b57d0;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

**Also reference:** Root `index.html` (lines 9-53) for additional CSS patterns:
```css
/* Hover/focus states on links */
a {
  color: #0b57d0;
  text-decoration: none;
}
a:hover,
a:focus {
  text-decoration: underline;
}

/* Flex layout for link groups */
.links {
  display: flex;
  gap: 16px;
  font-size: 15px;
}
```

**Conventions to carry forward into `styles.css`:**
- Plain class names (`.hidden`, `.status`, `.links`), no BEM or prefixes
- `margin: 0 0 Npx 0` spacing pattern
- `border-radius: 6px` on form elements (will be replaced by CSS custom property `--radius-sm: 6px`)
- `:hover` and `:focus` states on interactive elements
- `:disabled` states on buttons
- `max-width` + `margin: auto` centered layout
- Letter-spacing `-0.02em` on headings

**New patterns not in existing code (from RESEARCH.md):**
- CSS custom properties on `:root` for all design tokens
- Sunset warm color palette (terracotta, golden, dusty rose, cream)
- Google Fonts typography (Playfair Display + Source Sans 3)
- `body.auth-pending main { visibility: hidden; }` for FOUC prevention
- Mobile-first media queries with breakpoint at 768px
- Soft shadows and rounded corners per D-05

---

### `narsh2026/auth.js` (utility, event-driven) -- NEW (replaces `app.js`)

**Analog:** `narsh2026/app.js` (lines 1-88)

The existing `app.js` is the closest analog. `auth.js` replaces its functionality (Supabase magic link) with client-side password hashing + localStorage tier storage. The structural patterns from `app.js` should be preserved.

**DOM reference pattern with `El` suffix** (`app.js` lines 5-10):
```javascript
const gateEl = document.getElementById("gate");
const contentEl = document.getElementById("content");
const formEl = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const statusEl = document.getElementById("status");
const submitEl = document.getElementById("submit");
```

**View toggle pattern** (`app.js` lines 21-28):
```javascript
const showContent = () => {
  gateEl.classList.add("hidden");
  contentEl.classList.remove("hidden");
};

const showGate = () => {
  contentEl.classList.add("hidden");
  gateEl.classList.remove("hidden");
};
```

**Form submit handler pattern** (`app.js` lines 55-82):
```javascript
formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "";
  submitEl.disabled = true;

  const email = emailEl.value.trim();
  if (!email) {
    statusEl.textContent = "Enter a valid email.";
    submitEl.disabled = false;
    return;
  }

  // ... async operation ...

  if (error) {
    statusEl.textContent = error.message;
    submitEl.disabled = false;
    return;
  }

  statusEl.textContent = "Check your email for the access link.";
  submitEl.disabled = false;
});
```

**IIFE initialization pattern** (`app.js` lines 84-87):
```javascript
(async () => {
  await exchangeIfCodePresent();
  await refreshAuthState();
})();
```

**Conventions to preserve:**
- `const` everywhere, no `let` or `var`
- `El` suffix on DOM element references
- `event.preventDefault()` in form submit
- `submitEl.disabled = true/false` for button state during async ops
- `statusEl.textContent = "..."` for feedback messages
- Guard clause / early return pattern for validation
- No modules -- single IIFE or revealing module pattern
- Double quotes for strings
- Semicolons at end of statements
- 2-space indentation

**What changes (not carried from analog):**
- Remove all Supabase references (URL, anon key, SDK calls)
- Replace email input handling with password input handling
- Add SHA-256 hashing via `crypto.subtle.digest()` (new -- no analog in codebase)
- Add localStorage read/write for tier persistence (new -- no analog)
- Add `requireAuth()` function for section pages to call (new)
- Add `applyTierVisibility()` for data-tier attribute filtering (new)
- Wrap in IIFE module pattern `const NARSH_AUTH = (() => { ... return { ... }; })()` instead of bare top-level code
- Add try/catch around localStorage calls for private browsing fallback

---

### `narsh2026/nav.js` (utility, event-driven) -- NEW

**Analog:** `narsh2026/app.js` (partial -- event listener and DOM toggle patterns)

There is no navigation JS in the existing codebase. The closest structural pattern is `app.js`'s event listener and class toggle approach.

**Event listener + class toggle pattern** (`app.js` lines 21-28, 55):
```javascript
// Class toggle for visibility (reuse this pattern for nav open/close)
const showContent = () => {
  gateEl.classList.add("hidden");
  contentEl.classList.remove("hidden");
};

// Event listener attachment
formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  // ...
});
```

**Conventions to apply:**
- `const` for all declarations
- `El` suffix on DOM references (e.g., `toggleEl`, `navEl`)
- `classList.add()` / `classList.remove()` / `classList.toggle()` for state changes
- `<button>` element (not `<div>`) as toggle target
- Set `aria-expanded` attribute on toggle button
- Handle Escape key to close nav
- Double quotes, semicolons, 2-space indent

---

### `narsh2026/our-story/index.html` (page, request-response) -- NEW
### `narsh2026/our-people/index.html` (page, request-response) -- NEW
### `narsh2026/puzzles/index.html` (page, request-response) -- NEW
### `narsh2026/schedule/index.html` (page, request-response) -- NEW
### `narsh2026/venue-travel/index.html` (page, request-response) -- NEW
### `narsh2026/dress-code/index.html` (page, request-response) -- NEW

**Analog:** `narsh2026/index.html` (existing, lines 1-89) for HTML boilerplate structure

All six section pages follow an identical template pattern. They differ only in `<title>`, the `class="active"` nav link, the `<h1>` heading, and the page-specific content (all "Coming soon" placeholders for now).

**HTML boilerplate pattern** (`narsh2026/index.html` lines 1-7):
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>Narsh 2026</title>
```

**Body structure pattern** (`narsh2026/index.html` lines 68-69):
```html
  <body>
    <main>
```

**Script loading pattern** (`narsh2026/index.html` lines 86-88, adapted):
```html
    <script src="/narsh2026/auth.js"></script>
    <script src="/narsh2026/nav.js"></script>
    <script>
      const tier = NARSH_AUTH.requireAuth();
      if (tier) NARSH_AUTH.applyTierVisibility(tier);
    </script>
  </body>
</html>
```

**Conventions to apply (from existing code):**
- `lang="en"` on `<html>`
- `<meta charset>` then `<meta viewport>` as first two head elements
- 2-space indentation throughout
- `<main>` as primary content container
- Scripts at bottom of `<body>`, before `</body>`

**New patterns not in existing code (from RESEARCH.md):**
- `<body class="auth-pending">` to prevent FOUC
- Google Fonts `<link>` tags with `preconnect` in `<head>`
- `<link rel="stylesheet" href="/narsh2026/styles.css">` (external stylesheet instead of inline)
- `<header class="site-header">` with nav element and 6 section links
- Root-relative paths (`/narsh2026/styles.css`, `/narsh2026/auth.js`) to avoid path depth issues
- `class="active"` on current section's nav link

---

## Shared Patterns

### HTML Document Boilerplate
**Source:** `narsh2026/index.html` lines 1-7, `index.html` lines 1-8
**Apply to:** All HTML files (landing page + 6 section pages)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narsh 2026">
    <title>[Section Name] -- Narsh 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/narsh2026/styles.css">
  </head>
```

### DOM Reference Naming Convention
**Source:** `narsh2026/app.js` lines 5-10
**Apply to:** `auth.js`, `nav.js`, any inline `<script>` blocks
```javascript
// All DOM element variables end with El suffix
const gateEl = document.getElementById("gate");
const formEl = document.getElementById("password-form");
const inputEl = document.getElementById("password-input");
const statusEl = document.getElementById("gate-status");
const toggleEl = document.querySelector(".nav-toggle");
const navEl = document.getElementById("site-nav");
```

### CSS Class Toggle for State
**Source:** `narsh2026/app.js` lines 21-28, `narsh2026/index.html` line 63-65
**Apply to:** `auth.js` (gate/content toggle), `nav.js` (menu open/close)
```javascript
// Show/hide via CSS class toggle -- not inline style manipulation
element.classList.add("hidden");
element.classList.remove("hidden");

// Also used for body-level state
document.body.classList.remove("auth-pending");
document.body.classList.add("nav-open");
```

### Form Submit Handler
**Source:** `narsh2026/app.js` lines 55-82
**Apply to:** `auth.js` (password form submission)
```javascript
formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "";
  submitEl.disabled = true;

  // Validate input
  const value = inputEl.value.trim();
  if (!value) {
    statusEl.textContent = "Please enter a password.";
    submitEl.disabled = false;
    return;
  }

  // Async operation (hash + compare)
  // ...

  // Error feedback
  statusEl.textContent = "Hmm, that's not it -- check your invitation!";
  submitEl.disabled = false;
});
```

### Centered Layout Container
**Source:** `narsh2026/index.html` lines 18-23, `index.html` lines 22-25
**Apply to:** `styles.css` (base layout)
```css
/* Existing pattern -- centered max-width container with horizontal padding */
main {
  max-width: 560px;
  margin: 96px auto;
  padding: 0 24px;
}
```

### Interactive Element States
**Source:** `narsh2026/index.html` lines 53-57, `index.html` lines 46-53
**Apply to:** `styles.css` (buttons, links)
```css
/* Button disabled state */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Link hover/focus states */
a:hover,
a:focus {
  text-decoration: underline;
}
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `narsh2026/styles.css` | config | N/A | No external CSS file exists yet; all styles are inline. RESEARCH.md Pattern 3 (CSS Custom Properties Design System) provides the full pattern. |
| `narsh2026/nav.js` | utility | event-driven | No navigation exists in the codebase. RESEARCH.md Pattern 4 (Responsive Navigation) provides the full pattern. Only the DOM reference naming and class toggle conventions carry over from `app.js`. |

Note: While these files have no direct analog, they should still follow project conventions extracted from existing code: `const` declarations, `El` suffix on DOM refs, double quotes, semicolons, 2-space indentation, plain CSS class names (no BEM), `classList` for state toggling.

## Files to Remove

| File | Reason |
|------|--------|
| `narsh2026/app.js` | Replaced by `narsh2026/auth.js`. Contains Supabase magic link logic and hardcoded Supabase credentials that are no longer needed. |

## Metadata

**Analog search scope:** `/Users/nataliefleury/programming/arashrai.github.io/` (all source files excluding `.git/`, `.planning/`, `.claude/`)
**Files scanned:** 8 (total source files in project)
**Analog files read:** 3 (`narsh2026/index.html`, `narsh2026/app.js`, `index.html`)
**Pattern extraction date:** 2026-05-17
