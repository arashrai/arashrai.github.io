# Integrations

> Mapped: 2026-05-14

## External Services

### Supabase (Auth)

- **Project URL**: `https://puaovacwoxelmijgowof.supabase.co`
- **Auth method**: Magic link OTP (`signInWithOtp`)
- **Key type**: Anon key (public, client-safe)
- **Used in**: `narsh2026/app.js`
- **Flow**:
  1. User enters email → `signInWithOtp()` sends magic link
  2. User clicks link → redirected back with `?code=` param
  3. `exchangeCodeForSession()` exchanges code for session
  4. Session stored in browser → gated content revealed

### GitHub Pages (Hosting)

- **Repository**: `arashrai/arashrai.github.io`
- **Custom domain**: `arashrai.com` (configured via `CNAME` file)
- **Deploy**: Push to `main` → auto-deploy

## Databases

None. Supabase is used for auth only — no data tables or storage referenced.

## APIs

No REST/GraphQL APIs consumed beyond Supabase Auth SDK.
