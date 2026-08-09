// Narsh 2026 — Our Story WIP Timeline Module
const NARSH_TIMELINE_WIP = (() => {
  "use strict";

  let STOPS = [];
  let containerEl = null;
  let dotElements = [];
  let prevBtnEl = null;
  let nextBtnEl = null;
  let onDotClickCallback = null;
  let activeIndex = -1;

  const init = (stops, onDotClick) => {
    STOPS = stops;
    onDotClickCallback = onDotClick;
    containerEl = document.getElementById("timeline-bar");
    if (!containerEl) return;

    containerEl.textContent = "";

    prevBtnEl = document.createElement("button");
    prevBtnEl.className = "timeline-nav timeline-nav-prev";
    prevBtnEl.setAttribute("aria-label", "Previous stop");
    prevBtnEl.addEventListener("click", () => {
      if (activeIndex > 0 && onDotClickCallback) {
        onDotClickCallback(activeIndex - 1);
      }
    });
    containerEl.appendChild(prevBtnEl);

    dotElements = [];
    STOPS.forEach((stop, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "timeline-dot-wrapper";

      const dot = document.createElement("button");
      dot.className = "timeline-dot";
      dot.setAttribute("aria-label", stop.year + " - " + stop.location);
      dot.setAttribute("title", stop.year + " - " + stop.location);

      dot.addEventListener("click", () => {
        if (onDotClickCallback) {
          onDotClickCallback(i);
        }
      });

      wrapper.appendChild(dot);
      containerEl.appendChild(wrapper);

      dotElements.push({ dot, wrapper, stop });
    });

    nextBtnEl = document.createElement("button");
    nextBtnEl.className = "timeline-nav timeline-nav-next";
    nextBtnEl.setAttribute("aria-label", "Next stop");
    nextBtnEl.addEventListener("click", () => {
      if (activeIndex < STOPS.length - 1 && onDotClickCallback) {
        onDotClickCallback(activeIndex + 1);
      }
    });
    containerEl.appendChild(nextBtnEl);

    updateNavButtons();
  };

  const setActive = (index) => {
    activeIndex = index;
    dotElements.forEach((item, i) => {
      if (i === index) {
        item.dot.classList.add("active");
        item.dot.setAttribute("aria-current", "step");
      } else {
        item.dot.classList.remove("active");
        item.dot.removeAttribute("aria-current");
      }
    });
    updateNavButtons();
  };

  const setVisited = (index) => {
    dotElements.forEach((item, i) => {
      if (i <= index) {
        item.dot.classList.add("visited");
      } else {
        item.dot.classList.remove("visited");
      }
    });
  };

  const updateNavButtons = () => {
    if (prevBtnEl) prevBtnEl.disabled = activeIndex <= 0;
    if (nextBtnEl) nextBtnEl.disabled = activeIndex >= STOPS.length - 1;
  };

  return { init, setActive, setVisited };
})();
