// Narsh 2026 — Wedding Countdown Timer Module
// Counts down to Saturday, September 26, 2026 at 9:00 AM PDT (Kelowna, BC / Pacific Time)

const NARSH_TIMER = (() => {
  "use strict";

  // Target: Saturday, September 26, 2026 at 9:00 AM PDT (UTC-7)
  const TARGET_DATE = new Date("2026-09-26T09:00:00-07:00").getTime();
  let timerInterval = null;

  const update = () => {
    const now = Date.now();
    const distance = TARGET_DATE - now;

    const containers = document.querySelectorAll(".countdown-container");
    if (!containers.length) return;

    if (distance <= 0) {
      containers.forEach(container => {
        const grid = container.querySelector(".countdown-grid");
        const label = container.querySelector(".countdown-label");
        if (label) label.textContent = "The wedding has begun!";
        if (grid) {
          grid.innerHTML = '<div class="countdown-celebration">🎉 Today\'s the big day! 💕</div>';
        }
      });
      if (timerInterval) clearInterval(timerInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, "0");

    containers.forEach(container => {
      const daysEl = container.querySelector('[data-unit="days"]');
      const hoursEl = container.querySelector('[data-unit="hours"]');
      const minutesEl = container.querySelector('[data-unit="minutes"]');
      const secondsEl = container.querySelector('[data-unit="seconds"]');

      if (daysEl) daysEl.textContent = String(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    });
  };

  const init = () => {
    update();
    if (!timerInterval) {
      timerInterval = setInterval(update, 1000);
    }
  };

  return { init, update, TARGET_DATE };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", NARSH_TIMER.init);
} else {
  NARSH_TIMER.init();
}
