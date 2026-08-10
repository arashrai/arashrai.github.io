// Narsh 2026 — Story Data Module
// Complete Story Arc with Photos: Ludhiana, Grand Cayman, Auckland, Abbotsford, SHAD, Waterloo, Seattle, Honolulu, Zurich, Cayman, Mexico City, Tokyo, Paris, Montreal, Crescent City, Serbia, Proposal, Kilimanjaro, Jamaica, Kelowna Wedding

const NARSH_STORY_DATA = (() => {
  "use strict";

  const SEATTLE_HUB = [-122.3421, 47.6097];

  const STOPS = [
    {
      id: "arash-ludhiana",
      owner: "arash",
      location: "Ludhiana, Punjab, India",
      coords: [75.8573, 30.9010],
      zoom: 4.5,
      year: 1997,
      narrative: "Arash was born in Ludhiana, Punjab, and moved away at age 4 to New Zealand.",
      photos: [
        { src: "/narsh2026/images/story/arash%20Ludhiana/010.jpg", alt: "Arash's family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/020.jpg", alt: "A family photograph from Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/030.jpg", alt: "Baby Arash in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/040.jpg", alt: "Arash's family in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/050.jpg", alt: "Arash's early years in Ludhiana" }
      ],
      isConvergence: false
    },
    {
      id: "natalie-cayman",
      owner: "natalie",
      location: "Grand Cayman, Cayman Islands",
      coords: [-81.2546, 19.3133],
      zoom: 6.0,
      year: "1999 – 2016",
      narrative: "Natalie was born in the Cayman Islands. Loved climbing, exploring, and pets.",
      photos: [
        { src: "/narsh2026/images/story/natalie%20gc/010.jpg", alt: "Baby Natalie with her mom and sister Nicole, May 1999" },
        { src: "/narsh2026/images/story/natalie%20gc/020.jpg", alt: "Natalie in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/030.jpg", alt: "Natalie's childhood in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/040.jpg", alt: "Growing up in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/050.jpg", alt: "Natalie's island childhood" }
      ],
      isConvergence: false
    },
    {
      id: "arash-auckland",
      owner: "arash",
      location: "Auckland, New Zealand",
      coords: [174.7633, -36.8485],
      flyVia: [75.8573, 30.9010],
      zoom: 4.5,
      year: 2001,
      narrative: "Arash lived in Auckland from age 4-11 before moving to Canada.",
      photos: [
        { src: "/narsh2026/images/story/arash%20New%20Zealand/010.jpg", alt: "Arash's years in Auckland, New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/020.jpg", alt: "Arash growing up in New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/030.jpg", alt: "Arash's childhood in Auckland" }
      ],
      isConvergence: false
    },
    {
      id: "arash-abbotsford",
      owner: "arash",
      location: "Abbotsford, BC, Canada",
      coords: [-122.3045, 49.0504],
      flyVia: [174.7633, -36.8485],
      zoom: 5.5,
      year: 2010,
      narrative: "Arash and his family moved to Abbotsford, BC.",
      photos: [
        { src: "/narsh2026/images/story/arash%20BC/010.jpg", alt: "Arash in British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/020.jpg", alt: "Arash's high school years in Abbotsford" },
        { src: "/narsh2026/images/story/arash%20BC/030.jpg", alt: "Arash in Abbotsford, British Columbia" }
      ],
      isConvergence: false
    },
    {
      id: "shad-valley",
      owner: "both",
      location: "University of Saskatchewan, Canada",
      coords: [-106.6330, 52.1332],
      wideCoords: [-101.5, 38.0],
      wideZoom: 2.9,
      zoom: 5.5,
      year: 2015,
      narrative: "Where the two met! Lines travel simultaneously from BC & Cayman to meet in Saskatchewan.",
      photos: [
        { src: "/narsh2026/images/story/shad/010.jpeg", alt: "Natalie and Arash at SHAD in Saskatchewan" }
      ],
      isConvergence: true
    },
    {
      id: "long-distance",
      owner: "both",
      location: "BC & Cayman Islands",
      coords: [-101.7795, 34.1818],
      arashPos: [-122.3045, 49.0504],
      nataliePos: [-81.2546, 19.3133],
      zoom: 3.2,
      year: "2015 – 2016",
      narrative: "After SHAD in Saskatchewan, Arash returned to BC and Natalie returned to Cayman for her senior year. One year of long-distance calls and countdowns!",
      photos: [],
      isConvergence: false
    },
    {
      id: "waterloo",
      owner: "both",
      location: "Waterloo, Ontario, Canada",
      coords: [-80.5204, 43.4643],
      wideCoords: [-98.0, 36.0],
      wideZoom: 3.1,
      zoom: 6.5,
      year: "2016 – 2020",
      narrative: "Reunited at the University of Waterloo! Software Engineering & Computer Science.",
      photos: [
        { src: "/narsh2026/images/story/waterloo/010.jpg", alt: "Natalie and Arash during their Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/020.jpg", alt: "Natalie and Arash with friends at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/030.jpg", alt: "Natalie and Arash in Waterloo, 2018" },
        { src: "/narsh2026/images/story/waterloo/050.jpg", alt: "Natalie and Arash during university" }
      ],
      isConvergence: false
    },
    {
      id: "seattle",
      owner: "both",
      location: "Seattle, Washington",
      coords: SEATTLE_HUB,
      zoom: 6.5,
      year: "2021 – present",
      narrative: "After Waterloo, they set up home base in Seattle, WA! Enjoying the mountains, water, climate, and proximity to family.",
      photos: [
        { src: "/narsh2026/images/story/seattle/010.jpg", alt: "Natalie and Arash in Seattle, 2020" },
        { src: "/narsh2026/images/story/seattle/020.jpg", alt: "Natalie and Arash in Seattle, 2022" },
        { src: "/narsh2026/images/story/seattle/050.jpg", alt: "Summer in the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/070.jpg", alt: "Natalie and Arash in Seattle, 2024" }
      ],
      isConvergence: false
    },
    {
      id: "travel-honolulu",
      owner: "both",
      location: "Honolulu, Hawaii",
      coords: [-157.8583, 21.3069],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2021,
      narrative: "Tropical getaway to Oahu! Sunsets, beach walks, and island adventures.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-zurich",
      owner: "both",
      location: "Zurich, Switzerland",
      coords: [8.5417, 47.3769],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2022,
      narrative: "Alpine trip through Switzerland! Scenic train rides, mountain lakes, and Swiss chocolate.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-cayman",
      owner: "both",
      location: "Grand Cayman, Cayman Islands",
      coords: [-81.2546, 19.3133],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2023,
      narrative: "Visiting home in Grand Cayman! Crystal clear waters, family time, and island warmth.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-mexico-city",
      owner: "both",
      location: "Mexico City, Mexico",
      coords: [-99.1332, 19.4326],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2023,
      narrative: "Vibrant culture, delicious street tacos, historic Zócalo, and exploring ancient pyramids in Mexico City.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-tokyo",
      owner: "both",
      location: "Tokyo, Japan",
      coords: [139.6917, 35.6895],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2024,
      narrative: "Exploring Japan! Bustling streets of Tokyo, delicious ramen, and historic shrines.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-paris",
      owner: "both",
      location: "Paris, France",
      coords: [2.3522, 48.8566],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2024,
      narrative: "The City of Light! Strolling along the Seine, museum visits, and fresh pastries.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-montreal",
      owner: "both",
      location: "Montreal, Quebec, Canada",
      coords: [-73.5674, 45.5017],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2024,
      narrative: "Exploring Montreal! European flair, Old Montreal cobblestone streets, delicious bagels, and vibrant culture.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-crescent-city",
      owner: "both",
      location: "Crescent City, California",
      coords: [-124.2026, 41.7558],
      flyVia: SEATTLE_HUB,
      zoom: 6.5,
      year: 2025,
      narrative: "Coastal road trip along Northern California and the majestic Redwood forests.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-serbia",
      owner: "both",
      location: "Belgrade, Serbia",
      coords: [20.4572, 44.7866],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2025,
      narrative: "Exploring Serbia! Historic fortresses, vibrant cafes along the Danube, and rich culture.",
      photos: [],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Ucluelet, Vancouver Island, BC",
      coords: [-125.5462, 48.9420],
      flyVia: SEATTLE_HUB,
      zoom: 7.0,
      year: 2025,
      narrative: "The Proposal! On the rugged ocean cliffs of Vancouver Island, Arash proposed to Natalie.",
      photos: [
        { src: "/narsh2026/images/story/proposal/010.jpg", alt: "The proposal trip on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/020.jpg", alt: "Natalie and Arash on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/030.jpg", alt: "Newly engaged on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/040.jpg", alt: "Celebrating the engagement" }
      ],
      isConvergence: false
    },
    {
      id: "travel-kilimanjaro",
      owner: "both",
      location: "Mount Kilimanjaro, Tanzania",
      coords: [37.3556, -3.0674],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2025,
      narrative: "Summiting Africa's highest peak! An unforgettable trek up Mount Kilimanjaro in Tanzania.",
      photos: [],
      isConvergence: false
    },
    {
      id: "travel-jamaica",
      owner: "both",
      location: "Montego Bay, Jamaica",
      coords: [-77.9188, 18.4762],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2026,
      narrative: "Caribbean escape to Jamaica! Beachside relaxation, reggae music, and warm island breezes.",
      photos: [],
      isConvergence: false
    },
    {
      id: "wedding",
      owner: "both",
      location: "Kelowna, BC, Canada",
      coords: [-119.4960, 49.8880],
      flyVia: SEATTLE_HUB,
      zoom: 7.0,
      year: 2026,
      narrative: "The Wedding! Celebrating 10 years together surrounded by family and friends in Okanagan wine country.",
      photos: [],
      isConvergence: false
    }
  ];

  return { STOPS };
})();

// Backward compatibility alias for WIP references
const NARSH_STORY_WIP_DATA = NARSH_STORY_DATA;
