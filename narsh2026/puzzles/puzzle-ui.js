// Narsh 2026 — Puzzle UI Module
// Card grid rendering, guess dialog, card flip interaction, stats bar,
// controls bar, and game feedback for the Puzzles page.

const NARSH_PUZZLE_UI = (() => {
  "use strict";

  let gridEl = null;
  let statsEl = null;
  let controlsEl = null;
  let activeGuessDialogEl = null;
  let mistakesDisplayEl = null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const init = () => {
    gridEl = document.getElementById("puzzle-grid");
    statsEl = document.getElementById("puzzle-stats");
    controlsEl = document.getElementById("puzzle-controls");

    if (!gridEl || !statsEl || !controlsEl) return;

    renderGrid();
    renderStats();
    renderControls();

    // Register callbacks with puzzle logic module
    NARSH_PUZZLE.onCardFlip = handleCardFlip;
    NARSH_PUZZLE.onMistake = handleMistake;
    NARSH_PUZZLE.onGameComplete = handleGameComplete;

    // Click outside to dismiss guess dialog
    document.addEventListener("click", (event) => {
      if (activeGuessDialogEl && !activeGuessDialogEl.contains(event.target)) {
        const cardEl = activeGuessDialogEl.closest(".puzzle-card");
        if (!cardEl || !cardEl.contains(event.target)) {
          dismissGuessDialog();
        }
      }
    });

    // Escape key to dismiss guess dialog
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeGuessDialogEl) {
        dismissGuessDialog();
      }
    });
  };

  const renderGrid = () => {
    if (!gridEl) return;
    gridEl.textContent = "";

    const totalCharacters = NARSH_PUZZLE_DATA.getTotalCharacters();

    for (let i = 0; i < totalCharacters; i++) {
      const character = NARSH_PUZZLE_DATA.getCharacter(i);
      if (!character) continue;

      const cardEl = document.createElement("div");
      cardEl.className = "puzzle-card";
      cardEl.setAttribute("role", "button");
      cardEl.setAttribute("tabindex", "0");
      cardEl.setAttribute("aria-label", character.name + ", " + character.profession);
      cardEl.setAttribute("data-index", String(i));

      const innerEl = document.createElement("div");
      innerEl.className = "puzzle-card-inner";

      // Front face
      const frontEl = document.createElement("div");
      frontEl.className = "puzzle-card-front";

      const emojiEl = document.createElement("span");
      emojiEl.className = "card-emoji";
      emojiEl.textContent = NARSH_PUZZLE_DATA.getEmoji(character.profession);
      frontEl.appendChild(emojiEl);

      const nameEl = document.createElement("div");
      nameEl.className = "card-name";
      nameEl.textContent = character.name;
      frontEl.appendChild(nameEl);

      const professionEl = document.createElement("div");
      professionEl.className = "card-profession";
      professionEl.textContent = character.profession;
      frontEl.appendChild(professionEl);

      innerEl.appendChild(frontEl);

      // Back face (empty initially, populated on flip)
      const backEl = document.createElement("div");
      backEl.className = "puzzle-card-back";
      innerEl.appendChild(backEl);

      cardEl.appendChild(innerEl);

      // Click handler
      cardEl.addEventListener("click", (event) => {
        event.stopPropagation();
        handleCardClick(i, cardEl);
      });

      // Keyboard handler: Enter/Space triggers same as click
      cardEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          handleCardClick(i, cardEl);
        }
      });

      // Suppress native context menu on cards (for future color tag feature)
      cardEl.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });

      gridEl.appendChild(cardEl);
    }
  };

  const handleCardClick = (cardIndex, cardEl) => {
    // Do not show dialog if card is already flipped
    if (cardEl.classList.contains("flipped")) return;

    // Do not show dialog if game is complete
    if (NARSH_PUZZLE.isComplete()) return;

    showGuessDialog(cardIndex, cardEl);
  };

  const showGuessDialog = (cardIndex, cardEl) => {
    // Dismiss any existing dialog first
    dismissGuessDialog();

    const character = NARSH_PUZZLE_DATA.getCharacter(cardIndex);
    if (!character) return;

    const dialogEl = document.createElement("div");
    dialogEl.className = "guess-dialog";
    dialogEl.setAttribute("role", "dialog");
    dialogEl.setAttribute("aria-label", "Guess role for " + character.name);

    const criminalBtnEl = document.createElement("button");
    criminalBtnEl.className = "guess-btn criminal-btn";
    criminalBtnEl.textContent = "Criminal";
    criminalBtnEl.addEventListener("click", (event) => {
      event.stopPropagation();
      const result = NARSH_PUZZLE.guessRole(cardIndex, true);
      processGuessResult(result, cardIndex, cardEl);
    });

    const innocentBtnEl = document.createElement("button");
    innocentBtnEl.className = "guess-btn innocent-btn";
    innocentBtnEl.textContent = "Innocent";
    innocentBtnEl.addEventListener("click", (event) => {
      event.stopPropagation();
      const result = NARSH_PUZZLE.guessRole(cardIndex, false);
      processGuessResult(result, cardIndex, cardEl);
    });

    dialogEl.appendChild(criminalBtnEl);
    dialogEl.appendChild(innocentBtnEl);

    // Position dialog above or below card based on viewport space
    const cardRect = cardEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (cardRect.top > viewportHeight / 2) {
      // Card is in lower half: position dialog above
      dialogEl.style.bottom = "100%";
      dialogEl.style.marginBottom = "4px";
    } else {
      // Card is in upper half: position dialog below
      dialogEl.style.top = "100%";
      dialogEl.style.marginTop = "4px";
    }
    dialogEl.style.left = "50%";
    dialogEl.style.transform = "translateX(-50%)";

    cardEl.appendChild(dialogEl);
    activeGuessDialogEl = dialogEl;

    // Focus the first button
    criminalBtnEl.focus();
  };

  const dismissGuessDialog = () => {
    if (activeGuessDialogEl) {
      activeGuessDialogEl.remove();
      activeGuessDialogEl = null;
    }
  };

  const processGuessResult = (result, cardIndex, cardEl) => {
    if (result.result === "correct") {
      // Dismiss dialog first
      dismissGuessDialog();

      // Add flipped class for CSS 3D flip
      cardEl.classList.add("flipped");

      // Populate card back
      const backEl = cardEl.querySelector(".puzzle-card-back");
      if (backEl) {
        backEl.textContent = "";

        const roleClass = result.criminal ? "criminal" : "innocent";
        backEl.classList.add(roleClass);

        const roleLabelEl = document.createElement("span");
        roleLabelEl.className = "role-label " + roleClass;
        roleLabelEl.textContent = result.criminal ? "CRIMINAL" : "INNOCENT";
        backEl.appendChild(roleLabelEl);

        const clueTextEl = document.createElement("p");
        clueTextEl.className = "clue-text";
        clueTextEl.textContent = result.clueText;
        backEl.appendChild(clueTextEl);
      }

      // Update aria attributes
      const character = NARSH_PUZZLE_DATA.getCharacter(cardIndex);
      const roleName = result.criminal ? "Criminal" : "Innocent";
      cardEl.setAttribute("aria-label", character.name + ", " + roleName + " -- " + result.clueText);
      cardEl.setAttribute("aria-disabled", "true");
      cardEl.removeAttribute("tabindex");

    } else if (result.result === "incorrect") {
      dismissGuessDialog();

      // Shake animation
      cardEl.classList.add("shake");

      // Brief incorrect flash
      cardEl.classList.add("incorrect-flash");

      // Remove shake class after animation completes
      const shakeTimeout = reducedMotion ? 0 : 400;
      setTimeout(() => {
        cardEl.classList.remove("shake");
      }, shakeTimeout);

      // Remove flash after brief delay
      setTimeout(() => {
        cardEl.classList.remove("incorrect-flash");
      }, 300);

      // Update mistakes display
      updateStats();

    } else if (result.result === "not-deducible") {
      dismissGuessDialog();

      // Show temporary warning overlay on the card
      const warningEl = document.createElement("div");
      warningEl.className = "not-deducible-warning";

      const warningTextEl = document.createElement("span");
      warningTextEl.textContent = "Flip more cards first!";
      warningEl.appendChild(warningTextEl);

      cardEl.appendChild(warningEl);

      // Remove warning after 2 seconds
      setTimeout(() => {
        if (warningEl.parentNode) {
          warningEl.remove();
        }
      }, 2000);

    } else if (result.result === "already-flipped" || result.result === "game-over") {
      dismissGuessDialog();
    }
  };

  const renderStats = () => {
    if (!statsEl) return;
    statsEl.textContent = "";

    // Timer display (static in this plan)
    const timerEl = document.createElement("span");
    timerEl.className = "stat-item";
    timerEl.textContent = "0:00";
    statsEl.appendChild(timerEl);

    // Mistakes display
    mistakesDisplayEl = document.createElement("span");
    mistakesDisplayEl.className = "stat-item";
    mistakesDisplayEl.setAttribute("aria-live", "polite");
    mistakesDisplayEl.textContent = "Mistakes: 0";
    statsEl.appendChild(mistakesDisplayEl);

    // Hints display (placeholder for Plan 02)
    const hintsEl = document.createElement("span");
    hintsEl.className = "stat-item";
    hintsEl.setAttribute("aria-live", "polite");
    hintsEl.textContent = "Hints: 0";
    statsEl.appendChild(hintsEl);
  };

  const renderControls = () => {
    if (!controlsEl) return;
    controlsEl.textContent = "";

    // Hint button (non-functional in this plan)
    const hintBtnEl = document.createElement("button");
    hintBtnEl.className = "btn-hint";
    hintBtnEl.textContent = "Show Hint";
    hintBtnEl.disabled = true;
    controlsEl.appendChild(hintBtnEl);

    // Inspect button (non-functional in this plan)
    const inspectBtnEl = document.createElement("button");
    inspectBtnEl.className = "btn-inspect";
    inspectBtnEl.textContent = "Inspect";
    inspectBtnEl.disabled = true;
    controlsEl.appendChild(inspectBtnEl);

    // Share button (non-functional in this plan)
    const shareBtnEl = document.createElement("button");
    shareBtnEl.className = "btn-share";
    shareBtnEl.textContent = "Share Results";
    shareBtnEl.disabled = true;
    controlsEl.appendChild(shareBtnEl);
  };

  const updateStats = () => {
    if (mistakesDisplayEl) {
      mistakesDisplayEl.textContent = "Mistakes: " + NARSH_PUZZLE.getMistakes();
    }
  };

  // Callbacks registered with NARSH_PUZZLE
  const handleCardFlip = (cardIndex, clueText, isCriminal) => {
    // Card flip is handled inline in processGuessResult
  };

  const handleMistake = (totalMistakes) => {
    updateStats();
  };

  const handleGameComplete = (totalMistakes) => {
    // Game complete handling deferred to Plan 02 (modal, share, etc.)
  };

  return { init };
})();
