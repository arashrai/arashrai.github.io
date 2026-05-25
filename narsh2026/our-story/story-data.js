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
      year: "1999 – 2016",
      narrative: "Born and raised on a small island nation with warm weather and incredible wildlife. Natalie was the kid who kept bunnies, cats, chickens, snakes she caught herself, frogs, and iguanas. She climbed every tree she could find and explored every corner of the island. A natural joker who lived to make people laugh. She completed her high school diploma and IB at Cayman International School in 2016.",
      photos: [
        { src: "/narsh2026/images/story/gc/family-1999.jpg", alt: "Baby Natalie with mom and sister, 1999" },
        { src: "/narsh2026/images/story/gc/grown-up-quote.jpg", alt: "Young Natalie's school quote: When I grow up I want to be a grown-up" },
        { src: "/narsh2026/images/story/gc/boat-2003.jpg", alt: "Natalie steering a boat, 2003" },
        { src: "/narsh2026/images/story/gc/childhood-6.jpg", alt: "Natalie and friend with pet bunny" },
        { src: "/narsh2026/images/story/gc/childhood-5.jpg", alt: "Natalie climbing a dock post by the Caribbean Sea" },
        { src: "/narsh2026/images/story/gc/beach-lobster.jpg", alt: "Natalie and sister on the beach with a lobster" },
        { src: "/narsh2026/images/story/gc/childhood-7.jpg", alt: "Natalie growing up in Grand Cayman" },
        { src: "/narsh2026/images/story/gc/childhood-8.jpg", alt: "Natalie in the Cayman Islands" },
        { src: "/narsh2026/images/story/gc/childhood-9.jpg", alt: "Natalie's island childhood" },
        { src: "/narsh2026/images/story/gc/childhood-10.jpg", alt: "Natalie as a teenager in Grand Cayman" }
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
      id: "arash-vancouver",
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
      year: "2016 – 2020",
      narrative: "Arash convinced Natalie that computer science was a promising career, so she took his word for it and switched from studying veterinary medicine to Computer Science at Waterloo. Best decision ever — he was right, plus they got to be together. They made lifelong friends and landed incredible co-op internships in Toronto, Boston, Vancouver, San Francisco, New York, and Seattle. What a great way to window-shop for their future home.",
      photos: [
        { src: "/narsh2026/images/story/uw/early-days.jpg", alt: "Natalie and Arash in their early university days" },
        { src: "/narsh2026/images/story/uw/friends-selfie.jpg", alt: "Natalie and Arash with friends at Waterloo" },
        { src: "/narsh2026/images/story/uw/friends-outing.jpg", alt: "Natalie and friends on an outing" },
        { src: "/narsh2026/images/story/uw/bridge-foggy.jpg", alt: "Natalie and Arash at a misty bridge during a co-op adventure" },
        { src: "/narsh2026/images/story/uw/haystack-rock.jpg", alt: "Arash at Haystack Rock on the Oregon coast" },
        { src: "/narsh2026/images/story/uw/drone-aerial.jpg", alt: "Aerial view from one of their adventures" }
      ],
      isConvergence: false
    },
    {
      id: "seattle",
      owner: "both",
      location: "Seattle, Washington",
      coords: [-122.3321, 47.6062],
      zoom: 7,
      year: "2021 – present",
      narrative: "The Pacific Northwest called. Seattle brought rain, coffee snobbery, two cats named Presto and Trino, and the quiet certainty that this was home. Not the city — each other.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-2.svg", alt: "Natalie and Arash in Seattle" }
      ],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Tofino, Vancouver Island",
      coords: [-125.9066, 49.1530],
      zoom: 9,
      year: 2025,
      narrative: "He asked. She said yes. Two lives that started oceans apart, now writing the same story. The next chapter begins in September 2026.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "The proposal in Tofino" }
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
