# Narsh 2026 — Wedding Website

## What This Is

A fun, personality-forward wedding website for Natalie Fleury & Arash Rai's September 2026 wedding. More than logistics — it tells the story of two people growing up across the world and finding each other, helps guests meet each other before the big day, and wraps it all in warmth, whimsy, and a love of puzzles.

## Core Value

Guests feel a personal, heartfelt connection to Natalie and Arash's story — the site isn't a formality, it's an experience.

## Requirements

### Validated

- ✓ Static site hosted on GitHub Pages with custom domain (arashrai.com) — existing
- ✓ Wedding subpage at `/narsh2026/` with basic page structure — existing
- ✓ Supabase integration for auth flow — existing (will be replaced with password-based access)

### Active

- [ ] Map-driven photo timeline showing Arash and Natalie's parallel life stories converging
- [ ] Interactive guest graph combining family tree and social connections with filters
- [ ] Custom "Clues by Sam" puzzle featuring the couple, cats, and family/friends
- [ ] Links to favorite daily puzzles
- [ ] Tiered password access (Day 2 password for most guests, full-access password for multi-day guests)
- [ ] Event timeline/schedule page
- [ ] Venue and travel information page
- [ ] Dress code information
- [ ] Photo storage and optimized delivery for timeline images
- [ ] Warm, playful, colorful visual design with fun animations

### Out of Scope

- RSVP system — not needed, handled separately
- Email-based auth / magic links — replacing with simpler password approach
- Mobile app — web only
- Real-time features — static site is sufficient
- Video content — photos only for timeline

## Context

Arash's existing personal site (arashrai.com) is being transformed into the wedding website. The site is a GitHub Pages static site with no build tools or frameworks — just HTML, CSS, and JS. A Supabase magic link gate was prototyped at `/narsh2026/` but will be replaced with a simpler password-based tiered access model.

**Two guest tiers:**
- **Day 2 guests** (majority) — see Day 2 event info only
- **Multi-day guests** — see full schedule across all days

**Timeline geography (broad strokes):**
- Arash: India (birth, 1997) → New Zealand (age ~4) → Canada (SHAD Valley, Waterloo)
- Natalie: Cayman Islands (birth, 1999) → [childhood locations] → Canada (SHAD Valley, Waterloo)
- Together: SHAD Valley (met) → Waterloo → internship cities → Seattle

**Photos:** Not yet curated, 1-3 per timeline stop, ~15-20 stops total. Need storage recommendation (repo-committed vs CDN).

**Design direction:** Warm & playful — colorful, personality-forward, fun animations. Not minimal/corporate.

## Constraints

- **Hosting**: GitHub Pages (static files only, no server-side rendering)
- **Domain**: arashrai.com (CNAME already configured)
- **Budget**: Free hosting, minimize paid services
- **Content**: Photos are a future task — site structure should work with placeholders
- **Timeline**: No hard deadline, ship incrementally before September 2026

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace Supabase magic links with password-based access | Simpler for guests, supports two-tier access naturally | — Pending |
| Static site (no framework) | Existing approach, GitHub Pages compatible, no build step needed | — Pending |
| Photo storage approach | Need to decide: repo-committed (simple) vs CDN like Cloudinary (scalable) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-15 after initialization*
