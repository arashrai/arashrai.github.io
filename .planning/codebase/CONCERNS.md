# Concerns

> Mapped: 2026-05-14

## Security

### Supabase Anon Key Exposed in Source (`narsh2026/app.js:2-3`)
- **Severity**: Low
- The anon key is designed to be public (used client-side), so this is expected Supabase behavior
- Row-Level Security (RLS) policies on the Supabase project control actual data access
- **Action**: Ensure RLS policies are properly configured in the Supabase dashboard

### No Content Security Policy
- **Severity**: Low
- No CSP headers configured — relies on GitHub Pages defaults
- CDN script from `cdn.jsdelivr.net` loaded without `integrity` attribute (SRI)
- **Action**: Consider adding `integrity` and `crossorigin` attributes to the CDN script tag

## Functionality Gaps

### Wedding Content is Placeholder
- `narsh2026/` shows "Coming soon" after auth — no actual wedding details
- Needs: date, venue, RSVP, schedule, travel info, registry, etc.

### No RSVP System
- Supabase is only used for email-gated access, not for collecting RSVPs
- Will need a data model (Supabase tables or alternative) for guest responses

### No Guest List Management
- No way to restrict access to invited guests only
- Current auth allows any email to request a magic link
- **Action**: Consider allowlisting invited emails or using Supabase invite-only auth

## Technical Debt

### Duplicated CSS
- `index.html` and `narsh2026/index.html` share similar styles (font stack, colors, spacing) but each has its own `<style>` block
- Will diverge as the wedding page grows
- **Action**: Extract shared styles to a common CSS file if/when the site grows

### No Local Dev Environment
- No `package.json`, dev server, or hot reload
- Testing auth flow requires deploying to GitHub Pages or running a manual local server

## Performance

No concerns — the site is <5KB total (excluding PDF and favicon), loads one external script.
