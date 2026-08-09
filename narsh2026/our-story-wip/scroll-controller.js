// Narsh 2026 — Our Story WIP Scroll Controller Module
const NARSH_SCROLL_WIP = (() => {
  "use strict";

  let perStop = window.innerHeight;
  let stopCount = 0;
  let currentStopIndex = -1;
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
    handleScroll();
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (targetIndex >= 0) {
      if (Math.abs(scrollY - targetIndex * perStop) < perStop * 0.1) {
        targetIndex = -1;
      }
      return;
    }

    const newIndex = clampIndex(Math.round(scrollY / perStop));
    setStop(newIndex);
  };

  const handleResize = () => {
    syncHeight();
    if (targetIndex >= 0) {
      window.scrollTo(0, targetIndex * perStop);
    }
  };

  const scrollToStop = (index) => {
    index = clampIndex(index);
    perStop = window.innerHeight || perStop;
    targetIndex = index;

    setStop(index);

    window.scrollTo({
      top: index * perStop,
      behavior: reducedMotion ? "auto" : "smooth"
    });

    setTimeout(() => {
      if (targetIndex === index) targetIndex = -1;
    }, 1200);
  };

  const getCurrentIndex = () => currentStopIndex;

  return { init, scrollToStop, getCurrentIndex };
})();
