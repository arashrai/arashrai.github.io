// Narsh 2026 — Scroll Controller Module
// Maps scroll position to stop index changes for the map timeline, and drives
// programmatic navigation (timeline dots, prev/next arrows, keyboard arrows).

const NARSH_SCROLL = (() => {
  "use strict";

  let perStop = window.innerHeight;
  let stopCount = 0;
  let currentStopIndex = -1;
  // While a programmatic navigation (button/dot/keyboard) is in flight this is
  // the destination; -1 means the user is free-scrolling. It exists to survive
  // the mobile URL bar: tapping "next" scrolls the page down, which hides the
  // URL bar, which resizes the viewport mid-scroll. Without an owned target,
  // that resize (and the transient scroll positions during the animation) would
  // shift the active stop or snap the scroll back — the reported "the next
  // button hardly works" while a finger swipe was fine.
  let targetIndex = -1;
  let onStopChange = null;
  let scrollContainerEl = null;
  let reducedMotion = false;

  const clampIndex = (i) => Math.max(0, Math.min(i, stopCount - 1));

  const setStop = (index) => {
    if (index === currentStopIndex) return;
    const previousIndex = currentStopIndex;
    currentStopIndex = index;
    if (onStopChange) onStopChange(index, previousIndex);
  };

  // Size the scroll track to the LIVE viewport height so the document is always
  // tall enough to reach the final stop (the mobile URL bar collapsing grows
  // innerHeight). Called only on viewport CHANGE, never from the scroll handler.
  const syncHeight = () => {
    perStop = window.innerHeight || perStop;
    if (scrollContainerEl) {
      scrollContainerEl.style.height = (stopCount * perStop) + "px";
    }
  };

  const init = (stops, callback) => {
    onStopChange = callback;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollContainerEl = document.getElementById("scroll-container");
    if (!scrollContainerEl) return;

    stopCount = stops.length;
    syncHeight();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    // The mobile URL bar showing/hiding changes innerHeight without always firing
    // a window resize; visualViewport's resize does fire.
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, { passive: true });
    }

    // Trigger initial state
    handleScroll();
  };

  const handleScroll = () => {
    // During a programmatic navigation the intermediate scroll positions are
    // transient — let the target own the active stop until we actually arrive,
    // so mid-flight positions (and mobile URL-bar resizes) can't yank it around.
    if (targetIndex >= 0) {
      if (Math.round(window.scrollY / perStop) === targetIndex) {
        targetIndex = -1; // arrived — free scrolling resumes
      }
      return;
    }

    const newIndex = clampIndex(Math.floor(window.scrollY / perStop));
    setStop(newIndex);
  };

  const handleResize = () => {
    syncHeight();
    // Re-anchor ONLY when a navigation is in flight, so a URL-bar resize lands us
    // on the destination instead of aborting the scroll. During a free user
    // swipe (no target) we leave the scroll alone so we don't fight the finger.
    if (targetIndex >= 0) {
      window.scrollTo(0, targetIndex * perStop);
    }
  };

  const scrollToStop = (index) => {
    index = clampIndex(index);
    perStop = window.innerHeight || perStop;
    targetIndex = index;

    // Update the map/panel/dots immediately so tapping a button gives instant
    // feedback even if the scroll animation is interrupted on mobile.
    setStop(index);

    window.scrollTo({
      top: index * perStop,
      behavior: reducedMotion ? "auto" : "smooth"
    });

    // Safety net: if the "arrived" scroll event never lands exactly (rounding,
    // interrupted animation), release the target so free scrolling can resume.
    setTimeout(() => {
      if (targetIndex === index) targetIndex = -1;
    }, 1200);
  };

  const getCurrentIndex = () => {
    return currentStopIndex;
  };

  return { init, scrollToStop, getCurrentIndex };
})();
