// Narsh 2026 — Puzzle Data Module
// Character definitions, hint sequence, profession emoji map, daily puzzle links,
// and clue template resolver for the Clues-style logic puzzle on the Puzzles page.
// Logic ported from a Clues by Sam puzzle (id 5e87f220d3d9).

const NARSH_PUZZLE_DATA = (() => {
  "use strict";

  // Bumped for the wedding-guest cast reskin. Old saves are keyed to a cast that
  // no longer exists, so discarding any in-progress game is intended here.
  const DATA_VERSION = "5";

  // 4x5 grid layout (column A-D, row 1-5):
  //   A1(0)  B1(1)  C1(2)  D1(3)
  //   A2(4)  B2(5)  C2(6)  D2(7)
  //   A3(8)  B3(9)  C3(10) D3(11)
  //   A4(12) B4(13) C4(14) D4(15)
  //   A5(16) B5(17) C5(18) D5(19)
  //
  // Starter (auto-revealed): Aman (15).
  // paths[] lists the full prerequisite chain that must be revealed before a
  // card becomes deducible (character.paths.some(p => p.every(flipped))).

  const IDENTITY_CLUE = "The criminals stole something from the bride and groom!";

  const CHARACTERS = [
    {
      criminal: true,
      profession: "yapper",
      name: "Gurpreet",
      emoji: "💬",
      hint: "There's an odd number of innocents neighboring #NAME:13",
      paths: [[15,14,18,12,13,5,6,11,7,4,19]]
    },
    {
      criminal: false,
      profession: "yapper",
      name: "William",
      emoji: "💬",
      hint: "Give it back! At least let her throw it first...",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "lion",
      name: "Amritpal",
      emoji: "🦁",
      hint: "Where are the bride and groom? Seems suspicious to me...",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "lion",
      name: "Jatinder",
      emoji: "🦁",
      hint: "Wait... it's not the centrepieces, is it?",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: false,
      profession: "sweetie",
      name: "Shawna",
      emoji: "🍬",
      hint: "There are as many criminal #PROFS:flower girl as there are criminal #PROFS:coder",
      paths: [[15,14,18,12,13,5,6,11,7]]
    },
    {
      criminal: false,
      profession: "maid of honor",
      name: "Nicole",
      emoji: "🧚‍♀️",
      hint: "#NAME:6 is a criminal",
      paths: [[15,14,18,12,13]]
    },
    {
      criminal: true,
      profession: "muscle",
      name: "Sidney",
      emoji: "💪",
      hint: "2 #PROFS:dancer have a criminal directly below them",
      paths: [[15,14,18,12,13,5]]
    },
    {
      criminal: false,
      profession: "dancer",
      name: "Gurnoor",
      emoji: "💃",
      hint: "Only one row has exactly 2 criminals",
      paths: [[15,14,18,12,13,5,6,11]]
    },
    {
      criminal: true,
      profession: "sweetie",
      name: "Amrit",
      emoji: "🍬",
      hint: "I love my little flowers",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "joker",
      name: "Kyle",
      emoji: "🃏",
      hint: "I was thinking about going for the rings, but this place has no service",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "dancer",
      name: "Sabrina",
      emoji: "💃",
      hint: "Sashay away",
      paths: [[15,14,18,12,13,5,6,11,7,4,19,0]]
    },
    {
      criminal: true,
      profession: "dancer",
      name: "Stacey",
      emoji: "💃",
      hint: "There are exactly 2 innocents #BETWEEN:pair(5,7)",
      paths: [[15,14,18,12,13,5,6]]
    },
    {
      criminal: true,
      profession: "sweetie",
      name: "Kiran",
      emoji: "🍬",
      hint: "Row 4 is the only row with exactly one innocent",
      paths: [[15,14,18]]
    },
    {
      criminal: true,
      profession: "flower girl",
      name: "Nemo",
      emoji: "🌸",
      hint: "Both innocents #BETWEEN:pair(1,13) are connected",
      paths: [[15,14,18,12]]
    },
    {
      criminal: true,
      profession: "flower girl",
      name: "Mahi",
      emoji: "🌸",
      hint: "#NAME:18 is one of 2 criminals #BETWEEN:pair(16,19)",
      paths: [[15]]
    },
    {
      criminal: false,
      profession: "muscle",
      name: "Aman",
      emoji: "💪",
      hint: "I'm the only innocent #BETWEEN:pair(14,15)",
      paths: [[]]
    },
    {
      criminal: true,
      profession: "coder",
      name: "Matt",
      emoji: "👨‍💻",
      hint: "It was the flower girls' idea!",
      paths: [[15,14,18,12,13,5,6,11,7,4]]
    },
    {
      criminal: false,
      profession: "coder",
      name: "David",
      emoji: "👨‍💻",
      hint: "I hear the criminals stole something... But what?",
      paths: [[15,14,18,12]]
    },
    {
      criminal: true,
      profession: "coder",
      name: "Spencer",
      emoji: "👨‍💻",
      hint: "Only 1 of the 2 criminals neighboring #NAME:16 is #NAMES:12 neighbor",
      paths: [[15,14]]
    },
    {
      criminal: false,
      profession: "muscle",
      name: "Svetomir",
      emoji: "💪",
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

  // Dead code today: this map is defined and exported (via getEmoji) but never
  // rendered, because both card faces read character.emoji directly. It is kept
  // in sync with the cast anyway so a future consumer does not inherit stale data.
  const PROFESSION_EMOJI = {
    yapper: "💬",
    lion: "🦁",
    sweetie: "🍬",
    "maid of honor": "🧚‍♀️",
    muscle: "💪",
    dancer: "💃",
    joker: "🃏",
    "flower girl": "🌸",
    coder: "👨‍💻"
  };

  const DAILY_PUZZLES = [
    { name: "Clues by Sam", url: "https://cluesbysam.com/", emoji: "🔍" },
    { name: "Minute Cryptic", url: "https://www.minutecryptic.com/", emoji: "📝" },
    { name: "Globle", url: "https://globle-game.com/", emoji: "🌎" },
    { name: "FoodGuessr", url: "https://www.foodguessr.com/", emoji: "🍕" },
    { name: "City Angle", url: "https://visitwhale.com/city-angle/", emoji: "🏙️" }
  ];

  // Grid dimensions (used by the clue resolver's positional phrasing).
  const GRID_WIDTH = 4;
  const GRID_HEIGHT = 5;
  const COLS = ["A", "B", "C", "D", "E", "F", "G"];

  // Matcher for the #PROF(S):label template token. The label alternation is
  // derived from CHARACTERS rather than PROFESSION_EMOJI so the two cannot
  // drift, sorted longest-first so a label that prefixes another cannot shadow
  // it, and regex-escaped. A blind /[a-z]+/ run would stop at the space and
  // render "#PROFS:flower girl" as "flowers girl".
  const PROFESSION_TOKEN = new RegExp(
    "#PROF(S?):(" +
      Array.from(new Set(CHARACTERS.map((c) => c.profession)))
        .sort((a, b) => b.length - a.length)
        .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|") +
      ")",
    "gi"
  );

  const capitalize = (str) =>
    str.length === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1);

  // Faithful port of the Clues by Sam clue resolver, so displayed clues read
  // exactly as they do on the original puzzle. speakerIndex (u) enables the
  // first-person phrasing ("I"/"me"/"my"), and #BETWEEN uses grid positions to
  // produce "to the left/right of", "above/below", "in row/column", or
  // "in between X and Y".
  const resolveClue = (hintText, characters, speakerIndex) => {
    const u = speakerIndex;
    const f = { cards: characters, width: GRID_WIDTH, height: GRID_HEIGHT };
    let s = hintText;

    // #C:n -> column letter (1-based)
    s = s.replace(/#C:([0-9])/gi, (M, x) => COLS[parseInt(x, 10) - 1]);

    // #NAMES:n -> possessive ("my" / "Name'" / "Name's")
    s = s.replace(/#NAMES:([0-9]+)/gi, (M, x) => {
      const v = f.cards[x].name;
      return u == x
        ? "my"
        : (v[v.length - 1] === "s" ? "#NAME:" + x + "'" : "#NAME:" + x + "'s");
    });

    // "#NAME:x and #NAME:y" -> "... and I" when one is the speaker
    s = s.replace(/#NAME:([0-9]+) and #NAME:([0-9]+)/gi, (M, x, v) => {
      const N = parseInt(x, 10), H = parseInt(v, 10);
      if (!isNaN(N) && !isNaN(H) && N == u) return "#NAME:" + v + " and I";
      if (!isNaN(N) && !isNaN(H) && H == u) return "#NAME:" + x + " and I";
      return M;
    });

    // "^#NAME:x is/has" -> "I am"/"I have" when the speaker
    s = s.replace(/^#NAME:([0-9]+) (is|has)/gi, (M, x, v) => {
      const N = parseInt(x, 10);
      if (isNaN(N)) return x;
      if (N == u) return v == "is" ? "I am" : v == "has" ? "I have" : (v ? "I " + v : "I");
      return v ? "#NAME:" + N + " " + v : "#NAME:" + N;
    });

    // (is )?#BETWEEN:pair(x,y) -> positional phrasing
    s = s.replace(/(is )?#BETWEEN:pair\(([0-9]+),([0-9]+)\)/gi, (M, x, v, N) => {
      const H = parseInt(v, 10), G = parseInt(N, 10);
      const Q = H < G ? H : G, I = H < G ? G : H;
      const ce = Q % f.width, le = Math.floor(Q / f.width);
      const de = I % f.width, fe = Math.floor(I / f.width);
      const ve = le == fe;
      const Se = Q - (ve ? 1 : f.width), V = I + (ve ? 1 : f.width);
      if (ve) {
        if (ce == 0 && de == f.width - 1) return (x || "") + "in row " + (le + 1);
        if (ce == 0) return (x ? "is " : "") + "to the left of " + (u == V ? "me" : "#NAME:" + V);
        if (de == f.width - 1) return (x ? "is " : "") + "to the right of " + (u == Se ? "me" : "#NAME:" + Se);
      } else {
        if (le == 0 && fe == f.height - 1) return (x || "") + "in column " + COLS[ce];
        if (le == 0) return (x ? "is " : "") + "above " + (u == V ? "me" : "#NAME:" + V);
        if (fe == f.height - 1) return (x ? "is " : "") + "below " + (u == Se ? "me" : "#NAME:" + Se);
      }
      if (u == Se) return (x ? "is " : "") + "in between #NAME:" + V + " and me";
      if (u == V) return (x ? "is " : "") + "in between #NAME:" + Se + " and me";
      return (x ? "is " : "") + "in between #NAME:" + Se + " and #NAME:" + V;
    });

    // #PROF(S):prof -> profession, pluralized when the S is present. Matching is
    // restricted to the known profession set (see PROFESSION_TOKEN), so
    // multi-word labels survive intact: "flower girl" -> "flower girls". The old
    // "witch" -> "witches" special case is gone -- it is unreachable once only
    // professions that actually exist in CHARACTERS can match.
    s = s.replace(PROFESSION_TOKEN, (M, x, v) => v + (x ? "s" : ""));

    // "neighboring #NAME:x" -> "neighboring me" when the speaker
    s = s.replace(/neighboring #NAME:([0-9]+)/gi, (M, x) =>
      parseInt(x, 10) == u ? "neighboring me" : M);

    // "^#NAME:x" -> "I" when the speaker
    s = s.replace(/^#NAME:([0-9]+)/gi, (M, x) => (parseInt(x, 10) == u ? "I" : M));

    // "#NAME:x" -> "me" when the speaker
    s = s.replace(/#NAME:([0-9]+)/gi, (M, x) => (parseInt(x, 10) == u ? "me" : M));

    // "#NAME:x" -> capitalized name
    s = s.replace(/#NAME:([0-9]+)/gi, (M, x) => {
      const v = parseInt(x, 10);
      if (isNaN(v)) return x;
      return capitalize(f.cards[v].name);
    });

    // Cleanups
    s = s.replace(" exactly 0 ", " no ");
    s = s.substring(0, 1).toUpperCase() + s.substring(1);
    return s;
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
