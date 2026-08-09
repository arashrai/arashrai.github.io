// Narsh 2026 — Scroll Controller Module
// Maps scroll position to stop index changes for the map timeline, and drives
// programmatic navigation (timeline dots, prev/next arrows, keyboard arrows).

const NARSH_SCROLL = (() => {
  "use strict";

  let perStop = window.innerHeight;
  let stopCount = 0;
  let currentStopIndex = -1;
  // While a programmatic navigation (button/dot/keyboard) is in flight this is
  // the destination; -1 means the user is free-scrolling. It exists to survive
  // the mobile URL bar: tapping "next" scrolls the page down, which hides the
  // URL bar, which resizes the viewport mid-scroll. Without an owned target,
  // that resize (and the transient scroll positions during the animation) would
  // shift the active stop or snap the scroll back — the reported "the next
  // button hardly works" while a finger swipe was fine.
  let targetIndex = -1;
  let onStopChange = null;
  let scrollContainerEl = null;
  let reducedMotion = false;

  // --- One-step-per-gesture layer ------------------------------------------
  // Everything below maps raw scrollY to an index, which is right for a
  // scrollbar drag, Page Down or an anchor jump but wrong for a phone: the
  // momentum from one hard flick carries the document several viewport heights,
  // so a guest blows past two or three life moments in a single swipe. The
  // handlers further down sit in FRONT of that mapping and turn one touch drag
  // or one wheel gesture into exactly one scrollToStop() call, swallowing the
  // momentum that follows. Anything they do not intercept still falls through
  // to the position-based mapping unchanged.

  // Movement needed before we judge horizontal vs vertical intent.
  const AXIS_LOCK_PX = 8;
  // Minimum vertical travel for a touch drag to count as a step.
  const SWIPE_STEP_PX = 40;
  // Accumulated normalized wheel delta for one step.
  const WHEEL_STEP_PX = 40;
  // Quiet period with no wheel events before a new wheel gesture is allowed.
  const WHEEL_IDLE_MS = 220;

  // null | "pending" | "step" | "native" | "ignore"
  let gestureMode = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaY = 0;
  let gestureScrollerEl = null;
  let wheelAccum = 0;
  let wheelLocked = false;
  let wheelIdleTimer = null;

  const clampIndex = (i) => Math.max(0, Math.min(i, stopCount - 1));

  const setStop = (index) => {
    if (index === currentStopIndex) return;
    const previousIndex = currentStopIndex;
    currentStopIndex = index;
    if (onStopChange) onStopChange(index, previousIndex);
  };

  // Size the scroll track to the LIVE viewport height so the document is always
  // tall enough to reach the final stop (the mobile URL bar collapsing grows
  // innerHeight). Called only on viewport CHANGE, never from the scroll handler.
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
    // The mobile URL bar showing/hiding changes innerHeight without always firing
    // a window resize; visualViewport's resize does fire.
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, { passive: true });
    }

    // One-step-per-gesture layer. touchmove and wheel MUST be non-passive or
    // their preventDefault() is a silent no-op and momentum keeps skipping
    // stops; the rest stay passive so they never block the compositor.
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Trigger initial state
    handleScroll();
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // During a programmatic navigation the intermediate scroll positions are
    // transient — let the target own the active stop until we actually arrive,
    // so mid-flight positions (and mobile URL-bar resizes) can't yank it around.
    if (targetIndex >= 0) {
      // Release the lock only once we've SETTLED on the target (within 10% of a
      // stop), NOT at the midpoint. Clearing at the midpoint let the tail of the
      // animation (still below the stop boundary) read as the previous stop and
      // bounce the view back — every other click.
      if (Math.abs(scrollY - targetIndex * perStop) < perStop * 0.1) {
        targetIndex = -1; // arrived — free scrolling resumes
      }
      return;
    }

    // Nearest stop (round, not floor) so a scroll that settles a hair short of a
    // stop boundary isn't read as the previous stop.
    const newIndex = clampIndex(Math.round(scrollY / perStop));
    setStop(newIndex);
  };

  const handleResize = () => {
    syncHeight();
    // Re-anchor ONLY when a navigation is in flight, so a URL-bar resize lands us
    // on the destination instead of aborting the scroll. During a free user
    // swipe (no target) we leave the scroll alone so we don't fight the finger.
    if (targetIndex >= 0) {
      window.scrollTo(0, targetIndex * perStop);
    }
  };

  const scrollToStop = (index) => {
    index = clampIndex(index);
    perStop = window.innerHeight || perStop;
    targetIndex = index;

    // Update the map/panel/dots immediately so tapping a button gives instant
    // feedback even if the scroll animation is interrupted on mobile.
    setStop(index);

    window.scrollTo({
      top: index * perStop,
      behavior: reducedMotion ? "auto" : "smooth"
    });

    // Safety net: if the "arrived" scroll event never lands exactly (rounding,
    // interrupted animation), release the target so free scrolling can resume.
    setTimeout(() => {
      if (targetIndex === index) targetIndex = -1;
    }, 1200);
  };

  const getCurrentIndex = () => {
    return currentStopIndex;
  };

  // Walk up from the gesture's target looking for a panel that scrolls its own
  // content — the mobile .stop-narrative, the desktop .story-panel. Found by
  // computed style instead of a hardcoded selector so a later layout change
  // can't quietly break it. The document itself is deliberately never a match:
  // the tall #scroll-container track IS the thing we are taking over.
  const findScrollableAncestor = (node) => {
    let el = node;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.nodeType === 1) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") &&
            el.scrollHeight - el.clientHeight > 1) {
          return el;
        }
      }
      el = el.parentNode;
    }
    return null;
  };

  // The 1px tolerance is not cosmetic: device pixel ratio and text zoom give
  // fractional scrollTop/scrollHeight, so a panel parked at its end almost
  // never satisfies an exact comparison.
  const canScrollFurther = (el, direction) => {
    if (!el) return false;
    if (direction === "down") {
      return el.scrollTop < el.scrollHeight - el.clientHeight - 1;
    }
    return el.scrollTop > 1;
  };

  // Gestures that belong to the page chrome, not the story: the open mobile
  // menu (nav.js puts .nav-open on the body) and anything inside the pinned
  // header. Guard the closest() call — a touch target may not be an Element.
  const shouldIgnoreGesture = (event) => {
    if (document.body.classList.contains("nav-open")) return true;
    const targetEl = event.target;
    return !!(targetEl && targetEl.closest && targetEl.closest(".site-header"));
  };

  // Always route a gesture through scrollToStop rather than window.scrollTo:
  // scrollToStop owns targetIndex, so the URL-bar-resize lock, the instant
  // setStop feedback, the reduced-motion branch and the 1200ms safety release
  // all keep working. At the first or last stop clampIndex re-snaps to the
  // current stop, which is the correct "nothing beyond here" feel.
  const stepBy = (delta) => {
    if (currentStopIndex < 0) return;
    scrollToStop(clampIndex(currentStopIndex + delta));
  };

  const resetTouchGesture = () => {
    gestureMode = null;
    gestureScrollerEl = null;
    touchDeltaY = 0;
  };

  const handleTouchStart = (event) => {
    touchDeltaY = 0;

    // Never fight a pinch, and never steal a gesture aimed at the chrome.
    if (event.touches.length > 1 || shouldIgnoreGesture(event)) {
      gestureMode = "ignore";
      return;
    }

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    gestureScrollerEl = findScrollableAncestor(event.target);
    gestureMode = "pending";
  };

  const handleTouchMove = (event) => {
    if (gestureMode === "ignore" || gestureMode === "native") return;

    const touch = event.touches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    touchDeltaY = dy;

    if (gestureMode === "pending") {
      // Wait for enough travel to read intent, then decide ONCE and hold that
      // decision for the whole drag. Re-deciding mid-drag would let a text
      // panel that just hit its end chain straight into a story step inside the
      // same swipe, which reads as a double action — and browsers stop honoring
      // preventDefault() once native scrolling has already started, so a late
      // switch to "step" would be a silent no-op anyway.
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Mostly sideways: the photo carousel's gesture, and it stays the
        // carousel's for the rest of this drag.
        gestureMode = "ignore";
        return;
      }

      // A finger moving up (negative dy) scrolls the page down.
      const direction = dy < 0 ? "down" : "up";
      gestureMode = canScrollFurther(gestureScrollerEl, direction) ? "native" : "step";
      if (gestureMode === "native") return;
    }

    // Non-passive registration is what makes this line real; cancelable is
    // false once the browser has committed the gesture to native scrolling.
    if (gestureMode === "step" && event.cancelable) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    // Travel beyond the threshold is deliberately thrown away — a gentle drag
    // and a violent flick both mean "one stop". That is the whole fix.
    if (gestureMode === "step" && Math.abs(touchDeltaY) >= SWIPE_STEP_PX) {
      stepBy(touchDeltaY < 0 ? 1 : -1);
    }
    resetTouchGesture();
  };

  const handleTouchCancel = () => {
    resetTouchGesture();
  };

  const handleWheel = (event) => {
    // ctrlKey + wheel is a trackpad pinch-zoom, not a scroll.
    if (event.ctrlKey || shouldIgnoreGesture(event)) return;

    const direction = event.deltaY > 0 ? "down" : "up";
    // The story card still has room in this direction — let it scroll natively.
    if (canScrollFurther(findScrollableAncestor(event.target), direction)) return;

    if (event.cancelable) event.preventDefault();

    // deltaMode: 0 pixels, 1 lines, 2 pages.
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
      delta *= 16;
    } else if (event.deltaMode === 2) {
      delta *= window.innerHeight;
    }

    // Restart the idle timer on EVERY event, including the ones we swallow: the
    // lock only lifts once the trackpad has genuinely gone quiet, which is what
    // makes a long momentum tail count as one gesture instead of a dozen.
    clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => {
      wheelLocked = false;
      wheelAccum = 0;
    }, WHEEL_IDLE_MS);

    if (wheelLocked) return;

    // A direction reversal is a new intent, not a continuation.
    if ((wheelAccum > 0 && delta < 0) || (wheelAccum < 0 && delta > 0)) {
      wheelAccum = 0;
    }
    wheelAccum += delta;

    if (Math.abs(wheelAccum) >= WHEEL_STEP_PX) {
      stepBy(wheelAccum > 0 ? 1 : -1);
      wheelLocked = true;
      wheelAccum = 0;
    }
  };

  return { init, scrollToStop, getCurrentIndex };
})();
