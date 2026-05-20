// Narsh 2026 — Story Data Module
// Chronological life stops for the interactive map timeline.

const NARSH_STORY_DATA = (() => {
  "use strict";

  const STOPS = [
    {
      id: "arash-mumbai",
      owner: "arash",
      location: "Mumbai, India",
      coords: [72.8777, 19.0760],
      zoom: 5,
      year: 1997,
      narrative: "Born in the bustling heart of Mumbai, where monsoon rains and cricket matches filled the earliest chapters. The city of dreams gave Arash his first taste of a big, vibrant world.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Arash in Mumbai" }
      ],
      isConvergence: false
    },
    {
      id: "natalie-cayman",
      owner: "natalie",
      location: "Grand Cayman, Cayman Islands",
      coords: [-81.2546, 19.3133],
      zoom: 7,
      year: 1999,
      narrative: "Born on an island where the water is impossibly blue and everyone knows your name. Natalie grew up barefoot on beaches, building sandcastles and chasing iguanas.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Natalie in Grand Cayman" }
      ],
      isConvergence: false
    },
    {
      id: "arash-auckland",
      owner: "arash",
      location: "Auckland, New Zealand",
      coords: [174.7633, -36.8485],
      zoom: 5,
      year: 2001,
      narrative: "A move to the other side of the world. Auckland brought rugby, meat pies, and a Kiwi accent that would confuse people for years to come. The adventure gene was already strong.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Arash in Auckland" }
      ],
      isConvergence: false
    },
    {
      id: "natalie-childhood",
      owner: "natalie",
      location: "Ontario, Canada",
      coords: [-79.3832, 43.6532],
      zoom: 5,
      year: 2005,
      narrative: "Trading tropical heat for Canadian winters. Natalie discovered snow, hockey, and the particular joy of a Tim Hortons hot chocolate on a cold morning.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Natalie in Ontario" }
      ],
      isConvergence: false
    },
    {
      id: "arash-canada",
      owner: "arash",
      location: "Vancouver, Canada",
      coords: [-123.1216, 49.2827],
      zoom: 5,
      year: 2010,
      narrative: "From one coast to another. Vancouver meant mountains, ocean, and a new chapter in yet another country. By now, Arash had lived on three continents before turning thirteen.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Arash in Vancouver" }
      ],
      isConvergence: false
    },
    {
      id: "shad-valley",
      owner: "both",
      location: "SHAD Valley, Canada",
      coords: [-80.5204, 43.4643],
      zoom: 6,
      year: 2016,
      narrative: "Two stories collide at SHAD Valley. A summer program for curious minds brought together a kid from three continents and an island girl turned Canuck. Neither knew it yet, but this was the beginning of everything.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Natalie and Arash at SHAD Valley" }
      ],
      isConvergence: true
    },
    {
      id: "waterloo",
      owner: "both",
      location: "Waterloo, Ontario",
      coords: [-80.5204, 43.4643],
      zoom: 8,
      year: 2017,
      narrative: "University of Waterloo. Co-op terms, late-night study sessions, and the slow realization that the person you keep running into might be the person you were always running toward.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Natalie and Arash at Waterloo" }
      ],
      isConvergence: false
    },
    {
      id: "arash-sf-intern",
      owner: "arash",
      location: "San Francisco, California",
      coords: [-122.4194, 37.7749],
      zoom: 6,
      year: 2018,
      narrative: "Arash's co-op took him to Silicon Valley. Long-distance texts, time zone math, and the discovery that missing someone is its own kind of proof.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Arash in San Francisco" }
      ],
      isConvergence: false
    },
    {
      id: "natalie-nyc-intern",
      owner: "natalie",
      location: "New York City, New York",
      coords: [-74.0060, 40.7128],
      zoom: 6,
      year: 2019,
      narrative: "Natalie's turn to explore. New York City, the subway, and the strange comfort of being anonymous in a crowd of millions. She sent Arash a photo of every good sunset.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Natalie in New York City" }
      ],
      isConvergence: false
    },
    {
      id: "waterloo-return",
      owner: "both",
      location: "Waterloo, Ontario",
      coords: [-80.5204, 43.4643],
      zoom: 8,
      year: 2020,
      narrative: "Back together at Waterloo. A global pandemic meant the world got smaller, but their world got bigger. Quarantine walks, sourdough experiments, and learning to be a team.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-1.svg", alt: "Natalie and Arash back at Waterloo" }
      ],
      isConvergence: false
    },
    {
      id: "seattle",
      owner: "both",
      location: "Seattle, Washington",
      coords: [-122.3321, 47.6062],
      zoom: 7,
      year: 2022,
      narrative: "The Pacific Northwest called. Seattle brought rain, coffee snobbery, two cats named Beans and Biscuit, and the quiet certainty that this was home. Not the city — each other.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Natalie and Arash in Seattle" }
      ],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Seattle, Washington",
      coords: [-122.3321, 47.6062],
      zoom: 9,
      year: 2024,
      narrative: "He asked. She said yes. (She also said \"finally.\") Two lives that started oceans apart, now writing the same story. The next chapter begins in September 2026.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Natalie and Arash's proposal" }
      ],
      isConvergence: false
    }
  ];

  const getArashCoords = () => {
    return STOPS.filter(s => s.owner === "arash" || s.owner === "both")
      .map(s => s.coords);
  };

  const getNatalieCoords = () => {
    return STOPS.filter(s => s.owner === "natalie" || s.owner === "both")
      .map(s => s.coords);
  };

  const getStopById = (id) => {
    return STOPS.find(s => s.id === id) || null;
  };

  return { STOPS, getArashCoords, getNatalieCoords, getStopById };
})();
