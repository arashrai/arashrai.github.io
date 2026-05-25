// Narsh 2026 — Puzzle Logic Module
// Game state machine: card flipping, guess validation, deducibility checks,
// mistake tracking, timer, color tags, inspect/dim mode, hints, share results,
// localStorage persistence, and callbacks for UI communication.

const NARSH_PUZZLE = (() => {
  "use strict";

  // Color tag palette: 7 colors cycled via right-click (desktop) or long-press (mobile)
  const COLOR_TAG_CYCLE = [
    "transparent", "#E74C3C", "#E67E22", "#F1C40F", "#27AE60", "#3498DB", "#8E44AD"
  ];

  const STORAGE_KEY = "narsh-puzzle-state";

  // Private state
  let puzzleData = null;
  let flippedCards = new Set();
  let mistakes = 0;
  let gameComplete = false;

  // Timer state
  let timerStart = 0;
  let accumulated = 0;
  let timerRunning = false;
  let firstAction = false;

  // Color tags: cardIndex -> palette index (0-6)
  let colorTags = {};

  // Inspect/dim mode
  let inspectMode = false;
  let dimmedCards = new Set();

  // Hint system
  let hintsUsed = 0;
  let currentHintLevel = -1;

  // Callbacks for UI module
  let onCardFlipCallback = null;
  let onMistakeCallback = null;
  let onGameCompleteCallback = null;
  let onColorTagChangeCallback = null;
  let onInspectToggleCallback = null;
  let onHintUpdateCallback = null;

  // --- Timer functions ---

  const startTimer = () => {
    if (!timerRunning && !gameComplete) {
      timerStart = performance.now();
      timerRunning = true;
    }
  };

  const pauseTimer = () => {
    if (timerRunning) {
      accumulated += (performance.now() - timerStart);
      timerRunning = false;
    }
  };

  const resumeTimer = () => {
    if (!timerRunning && !gameComplete) {
      timerStart = performance.now();
      timerRunning = true;
    }
  };

  const getElapsed = () => {
    if (timerRunning) {
      return accumulated + (performance.now() - timerStart);
    }
    return accumulated;
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  };

  // Pause timer when tab is hidden, resume when visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  });

  // --- Color tag functions ---

  const cycleColorTag = (cardIndex) => {
    const currentIndex = colorTags[cardIndex] || 0;
    const nextIndex = (currentIndex + 1) % COLOR_TAG_CYCLE.length;
    colorTags[cardIndex] = nextIndex;
    saveState();
    if (onColorTagChangeCallback) {
      onColorTagChangeCallback(cardIndex, COLOR_TAG_CYCLE[nextIndex]);
    }
    return COLOR_TAG_CYCLE[nextIndex];
  };

  const getColorTag = (cardIndex) => {
    return COLOR_TAG_CYCLE[colorTags[cardIndex] || 0];
  };

  // --- Inspect/dim mode ---

  const toggleInspectMode = () => {
    inspectMode = !inspectMode;
    if (onInspectToggleCallback) {
      onInspectToggleCallback(inspectMode);
    }
    return inspectMode;
  };

  const toggleDimCard = (cardIndex) => {
    if (flippedCards.has(cardIndex)) {
      if (dimmedCards.has(cardIndex)) {
        dimmedCards.delete(cardIndex);
      } else {
        dimmedCards.add(cardIndex);
      }
      saveState();
    }
  };

  const isDimmed = (cardIndex) => {
    return dimmedCards.has(cardIndex);
  };

  const isInspectMode = () => {
    return inspectMode;
  };

  // --- Hint system ---

  const getNextHint = () => {
    if (!puzzleData || !puzzleData.HINT_SEQUENCE) return null;

    const sequence = puzzleData.HINT_SEQUENCE;

    // Find the first entry where all requires are flipped and at least one reveals is not
    for (let i = 0; i < sequence.length; i++) {
      const entry = sequence[i];
      const requiresMet = entry.requires.every((idx) => flippedCards.has(idx));
      const hasUnrevealed = entry.reveals.some((idx) => !flippedCards.has(idx));

      if (requiresMet && hasUnrevealed) {
        // Only increment hintsUsed if this is a new hint level (not re-showing same one)
        if (i !== currentHintLevel) {
          hintsUsed++;
          currentHintLevel = i;
          saveState();
          if (onHintUpdateCallback) {
            onHintUpdateCallback(hintsUsed);
          }
        }
        return { sources: entry.sources, reveals: entry.reveals };
      }
    }

    return null;
  };

  const getHintHighlights = () => {
    if (currentHintLevel < 0 || !puzzleData || !puzzleData.HINT_SEQUENCE) {
      return [];
    }
    const entry = puzzleData.HINT_SEQUENCE[currentHintLevel];
    if (!entry) return [];
    return entry.reveals.filter((idx) => !flippedCards.has(idx));
  };

  const hideHint = () => {
    currentHintLevel = -1;
    return [];
  };

  const getHintsUsed = () => {
    return hintsUsed;
  };

  // --- Share results ---

  const generateShareText = () => {
    const timeStr = formatTime(getElapsed());
    const mistakeWord = mistakes === 1 ? "mistake" : "mistakes";
    const hintWord = hintsUsed === 1 ? "hint" : "hints";

    let text = "Clues Puzzle\n";
    text += "\u{23F1}️ " + timeStr + " | ❌ " + mistakes + " " + mistakeWord + " | \u{1F4A1} " + hintsUsed + " " + hintWord + "\n\n";

    // Emoji grid: red square for criminal, green square for innocent, 4 per row
    if (puzzleData) {
      const characters = puzzleData.CHARACTERS;
      for (let i = 0; i < characters.length; i++) {
        if (i > 0 && i % 4 === 0) {
          text += "\n";
        }
        text += characters[i].criminal ? "\u{1F7E5}" : "\u{1F7E9}";
      }
    }

    return text;
  };

  const getShareText = () => {
    return generateShareText();
  };

  // --- localStorage persistence ---

  const saveState = () => {
    try {
      const state = {
        version: puzzleData ? puzzleData.DATA_VERSION : "1",
        flipped: Array.from(flippedCards),
        mistakes: mistakes,
        hintsUsed: hintsUsed,
        colorTags: colorTags,
        elapsedMs: getElapsed(),
        dimmedCards: Array.from(dimmedCards),
        gameComplete: gameComplete
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Silently fail (private browsing mode)
    }
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || state.version !== (puzzleData ? puzzleData.DATA_VERSION : "1")) {
        return null;
      }
      return state;
    } catch (e) {
      return null;
    }
  };

  const clearState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Silently fail
    }
  };

  // --- Core game functions ---

  const init = (data) => {
    puzzleData = data;

    const saved = loadState();
    if (saved) {
      flippedCards = new Set(saved.flipped || []);
      mistakes = saved.mistakes || 0;
      hintsUsed = saved.hintsUsed || 0;
      colorTags = saved.colorTags || {};
      dimmedCards = new Set(saved.dimmedCards || []);
      accumulated = saved.elapsedMs || 0;
      gameComplete = saved.gameComplete || false;
      currentHintLevel = -1;
      inspectMode = false;
      timerRunning = false;
      timerStart = 0;

      if (gameComplete) {
        // Game was already complete, don't start timer
        firstAction = true;
      } else if (flippedCards.size > 0) {
        // Resuming an in-progress game, timer was running
        firstAction = true;
        startTimer();
      } else {
        firstAction = false;
      }
    } else {
      flippedCards = new Set();
      mistakes = 0;
      hintsUsed = 0;
      colorTags = {};
      dimmedCards = new Set();
      accumulated = 0;
      gameComplete = false;
      currentHintLevel = -1;
      inspectMode = false;
      timerRunning = false;
      timerStart = 0;
      firstAction = false;
    }
  };

  const guessRole = (cardIndex, guessedCriminal) => {
    if (flippedCards.has(cardIndex)) {
      return { result: "already-flipped" };
    }

    if (gameComplete) {
      return { result: "game-over" };
    }

    const character = puzzleData.getCharacter(cardIndex);
    if (!character) {
      return { result: "invalid" };
    }

    // Start timer on first action
    if (!firstAction) {
      firstAction = true;
      startTimer();
    }

    // Check deducibility: at least one path must have all prerequisites flipped
    const isDeducible = character.paths.some((path) =>
      path.every((idx) => flippedCards.has(idx))
    );

    if (!isDeducible) {
      return { result: "not-deducible" };
    }

    const isCorrect = (guessedCriminal === character.criminal);

    if (isCorrect) {
      flippedCards.add(cardIndex);
      const clueText = puzzleData.resolveClue(character.hint, puzzleData.CHARACTERS, cardIndex);

      // Clear hint highlights if the flipped card was a hint target
      if (currentHintLevel >= 0) {
        const highlights = getHintHighlights();
        if (highlights.length === 0) {
          currentHintLevel = -1;
        }
      }

      if (onCardFlipCallback) {
        onCardFlipCallback(cardIndex, clueText, character.criminal);
      }

      // Check for game completion
      if (flippedCards.size === puzzleData.getTotalCharacters()) {
        gameComplete = true;
        pauseTimer();
        if (onGameCompleteCallback) {
          onGameCompleteCallback(mistakes);
        }
      }

      saveState();
      return { result: "correct", clueText, criminal: character.criminal };
    } else {
      mistakes++;
      if (onMistakeCallback) {
        onMistakeCallback(mistakes);
      }
      saveState();
      return { result: "incorrect" };
    }
  };

  const getFlippedCards = () => new Set(flippedCards);

  const getMistakes = () => mistakes;

  const isComplete = () => gameComplete;

  const getCharacterCount = () => {
    return puzzleData ? puzzleData.getTotalCharacters() : 0;
  };

  const reset = () => {
    flippedCards = new Set();
    mistakes = 0;
    gameComplete = false;
    hintsUsed = 0;
    colorTags = {};
    dimmedCards = new Set();
    accumulated = 0;
    timerRunning = false;
    timerStart = 0;
    currentHintLevel = -1;
    inspectMode = false;
    firstAction = false;
    clearState();
  };

  return {
    init,
    guessRole,
    getFlippedCards,
    getMistakes,
    isComplete,
    getCharacterCount,
    reset,
    cycleColorTag,
    getColorTag,
    toggleInspectMode,
    isInspectMode,
    toggleDimCard,
    isDimmed,
    getNextHint,
    getHintHighlights,
    hideHint,
    getHintsUsed,
    getElapsed,
    formatTime,
    getShareText,
    set onCardFlip(cb) { onCardFlipCallback = cb; },
    set onMistake(cb) { onMistakeCallback = cb; },
    set onGameComplete(cb) { onGameCompleteCallback = cb; },
    set onColorTagChange(cb) { onColorTagChangeCallback = cb; },
    set onInspectToggle(cb) { onInspectToggleCallback = cb; },
    set onHintUpdate(cb) { onHintUpdateCallback = cb; }
  };
})();
