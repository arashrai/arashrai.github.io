// Narsh 2026 — Puzzle Data Module
// Character definitions, hint sequence, profession emoji map, daily puzzle links,
// and clue template resolver for the Clues-style logic puzzle on the Puzzles page.
// Logic ported from a Clues by Sam puzzle (id 5e87f220d3d9).
// NOTE: names/emojis are placeholders — to be replaced with family members later.

const NARSH_PUZZLE_DATA = (() => {
  "use strict";

  const DATA_VERSION = "4";

  // 4x5 grid layout (column A-D, row 1-5):
  //   A1(0)  B1(1)  C1(2)  D1(3)
  //   A2(4)  B2(5)  C2(6)  D2(7)
  //   A3(8)  B3(9)  C3(10) D3(11)
  //   A4(12) B4(13) C4(14) D4(15)
  //   A5(16) B5(17) C5(18) D5(19)
  //
  // Starter (auto-revealed): Tina (15).
  // paths[] lists the full prerequisite chain that must be revealed before a
  // card becomes deducible (character.paths.some(p => p.every(flipped))).

  const IDENTITY_CLUE = "The criminals stole something cuddly";

  const CHARACTERS = [
    {
      criminal: true,
      profession: "doctor",
      name: "Amy",
      emoji: "👩‍⚕️",
      hint: "There's an odd number of innocents neighboring #NAME:13",
      paths: [[15,14,18,12,13,5,6,11,7,4,19]]
    },
    {
      criminal: false,
      profession: "doctor",
      name: "Bunty",
      emoji: "👩‍⚕️",
      hint: "Oh, no! I think I know what it is... You're horrible!",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "farmer",
      name: "Chris",
      emoji: "👨‍🌾",
      hint: "Give it back now! I can't sleep without it!",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "farmer",
      name: "Donna",
      emoji: "👩‍🌾",
      hint: "Wait... It's not a hoover, is it?",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "cook",
      name: "Erwin",
      emoji: "👨‍🍳",
      hint: "There are as many criminal #PROFS:builder as there are criminal #PROFS:coder",
      paths: [[15,14,18,12,13,5,6,11,7]]
    },
    {
      criminal: false,
      profession: "painter",
      name: "Frida",
      emoji: "👩‍🎨",
      hint: "#NAME:6 is a criminal",
      paths: [[15,14,18,12,13]]
    },
    {
      criminal: true,
      profession: "guard",
      name: "Hal",
      emoji: "💂‍♂️",
      hint: "2 #PROFS:mech have a criminal directly below them",
      paths: [[15,14,18,12,13,5]]
    },
    {
      criminal: false,
      profession: "mech",
      name: "Igor",
      emoji: "👨‍🔧",
      hint: "Only one row has exactly 2 criminals",
      paths: [[15,14,18,12,13,5,6,11]]
    },
    {
      criminal: true,
      profession: "cook",
      name: "Keith",
      emoji: "👨‍🍳",
      hint: "We stole it from your bedroom...",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "painter",
      name: "Martin",
      emoji: "👨‍🎨",
      hint: "If you want a replacement, you might find one at Paddington Station",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "mech",
      name: "Nancy",
      emoji: "👩‍🔧",
      hint: "What we stole was inspired by a certain president",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "mech",
      name: "Oscar",
      emoji: "👨‍🔧",
      hint: "There are exactly 2 innocents #BETWEEN:pair(5,7)",
      paths: [[15,14,18,12,13,5,6]]
    },
    {
      criminal: true,
      profession: "cook",
      name: "Penny",
      emoji: "👩‍🍳",
      hint: "Row 4 is the only row with exactly one innocent",
      paths: [[15,14,18]]
    },
    {
      criminal: true,
      profession: "builder",
      name: "Quita",
      emoji: "👷‍♀️",
      hint: "Both innocents #BETWEEN:pair(1,13) are connected",
      paths: [[15,14,18,12]]
    },
    {
      criminal: true,
      profession: "builder",
      name: "Shaun",
      emoji: "👷‍♂️",
      hint: "#NAME:18 is one of 2 criminals #BETWEEN:pair(16,19)",
      paths: [[15]]
    },
    {
      criminal: false,
      profession: "guard",
      name: "Tina",
      emoji: "💂‍♀️",
      hint: "I'm the only innocent #BETWEEN:pair(14,15)",
      paths: [[]]
    },
    {
      criminal: true,
      profession: "coder",
      name: "Umar",
      emoji: "👨‍💻",
      hint: "We stole something soft...",
      paths: [[15,14,18,12,13,5,6,11,7,4]]
    },
    {
      criminal: false,
      profession: "coder",
      name: "Wanda",
      emoji: "👩‍💻",
      hint: "I hear the criminals stole something... But what?",
      paths: [[15,14,18,12]]
    },
    {
      criminal: true,
      profession: "coder",
      name: "Xia",
      emoji: "👩‍💻",
      hint: "Only 1 of the 2 criminals neighboring #NAME:16 is #NAMES:12 neighbor",
      paths: [[15,14]]
    },
    {
      criminal: false,
      profession: "guard",
      name: "Zed",
      emoji: "💂‍♂️",
      hint: "There is only one innocent #BETWEEN:pair(0,4)",
      paths: [[15,14,18,12,13,5,6,11,7,4]]
    }
  ];

  // Hint sequence guides the optimal deduction order (one card per step, in the
  // order they become deducible from the starter).
  const HINT_SEQUENCE = [
    { requires: [15], sources: [15], reveals: [14] },
    { requires: [15,14], sources: [15,14], reveals: [18] },
    { requires: [15,14,18], sources: [15,14,18], reveals: [12] },
    { requires: [15,14,18,12], sources: [15,14,18,12], reveals: [13] },
    { requires: [15,14,18,12], sources: [15,14,18,12], reveals: [17] },
    { requires: [15,14,18,12,13], sources: [15,14,18,12,13], reveals: [5] },
    { requires: [15,14,18,12,13,5], sources: [15,14,18,12,13,5], reveals: [6] },
    { requires: [15,14,18,12,13,5,6], sources: [15,14,18,12,13,5,6], reveals: [11] },
    { requires: [15,14,18,12,13,5,6,11], sources: [15,14,18,12,13,5,6,11], reveals: [7] },
    { requires: [15,14,18,12,13,5,6,11,7], sources: [15,14,18,12,13,5,6,11,7], reveals: [4] },
    { requires: [15,14,18,12,13,5,6,11,7,4], sources: [15,14,18,12,13,5,6,11,7,4], reveals: [16] },
    { requires: [15,14,18,12,13,5,6,11,7,4], sources: [15,14,18,12,13,5,6,11,7,4], reveals: [19] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19], sources: [15,14,18,12,13,5,6,11,7,4,19], reveals: [0] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [1] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [2] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [3] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [8] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [9] },
    { requires: [15,14,18,12,13,5,6,11,7,4,19,0], sources: [15,14,18,12,13,5,6,11,7,4,19,0], reveals: [10] }
  ];

  const PROFESSION_EMOJI = {
    doctor: "🩺",
    farmer: "🌾",
    cook: "🍳",
    painter: "🎨",
    guard: "💂",
    mech: "🔧",
    builder: "👷",
    coder: "💻"
  };

  const DAILY_PUZZLES = [
    { name: "Clues by Sam", url: "https://cluesbysam.com/", emoji: "🔍", description: "Social deduction logic puzzle" },
    { name: "Minute Cryptic", url: "https://www.minutecryptic.com/", emoji: "📝", description: "Quick cryptic crossword clue" },
    { name: "Globle", url: "https://globle-game.com/", emoji: "🌎", description: "Guess the country by proximity" },
    { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", emoji: "🟩", description: "The classic word game" },
    { name: "FoodGuessr", url: "https://www.foodguessr.com/", emoji: "🍕", description: "Guess the food origin" },
    { name: "City Angle", url: "https://visitwhale.com/city-angle/", emoji: "🏙️", description: "Guess the city from a street view angle" }
  ];

  const resolveClue = (hintText, characters, speakerIndex) => {
    let resolved = hintText;

    // #NAMES:idx -> possessive name (e.g., "Penny's")
    resolved = resolved.replace(/#NAMES:(\d+)/g, (match, idx) => {
      const char = characters[parseInt(idx, 10)];
      return char ? char.name + "'s" : match;
    });

    // #NAME:idx -> character name
    resolved = resolved.replace(/#NAME:(\d+)/g, (match, idx) => {
      const char = characters[parseInt(idx, 10)];
      return char ? char.name : match;
    });

    // #PROFS:profession -> plural profession word (e.g., "builders")
    resolved = resolved.replace(/#PROFS:([a-zA-Z]+)/g, (match, prof) => {
      return prof + "s";
    });

    // #C:idx -> column label
    resolved = resolved.replace(/#C:(\d+)/g, (match, idx) => {
      const col = (parseInt(idx, 10) % 4) + 1;
      return "column " + col;
    });

    // #BETWEEN:pair(x,y) -> "between NameX and NameY"
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
    IDENTITY_CLUE,
    resolveClue,
    getCharacter,
    getEmoji,
    getTotalCharacters
  };
})();
