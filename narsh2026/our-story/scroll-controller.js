// Narsh 2026 — Story Scroll Controller Module

const NARSH_SCROLL = (() => {
  "use strict";

  let STOPS = [];
  let onStopChangeCallback = null;
  let currentIndex = 0;
  let scrollContainerEl = null;
  let isProgrammaticScroll = false;
  let scrollTimeout = null;

  const init = (stops, onStopChange) => {
    STOPS = stops;
    onStopChangeCallback = onStopChange;
    scrollContainerEl = document.getElementById("scroll-container");

    if (scrollContainerEl) {
      scrollContainerEl.style.height = (STOPS.length * 100) + "vh";
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
  };

  const handleScroll = () => {
    if (isProgrammaticScroll) return;

    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const rawIndex = Math.round(scrollY / vh);
    const newIndex = Math.max(0, Math.min(rawIndex, STOPS.length - 1));

    if (newIndex !== currentIndex) {
      const prevIndex = currentIndex;
      currentIndex = newIndex;
      if (onStopChangeCallback) {
        onStopChangeCallback(currentIndex, prevIndex);
      }
    }
  };

  const scrollToStop = (index) => {
    if (index < 0 || index >= STOPS.length) return;

    isProgrammaticScroll = true;
    const prevIndex = currentIndex;
    currentIndex = index;

    const targetY = index * window.innerHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });

    if (onStopChangeCallback) {
      onStopChangeCallback(currentIndex, prevIndex);
    }

    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 1000);
  };

  const getCurrentIndex = () => currentIndex;

  return { init, scrollToStop, getCurrentIndex };
})();

// Backward compatibility alias for WIP references
const NARSH_SCROLL_WIP = NARSH_SCROLL;
