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
      narrative: "Born in Punjab, moved away at age 4 to New Zealand.",
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
      narrative: "Born and raised in the Cayman Islands (Grand Cayman). It has warm weather and lots of fun animals. Loved playing outside and kept all sorts of pets including iguanas, bunnies, cats, chickens, snakes (that I caught), and frogs. Loved climbing all sorts of things and exploring. Loved making people laugh and joked around a lot.\nCompleted her highschool and IB diploma at Cayman International School (CIS) in 2016.",
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
      narrative: "Lived in Aukland from age 4-11, very formative. Wishes the accent stuck. Briefly lived in Australia before moving to Canada.",
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
      narrative: "Moved from Aukland/Austtralia to BC at age 12. Completed his highschool degree.",
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
      narrative: "Where we met!\nWe were both a little disheartened that we pulled the short straw of SHAD campuses, being in Saskatchewan of all places, but it was the best thing we could have asked for.\nIt was the summer after Arash completed his highschool degree, on his way to Waterloo. It was the summer between Natalie's 11th and 12th grades – the perfect time to completely change her career plans to follow Arash to Waterloo. So worth it!!\nThey were seeing each other long-distance after camp until Natalie completed highschool.",
      photos: [
        { src: "/narsh2026/images/story/shad/WhatsApp%20Image%202026-07-31%20at%2017.44.08.jpeg", alt: "Natalie and Arash at SHAD in Saskatchewan" }
      ],
      isConvergence: true
    },
    {
      id: "waterloo",
      owner: "both",
      location: "Waterloo, Ontario, Canada",
      coords: [-80.5204, 43.4643],
      zoom: 8,
      year: "2016 – 2020",
      narrative: "Arash convinced Natalie that computer science was a promising career so she took his word for it and switched plans from doing something medical eg. veterinary medicine to instead study Computer Science at Waterloo. Best decision ever! He was right, plus they got to be together.\nThey made some amazing friends for life. They got some amazing opportunities like doing 4-month internships in Toronto, Boston, Vancouver, San Francisco, New York, and Seattle. What a great way to window-shop for our future home!",
      photos: [
        { src: "/narsh2026/images/story/waterloo/20180831_194553.jpg", alt: "Natalie and Arash during their Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/20190324_145534.jpg", alt: "Natalie and Arash in Waterloo, Ontario" },
        { src: "/narsh2026/images/story/waterloo/Snapchat-1579637764.jpg", alt: "Natalie and Arash with friends at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/IMG_5605.JPG", alt: "University days in Waterloo" },
        { src: "/narsh2026/images/story/waterloo/DSC_7410.JPG", alt: "Natalie and Arash during university" },
        { src: "/narsh2026/images/story/waterloo/DSC_7470.JPG", alt: "Friends made for life at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/DSC_7651.JPG", alt: "Natalie and Arash in their Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/DJI_0120.JPG", alt: "Aerial view from one of their adventures" },
        { src: "/narsh2026/images/story/waterloo/DJI_0218.JPG", alt: "An aerial shot from the Waterloo years" }
      ],
      isConvergence: false
    },
    {
      id: "seattle",
      owner: "both",
      location: "Seattle, Washington",
      coords: [-122.3421, 47.6097],
      zoom: 7,
      year: "2021 – present",
      narrative: "Our careers took us to the US and we decided to setup some roots in Seattle. We love the beautiful mountains and water, the climate, and the proximity to Canada and Arash's family.",
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
      narrative: "Arash took Natalie on a road trip around Vancouver island featuring geodesic domes, petting farm animals like baby goats, horses running right outside our bed, stunning views and meals plus personal spa, and yeah I guess he threw a proposal in too.",
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
