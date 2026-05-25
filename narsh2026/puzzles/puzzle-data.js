// Narsh 2026 — Puzzle Data Module
// Character definitions, hint sequence, profession emoji map, daily puzzle links,
// and clue template resolver for the Clues-style logic puzzle on the Puzzles page.
// Puzzle modeled after Clues by Sam (May 25, 2026).

const NARSH_PUZZLE_DATA = (() => {
  "use strict";

  const DATA_VERSION = "2";

  // 4x5 grid layout (column A-D, row 1-5):
  //   A1(0)  B1(1)  C1(2)  D1(3)
  //   A2(4)  B2(5)  C2(6)  D2(7)
  //   A3(8)  B3(9)  C3(10) D3(11)
  //   A4(12) B4(13) C4(14) D4(15)
  //   A5(16) B5(17) C5(18) D5(19)
  //
  // Criminals (5): Bobby(1), Freya(4), Ollie(10), Scott(13), Vicky(16)
  // Innocent (15): everyone else
  //
  // Deduction chain starting from Zara (auto-revealed):
  //   Zara → Thor,Uma → Nancy,Wally / Ollie,Paula,Xavi → Scott / Vicky / Igor,Kay
  //   → Quita / Emma → Ghani / Martin → Anna,Bobby,Derek → Freya

  const CHARACTERS = [
    {
      criminal: false,
      profession: "cop",
      name: "Anna",
      emoji: "👮‍♀️",
      hint: "Freya is definitely not innocent",
      paths: [[5]]
    },
    {
      criminal: true,
      profession: "guard",
      name: "Bobby",
      emoji: "💂‍♂️",
      hint: "I'd team up with Freya any day",
      paths: [[5]]
    },
    {
      criminal: false,
      profession: "pilot",
      name: "Derek",
      emoji: "👨‍✈️",
      hint: "The cops in this grid are clean",
      paths: [[5], [3]]
    },
    {
      criminal: false,
      profession: "mech",
      name: "Emma",
      emoji: "👩‍🔧",
      hint: "Derek has nothing to hide",
      paths: [[7]]
    },
    {
      criminal: true,
      profession: "builder",
      name: "Freya",
      emoji: "👷‍♀️",
      hint: "Martin was too kind to suspect me",
      paths: [[8], [0]]
    },
    {
      criminal: false,
      profession: "sleuth",
      name: "Ghani",
      emoji: "🕵️‍♂️",
      hint: "Bobby is the only criminal in the top row",
      paths: [[6]]
    },
    {
      criminal: false,
      profession: "builder",
      name: "Igor",
      emoji: "👷‍♂️",
      hint: "Ghani is innocent, I'm sure of it",
      paths: [[11]]
    },
    {
      criminal: false,
      profession: "guard",
      name: "Kay",
      emoji: "💂‍♀️",
      hint: "Emma is innocent",
      paths: [[11]]
    },
    {
      criminal: false,
      profession: "builder",
      name: "Martin",
      emoji: "👷‍♂️",
      hint: "Freya is criminal",
      paths: [[12], [16]]
    },
    {
      criminal: false,
      profession: "sleuth",
      name: "Nancy",
      emoji: "🕵️‍♀️",
      hint: "Scott is guilty",
      paths: [[14]]
    },
    {
      criminal: true,
      profession: "singer",
      name: "Ollie",
      emoji: "👨‍🎤",
      hint: "Nancy never suspected me",
      paths: [[15]]
    },
    {
      criminal: false,
      profession: "mech",
      name: "Paula",
      emoji: "👩‍🔧",
      hint: "Igor and Kay are both innocent",
      paths: [[15]]
    },
    {
      criminal: false,
      profession: "pilot",
      name: "Quita",
      emoji: "👩‍✈️",
      hint: "Martin is innocent",
      paths: [[13]]
    },
    {
      criminal: true,
      profession: "sleuth",
      name: "Scott",
      emoji: "🕵️‍♂️",
      hint: "Quita is innocent",
      paths: [[9]]
    },
    {
      criminal: false,
      profession: "cop",
      name: "Thor",
      emoji: "👮‍♂️",
      hint: "Nancy and Wally are both innocent",
      paths: [[19]]
    },
    {
      criminal: false,
      profession: "singer",
      name: "Uma",
      emoji: "👩‍🎤",
      hint: "Ollie is the only criminal next to me",
      paths: [[19]]
    },
    {
      criminal: true,
      profession: "cook",
      name: "Vicky",
      emoji: "👩‍🍳",
      hint: "Martin is not one of us",
      paths: [[17]]
    },
    {
      criminal: false,
      profession: "cook",
      name: "Wally",
      emoji: "👨‍🍳",
      hint: "Xavi is innocent but Vicky is not",
      paths: [[14]]
    },
    {
      criminal: false,
      profession: "singer",
      name: "Xavi",
      emoji: "👨‍🎤",
      hint: "Wally always has my back",
      paths: [[15], [17]]
    },
    {
      criminal: false,
      profession: "mech",
      name: "Zara",
      emoji: "👩‍🔧",
      hint: "Xavi and I have 2 innocent neighbors in common",
      paths: [[]]
    }
  ];

  // Hint sequence guides the optimal deduction order.
  // requires: cards that must already be flipped
  // sources: cards whose clues point to the reveal
  // reveals: cards newly deducible after requirements are met
  const HINT_SEQUENCE = [
    { requires: [], sources: [], reveals: [19] },
    { requires: [19], sources: [19], reveals: [14, 15] },
    { requires: [14], sources: [14], reveals: [9, 17] },
    { requires: [15], sources: [15], reveals: [10, 11, 18] },
    { requires: [9], sources: [9], reveals: [13] },
    { requires: [17], sources: [17], reveals: [16] },
    { requires: [11], sources: [11], reveals: [6, 7] },
    { requires: [13], sources: [13], reveals: [12] },
    { requires: [6], sources: [6], reveals: [5] },
    { requires: [7], sources: [7], reveals: [3] },
    { requires: [12], sources: [12], reveals: [8] },
    { requires: [5], sources: [5], reveals: [0, 1, 2] },
    { requires: [8], sources: [8], reveals: [4] }
  ];

  const PROFESSION_EMOJI = {
    cop: "👮",
    guard: "💂",
    pilot: "✈️",
    mech: "🔧",
    builder: "👷",
    sleuth: "🕵️",
    singer: "🎤",
    cook: "🍳"
  };

  const DAILY_PUZZLES = [
    { name: "Clues by Sam", url: "https://cluesbysam.com/", emoji: "🔍", description: "Social deduction logic puzzle" },
    { name: "Minute Cryptic", url: "https://www.minutecryptic.com/", emoji: "📝", description: "Quick cryptic crossword clue" },
    { name: "Globle", url: "https://globle-game.com/", emoji: "🌎", description: "Guess the country by proximity" },
    { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", emoji: "🟩", description: "The classic word game" },
    { name: "FoodGuessr", url: "https://www.foodguessr.com/", emoji: "🍕", description: "Guess the food origin" }
  ];

  const resolveClue = (hintText, characters, speakerIndex) => {
    let resolved = hintText;

    resolved = resolved.replace(/#NAME:(\d+)/g, (match, idx) => {
      const char = characters[parseInt(idx, 10)];
      return char ? char.name : match;
    });

    resolved = resolved.replace(/#C:(\d+)/g, (match, idx) => {
      const col = (parseInt(idx, 10) % 4) + 1;
      return "column " + col;
    });

    resolved = resolved.replace(/#BETWEEN:pair\((\d+),(\d+)\)/g, (match, x, y) => {
      const charX = characters[parseInt(x, 10)];
      const charY = characters[parseInt(y, 10)];
      return "between " + (charX ? charX.name : "?") + " and " + (charY ? charY.name : "?");
    });

    return resolved;
  };

  const getCharacter = (index) => CHARACTERS[index] || null;

  const getEmoji = (profession) => PROFESSION_EMOJI[profession] || "👤";

  const getTotalCharacters = () => CHARACTERS.length;

  return {
    CHARACTERS,
    HINT_SEQUENCE,
    PROFESSION_EMOJI,
    DAILY_PUZZLES,
    DATA_VERSION,
    resolveClue,
    getCharacter,
    getEmoji,
    getTotalCharacters
  };
})();
