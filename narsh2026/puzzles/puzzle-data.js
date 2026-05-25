// Narsh 2026 — Puzzle Data Module
// Character definitions, hint sequence, profession emoji map, daily puzzle links,
// and clue template resolver for the Clues-style logic puzzle on the Puzzles page.

const NARSH_PUZZLE_DATA = (() => {
  "use strict";

  const DATA_VERSION = "1";

  // 20 characters in a 4x5 grid. Each has:
  //   criminal (boolean), profession (string), name (string), gender (string),
  //   hint (clue text with template tokens), paths (arrays of prerequisite card indices)
  //
  // Grid layout (by index):
  //   0  1  2  3
  //   4  5  6  7
  //   8  9  10 11
  //   12 13 14 15
  //   16 17 18 19
  //
  // Criminals: indices 1, 5, 8, 12, 16 (5 criminals, 15 innocent)
  //
  // Paths: each inner array is a set of prerequisite cards that must ALL be flipped
  // before this card is deducible. Multiple inner arrays = multiple valid paths.
  // An empty inner array [] means the card is a starting card (no prerequisites).

  const CHARACTERS = [
    {
      criminal: false,
      profession: "detective",
      name: "Rosa",
      gender: "female",
      hint: "I investigated #NAME:1 and found evidence of guilt.",
      paths: [[]]
    },
    {
      criminal: true,
      profession: "cook",
      name: "Viktor",
      gender: "male",
      hint: "#NAME:2 is in #C:2 and is innocent.",
      paths: [[0]]
    },
    {
      criminal: false,
      profession: "teacher",
      name: "Mei",
      gender: "female",
      hint: "The person #BETWEEN:pair(1,3) in my row is not a criminal.",
      paths: [[1]]
    },
    {
      criminal: false,
      profession: "artist",
      name: "Sanjay",
      gender: "male",
      hint: "I can confirm #NAME:7 is innocent.",
      paths: [[]]
    },
    {
      criminal: false,
      profession: "nurse",
      name: "Lena",
      gender: "female",
      hint: "#NAME:5 in #C:5 is definitely a criminal.",
      paths: [[0], [3]]
    },
    {
      criminal: true,
      profession: "lawyer",
      name: "Marco",
      gender: "male",
      hint: "#NAME:9 is someone I would never trust.",
      paths: [[4]]
    },
    {
      criminal: false,
      profession: "engineer",
      name: "Priya",
      gender: "female",
      hint: "#NAME:10 and I are both innocent.",
      paths: [[5]]
    },
    {
      criminal: false,
      profession: "scientist",
      name: "Oliver",
      gender: "male",
      hint: "The person in #C:11 on my row is not criminal.",
      paths: [[3]]
    },
    {
      criminal: true,
      profession: "police",
      name: "Dante",
      gender: "male",
      hint: "I know that #NAME:12 is also guilty.",
      paths: [[4], [7]]
    },
    {
      criminal: false,
      profession: "doctor",
      name: "Yuki",
      gender: "female",
      hint: "#NAME:13 is innocent, I am sure of it.",
      paths: [[5], [8]]
    },
    {
      criminal: false,
      profession: "teacher",
      name: "Carlos",
      gender: "male",
      hint: "Both #NAME:14 and #NAME:15 are innocent.",
      paths: [[6]]
    },
    {
      criminal: false,
      profession: "artist",
      name: "Freya",
      gender: "female",
      hint: "#NAME:15 told me they are innocent, and I believe them.",
      paths: [[7]]
    },
    {
      criminal: true,
      profession: "engineer",
      name: "Hassan",
      gender: "male",
      hint: "#NAME:16 is guilty just like me.",
      paths: [[8], [9]]
    },
    {
      criminal: false,
      profession: "nurse",
      name: "Anya",
      gender: "female",
      hint: "I know #NAME:17 is innocent because I saw the evidence.",
      paths: [[9]]
    },
    {
      criminal: false,
      profession: "scientist",
      name: "Leo",
      gender: "male",
      hint: "#NAME:18 is in #C:18 and is not a criminal.",
      paths: [[10]]
    },
    {
      criminal: false,
      profession: "doctor",
      name: "Sofia",
      gender: "female",
      hint: "#NAME:19 is the last innocent person I need to vouch for.",
      paths: [[10], [11]]
    },
    {
      criminal: true,
      profession: "cook",
      name: "Remy",
      gender: "male",
      hint: "I have nothing useful to say. I am guilty.",
      paths: [[12]]
    },
    {
      criminal: false,
      profession: "detective",
      name: "Noor",
      gender: "female",
      hint: "My investigation shows #NAME:18 is clean.",
      paths: [[13]]
    },
    {
      criminal: false,
      profession: "lawyer",
      name: "Tomas",
      gender: "male",
      hint: "I represented #NAME:19 and can confirm innocence.",
      paths: [[14], [17]]
    },
    {
      criminal: false,
      profession: "police",
      name: "Isla",
      gender: "female",
      hint: "Case closed. Everyone accounted for.",
      paths: [[15], [18]]
    }
  ];

  // Pre-computed hint sequence. Each entry:
  //   requires: cards that must already be flipped
  //   sources: cards whose clues point to the reveal
  //   reveals: cards newly deducible after requirements are met
  const HINT_SEQUENCE = [
    { requires: [], sources: [], reveals: [0, 3] },
    { requires: [0], sources: [0], reveals: [1] },
    { requires: [3], sources: [3], reveals: [7] },
    { requires: [0, 3], sources: [0, 3], reveals: [4] },
    { requires: [1], sources: [1], reveals: [2] },
    { requires: [4], sources: [4], reveals: [5] },
    { requires: [5], sources: [5], reveals: [6, 9] },
    { requires: [3, 7], sources: [7], reveals: [8] },
    { requires: [6], sources: [6], reveals: [10] },
    { requires: [7], sources: [7], reveals: [11] },
    { requires: [8, 9], sources: [8, 9], reveals: [12] },
    { requires: [9], sources: [9], reveals: [13] },
    { requires: [10], sources: [10], reveals: [14] },
    { requires: [10, 11], sources: [10, 11], reveals: [15] },
    { requires: [12], sources: [12], reveals: [16] },
    { requires: [13], sources: [13], reveals: [17] },
    { requires: [14, 17], sources: [14, 17], reveals: [18] },
    { requires: [15, 18], sources: [15, 18], reveals: [19] }
  ];

  const PROFESSION_EMOJI = {
    police: "\u{1F46E}",
    cook: "\u{1F468}‍\u{1F373}",
    detective: "\u{1F575}️",
    doctor: "\u{1F468}‍⚕️",
    teacher: "\u{1F468}‍\u{1F3EB}",
    artist: "\u{1F3A8}",
    lawyer: "⚖️",
    engineer: "\u{1F527}",
    scientist: "\u{1F52C}",
    nurse: "\u{1F469}‍⚕️"
  };

  const DAILY_PUZZLES = [
    { name: "Clues by Sam", url: "https://cluesbysam.com/", emoji: "\u{1F50D}", description: "Social deduction logic puzzle" },
    { name: "Minute Cryptic", url: "https://www.minutecryptic.com/", emoji: "\u{1F4DD}", description: "Quick cryptic crossword clue" },
    { name: "Globle", url: "https://globle-game.com/", emoji: "\u{1F30E}", description: "Guess the country by proximity" },
    { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", emoji: "\u{1F7E9}", description: "The classic word game" },
    { name: "FoodGuessr", url: "https://www.foodguessr.com/", emoji: "\u{1F355}", description: "Guess the food origin" }
  ];

  // Resolve clue template tokens in hint text.
  // #NAME:N -> character name at index N
  // #C:N -> "column " + ((N % 4) + 1) for character at index N
  // #BETWEEN:pair(X,Y) -> "between NameX and NameY"
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

  const getEmoji = (profession) => PROFESSION_EMOJI[profession] || "\u{1F464}";

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
