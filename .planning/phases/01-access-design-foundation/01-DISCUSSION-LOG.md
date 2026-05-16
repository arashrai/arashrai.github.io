# Phase 1: Access & Design Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 1-Access & Design Foundation
**Areas discussed:** Landing page personality, Color palette & fonts, Navigation & sections, Password experience

---

## Landing Page Personality

| Option | Description | Selected |
|--------|-------------|----------|
| Warm welcome first | Couple's names, a photo or illustration, playful tagline, then password field below — feels like arriving at a doorstep | ✓ |
| Mystery teaser | Minimal reveal — just names/monogram, hint of color, password field. "What's behind the door" feeling | |
| Full splash page | Scroll-down experience with hero image/animation, names big, welcome message, THEN password gate further down | |

**User's choice:** Warm welcome first
**Notes:** Landing page should feel inviting, not like a locked gate

### Visual at the top

| Option | Description | Selected |
|--------|-------------|----------|
| A couple photo | A real photo of Natalie and Arash — immediately personal and warm. Placeholder for now. | ✓ |
| Custom illustration | Hand-drawn or illustrated graphic — more whimsical but needs asset created | |
| Colorful pattern/texture | No specific image — warm gradient, confetti, or abstract colorful background | |
| You decide | Let Claude pick | |

**User's choice:** A couple photo (placeholder for now)

### Tagline tone

| Option | Description | Selected |
|--------|-------------|----------|
| Playful & fun | Cheeky or lighthearted — personality-forward | ✓ |
| Warm & heartfelt | Genuine and sweet — less jokey, more emotional | |
| Short & elegant | Minimal copy — let the design speak | |

**User's choice:** Playful & fun

### Post-password transition

| Option | Description | Selected |
|--------|-------------|----------|
| Smooth reveal | Gate fades away, main content slides/fades in on same page | |
| Page redirect | Navigates to a separate main page — cleaner separation | |
| You decide | Let Claude pick what works best | ✓ |

**User's choice:** You decide (Claude's discretion)

---

## Color Palette & Fonts

### Color mood

| Option | Description | Selected |
|--------|-------------|----------|
| Sunset warm tones | Terracotta, golden yellow, dusty rose, warm cream — earthy and romantic | ✓ |
| Bold & poppy | Bright coral, teal, marigold, rich purple — high-energy, maximalist | |
| Soft pastels | Blush pink, lavender, mint, peach — playful but gentle | |
| Jewel tones | Deep burgundy, emerald, sapphire, gold accents — warm and rich | |

**User's choice:** Sunset warm tones

### Typography direction

| Option | Description | Selected |
|--------|-------------|----------|
| Script + clean sans | Handwritten/script for headings, clean sans for body — romantic and personal | |
| Rounded friendly sans | Soft, rounded sans-serif throughout (Nunito, Quicksand) — approachable, modern | |
| Serif + sans pairing | Elegant serif for headings (Playfair Display), simple sans for body — classic | |
| You decide | Let Claude pick the best pairing | ✓ |

**User's choice:** You decide (Claude's discretion)

### Playful touches

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle warmth | Rounded corners, soft shadows, warm backgrounds, gentle hover effects | ✓ |
| Fun accents | Small illustrations, playful micro-animations, hand-drawn dividers | |
| Mix of both | Clean layout with a few standout playful moments at key spots | |

**User's choice:** Subtle warmth

### Design references

| Option | Description | Selected |
|--------|-------------|----------|
| No references | Let the sunset warm + subtle warmth direction guide | ✓ |
| I have some | Will share URLs or names | |

**User's choice:** No references

---

## Navigation & Sections

### Site structure

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-page | Separate HTML files per section — each has its own URL | ✓ |
| Single page with sections | One HTML file, nav scrolls/shows/hides sections | |
| You decide | Let Claude pick | |

**User's choice:** Multi-page

### Nav items

| Option | Description | Selected |
|--------|-------------|----------|
| All sections upfront | Show all nav items from day one with "Coming soon" placeholders | ✓ |
| Only built sections | Nav only shows sections with content — grows per phase | |
| Core + coming soon hints | 2-3 key sections now, subtle "more coming" indicator | |

**User's choice:** All sections upfront

### Mobile nav

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger menu | Classic three-line icon, slide-out/dropdown — saves space, familiar | |
| Bottom tab bar | Fixed tabs at bottom like a mobile app — always visible, thumb-friendly | |
| You decide | Let Claude pick | ✓ |

**User's choice:** You decide (Claude's discretion)

### Section labels

| Option | Description | Selected |
|--------|-------------|----------|
| Those names are great | Our Story, Our People, Puzzles, Schedule, Venue & Travel, Dress Code | ✓ |
| I want different names | User suggests own section names | |
| You decide | Let Claude come up with labels fitting the tone | |

**User's choice:** Those names are great

---

## Password Experience

### Two-tier system UX

| Option | Description | Selected |
|--------|-------------|----------|
| Single field, auto-detects tier | One input — site checks which password was entered, unlocks appropriate tier | ✓ |
| Single field with tier hint | One input with note like "Your password was in your invitation" | |
| Two separate fields | Visually distinguish tiers — "Guest password" and "VIP password" | |

**User's choice:** Single field, auto-detects tier

### Session persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Remember indefinitely | localStorage — never need password again | ✓ |
| Remember for a while | Expiration (e.g., 30 days) | |
| Never remember | Require password every time | |

**User's choice:** Remember indefinitely

### Wrong password behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Playful nudge | Warm, on-brand message like "Hmm, that's not it — check your invitation!" | ✓ |
| Simple error | Straightforward "Incorrect password, try again" | |
| You decide | Let Claude pick matching the tone | |

**User's choice:** Playful nudge

### Actual passwords

| Option | Description | Selected |
|--------|-------------|----------|
| Use placeholders | Placeholder passwords for development (swap in real ones later) | ✓ |
| I'll share them now | Passwords ready to provide | |

**User's choice:** Use placeholders

---

## Claude's Discretion

- Post-password transition (smooth reveal vs page redirect)
- Typography selection (font pairing for sunset warm palette)
- Mobile navigation pattern (hamburger vs bottom tab vs other)

## Deferred Ideas

None — discussion stayed within phase scope
