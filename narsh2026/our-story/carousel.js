// Narsh 2026 — Photo Carousel Module
// Swipeable photo carousel with arrow navigation, dot indicators, and keyboard support.

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

    // Controls live in a sibling row below the photo, so search the shared
    // parent (not just the photo box) for the buttons and dots.
    const scope = containerEl.parentElement || containerEl;
    trackEl = containerEl.querySelector(".carousel-track");
    controlsEl = scope.querySelector(".carousel-controls");
    prevEl = scope.querySelector(".carousel-prev");
    nextEl = scope.querySelector(".carousel-next");
    dotsEl = scope.querySelector(".carousel-dots");
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

    window.addEventListener("resize", resizeToCurrent);
  };

  const loadPhotos = (newPhotos) => {
    photos = newPhotos || [];
    currentIndex = 0;

    if (trackEl) {
      // Rewind AND empty the track before anything else. currentIndex goes back
      // to 0 above, but the inline transform that goTo()/touchmove left on the
      // PREVIOUS stop survives the innerHTML swap -- so the new city opens
      // still translated to the old photo's offset. That shows a later photo
      // from the new set, or, when the new set is shorter, scrolls past the
      // end to a blank box that reads as "the first photo didn't load".
      // Clearing here (not only in the has-photos branch below) also means a
      // photo-less stop can't keep the previous stop's slides in the DOM.
      // Suppress the transition so this rewind doesn't animate as a slide.
      trackEl.style.transition = "none";
      trackEl.style.transform = "translateX(0)";
      trackEl.innerHTML = "";
      // Commit the reset now, so the next goTo() animates from 0 rather than
      // coalescing with it and sliding from the stale offset.
      void trackEl.offsetWidth;
    }

    if (photos.length === 0) {
      // No photos (e.g. the wedding stop before its gallery is added): hide the
      // photo box AND the control bar. updateUI() alone isn't enough here --
      // loadPhotos used to return before calling it, so the previous stop's
      // prev/next arrows and dots lingered as clickable ghost navigation until
      // the first click. Hide them up front so it's correct from the start.
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
        img.alt = photo.alt;
        // Eager + async decode: only the current stop's (now web-sized) photos
        // are in the DOM at once, and lazy-loading is unreliable for the
        // horizontally-translated off-screen carousel slides.
        img.loading = "eager";
        img.decoding = "async";
        // The visible photo competes with every other slide for bandwidth, and
        // some stops carry 9+ multi-megabyte images. Let the first one win.
        img.fetchPriority = i === 0 ? "high" : "low";
        img.src = photo.src;
        sizeWhenReady(img);
        trackEl.appendChild(img);
      });
    }

    updateUI();
    sizeWhenReady(trackEl ? trackEl.children[currentIndex] : null);
  };

  // Size the box to `img` as soon as it can be measured.
  //
  // A cached image is already `complete` by the time we attach a listener --
  // its load event fired during `img.src = ...` -- so a listener-only approach
  // silently never runs and the box keeps the PREVIOUS stop's dimensions,
  // leaving the first photo of each new city invisible until some other event
  // (clicking next, then back) happens to re-measure it. Check `complete`
  // first, and only fall back to the event when the image really is in flight.
  const sizeWhenReady = (img) => {
    if (!img) return;

    if (img.complete && img.naturalWidth) {
      resizeToCurrent();
      return;
    }

    // Compare element identity rather than a captured index: the user can
    // navigate away mid-load, and `trackEl.children` is rebuilt per stop.
    const onSettled = () => {
      if (trackEl && trackEl.children[currentIndex] === img) resizeToCurrent();
    };
    img.addEventListener("load", onSettled, { once: true });
    // A failed image must not wedge the box at a stale size either.
    img.addEventListener("error", onSettled, { once: true });
  };

  // Size the carousel box to the current photo so the whole image is shown
  // without cropping, while keeping the photo AND the surrounding text within
  // the panel so nothing needs to be scrolled. Tall portraits are capped in
  // height and the box narrows to hug the image (centered).
  const resizeToCurrent = () => {
    if (!containerEl || !trackEl) return;
    const img = trackEl.children[currentIndex];
    if (!img || !img.naturalWidth) return;

    const content = containerEl.parentElement;
    const maxWidth = content ? content.clientWidth : containerEl.clientWidth;
    if (!maxWidth) return;

    // Vertical budget for the whole panel, minus the height of the text
    // (heading, year, narrative) so the photo fits alongside it.
    const isDesktop = window.innerWidth >= 768;
    const budget = window.innerHeight * (isDesktop ? 0.74 : 0.72);
    const textHeight = content ? Math.max(0, content.scrollHeight - containerEl.offsetHeight) : 0;
    const maxHeight = Math.max(window.innerHeight * 0.34, budget - textHeight - 16);

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

    if (trackEl) {
      if (reducedMotion) {
        trackEl.style.transition = "none";
      } else {
        trackEl.style.transition = "transform 250ms ease";
      }
      trackEl.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    }

    // Same cached-vs-in-flight problem as loadPhotos: a slide the user reaches
    // before it has decoded needs to re-measure when it arrives.
    sizeWhenReady(trackEl ? trackEl.children[currentIndex] : null);
    updateUI();
  };

  const updateUI = () => {
    if (photos.length <= 1) {
      // Nothing to navigate — hide the whole control bar.
      if (controlsEl) controlsEl.style.display = "none";
    } else {
      if (controlsEl) controlsEl.style.display = "";
      // Keep both arrows in place (a stable spot); disable at the ends
      // rather than hiding, so the bar doesn't shift between photos.
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
