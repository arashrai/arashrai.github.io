---
phase: 01-access-design-foundation
reviewed: 2026-05-17T19:30:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - narsh2026/auth.js
  - narsh2026/dress-code/index.html
  - narsh2026/images/couple-placeholder.svg
  - narsh2026/index.html
  - narsh2026/nav.js
  - narsh2026/our-people/index.html
  - narsh2026/our-story/index.html
  - narsh2026/puzzles/index.html
  - narsh2026/schedule/index.html
  - narsh2026/styles.css
  - narsh2026/venue-travel/index.html
findings:
  critical: 3
  warning: 3
  info: 2
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-17T19:30:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This review covers the wedding website's access-control foundation: a client-side password gate with two-tier visibility, shared CSS design system, mobile navigation, and six subpages. The core architecture is a static site with client-side-only authentication using SHA-256 password hashing and localStorage persistence.

The primary concern is that the authentication model is trivially bypassable by anyone with basic browser knowledge (DevTools console). While the comments acknowledge these are placeholder passwords, the underlying mechanism itself has structural security flaws that persist regardless of password strength. Additionally, a tier-escalation bug allows day2 guests to access full-tier content by editing localStorage. Multiple HTML pages also have a content-exposure issue where the header and navigation remain visible before the auth redirect fires.

## Critical Issues

### CR-01: Authentication bypass via localStorage manipulation

**File:** `narsh2026/auth.js:30-35`
**Issue:** The `getTier()` function reads the tier directly from localStorage without any integrity check. Any visitor can open the browser console and run `localStorage.setItem("narsh-tier", "full")` then reload the page to gain full access. The `requireAuth()` function on line 46 trusts this value unconditionally -- it only checks whether *any* value exists, not whether it was set by a valid password check. This is not a theoretical concern; it requires zero technical skill beyond "open DevTools."
**Fix:** For a static site (no server), there is no way to make this truly secure. However, you can raise the bar significantly by storing a signed token rather than a bare tier string. For example, store the hash output itself as the token and validate it on each page load:

```javascript
const setTier = (tier, hash) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier, token: hash }));
  } catch {}
};

const getTier = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && TIER_HASHES[stored.tier] === stored.token) {
      return stored.tier;
    }
    return null;
  } catch {
    return null;
  }
};
```

This ensures a visitor must know a valid password hash to forge a tier value. It is not cryptographically strong (the hashes are in the JS source), but it prevents the trivial one-line console bypass.

### CR-02: Tier escalation from day2 to full via localStorage

**File:** `narsh2026/auth.js:65-71`
**Issue:** A day2 guest can escalate their access by changing the localStorage value from `"day2"` to `"full"`. The `applyTierVisibility` function only hides `[data-tier='full']` elements when `tier === "day2"`. Setting the value to `"full"` causes this check to be skipped, revealing all content. This is demonstrated on `narsh2026/schedule/index.html:33-35` which has a `data-tier="full"` section. Even without CR-01's fix, the tier value is never re-validated against the password.
**Fix:** This is addressed by the same token-validation approach described in CR-01. Additionally, `applyTierVisibility` should use a whitelist approach rather than a blacklist:

```javascript
const applyTierVisibility = (tier) => {
  const TIER_LEVELS = { "day2": 1, "full": 2 };
  const userLevel = TIER_LEVELS[tier] || 0;
  document.querySelectorAll("[data-tier]").forEach(el => {
    const requiredLevel = TIER_LEVELS[el.dataset.tier] || 0;
    if (userLevel < requiredLevel) {
      el.style.display = "none";
    }
  });
  document.body.classList.remove("auth-pending");
};
```

### CR-03: Placeholder passwords shipped in source code with documented cleartext values

**File:** `narsh2026/auth.js:13-19`
**Issue:** The comments on lines 14-16 explicitly document the plaintext passwords ("day2guest" and "fullaccess"). While the code states "Replace these with real password hashes before production deploy," these placeholder values are already deployed on GitHub Pages (the site deploys from `main` automatically per CLAUDE.md line 41). Any visitor can read the JS source, see the comment, and log in immediately. The hashes themselves are unsalted SHA-256 of the documented cleartext, confirmed by verification (`echo -n "day2guest" | sha256sum` matches the day2 hash).
**Fix:** Remove the cleartext password values from comments immediately. Replace the hashes with production values. Even for placeholder/dev use, never document cleartext passwords in shipped source:

```javascript
// Pre-computed SHA-256 hashes of tier passwords.
// To regenerate: node -e "const c=require('crypto');console.log(c.createHash('sha256').update('PASSWORD').digest('hex'))"
const TIER_HASHES = {
  "day2": "<hash-of-actual-day2-password>",
  "full": "<hash-of-actual-full-password>"
};
```

