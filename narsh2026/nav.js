// Narsh 2026 — Navigation Toggle Module
// Mobile hamburger menu with keyboard and accessibility support.

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const toggleEl = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");

  if (!toggleEl || !navEl) {
    return;
  }

  const openNav = () => {
    document.body.classList.add("nav-open");
    toggleEl.setAttribute("aria-expanded", "true");
    const firstLinkEl = navEl.querySelector("a");
    if (firstLinkEl) {
      firstLinkEl.focus();
    }
  };

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    toggleEl.setAttribute("aria-expanded", "false");
    toggleEl.focus();
  };

  toggleEl.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNav();
    }
  });

  const navLinksEl = navEl.querySelectorAll("a");
  navLinksEl.forEach((linkEl) => {
    linkEl.addEventListener("click", () => {
      if (document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggleEl.setAttribute("aria-expanded", "false");
      }
    });
  });
});
