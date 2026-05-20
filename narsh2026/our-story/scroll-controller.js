// Narsh 2026 — Scroll Controller Module
// Maps scroll position to stop index changes for the map timeline.

const NARSH_SCROLL = (() => {
  "use strict";

  let scrollPerStop = window.innerHeight;
  let currentStopIndex = -1;
  let onStopChange = null;
  let scrollContainerEl = null;
  let reducedMotion = false;

  const init = (stops, callback) => {
    onStopChange = callback;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollContainerEl = document.getElementById("scroll-container");
    if (!scrollContainerEl) return;

    // Set scroll container height to create scroll distance
    scrollContainerEl.style.height = (stops.length * scrollPerStop) + "px";

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Trigger initial state
    handleScroll();
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const newIndex = Math.max(0, Math.min(
      Math.floor(scrollY / scrollPerStop),
      (scrollContainerEl ? Math.floor(parseInt(scrollContainerEl.style.height, 10) / scrollPerStop) : 1) - 1
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
    scrollPerStop = window.innerHeight;
    if (scrollContainerEl) {
      const stopCount = Math.round(parseInt(scrollContainerEl.style.height, 10) / scrollPerStop) || 1;
      scrollContainerEl.style.height = (stopCount * scrollPerStop) + "px";
    }
  };

  const scrollToStop = (index) => {
    window.scrollTo({
      top: index * scrollPerStop,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  const getCurrentIndex = () => {
    return currentStopIndex;
  };

  return { init, scrollToStop, getCurrentIndex };
})();
