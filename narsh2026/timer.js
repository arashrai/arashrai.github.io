// Narsh 2026 — Wedding Elapsed Timer Module
// Counts up the time since the wedding: Saturday, September 26, 2026 at 12:00 PM PDT (Kelowna, BC / Pacific Time)

const NARSH_TIMER = (() => {
  "use strict";

  // Event Time: Saturday, September 26, 2026 at 12:00 PM PDT (UTC-7)
  const EVENT_DATE = new Date("2026-09-26T12:00:00-07:00").getTime();
  let timerInterval = null;

  const update = () => {
    const now = Date.now();
    const elapsed = Math.max(0, now - EVENT_DATE);

    const containers = document.querySelectorAll(".countdown-container");
    if (!containers.length) return;

    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, "0");

    containers.forEach(container => {
      const label = container.querySelector(".countdown-label");
      if (label && !label.dataset.custom) {
        label.textContent = "Time since the big day";
      }

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

  return { init, update, EVENT_DATE };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", NARSH_TIMER.init);
} else {
  NARSH_TIMER.init();
}
