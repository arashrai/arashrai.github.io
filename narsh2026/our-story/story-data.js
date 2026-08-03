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
      narrative: "Arash was born in Ludhiana, Punjab, and moved away at age 4 to New Zealand.",
      photos: [
        // Filenames are numbered so the carousel runs in Natalie's chosen order.
        { src: "/narsh2026/images/story/arash%20Ludhiana/010.jpg", alt: "Arash's family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/020.jpg", alt: "A family photograph from Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/030.jpg", alt: "Baby Arash in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/040.jpg", alt: "Arash's family in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/050.jpg", alt: "Arash's early years in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/060.jpg", alt: "A family photograph from Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/070.jpg", alt: "Arash's family in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/080.jpg", alt: "Family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/090.jpg", alt: "Arash's first years in Punjab" }
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
      narrative: "Natalie was born in the Cayman Islands. She loved playing outside and kept all sorts of pets including iguanas, bunnies, cats, chickens, snakes, and frogs. She loved climbing and exploring. Loved making people laugh and joked around a lot.\nCompleted her highschool and IB diploma at Cayman International School (CIS) in 2016.",
      photos: [
        { src: "/narsh2026/images/story/natalie%20gc/010.jpg", alt: "Baby Natalie with her mom and sister Nicole, May 1999" },
        { src: "/narsh2026/images/story/natalie%20gc/020.jpg", alt: "Natalie in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/030.jpg", alt: "Natalie's childhood in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/040.jpg", alt: "Growing up in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/050.jpg", alt: "Natalie's island childhood" },
        { src: "/narsh2026/images/story/natalie%20gc/060.jpg", alt: "Natalie exploring Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/070.jpg", alt: "Natalie in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/080.jpg", alt: "Natalie's years in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/090.jpg", alt: "Natalie growing up on the island" },
        { src: "/narsh2026/images/story/natalie%20gc/100.jpg", alt: "Natalie as a teenager in Grand Cayman" }
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
      narrative: "Arash lived in Aukland from age 4-11, very formative for him, but unfortunately the accent didn't stick. He and his family briefly lived in Australia before moving to Canada.",
      photos: [
        // Numbered for carousel order, same as the Ludhiana set.
        { src: "/narsh2026/images/story/arash%20New%20Zealand/010.jpg", alt: "Arash's years in Auckland, New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/020.jpg", alt: "Arash growing up in New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/030.jpg", alt: "Arash's childhood in Auckland" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/040.jpg", alt: "A family photograph from New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/050.jpg", alt: "Arash's New Zealand years" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/060.jpg", alt: "Arash in Auckland, New Zealand" }
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
      narrative: "Arash and his family moved from New Zealand/Australia to Abbotsford, BC at age 12. Arash completed his highschool degree before heading across the country to university. But first, a quick summer camp.",
      photos: [
        { src: "/narsh2026/images/story/arash%20BC/010.jpg", alt: "Arash in British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/020.jpg", alt: "Arash's high school years in Abbotsford" },
        { src: "/narsh2026/images/story/arash%20BC/030.jpg", alt: "Arash in Abbotsford, British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/040.jpg", alt: "Arash's years in British Columbia" }
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
      narrative: "Where the two met!\nBoth a little disheartened that they pulled the short straw of campuses (Saskatchewan), but it turned out so much better than anyone hoped.\nArash completed his highschool degree, and was on his way to Waterloo. It was the summer between Natalie's 11th and 12th grades. He opened her eyes to the world of tech and she decided she would follow him to Waterloo after finishing her final year of highschool.",
      photos: [
        { src: "/narsh2026/images/story/shad/010.jpeg", alt: "Natalie and Arash at SHAD in Saskatchewan" }
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
      narrative: "Arash studied Software Engineering, and Natalie studied Computer Science. They got to be together, and support each other.\nThey made some amazing friends for life.\nThey got some amazing opportunities like doing 4-month internships in Toronto, Boston, Vancouver, San Francisco, New York, and Seattle. After a haitus due to the pandemic,they were able to take their next step, and decided they'd come back to Seattle.",
      photos: [
        { src: "/narsh2026/images/story/waterloo/010.jpg", alt: "Natalie and Arash during their Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/020.jpg", alt: "Natalie and Arash with friends at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/030.jpg", alt: "Natalie and Arash in Waterloo, 2018" },
        { src: "/narsh2026/images/story/waterloo/040.jpg", alt: "An aerial view from the Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/050.jpg", alt: "Natalie and Arash during university" },
        { src: "/narsh2026/images/story/waterloo/060.jpg", alt: "Friends made for life at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/070.jpg", alt: "Natalie and Arash in their Waterloo years" }
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
      narrative: "They setup roots in Seattle, and really enjoy the beautiful mountains, water, the climate, and the proximity to Arash's family.",
      photos: [
        { src: "/narsh2026/images/story/seattle/010.jpg", alt: "Natalie and Arash in Seattle, 2020" },
        { src: "/narsh2026/images/story/seattle/020.jpg", alt: "Natalie and Arash in Seattle, 2022" },
        { src: "/narsh2026/images/story/seattle/030.jpg", alt: "A Seattle winter, 2020" },
        { src: "/narsh2026/images/story/seattle/040.jpg", alt: "Seattle in December 2020" },
        { src: "/narsh2026/images/story/seattle/050.jpg", alt: "Summer in the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/060.jpg", alt: "Exploring the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/070.jpg", alt: "Natalie and Arash in Seattle, 2024" },
        { src: "/narsh2026/images/story/seattle/080.jpg", alt: "Natalie and Arash in the Pacific Northwest, 2024" },
        { src: "/narsh2026/images/story/seattle/090.jpg", alt: "Seattle in December 2024" },
        { src: "/narsh2026/images/story/seattle/100.jpg", alt: "Natalie and Arash in Seattle, 2024" },
        { src: "/narsh2026/images/story/seattle/110.jpg", alt: "The holidays in Seattle, 2024" },
        { src: "/narsh2026/images/story/seattle/120.jpg", alt: "Natalie and Arash in Seattle, 2025" },
        { src: "/narsh2026/images/story/seattle/130.jpg", alt: "Natalie and Arash in Seattle, 2025" },
        { src: "/narsh2026/images/story/seattle/140.jpg", alt: "Home in Seattle, 2025" }
      ],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Ucluelet, Vancouver Island, BC, Canada",
      coords: [-125.5462, 48.9420],
      zoom: 9,
      year: 2025,
      narrative: "Arash surprised Natalie with a road trip around Vancouver island featuring geodesic domes, petting farm animals like baby goats, horses passing by right outside our bed, stunning views and meals plus personal spa, and yeah I guess he threw a proposal in too.",
      photos: [
        { src: "/narsh2026/images/story/proposal/010.jpg", alt: "The proposal trip on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/020.jpg", alt: "Natalie and Arash on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/030.jpg", alt: "Newly engaged on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/040.jpg", alt: "Celebrating the engagement" }
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
