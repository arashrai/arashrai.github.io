// Narsh 2026 — Nav Peek Module
// Reveals the pinned site header when the pointer nears the top of the
// viewport, so guests can navigate away mid-story without scrolling back to
// the beginning. Pairs with the .site-header rules in our-story.css.

const NARSH_NAV_PEEK = (() => {
  "use strict";

  // How close to the top counts as reaching for the nav. Floored at the
  // header's own height so the header can never hide while the pointer is
  // still resting on it.
  const MIN_ZONE = 72;

  let headerEl = null;
  let zone = MIN_ZONE;
  let pointerNearTop = false;

  const measure = () => {
    zone = Math.max(MIN_ZONE, headerEl ? headerEl.offsetHeight : 0);
  };

  // Single source of truth: the header shows if the pointer is reaching for
  // it OR the page is still near the top, where the header has always been
  // visible. Deriving both in one place stops a scroll and a pointermove from
  // fighting over the class.
  const update = () => {
    if (!headerEl) return;
    headerEl.classList.toggle("peek", pointerNearTop || window.scrollY <= zone);
  };

  const init = () => {
    headerEl = document.querySelector(".site-header");
    if (!headerEl) return;

    measure();

    window.addEventListener("pointermove", (event) => {
      // Ignore touch and pen: they only report a position mid-gesture, so a
      // tap near the top would latch the header open with no way to dismiss.
      if (event.pointerType !== "mouse") return;
      pointerNearTop = event.clientY <= zone;
      update();
    }, { passive: true });

    // Pointer left the window entirely -- tuck the header away again.
    document.addEventListener("mouseleave", () => {
      pointerNearTop = false;
      update();
    });

    window.addEventListener("scroll", update, { passive: true });

    window.addEventListener("resize", () => {
      measure();
      update();
    }, { passive: true });

    update();
  };

  return { init };
})();
