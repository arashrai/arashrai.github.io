// Narsh 2026 — Story Data Module
// Chronological life stops for the interactive map timeline.

const NARSH_STORY_DATA = (() => {
  "use strict";

  const STOPS = [
    {
      id: "arash-amritsar",
      owner: "arash",
      location: "Amritsar, Punjab, India",
      coords: [74.8723, 31.6340],
      zoom: 5,
      year: 1997,
      narrative: "Where it all begins. Arash was born in Amritsar, in the heart of Punjab. The first four years of his life were spent here, before the family set off for the far side of the world.",
      photos: [
        { src: "/narsh2026/images/story/arash%20baby.jpg", alt: "Baby Arash in Punjab" }
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
      narrative: "Auckland, from ages four to eleven — the most formative years, and Arash still wishes the Kiwi accent had stuck. A brief chapter in Australia followed before the family pointed the compass toward Canada.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Arash in Auckland" }
      ],
      isConvergence: false
    },
    {
      id: "arash-abbotsford",
      owner: "arash",
      location: "Abbotsford, BC, Canada",
      coords: [-122.3045, 49.0504],
      zoom: 5,
      year: 2010,
      narrative: "At twelve, another new country: Canada. Abbotsford, British Columbia became home, and it's where Arash finished high school — three continents lived on before he'd even graduated.",
      photos: [
        { src: "/narsh2026/images/story/arash%20BC.jpg", alt: "Arash in British Columbia" }
      ],
      isConvergence: false
    },
    {
      id: "shad-valley",
      owner: "both",
      location: "University of Saskatchewan, Canada",
      coords: [-106.6330, 52.1332],
      zoom: 6,
      year: 2016,
      narrative: "Where we met! We were both a little disheartened to have drawn the short straw of SHAD campuses — Saskatchewan, of all places — but it turned out to be the best thing we could have asked for. SHAD is a summer enrichment program for high schoolers, and it landed a boy who'd grown up across three continents in the same place as an island girl: the summer after Arash finished high school on his way to Waterloo, and the summer between Natalie's grades 11 and 12. It was enough to make Natalie rethink her whole plan and follow him to Waterloo. They dated long-distance until she graduated. So worth it.",
      photos: [
        { src: "/narsh2026/images/story/placeholder-3.svg", alt: "Natalie and Arash at SHAD in Saskatchewan" }
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
      location: "Pike Place Market, Seattle, Washington",
      coords: [-122.3421, 47.6097],
      zoom: 7,
      year: "2021 – present",
      narrative: "Their careers took them to the US, and Seattle is where they chose to put down roots — drawn by the mountains and the water, the mild Pacific Northwest climate, and being close to Canada and Arash's family. It came with two cats, Presto and Trino, and the quiet certainty that this was home.",
      photos: [
        { src: "/narsh2026/images/story/seattle/20200620_144808.jpg", alt: "Natalie and Arash in Seattle" },
        { src: "/narsh2026/images/story/seattle/PXL_20220206_210856198.jpg", alt: "Natalie and Arash in Seattle, 2022" },
        { src: "/narsh2026/images/story/seattle/20220721_195734.jpg", alt: "A Seattle summer, 2022" },
        { src: "/narsh2026/images/story/seattle/PXL_20240324_171407406.jpg", alt: "Natalie and Arash in the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/PXL_20240619_072540622.jpg", alt: "Exploring the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/PXL_20240916_003938733.jpg", alt: "Natalie and Arash in Seattle, 2024" },
        { src: "/narsh2026/images/story/seattle/PXL_20241225_000049234.jpg", alt: "The holidays in Seattle, 2024" },
        { src: "/narsh2026/images/story/seattle/PXL_20250330_174700644.jpg", alt: "Natalie and Arash in Seattle, 2025" },
        { src: "/narsh2026/images/story/seattle/PXL_20250914_210423312.jpg", alt: "Home in Seattle, 2025" }
      ],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Ucluelet, Vancouver Island",
      coords: [-125.5462, 48.9420],
      zoom: 9,
      year: 2025,
      narrative: "Arash whisked Natalie on a road trip around Vancouver Island — geodesic domes, a petting farm full of baby goats, horses grazing right outside the window, jaw-dropping views, incredible meals, a private spa... and, oh yeah, a proposal too. She said yes. Two lives that started oceans apart, now writing the same story. The next chapter begins in September 2026.",
      photos: [
        { src: "/narsh2026/images/story/proposal/PXL_20250605_171039942.jpg", alt: "The proposal trip on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/PXL_20250605_171242893.jpg", alt: "Natalie and Arash on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/PXL_20250622_032122687%20(1).jpg", alt: "Celebrating the engagement" },
        { src: "/narsh2026/images/story/proposal/1%20(1).jpg", alt: "Newly engaged on Vancouver Island" }
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
