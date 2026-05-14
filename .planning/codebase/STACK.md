# Stack

> Mapped: 2026-05-14

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

No build tools, bundlers, package managers, or transpilers. All dependencies loaded via CDN `<script>` tags.

## Configuration

| File | Purpose |
|------|---------|
| `CNAME` | GitHub Pages custom domain → `arashrai.com` |

No `.env`, `package.json`, or config files. Supabase credentials are hardcoded in `narsh2026/app.js:1-3`.

## Key Patterns

- **No build step**: Edit HTML/JS directly, push to `main`, GitHub Pages deploys automatically
- **System font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Inline styles**: All CSS lives in `<style>` blocks within each HTML file (no external stylesheets)
