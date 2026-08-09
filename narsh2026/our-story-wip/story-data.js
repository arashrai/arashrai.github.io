// Narsh 2026 — Our Story WIP Data Module
const NARSH_STORY_WIP_DATA = (() => {
  "use strict";

  const STOPS = [
    {
      id: "arash-ludhiana",
      owner: "arash",
      location: "Ludhiana, Punjab, India",
      coords: [75.8573, 30.9010],
      zoom: 5,
      year: 1997,
      narrative: "Arash was born in Ludhiana, Punjab, and moved away at age 4 to New Zealand.",
      isConvergence: false
    },
    {
      id: "natalie-cayman",
      owner: "natalie",
      location: "Grand Cayman, Cayman Islands",
      coords: [-81.2546, 19.3133],
      zoom: 7,
      year: "1999 – 2016",
      narrative: "Natalie was born in the Cayman Islands. Loved climbing, exploring, and pets.",
      isConvergence: false
    },
    {
      id: "arash-auckland",
      owner: "arash",
      location: "Auckland, New Zealand",
      coords: [174.7633, -36.8485],
      zoom: 5,
      year: 2001,
      narrative: "Arash lived in Auckland from age 4-11 before moving to Canada.",
      isConvergence: false
    },
    {
      id: "arash-abbotsford",
      owner: "arash",
      location: "Abbotsford, BC, Canada",
      coords: [-122.3045, 49.0504],
      zoom: 5,
      year: 2010,
      narrative: "Arash and his family moved to Abbotsford, BC.",
      isConvergence: false
    },
    {
      id: "shad-valley",
      owner: "both",
      location: "University of Saskatchewan, Canada",
      coords: [-106.6330, 52.1332],
      zoom: 6,
      year: 2015,
      narrative: "Where the two met! SHAD summer camp in Saskatchewan.",
      isConvergence: true
    },
    {
      id: "long-distance",
      owner: "both",
      location: "BC & Cayman Islands",
      coords: [-101.7795, 34.1818],
      arashPos: [-122.3045, 49.0504],
      nataliePos: [-81.2546, 19.3133],
      zoom: 3.5,
      year: "2015 – 2016",
      narrative: "After SHAD, Arash headed back to BC and Natalie returned to Cayman for her senior year.",
      isConvergence: false
    },
    {
      id: "waterloo",
      owner: "both",
      location: "Waterloo, Ontario, Canada",
      coords: [-80.5204, 43.4643],
      zoom: 8,
      year: "2016 – 2020",
      narrative: "Reunited at the University of Waterloo! Software Engineering & Computer Science.",
      isConvergence: false
    },
    {
      id: "seattle",
      owner: "both",
      location: "Seattle, Washington",
      coords: [-122.3421, 47.6097],
      zoom: 7,
      year: "2021 – present",
      narrative: "Setting up roots in Seattle!",
      isConvergence: false
    },
    {
      id: "travel-mexico",
      owner: "both",
      location: "Cancún & Tulum, Mexico",
      coords: [-87.0469, 20.6296],
      isHubTrip: true,
      hubCoords: [-122.3421, 47.6097],
      zoom: 6,
      year: 2022,
      narrative: "Vacation trip: Seattle ➔ Mexico ➔ Seattle.",
      isConvergence: false
    },
    {
      id: "travel-jamaica",
      owner: "both",
      location: "Montego Bay, Jamaica",
      coords: [-77.9188, 18.4762],
      isHubTrip: true,
      hubCoords: [-122.3421, 47.6097],
      zoom: 7,
      year: 2023,
      narrative: "Vacation trip: Seattle ➔ Jamaica ➔ Seattle.",
      isConvergence: false
    },
    {
      id: "travel-switzerland",
      owner: "both",
      location: "Zermatt & The Alps, Switzerland",
      coords: [7.7491, 46.0207],
      isHubTrip: true,
      hubCoords: [-122.3421, 47.6097],
      zoom: 6,
      year: 2024,
      narrative: "Vacation trip: Seattle ➔ Switzerland ➔ Seattle.",
      isConvergence: false
    },
    {
      id: "travel-japan",
      owner: "both",
      location: "Tokyo & Kyoto, Japan",
      coords: [139.6917, 35.6895],
      isHubTrip: true,
      hubCoords: [-122.3421, 47.6097],
      zoom: 5,
      year: 2024,
      narrative: "Vacation trip: Seattle ➔ Japan ➔ Seattle.",
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Ucluelet, Vancouver Island, BC",
      coords: [-125.5462, 48.9420],
      zoom: 9,
      year: 2025,
      narrative: "The proposal on Vancouver Island!",
      isConvergence: false
    },
    {
      id: "wedding",
      owner: "both",
      location: "Kelowna, BC, Canada",
      coords: [-119.4960, 49.8880],
      zoom: 9,
      year: 2026,
      narrative: "The wedding in Kelowna!",
      isConvergence: false
    }
  ];

  return { STOPS };
})();
