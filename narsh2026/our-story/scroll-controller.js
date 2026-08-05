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

  // Size the scroll track to the LIVE viewport height. This is deliberately
  // driven off the current innerHeight (not a value cached at init): on mobile
  // the URL bar collapses as you scroll, growing innerHeight without always
  // firing a resize event. If the track kept its original (shorter) height, the
  // document wouldn't be tall enough to scroll to the final stop — which is why
  // the last stop (the wedding) was unreachable on phones.
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

    // Trigger initial state
    handleScroll();
  };

  const handleScroll = () => {
    // Keep the track in sync if the viewport height changed (mobile URL bar).
    if (window.innerHeight !== perStop) syncHeight();

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
