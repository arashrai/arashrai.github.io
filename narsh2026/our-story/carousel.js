// Narsh 2026 — Photo Carousel Module
// Swipeable photo carousel with arrow navigation, dot indicators, and dynamic photo sizing.

const NARSH_CAROUSEL = (() => {
  "use strict";

  let currentIndex = 0;
  let photos = [];
  let containerEl = null;
  let trackEl = null;
  let controlsEl = null;
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

    const scope = containerEl.parentElement || containerEl;
    trackEl = containerEl.querySelector(".carousel-track");
    controlsEl = scope.querySelector(".carousel-controls");
    prevEl = scope.querySelector(".carousel-prev");
    nextEl = scope.querySelector(".carousel-next");
    dotsEl = scope.querySelector(".carousel-dots");
    announceEl = containerEl.querySelector(".carousel-announce");
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prevEl) {
      prevEl.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(currentIndex - 1);
      });
    }

    if (nextEl) {
      nextEl.addEventListener("click", (e) => {
        e.stopPropagation();
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

    window.addEventListener("resize", resizeToCurrent);
  };

  const loadPhotos = (newPhotos) => {
    photos = newPhotos || [];
    currentIndex = 0;

    if (trackEl) {
      trackEl.style.transition = "none";
      trackEl.style.transform = "translateX(0)";
      trackEl.innerHTML = "";
      void trackEl.offsetWidth;
    }

    if (photos.length === 0) {
      if (containerEl) containerEl.style.display = "none";
      if (controlsEl) controlsEl.style.display = "none";
      if (announceEl) announceEl.textContent = "";
      return;
    }

    if (containerEl) containerEl.style.display = "";

    if (trackEl) {
      photos.forEach((photo, i) => {
        const img = document.createElement("img");
        img.className = "carousel-photo";
        img.alt = photo.alt || "";
        img.decoding = "async";
        img.fetchPriority = i === 0 ? "high" : "low";
        // Deferred rather than native loading="lazy": these slides sit in an
        // overflow:hidden track and move by transform, which browsers do not
        // reliably treat as entering the viewport, so a lazy slide can stay
        // blank after you tap next. ensureLoaded drives it explicitly instead.
        img.dataset.src = photo.src;
        trackEl.appendChild(img);
      });
    }

    ensureLoaded(currentIndex);
    updateUI();
  };

  // Attach src to slide `i` and its immediate neighbours, so the next/prev tap
  // already has its photo in flight. Idempotent — each slide is fetched once.
  const ensureLoaded = (index) => {
    if (!trackEl) return;
    for (let i = index - 1; i <= index + 1; i++) {
      const img = trackEl.children[i];
      if (!img || !img.dataset || !img.dataset.src) continue;
      img.src = img.dataset.src;
      delete img.dataset.src;
      sizeWhenReady(img);
    }
  };

  const sizeWhenReady = (img) => {
    if (!img) return;

    if (img.complete && img.naturalWidth) {
      resizeToCurrent();
      return;
    }

    const onSettled = () => {
      if (trackEl && trackEl.children[currentIndex] === img) resizeToCurrent();
    };
    img.addEventListener("load", onSettled, { once: true });
    img.addEventListener("error", onSettled, { once: true });
  };

  // Resizes photo container dynamically to display full photo generously
  const resizeToCurrent = () => {
    if (!containerEl || !trackEl) return;
    const img = trackEl.children[currentIndex];
    if (!img || !img.naturalWidth) return;

    const content = containerEl.parentElement;
    const maxWidth = content ? content.clientWidth : containerEl.clientWidth;
    if (!maxWidth) return;

    const isDesktop = window.innerWidth >= 768;
    const budget = window.innerHeight * (isDesktop ? 0.45 : 0.32);
    // Separate ceilings per breakpoint. The phone sheet only has room for a small
    // photo (230px), but applying that same cap on desktop threw away the larger
    // 0.45 budget and left the carousel tiny on a wide screen.
    const heightCap = isDesktop ? 460 : 230;
    const maxHeight = Math.max(180, Math.min(heightCap, budget));

    const ratio = img.naturalHeight / img.naturalWidth;
    let w = maxWidth;
    let h = w * ratio;
    if (h > maxHeight) {
      h = maxHeight;
      w = h / ratio;
    }
    containerEl.style.width = w + "px";
    containerEl.style.height = h + "px";
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, photos.length - 1));
    currentIndex = clamped;
    ensureLoaded(clamped);

    if (trackEl) {
      if (reducedMotion) {
        trackEl.style.transition = "none";
      } else {
        trackEl.style.transition = "transform 250ms ease";
      }
      trackEl.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    }

    sizeWhenReady(trackEl ? trackEl.children[currentIndex] : null);
    updateUI();
  };

  const updateUI = () => {
    if (photos.length <= 1) {
      if (controlsEl) controlsEl.style.display = "none";
    } else {
      if (controlsEl) controlsEl.style.display = "flex";
      if (prevEl) prevEl.disabled = currentIndex === 0;
      if (nextEl) nextEl.disabled = currentIndex === photos.length - 1;
      if (dotsEl) {
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
