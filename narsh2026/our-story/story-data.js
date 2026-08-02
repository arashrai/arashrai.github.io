// Narsh 2026 — Story Data Module
// Chronological life stops for the interactive map timeline.

const NARSH_STORY_DATA = (() => {
  "use strict";

  const STOPS = [
    {
      id: "arash-ludhiana",
      owner: "arash",
      location: "Ludhiana, Punjab, India",
      coords: [75.8573, 30.9010],
      zoom: 5,
      year: 1997,
      narrative: "Where it all begins. Arash was born in Ludhiana, in the heart of Punjab. The first four years of his life were spent here, before the family set off for the far side of the world.",
      photos: [
        { src: "/narsh2026/images/story/arash%20Ludhiana/arash%20baby.jpg", alt: "Baby Arash in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/FB_IMG_1785467190317.jpg", alt: "Arash's family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_024039471.jpg", alt: "A family photograph from Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_024104942.jpg", alt: "Arash's family in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_025040763.jpg", alt: "Arash's early years in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_025658389.jpg", alt: "A family photograph from Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_030047039.jpg", alt: "Arash's family in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_031525991.jpg", alt: "Family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_033020945.jpg", alt: "Arash's first years in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_033116840.jpg", alt: "A family photograph from Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/PXL_20260717_033426092.MP.jpg", alt: "Arash's family in Punjab" }
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
        { src: "/narsh2026/images/story/natalie%20gc/Mom__Nic___Nat___May_1999.JPG", alt: "Baby Natalie with her mom and sister Nicole, May 1999" },
        { src: "/narsh2026/images/story/natalie%20gc/May_2003___Natalie_steering_.JPG", alt: "Natalie steering a boat, May 2003" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20200609-WA0000.jpg", alt: "Natalie's childhood in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20200620-WA0000.jpg", alt: "Growing up in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20200704-WA0001.jpg", alt: "Natalie's island childhood" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20201006-WA0006.jpg", alt: "Natalie exploring Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20210611-WA0002.jpg", alt: "Natalie in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20210611-WA0012.jpg", alt: "Natalie's years in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/IMG-20210611-WA0015.jpg", alt: "Natalie growing up on the island" },
        { src: "/narsh2026/images/story/natalie%20gc/PXL_20260323_232606563.jpg", alt: "Natalie as a teenager in Grand Cayman" }
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
        { src: "/narsh2026/images/story/arash%20New%20Zealand/PXL_20260717_025847714.jpg", alt: "Arash's years in Auckland, New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/PXL_20260717_025915910.jpg", alt: "Arash growing up in New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/PXL_20260717_031953167.jpg", alt: "Arash's childhood in Auckland" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/PXL_20260731_035112051.jpg", alt: "A family photograph from New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/PXL_20260731_035518528.jpg", alt: "Arash's New Zealand years" }
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
        { src: "/narsh2026/images/story/arash%20BC/1.jpg", alt: "Arash in British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/2.jpg", alt: "Arash's high school years in Abbotsford" },
        { src: "/narsh2026/images/story/arash%20BC/3.jpg", alt: "Arash in Abbotsford, British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/4.jpg", alt: "Arash's years in British Columbia" }
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
      // No SHAD photos yet -- CONTENT.md leaves this section's IMG blank.
      // An empty array is safe: carousel.loadPhotos() hides the container.
      photos: [],
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