## Warnings

### WR-01: Protected page content exposed in HTML source before auth redirect

**File:** `narsh2026/schedule/index.html:30-36` (and all subpages)
**Issue:** On subpages, `body.auth-pending main { visibility: hidden; }` hides the `<main>` content visually, but: (1) the `<header>` with full navigation links is outside `<main>` and always visible, revealing site structure to unauthenticated users; (2) the content is in the HTML source regardless of visibility; (3) there is a window between page load and `requireAuth()`'s redirect where the header renders. For `schedule/index.html`, the `data-tier="full"` content on lines 33-35 is served to all visitors in the HTML.
**Fix:** Move tier-gated content out of static HTML into a separate JS-loaded mechanism, or at minimum move the `<header>` inside `<main>` so it is also hidden by `auth-pending`. For the redirect timing, add an immediate return after `window.location.href`:

```javascript
const tier = NARSH_AUTH.requireAuth();
if (!tier) {
  // requireAuth already set location.href; stop executing
  throw new Error("redirecting");
}
NARSH_AUTH.applyTierVisibility(tier);
```

### WR-02: No password strength enforcement -- unsalted SHA-256 enables trivial offline cracking

**File:** `narsh2026/auth.js:22-28`
**Issue:** Passwords are hashed with plain SHA-256 (no salt, no key-stretching). The `hashPassword` function also lowercases and trims the input, reducing the keyspace. SHA-256 is not a password hashing algorithm -- it is designed to be fast, enabling billions of guesses per second with commodity hardware. For a wedding site with short, dictionary-based passwords, the hashes can be reversed in seconds via rainbow tables or brute force. While the passwords are already documented in comments (CR-03), even after fixing CR-03, using unsalted SHA-256 for password hashing remains a weakness.
**Fix:** For a static site that cannot use server-side bcrypt/scrypt, consider using the Web Crypto API's PBKDF2 with a fixed public salt and high iteration count:

```javascript
const hashPassword = async (password) => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(password.trim().toLowerCase()), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode("narsh2026"), iterations: 100000, hash: "SHA-256" },
    key, 256
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
};
```

### WR-03: `requireAuth()` does not halt page execution after redirect

**File:** `narsh2026/auth.js:46-52`
**Issue:** When `requireAuth()` sets `window.location.href`, it returns `undefined` (implicitly). But the calling code on every subpage (e.g., `schedule/index.html:41-44`) does `const tier = NARSH_AUTH.requireAuth(); if (tier) { ... }`. When there is no tier, `requireAuth()` triggers a redirect but still returns `undefined`. The `if (tier)` guard prevents `applyTierVisibility` from running, but any code added after this block in future would execute before the redirect completes. More immediately, the header navigation is already visible during this window.
**Fix:** Have `requireAuth()` return `null` explicitly and document that callers must halt execution:

```javascript
const requireAuth = () => {
  const tier = getTier();
  if (!tier) {
    window.location.replace(GATE_URL);
    return null;
  }
  return tier;
};
```

Also use `location.replace()` instead of `location.href` to prevent the protected page from appearing in browser history (back-button bypass).

## Info

### IN-01: Hamburger animation has no X-state transform

**File:** `narsh2026/styles.css:203-232`
**Issue:** The hamburger icon defines `::before` and `::after` pseudo-elements with `transition: transform`, but there are no `.nav-open` transform rules to animate the hamburger into an X shape. The nav overlay opens, but the toggle button still looks like three lines rather than a close icon. This is a UX gap rather than a bug.
**Fix:** Add transform rules for the open state:

```css
.nav-open .nav-toggle-icon {
  background: transparent;
}
.nav-open .nav-toggle-icon::before {
  top: 0;
  transform: rotate(45deg);
}
.nav-open .nav-toggle-icon::after {
  top: 0;
  transform: rotate(-45deg);
}
```

### IN-02: Convention drift -- external stylesheet vs documented inline-styles pattern

**File:** `narsh2026/styles.css:1`
**Issue:** CLAUDE.md documents the convention as "Inline styles: All CSS in `<style>` blocks per page (no external stylesheets)" (line 56). This implementation introduces an external `styles.css` file, which contradicts the documented convention. The STACK.md section (line 43) also states "Inline styles" as a key pattern. This is intentional architectural evolution (shared design system), but the project documentation has not been updated to reflect it.
**Fix:** Update CLAUDE.md's conventions and stack sections to reflect the new pattern of a shared external stylesheet. No code change needed.

---

_Reviewed: 2026-05-17T19:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
