// Narsh 2026 — Puzzle Logic Module
// Game state machine: card flipping, guess validation, deducibility checks,
// mistake tracking, callbacks for UI communication. Timer, hints, color tags,
// inspect mode, and localStorage persistence deferred to Plan 02.

const NARSH_PUZZLE = (() => {
  "use strict";

  // Private state
  let puzzleData = null;
  let flippedCards = new Set();
  let mistakes = 0;
  let gameComplete = false;

  // Callbacks for UI module
  let onCardFlipCallback = null;
  let onMistakeCallback = null;
  let onGameCompleteCallback = null;

  const init = (data) => {
    puzzleData = data;
    flippedCards = new Set();
    mistakes = 0;
    gameComplete = false;
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

      if (onCardFlipCallback) {
        onCardFlipCallback(cardIndex, clueText, character.criminal);
      }

      // Check for game completion
      if (flippedCards.size === puzzleData.getTotalCharacters()) {
        gameComplete = true;
        if (onGameCompleteCallback) {
          onGameCompleteCallback(mistakes);
        }
      }

      return { result: "correct", clueText, criminal: character.criminal };
    } else {
      mistakes++;
      if (onMistakeCallback) {
        onMistakeCallback(mistakes);
      }
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
  };

  return {
    init,
    guessRole,
    getFlippedCards,
    getMistakes,
    isComplete,
    getCharacterCount,
    reset,
    set onCardFlip(cb) { onCardFlipCallback = cb; },
    set onMistake(cb) { onMistakeCallback = cb; },
    set onGameComplete(cb) { onGameCompleteCallback = cb; }
  };
})();
