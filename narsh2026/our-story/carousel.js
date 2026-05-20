// Narsh 2026 — Photo Carousel Module
// Swipeable photo carousel with arrow navigation, dot indicators, and keyboard support.

const NARSH_CAROUSEL = (() => {
  "use strict";

  let currentIndex = 0;
  let photos = [];
  let containerEl = null;
  let trackEl = null;
  let prevEl = null;
  let nextEl = null;
  let dotsEl = null;
  let announceEl = null;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let reducedMotion = false;

  const init = (el) => {
    containerEl = el;
    if (!containerEl) return;

    trackEl = containerEl.querySelector(".carousel-track");
    prevEl = containerEl.querySelector(".carousel-prev");
    nextEl = containerEl.querySelector(".carousel-next");
    dotsEl = containerEl.querySelector(".carousel-dots");
    announceEl = containerEl.querySelector(".carousel-announce");
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prevEl) {
      prevEl.addEventListener("click", () => {
        goTo(currentIndex - 1);
      });
    }

    if (nextEl) {
      nextEl.addEventListener("click", () => {
        goTo(currentIndex + 1);
      });
    }

    if (trackEl) {
      trackEl.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        if (!reducedMotion) {
          trackEl.style.transition = "none";
        }
      }, { passive: true });

      trackEl.addEventListener("touchmove", (e) => {
        touchDeltaX = e.touches[0].clientX - touchStartX;
        const offset = -(currentIndex * 100) + (touchDeltaX / containerEl.offsetWidth) * 100;
        trackEl.style.transform = "translateX(" + offset + "%)";
      }, { passive: true });

      trackEl.addEventListener("touchend", () => {
        if (Math.abs(touchDeltaX) > 50) {
          if (touchDeltaX > 0) {
            goTo(currentIndex - 1);
          } else {
            goTo(currentIndex + 1);
          }
        } else {
          goTo(currentIndex);
        }
      }, { passive: true });
    }

    containerEl.addEventListener("keydown", (e) => {
      if (!containerEl.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
    });
  };

  const loadPhotos = (newPhotos) => {
    photos = newPhotos || [];
    currentIndex = 0;

    if (photos.length === 0) {
      if (containerEl) containerEl.style.display = "none";
      return;
    }

    if (containerEl) containerEl.style.display = "";

    if (trackEl) {
      trackEl.innerHTML = "";
      photos.forEach((photo) => {
        const img = document.createElement("img");
        img.className = "carousel-photo";
        img.src = photo.src;
        img.alt = photo.alt;
        img.loading = "lazy";
        trackEl.appendChild(img);
      });
    }

    updateUI();
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, photos.length - 1));
    currentIndex = clamped;

    if (trackEl) {
      if (reducedMotion) {
        trackEl.style.transition = "none";
      } else {
        trackEl.style.transition = "transform 250ms ease";
      }
      trackEl.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    }

    updateUI();
  };

  const updateUI = () => {
    if (photos.length <= 1) {
      if (prevEl) prevEl.style.display = "none";
      if (nextEl) nextEl.style.display = "none";
      if (dotsEl) dotsEl.style.display = "none";
    } else {
      if (prevEl) prevEl.style.display = currentIndex === 0 ? "none" : "";
      if (nextEl) nextEl.style.display = currentIndex === photos.length - 1 ? "none" : "";
      if (dotsEl) {
        dotsEl.style.display = "";
        dotsEl.innerHTML = photos.map((_, i) => {
          const activeClass = i === currentIndex ? " active" : "";
          return "<span class=\"carousel-dot" + activeClass + "\"></span>";
        }).join("");
      }
    }

    if (announceEl) {
      announceEl.textContent = "Photo " + (currentIndex + 1) + " of " + photos.length;
    }
  };

  return { init, loadPhotos, goTo };
})();
