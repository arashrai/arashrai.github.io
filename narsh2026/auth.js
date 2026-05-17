// Narsh 2026 — Shared Auth Module
// Password gate with SHA-256 hashing and two-tier localStorage persistence.
//
// To regenerate hashes when passwords change:
// node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"

const NARSH_AUTH = (() => {
  "use strict";

  const STORAGE_KEY = "narsh-tier";
  const GATE_URL = "/narsh2026/";

  // Pre-computed SHA-256 hashes of tier passwords (placeholder values per D-13).
  // IMPORTANT: Replace these with real password hashes before production deploy.
  // These placeholder passwords ("day2guest" and "fullaccess") will be effectively
  // public once deployed — do not reuse personal passwords.
  const TIER_HASHES = {
    "day2": "a8e11207989a2ab9fe956ce183139683e10e135007873faa6b824bc49a8d6c2d",
    "full": "44ffde91067d45353ee3b6ec012580e30fea73b60654a905013269cb092b7b8d"
  };

  const hashPassword = async (password) => {
    const data = new TextEncoder().encode(password.trim().toLowerCase());
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const getTier = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const setTier = (tier) => {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch {
      // Private browsing fallback: tier persists only for this page load
    }
  };

  const requireAuth = () => {
    const tier = getTier();
    if (!tier) {
      window.location.href = GATE_URL;
    }
    return tier;
  };

  const checkPassword = async (input) => {
    const hashed = await hashPassword(input);
    for (const [tier, expectedHash] of Object.entries(TIER_HASHES)) {
      if (hashed === expectedHash) {
        setTier(tier);
        return tier;
      }
    }
    return null;
  };

  const applyTierVisibility = (tier) => {
    if (tier === "day2") {
      document.querySelectorAll("[data-tier='full']").forEach(el => {
        el.style.display = "none";
      });
    }
    document.body.classList.remove("auth-pending");
  };

  return { getTier, setTier, requireAuth, checkPassword, applyTierVisibility, hashPassword };
})();
