// Narsh 2026 — Timeline Bar Module
// Clickable timeline bar with active/visited state management and year labels.

const NARSH_TIMELINE = (() => {
  "use strict";

  let dotElements = [];
  let currentIndex = -1;

  const init = (stops, onDotClick) => {
    const barEl = document.getElementById("timeline-bar");
    if (!barEl) return;

    dotElements = [];

    stops.forEach((stop, index) => {
      const dotEl = document.createElement("button");
      dotEl.className = "timeline-dot";
      dotEl.setAttribute("aria-label", stop.location + ", " + stop.year);
      dotEl.title = stop.location;

      dotEl.addEventListener("click", () => {
        if (onDotClick) onDotClick(index);
      });

      // Show year labels at first stop, convergence stop, and last stop
      const showYear = index === 0 || stop.isConvergence || index === stops.length - 1;
      if (showYear) {
        const wrapperEl = document.createElement("div");
        wrapperEl.className = "timeline-dot-wrapper";

        const yearEl = document.createElement("span");
        yearEl.className = "timeline-year";
        yearEl.textContent = stop.year;

        wrapperEl.appendChild(dotEl);
        wrapperEl.appendChild(yearEl);
        barEl.appendChild(wrapperEl);
      } else {
        barEl.appendChild(dotEl);
      }

      dotElements.push(dotEl);
    });
  };

  const setActive = (index) => {
    dotElements.forEach((dotEl, i) => {
      if (i === index) {
        dotEl.classList.add("active");
        dotEl.setAttribute("aria-current", "step");
      } else {
        dotEl.classList.remove("active");
        dotEl.removeAttribute("aria-current");
      }
    });
    currentIndex = index;
  };

  const setVisited = (upToIndex) => {
    dotElements.forEach((dotEl, i) => {
      if (i <= upToIndex) {
        dotEl.classList.add("visited");
      }
    });
  };

  return { init, setActive, setVisited };
})();
