// Narsh 2026 — Scroll Controller Module
// Maps scroll position to stop index changes for the map timeline.

const NARSH_SCROLL = (() => {
  "use strict";

  let perStop = window.innerHeight;
  let stopCount = 0;
  let currentStopIndex = -1;
  let onStopChange = null;
  let scrollContainerEl = null;
  let reducedMotion = false;

  // Size the scroll track to the LIVE viewport height so the document is always
  // tall enough to reach the final stop (on mobile the URL bar collapses as you
  // scroll, growing innerHeight).
  //
  // IMPORTANT: only ever call this on a viewport CHANGE (resize / visualViewport),
  // never from the scroll handler. Mutating the track's height mid-scroll aborts
  // an in-flight programmatic smooth scroll — which is what made the prev/next
  // timeline buttons "sometimes do nothing" on mobile while swiping still worked
  // (a finger swipe is a user scroll and isn't cancelled the same way).
  const syncHeight = () => {
    perStop = window.innerHeight;
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
    // a window resize; visualViewport's resize does fire, so keep the track sized
    // through this instead of resizing on every scroll.
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, { passive: true });
    }

    // Trigger initial state
    handleScroll();
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const newIndex = Math.max(0, Math.min(
      Math.floor(scrollY / perStop),
      stopCount - 1
    ));

    if (newIndex !== currentStopIndex) {
      const previousIndex = currentStopIndex;
      currentStopIndex = newIndex;
      if (onStopChange) {
        onStopChange(currentStopIndex, previousIndex);
      }
    }
  };

  const handleResize = () => {
    syncHeight();
  };

  const scrollToStop = (index) => {
    window.scrollTo({
      top: index * perStop,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  const getCurrentIndex = () => {
    return currentStopIndex;
  };

  return { init, scrollToStop, getCurrentIndex };
})();
