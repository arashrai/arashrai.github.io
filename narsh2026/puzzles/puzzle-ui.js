// Narsh 2026 — Puzzle UI Module
// Card grid rendering, guess dialog, card flip interaction, stats bar,
// controls bar, modals, color tags, inspect mode, hints, share results,
// speech bubbles, daily puzzle links, and localStorage state restore.

const NARSH_PUZZLE_UI = (() => {
  "use strict";

  let gridEl = null;
  let statsEl = null;
  let controlsEl = null;
  let activeGuessDialogEl = null;
  let mistakesDisplayEl = null;
  let hintsDisplayEl = null;
  let timerDisplayEl = null;
  let hintBtnEl = null;
  let inspectBtnEl = null;
  let shareBtnEl = null;
  let timerIntervalId = null;
  let timerAriaCounter = 0;
  let hintHighlightedCards = [];
  let hintShowing = false;
  let previousFocusEl = null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Modal utilities ---

  const createModal = (className, options) => {
    const modalEl = document.createElement("div");
    modalEl.className = "modal " + className;
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");

    const overlayEl = document.createElement("div");
    overlayEl.className = "modal-overlay";
    modalEl.appendChild(overlayEl);

    const cardEl = document.createElement("div");
    cardEl.className = "modal-card";
    modalEl.appendChild(cardEl);

    if (options.heading) {
      const headingId = className + "-heading";
      const headingEl = document.createElement("h2");
      headingEl.id = headingId;
      headingEl.textContent = options.heading;
      cardEl.appendChild(headingEl);
      modalEl.setAttribute("aria-labelledby", headingId);
    }

    if (options.body) {
      const bodyEl = document.createElement("p");
      bodyEl.textContent = options.body;
      cardEl.appendChild(bodyEl);
    }

    if (options.customContent) {
      cardEl.appendChild(options.customContent);
    }

    const actionsEl = document.createElement("div");
    actionsEl.className = "modal-actions";
    cardEl.appendChild(actionsEl);

    if (options.buttons) {
      options.buttons.forEach((btn) => {
        const btnEl = document.createElement("button");
        btnEl.className = btn.className || "modal-btn-primary";
        btnEl.textContent = btn.label;
        btnEl.addEventListener("click", (event) => {
          event.stopPropagation();
          if (btn.action) btn.action();
        });
        actionsEl.appendChild(btnEl);
      });
    }

    // Focus trap
    modalEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!options.noEscapeClose) {
          closeModal(modalEl);
        }
        return;
      }

      if (event.key === "Tab") {
        const focusableEls = modalEl.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (focusableEls.length === 0) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    });

    // Overlay click to close (unless noOverlayClose)
    if (!options.noOverlayClose) {
      overlayEl.addEventListener("click", () => {
        closeModal(modalEl);
      });
    }

    return { modalEl, cardEl, actionsEl };
  };

  const showModal = (modalEl) => {
    previousFocusEl = document.activeElement;
    document.body.appendChild(modalEl);

    // Focus the first focusable element
    const firstFocusable = modalEl.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }
  };

  const closeModal = (modalEl) => {
    if (!modalEl || !modalEl.parentNode) return;

    if (reducedMotion) {
      modalEl.remove();
    } else {
      modalEl.classList.add("closing");
      setTimeout(() => {
        if (modalEl.parentNode) modalEl.remove();
      }, 150);
    }

    // Restore focus to the element that triggered the modal
    if (previousFocusEl && typeof previousFocusEl.focus === "function") {
      previousFocusEl.focus();
    }
    previousFocusEl = null;
  };

  // --- Wrong guess modal ---

  const showWrongGuessModal = () => {
    const { modalEl } = createModal("wrong-guess-modal", {
      heading: "Not so fast!",
      body: "This character can't be logically deduced yet. Flip more cards to gather clues first.",
      buttons: [
        { label: "Got it", className: "modal-btn-primary", action: () => closeModal(modalEl) }
      ]
    });
    showModal(modalEl);
  };

  // --- Game complete modal ---

  const showGameCompleteModal = () => {
    const timeStr = NARSH_PUZZLE.formatTime(NARSH_PUZZLE.getElapsed());
    const mistakeCount = NARSH_PUZZLE.getMistakes();
    const hintCount = NARSH_PUZZLE.getHintsUsed();
    const mistakeWord = mistakeCount === 1 ? "mistake" : "mistakes";
    const hintWord = hintCount === 1 ? "hint" : "hints";

    const statsText = "You identified all 20 characters in " + timeStr +
      " with " + mistakeCount + " " + mistakeWord + " and " + hintCount + " " + hintWord + ".";

    // Custom content: emoji grid preview
    const customEl = document.createElement("div");

    const statsP = document.createElement("p");
    statsP.textContent = statsText;
    customEl.appendChild(statsP);

    const previewEl = document.createElement("div");
    previewEl.className = "share-preview";
    const preEl = document.createElement("pre");
    preEl.textContent = NARSH_PUZZLE.getShareText();
    previewEl.appendChild(preEl);
    customEl.appendChild(previewEl);

    const { modalEl } = createModal("complete-modal", {
      heading: "Case Closed!",
      customContent: customEl,
      buttons: [
        {
          label: "Share Results",
          className: "modal-btn-primary",
          action: () => {
            copyShareText(modalEl.querySelector(".modal-btn-primary"));
          }
        },
        {
          label: "Play Again",
          className: "modal-btn-secondary",
          action: () => {
            closeModal(modalEl);
            showResetConfirmation();
          }
        }
      ]
    });
    showModal(modalEl);
  };

  // --- Reset confirmation modal ---

  const showResetConfirmation = () => {
    const { modalEl } = createModal("reset-modal", {
      heading: "Start Over?",
      body: "This will reset your progress. You can't undo this.",
      noOverlayClose: true,
      noEscapeClose: false,
      buttons: [
        {
          label: "Start Over",
          className: "modal-btn-destructive",
          action: () => {
            closeModal(modalEl);
            NARSH_PUZZLE.reset();
            renderGrid();
            renderStats();
            renderControls();
            autoRevealStarterCard();
          }
        },
        {
          label: "Keep Playing",
          className: "modal-btn-secondary",
          action: () => closeModal(modalEl)
        }
      ]
    });
    showModal(modalEl);
  };

  // --- Clipboard / Share ---

  const copyShareText = (btnEl) => {
    const text = NARSH_PUZZLE.getShareText();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (btnEl) {
          const originalText = btnEl.textContent;
          btnEl.textContent = "Copied!";
          setTimeout(() => {
            btnEl.textContent = originalText;
          }, 2000);
        }
      }).catch(() => {
        showCopyFallback(text, btnEl);
      });
    } else {
      showCopyFallback(text, btnEl);
    }
  };

  const showCopyFallback = (text, btnEl) => {
    if (btnEl) {
      btnEl.textContent = "Copy failed";
    }
    // Create a readonly textarea with the share text as fallback
    const existingFallback = document.querySelector(".share-fallback");
    if (existingFallback) existingFallback.remove();

    const fallbackEl = document.createElement("textarea");
    fallbackEl.className = "share-fallback";
    fallbackEl.readOnly = true;
    fallbackEl.value = text;
    fallbackEl.setAttribute("aria-label", "Share text -- select and copy manually");

    const parent = btnEl ? btnEl.parentNode : controlsEl;
    if (parent) {
      parent.appendChild(fallbackEl);
      fallbackEl.select();
    }
  };

  // --- Speech bubble ---

  const showSpeechBubble = (cardEl, clueText, isCriminal) => {
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "speech-bubble " + (isCriminal ? "criminal" : "innocent");

    const textEl = document.createTextNode(clueText);
    bubbleEl.appendChild(textEl);

    cardEl.appendChild(bubbleEl);

    // Auto-hide after 3 seconds with fade-out
    setTimeout(() => {
      bubbleEl.classList.add("fade-out");
      setTimeout(() => {
        if (bubbleEl.parentNode) bubbleEl.remove();
      }, 500);
    }, 3000);
  };

  // --- Card back population (shared by flip, restore, and auto-reveal) ---

  const populateCardBack = (backEl, cardIndex, clueText, isCriminal) => {
    const character = NARSH_PUZZLE_DATA.getCharacter(cardIndex);
    if (!backEl || !character) return;

    backEl.textContent = "";
    const roleClass = isCriminal ? "criminal" : "innocent";
    backEl.classList.add(roleClass);

    // Character identity: emoji, name, profession
    const emojiEl = document.createElement("span");
    emojiEl.className = "card-back-emoji";
    emojiEl.textContent = character.emoji;
    backEl.appendChild(emojiEl);

    const nameEl = document.createElement("div");
    nameEl.className = "card-back-name";
    nameEl.textContent = character.name;
    backEl.appendChild(nameEl);

    const professionEl = document.createElement("div");
    professionEl.className = "card-back-profession";
    professionEl.textContent = character.profession;
    backEl.appendChild(professionEl);

    // Role label
    const roleLabelEl = document.createElement("span");
    roleLabelEl.className = "role-label " + roleClass;
    roleLabelEl.textContent = isCriminal ? "CRIMINAL" : "INNOCENT";
    backEl.appendChild(roleLabelEl);

    // Clue text
    const clueTextEl = document.createElement("p");
    clueTextEl.className = "clue-text";
    clueTextEl.textContent = clueText;
    backEl.appendChild(clueTextEl);
  };

  // --- Init ---

  const init = () => {
    gridEl = document.getElementById("puzzle-grid");
    statsEl = document.getElementById("puzzle-stats");
    controlsEl = document.getElementById("puzzle-controls");

    if (!gridEl || !statsEl || !controlsEl) return;

    renderGrid();
    renderStats();
    renderControls();
    renderDailyPuzzles();

    // Register callbacks with puzzle logic module
    NARSH_PUZZLE.onCardFlip = handleCardFlip;
    NARSH_PUZZLE.onMistake = handleMistake;
    NARSH_PUZZLE.onGameComplete = handleGameComplete;

    // Restore visual state from localStorage if game had progress
    restoreVisualState();

    // Auto-reveal the first starter card so the player has a clue to work with
    if (NARSH_PUZZLE.getFlippedCards().size === 0) {
      autoRevealStarterCard();
    }

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

  // --- State restore ---

  const restoreVisualState = () => {
    const flipped = NARSH_PUZZLE.getFlippedCards();
    if (flipped.size === 0) return;

    const cards = gridEl.querySelectorAll(".puzzle-card");

    flipped.forEach((cardIndex) => {
      const cardEl = cards[cardIndex];
      if (!cardEl) return;

      const character = NARSH_PUZZLE_DATA.getCharacter(cardIndex);
      if (!character) return;

      // Apply flipped class
      cardEl.classList.add("flipped");

      // Populate card back with identity + role + clue
      const clueText = NARSH_PUZZLE_DATA.resolveClue(character.hint, NARSH_PUZZLE_DATA.CHARACTERS, cardIndex);
      const backEl = cardEl.querySelector(".puzzle-card-back");
      populateCardBack(backEl, cardIndex, clueText, character.criminal);

      // Update aria
      const roleName = character.criminal ? "Criminal" : "Innocent";
      cardEl.setAttribute("aria-label", character.name + ", " + roleName + " -- " + clueText);
      cardEl.setAttribute("aria-disabled", "true");
      cardEl.removeAttribute("tabindex");

      // Apply dimmed state
      if (NARSH_PUZZLE.isDimmed(cardIndex)) {
        cardEl.classList.add("dimmed");
      }
    });

    // Restore color tags for all cards
    cards.forEach((cardEl, idx) => {
      const tagColor = NARSH_PUZZLE.getColorTag(idx);
      const tagDotEl = cardEl.querySelector(".color-tag");
      if (tagDotEl && tagColor !== "transparent") {
        tagDotEl.style.backgroundColor = tagColor;
      }
    });

    // Update stats
    updateStats();

    // If game was complete, show completion state
    if (NARSH_PUZZLE.isComplete()) {
      stopTimerInterval();
      // Show game complete modal on restore
      setTimeout(() => showGameCompleteModal(), 300);
    }
  };

  // --- Grid rendering ---

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

      // Color tag dot
      const tagDotEl = document.createElement("span");
      tagDotEl.className = "color-tag";
      frontEl.appendChild(tagDotEl);

      const emojiEl = document.createElement("span");
      emojiEl.className = "card-emoji";
      emojiEl.textContent = character.emoji;
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

      // Desktop: right-click cycles color tag
      cardEl.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const tagColor = NARSH_PUZZLE.cycleColorTag(i);
        tagDotEl.style.backgroundColor = tagColor;
      });

      // Mobile: long-press (300ms) cycles color tag
      let longPressTimer = null;
      cardEl.addEventListener("touchstart", (event) => {
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          const tagColor = NARSH_PUZZLE.cycleColorTag(i);
          tagDotEl.style.backgroundColor = tagColor;
        }, 300);
      }, { passive: true });

      cardEl.addEventListener("touchmove", () => {
        if (longPressTimer !== null) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      cardEl.addEventListener("touchend", () => {
        if (longPressTimer !== null) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });

      gridEl.appendChild(cardEl);
    }
  };

  const handleCardClick = (cardIndex, cardEl) => {
    // In inspect mode, allow toggling dim on flipped cards
    if (NARSH_PUZZLE.isInspectMode() && cardEl.classList.contains("flipped")) {
      NARSH_PUZZLE.toggleDimCard(cardIndex);
      cardEl.classList.toggle("dimmed");
      return;
    }

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
      dialogEl.style.bottom = "100%";
      dialogEl.style.marginBottom = "4px";
    } else {
      dialogEl.style.top = "100%";
      dialogEl.style.marginTop = "4px";
    }
    dialogEl.style.left = "50%";
    dialogEl.style.transform = "translateX(-50%)";

    cardEl.appendChild(dialogEl);
    activeGuessDialogEl = dialogEl;

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
      dismissGuessDialog();

      // Add flipped class for CSS 3D flip
      cardEl.classList.add("flipped");

      // Populate card back with identity + role + clue
      const backEl = cardEl.querySelector(".puzzle-card-back");
      populateCardBack(backEl, cardIndex, result.clueText, result.criminal);

      // Update aria attributes
      const character = NARSH_PUZZLE_DATA.getCharacter(cardIndex);
      const roleName = result.criminal ? "Criminal" : "Innocent";
      cardEl.setAttribute("aria-label", character.name + ", " + roleName + " -- " + result.clueText);
      cardEl.setAttribute("aria-disabled", "true");
      cardEl.removeAttribute("tabindex");

      // Remove hint highlight if this card was highlighted
      cardEl.classList.remove("hint-highlighted");

      // Clear hint highlights if all revealed
      clearStaleHintHighlights();

      // Show speech bubble with clue text after flip completes
      const speechDelay = reducedMotion ? 0 : 500;
      setTimeout(() => {
        showSpeechBubble(cardEl, result.clueText, result.criminal);
      }, speechDelay);

      // Update stats
      updateStats();

    } else if (result.result === "incorrect") {
      dismissGuessDialog();

      // Shake animation
      cardEl.classList.add("shake");
      cardEl.classList.add("incorrect-flash");

      const shakeTimeout = reducedMotion ? 0 : 400;
      setTimeout(() => {
        cardEl.classList.remove("shake");
      }, shakeTimeout);

      setTimeout(() => {
        cardEl.classList.remove("incorrect-flash");
      }, 300);

      updateStats();

    } else if (result.result === "not-deducible") {
      dismissGuessDialog();
      showWrongGuessModal();

    } else if (result.result === "already-flipped" || result.result === "game-over") {
      dismissGuessDialog();
    }
  };

  // --- Stats bar ---

  const renderStats = () => {
    if (!statsEl) return;
    statsEl.textContent = "";

    // Timer display
    timerDisplayEl = document.createElement("span");
    timerDisplayEl.className = "stat-item";
    timerDisplayEl.setAttribute("aria-label", "Elapsed time: 0:00");
    timerDisplayEl.textContent = NARSH_PUZZLE.formatTime(NARSH_PUZZLE.getElapsed());
    statsEl.appendChild(timerDisplayEl);

    // Start timer interval
    startTimerInterval();

    // Mistakes display
    mistakesDisplayEl = document.createElement("span");
    mistakesDisplayEl.className = "stat-item";
    mistakesDisplayEl.setAttribute("aria-live", "polite");
    mistakesDisplayEl.textContent = "Mistakes: " + NARSH_PUZZLE.getMistakes();
    statsEl.appendChild(mistakesDisplayEl);

    // Hints display
    hintsDisplayEl = document.createElement("span");
    hintsDisplayEl.className = "stat-item";
    hintsDisplayEl.setAttribute("aria-live", "polite");
    hintsDisplayEl.textContent = "Hints: " + NARSH_PUZZLE.getHintsUsed();
    statsEl.appendChild(hintsDisplayEl);
  };

  const startTimerInterval = () => {
    stopTimerInterval();
    timerAriaCounter = 0;
    timerIntervalId = setInterval(() => {
      if (timerDisplayEl) {
        const elapsed = NARSH_PUZZLE.getElapsed();
        timerDisplayEl.textContent = NARSH_PUZZLE.formatTime(elapsed);

        // Update aria-label every 10 seconds to avoid screen reader noise
        timerAriaCounter++;
        if (timerAriaCounter >= 10) {
          timerAriaCounter = 0;
          timerDisplayEl.setAttribute("aria-label", "Elapsed time: " + NARSH_PUZZLE.formatTime(elapsed));
        }
      }
    }, 1000);
  };

  const stopTimerInterval = () => {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  };

  const updateStats = () => {
    if (mistakesDisplayEl) {
      mistakesDisplayEl.textContent = "Mistakes: " + NARSH_PUZZLE.getMistakes();
    }
    if (hintsDisplayEl) {
      hintsDisplayEl.textContent = "Hints: " + NARSH_PUZZLE.getHintsUsed();
    }
    if (timerDisplayEl) {
      timerDisplayEl.textContent = NARSH_PUZZLE.formatTime(NARSH_PUZZLE.getElapsed());
    }
  };

  // --- Controls bar ---

  const renderControls = () => {
    if (!controlsEl) return;
    controlsEl.textContent = "";

    // Reset hint state
    hintShowing = false;
    hintHighlightedCards = [];

    // Hint button
    hintBtnEl = document.createElement("button");
    hintBtnEl.className = "btn-hint";
    hintBtnEl.textContent = "Show Hint";
    hintBtnEl.setAttribute("aria-pressed", "false");
    hintBtnEl.addEventListener("click", handleHintClick);
    controlsEl.appendChild(hintBtnEl);

    // Inspect button
    inspectBtnEl = document.createElement("button");
    inspectBtnEl.className = "btn-inspect";
    inspectBtnEl.textContent = "Dim Read Cards";
    inspectBtnEl.setAttribute("aria-pressed", "false");
    inspectBtnEl.addEventListener("click", handleInspectClick);
    controlsEl.appendChild(inspectBtnEl);

    // Share button
    shareBtnEl = document.createElement("button");
    shareBtnEl.className = "btn-share";
    shareBtnEl.textContent = "Share Results";
    shareBtnEl.addEventListener("click", () => {
      copyShareText(shareBtnEl);
    });
    controlsEl.appendChild(shareBtnEl);
  };

  // --- Auto-reveal starter card ---

  const autoRevealStarterCard = () => {
    // Find the first starter card (one with an empty path)
    const total = NARSH_PUZZLE_DATA.getTotalCharacters();
    let starterIndex = -1;
    for (let i = 0; i < total; i++) {
      const character = NARSH_PUZZLE_DATA.getCharacter(i);
      if (character && character.paths.some((p) => p.length === 0)) {
        starterIndex = i;
        break;
      }
    }
    if (starterIndex < 0) return;

    const character = NARSH_PUZZLE_DATA.getCharacter(starterIndex);
    const result = NARSH_PUZZLE.guessRole(starterIndex, character.criminal);
    if (result.result !== "correct") return;

    const cards = gridEl.querySelectorAll(".puzzle-card");
    const cardEl = cards[starterIndex];
    if (!cardEl) return;

    // Flip the card visually
    cardEl.classList.add("flipped");

    const backEl = cardEl.querySelector(".puzzle-card-back");
    populateCardBack(backEl, starterIndex, result.clueText, character.criminal);

    const roleName = character.criminal ? "Criminal" : "Innocent";
    cardEl.setAttribute("aria-label", character.name + ", " + roleName + " -- " + result.clueText);
    cardEl.setAttribute("aria-disabled", "true");
    cardEl.removeAttribute("tabindex");

    updateStats();
  };

  // --- Hint handling ---

  const handleHintClick = () => {
    if (hintShowing) {
      // Toggle off: hide current hints
      clearHintHighlights();
      hintShowing = false;
      hintBtnEl.textContent = "Show Hint";
      hintBtnEl.classList.remove("active");
      hintBtnEl.setAttribute("aria-pressed", "false");
      NARSH_PUZZLE.hideHint();
      return;
    }

    // Get next hint
    const hint = NARSH_PUZZLE.getNextHint();
    if (!hint) {
      // No more hints available
      hintBtnEl.disabled = true;
      return;
    }

    // Highlight reveal cards
    applyHintHighlights(hint.reveals);
    hintShowing = true;
    hintBtnEl.classList.add("active");
    hintBtnEl.setAttribute("aria-pressed", "true");

    // Check if there are more hints after this one
    // The button text: "Hide Hint" means user can toggle off the current highlight
    hintBtnEl.textContent = "Hide Hint";

    updateStats();
  };

  const applyHintHighlights = (reveals) => {
    clearHintHighlights();
    const cards = gridEl.querySelectorAll(".puzzle-card");
    reveals.forEach((idx) => {
      if (cards[idx] && !cards[idx].classList.contains("flipped")) {
        cards[idx].classList.add("hint-highlighted");
        hintHighlightedCards.push(idx);
      }
    });
  };

  const clearHintHighlights = () => {
    const cards = gridEl.querySelectorAll(".puzzle-card.hint-highlighted");
    cards.forEach((cardEl) => {
      cardEl.classList.remove("hint-highlighted");
    });
    hintHighlightedCards = [];
  };

  const clearStaleHintHighlights = () => {
    // Remove highlights from cards that have been flipped
    if (!hintShowing) return;
    const remaining = [];
    const cards = gridEl.querySelectorAll(".puzzle-card");
    hintHighlightedCards.forEach((idx) => {
      if (cards[idx] && cards[idx].classList.contains("flipped")) {
        cards[idx].classList.remove("hint-highlighted");
      } else {
        remaining.push(idx);
      }
    });
    hintHighlightedCards = remaining;

    // If all hints for this level are flipped, reset hint state for next hint
    if (hintHighlightedCards.length === 0 && hintShowing) {
      hintShowing = false;
      hintBtnEl.textContent = "Show Hint";
      hintBtnEl.classList.remove("active");
      hintBtnEl.setAttribute("aria-pressed", "false");
    }
  };

  // --- Inspect handling ---

  const handleInspectClick = () => {
    const isOn = NARSH_PUZZLE.toggleInspectMode();
    if (isOn) {
      inspectBtnEl.textContent = "Dimming On";
      inspectBtnEl.classList.add("active");
      inspectBtnEl.setAttribute("aria-pressed", "true");
    } else {
      inspectBtnEl.textContent = "Dim Read Cards";
      inspectBtnEl.classList.remove("active");
      inspectBtnEl.setAttribute("aria-pressed", "false");
    }
  };

  // --- Daily puzzle links ---

  const renderDailyPuzzles = () => {
    const dailyPuzzlesEl = document.getElementById("daily-puzzles");
    if (!dailyPuzzlesEl) return;

    const puzzles = NARSH_PUZZLE_DATA.DAILY_PUZZLES;
    if (!puzzles || puzzles.length === 0) return;

    const gridContainerEl = document.createElement("div");
    gridContainerEl.className = "daily-puzzles-grid";

    puzzles.forEach((puzzle) => {
      const linkEl = document.createElement("a");
      linkEl.className = "daily-puzzle-card";
      linkEl.href = puzzle.url;
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
      linkEl.setAttribute("aria-label", puzzle.name + " -- opens in new tab");

      const emojiSpanEl = document.createElement("span");
      emojiSpanEl.className = "daily-emoji";
      emojiSpanEl.textContent = puzzle.emoji;
      linkEl.appendChild(emojiSpanEl);

      const infoEl = document.createElement("div");
      infoEl.className = "daily-info";

      const titleEl = document.createElement("div");
      titleEl.className = "daily-title";
      titleEl.textContent = puzzle.name;
      infoEl.appendChild(titleEl);

      const descEl = document.createElement("div");
      descEl.className = "daily-desc";
      descEl.textContent = puzzle.description;
      infoEl.appendChild(descEl);

      linkEl.appendChild(infoEl);
      gridContainerEl.appendChild(linkEl);
    });

    dailyPuzzlesEl.appendChild(gridContainerEl);
  };

  // --- Callbacks registered with NARSH_PUZZLE ---

  const handleCardFlip = (cardIndex, clueText, isCriminal) => {
    // Card flip is handled inline in processGuessResult
  };

  const handleMistake = (totalMistakes) => {
    updateStats();
  };

  const handleGameComplete = (totalMistakes) => {
    stopTimerInterval();
    // Final timer update
    if (timerDisplayEl) {
      timerDisplayEl.textContent = NARSH_PUZZLE.formatTime(NARSH_PUZZLE.getElapsed());
    }
    // Show game complete modal after a brief delay for last flip to animate
    const delay = reducedMotion ? 100 : 800;
    setTimeout(() => {
      showGameCompleteModal();
    }, delay);
  };

  return { init };
})();
