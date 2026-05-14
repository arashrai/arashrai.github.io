# Testing

> Mapped: 2026-05-14

## Current State

**No tests exist.** No test framework, test files, or CI/CD pipeline configured.

## Test Infrastructure

| Component | Status |
|-----------|--------|
| Test framework | None |
| Test files | None |
| CI/CD | None (GitHub Pages auto-deploys on push to main) |
| Linting | None |
| Type checking | None |

## Manual Testing

The site can be tested by:
1. Opening HTML files directly in a browser (limited — Supabase calls require HTTPS)
2. Using a local server: `python3 -m http.server` or `npx serve`
3. Pushing to GitHub and testing on `arashrai.com`

## Recommendations

Given the small size and static nature:
- A local dev server would help test the Supabase auth flow without deploying
- Browser-based manual testing is sufficient at this scale
- Consider adding a `.github/workflows/` CI check if the site grows
