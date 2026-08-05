// Narsh 2026 — Timeline Bar Module
// Clickable timeline bar with active/visited state management and year labels.

const NARSH_TIMELINE = (() => {
  "use strict";

  let dotElements = [];
  let currentIndex = -1;
  let prevBtnEl = null;
  let nextBtnEl = null;
  let dotClickHandler = null;

  const init = (stops, onDotClick) => {
    const barEl = document.getElementById("timeline-bar");
    if (!barEl) return;

    dotElements = [];
    dotClickHandler = onDotClick;

    // Prev button sits to the left of the dots. It steps back one stop.
    prevBtnEl = document.createElement("button");
    prevBtnEl.className = "timeline-nav timeline-nav-prev";
    prevBtnEl.setAttribute("aria-label", "Previous moment");
    prevBtnEl.addEventListener("click", () => {
      if (dotClickHandler) dotClickHandler(Math.max(0, currentIndex - 1));
    });
    barEl.appendChild(prevBtnEl);

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

    // Next button sits to the right of the dots. It advances one stop.
    nextBtnEl = document.createElement("button");
    nextBtnEl.className = "timeline-nav timeline-nav-next";
    nextBtnEl.setAttribute("aria-label", "Next moment");
    nextBtnEl.addEventListener("click", () => {
      if (dotClickHandler) dotClickHandler(Math.min(dotElements.length - 1, currentIndex + 1));
    });
    barEl.appendChild(nextBtnEl);
  };

  const updateNav = () => {
    if (prevBtnEl) prevBtnEl.disabled = currentIndex <= 0;
    if (nextBtnEl) nextBtnEl.disabled = currentIndex >= dotElements.length - 1;
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
    updateNav();
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
