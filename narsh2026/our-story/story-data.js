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
      narrative: "Arash was born in Punjab. He does not remember what he was like.",
      photos: [
        { src: "/narsh2026/images/story/arash%20Ludhiana/010.jpg", alt: "Arash's family in Ludhiana, Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/020.jpg", alt: "A family photograph from Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/030.jpg", alt: "Baby Arash in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/040.jpg", alt: "Arash's family in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/050.jpg", alt: "Arash's early years in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/060.jpg", alt: "Arash as a baby in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/070.jpg", alt: "Arash with family in Punjab" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/080.jpg", alt: "Arash growing up in Ludhiana" },
        { src: "/narsh2026/images/story/arash%20Ludhiana/090.jpg", alt: "Arash's early childhood in India" }
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
      narrative: "Natalie was born in the Cayman Islands to Canadian parents. No animal was safe from her love. Thankfully she was safe from the hurricanes.",
      photos: [
        { src: "/narsh2026/images/story/natalie%20gc/010.jpg", alt: "Baby Natalie with her mom and sister Nicole, May 1999" },
        { src: "/narsh2026/images/story/natalie%20gc/020.jpg", alt: "Natalie in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/030.jpg", alt: "Natalie's childhood in the Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/040.jpg", alt: "Growing up in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/050.jpg", alt: "Natalie's island childhood" },
        { src: "/narsh2026/images/story/natalie%20gc/060.jpg", alt: "Natalie with pets in Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/070.jpg", alt: "Natalie on the beach in Grand Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/080.jpg", alt: "Natalie's early years in Cayman" },
        { src: "/narsh2026/images/story/natalie%20gc/090.jpg", alt: "Natalie growing up on the island" },
        { src: "/narsh2026/images/story/natalie%20gc/100.jpg", alt: "Natalie in Grand Cayman, Cayman Islands" },
        { src: "/narsh2026/images/story/natalie%20gc/110.jpeg", alt: "Natalie with pet chickens" },
        { src: "/narsh2026/images/story/natalie%20gc/120.jpeg", alt: "Natalie with a green iguana she caught in their pool" }
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
      narrative: "Arash moved to NZ at the age of 4. Lost the accent, kept the passport.",
      photos: [
        { src: "/narsh2026/images/story/arash%20New%20Zealand/010.jpg", alt: "Arash's years in Auckland, New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/020.jpg", alt: "Arash growing up in New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/030.jpg", alt: "Arash's childhood in Auckland" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/040.jpg", alt: "Arash at school in New Zealand" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/050.jpg", alt: "Arash's years living in Auckland" },
        { src: "/narsh2026/images/story/arash%20New%20Zealand/060.jpg", alt: "Arash in New Zealand" }
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
      narrative: "Arash attended high school in Abbotsford, spending most of his free time on the internet.",
      photos: [
        { src: "/narsh2026/images/story/arash%20BC/010.jpg", alt: "Arash in British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/020.jpg", alt: "Arash's high school years in Abbotsford" },
        { src: "/narsh2026/images/story/arash%20BC/030.jpg", alt: "Arash in Abbotsford, British Columbia" },
        { src: "/narsh2026/images/story/arash%20BC/040.jpg", alt: "Arash during high school in BC" }
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
      narrative: "Natalie and Arash were both assigned to the same summer camp at the University of Saskatchewan. Campers introduced them because both of them had been showing off the same party trick: dislocating (and relocating) their shoulders.",
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
      narrative: "After Saskatchewan, Arash returned to BC and Natalie returned to Cayman for her senior year. They spent the year watching movies/shows together while long distance. Arash convinced Natalie that the shareholders needed her more than the animals (she originally wanted to be a vet).",
      photos: [
        { src: "/narsh2026/images/story/misc/arash_natalie_on_the_phone.jpg", alt: "Arash and Natalie video calling while long distance" }
      ],
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
      narrative: "Reunited at the University of Waterloo! They travelled far and wide for internships (sometimes together, sometimes apart) but always found their way back to eachother.",
      photos: [
        { src: "/narsh2026/images/story/waterloo/010.jpg", alt: "Natalie and Arash during their Waterloo years" },
        { src: "/narsh2026/images/story/waterloo/020.jpg", alt: "Natalie and Arash with friends at Waterloo" },
        { src: "/narsh2026/images/story/waterloo/025.jpg", alt: "Cleo listening to some sick beats" },
        { src: "/narsh2026/images/story/waterloo/030.jpg", alt: "Natalie and Arash in Waterloo, 2018" },
        { src: "/narsh2026/images/story/waterloo/040.jpg", alt: "Waterloo student days" },
        { src: "/narsh2026/images/story/waterloo/050.jpg", alt: "Natalie and Arash during university" },
        { src: "/narsh2026/images/story/waterloo/060.jpg", alt: "University of Waterloo campus life" },
        { src: "/narsh2026/images/story/waterloo/070.jpg", alt: "Graduation and Waterloo memories" }
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
      narrative: "After graduating and being split apart by the pandemic they decided they were done with long distance and moved to Seattle to build a life together. They made lots of friends, took lots of trips, and interviewed many cats before finally adopting Presto & Trino.",
      photos: [
        { src: "/narsh2026/images/story/seattle/010.jpeg", alt: "Seattle ferry and ferris wheel" },
        { src: "/narsh2026/images/story/seattle/020.jpeg", alt: "Backpacking at baker lake" },
        { src: "/narsh2026/images/story/seattle/030.jpeg", alt: "Hiking" },
        { src: "/narsh2026/images/story/seattle/040.jpeg", alt: "Skiing and snowboarding" },
        { src: "/narsh2026/images/story/seattle/050.jpeg", alt: "Our first apartment in Seattle" },
        { src: "/narsh2026/images/story/seattle/060.jpeg", alt: "Arash and (most of) his girls" },
        { src: "/narsh2026/images/story/seattle/070.jpeg", alt: "Quesadilla and coke" },
        { src: "/narsh2026/images/story/seattle/080.jpeg", alt: "Skiing and snowboarding some more" },
        { src: "/narsh2026/images/story/seattle/090.jpeg", alt: "Lap cats" },
        { src: "/narsh2026/images/story/seattle/100.jpeg", alt: "We need to take another with Trino in it too" }
      ],
      isConvergence: false
    },
    {
      id: "travel-honolulu",
      owner: "both",
      location: "Oahu, Hawaii",
      coords: [-157.8583, 21.3069],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2021,
      narrative: "Natalie showed Arash that while he could not float, he could, in fact, swim.",
      photos: [
        { src: "/narsh2026/images/story/misc/hawaii.jpg", alt: "Natalie and Arash in Oahu, Hawaii" },
        { src: "/narsh2026/images/story/misc/hawaii2.jpg", alt: "Hawaii getaway" }
      ],
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
      narrative: "They rode a train through the Alps. Arash fell asleep. The Matterhorn hid behind the clouds. They accidentally ordered an extra cheese course.",
      photos: [
        { src: "/narsh2026/images/story/misc/switzerland.jpg", alt: "Natalie and Arash in Switzerland" },
        { src: "/narsh2026/images/story/misc/switzerland2.jpg", alt: "Alpine views in Switzerland" },
        { src: "/narsh2026/images/story/misc/switzerland3.jpg", alt: "Swiss train ride through the Alps" }
      ],
      isConvergence: false
    },
    {
      id: "travel-cayman",
      owner: "both",
      location: "Grand Cayman",
      coords: [-81.2546, 19.3133],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2023,
      narrative: "Arash finally visited Natalie's homeland to see what all the fuss was about. Featuring stingray.",
      photos: [
        { src: "/narsh2026/images/story/misc/cayman.jpg", alt: "Visiting Grand Cayman" }
      ],
      isConvergence: false
    },
    {
      id: "travel-mexico",
      owner: "both",
      location: "Mexico City, Mexico",
      coords: [-99.1332, 19.4326],
      flyVia: SEATTLE_HUB,
      zoom: 6.0,
      year: 2023,
      narrative: "They went to Mexico, made churros together, and got food poisoning from their own churros.",
      photos: [
        { src: "/narsh2026/images/story/misc/mexico.jpg", alt: "Exploring Mexico City" },
        { src: "/narsh2026/images/story/misc/mexico2.jpg", alt: "Natalie and Arash making churros in Mexico" }
      ],
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
      narrative: "They went to Japan and only considered moving there four times.",
      photos: [
        { src: "/narsh2026/images/story/misc/japan.jpg", alt: "Natalie and Arash in Tokyo, Japan" },
        { src: "/narsh2026/images/story/misc/japan2.jpg", alt: "Exploring Japan" }
      ],
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
      narrative: "They failed to reserve tickets for the Louvre. They ate baguettes in the park instead.",
      photos: [
        { src: "/narsh2026/images/story/misc/paris.jpg", alt: "Natalie and Arash in Paris, France" },
        { src: "/narsh2026/images/story/misc/paris2.jpg", alt: "Baguettes in Paris" }
      ],
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
      narrative: "They went to Montreal for their Waterloo roommate's wedding. Very unoriginal of them.",
      photos: [
        { src: "/narsh2026/images/story/misc/montreal.jpeg", alt: "Wedding trip to Montreal" }
      ],
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
      narrative: "They went to see the redwoods. It ruined trees for them. They discovered their love of glamping.",
      photos: [
        { src: "/narsh2026/images/story/misc/crescent_city.jpg", alt: "Redwoods and glamping in Crescent City" }
      ],
      isConvergence: false
    },
    {
      id: "travel-serbia",
      owner: "both",
      location: "Belgrade, Serbia",
      coords: [20.4489, 44.7866],
      flyVia: SEATTLE_HUB,
      zoom: 5.5,
      year: 2025,
      narrative: "They travelled to Serbia for Natalie's sister's wedding. They road tripped across eastern Europe in van filled with of Natalie's relatives. They changed a tire in Bosnia.",
      photos: [
        { src: "/narsh2026/images/story/misc/serbia.jpg", alt: "Wedding trip in Belgrade, Serbia" },
        { src: "/narsh2026/images/story/misc/serbia2.jpg", alt: "Road trip across Eastern Europe" },
        { src: "/narsh2026/images/story/misc/serbia3.jpg", alt: "In Serbia with family" }
      ],
      isConvergence: false
    },
    {
      id: "proposal",
      owner: "both",
      location: "Ucluelet, BC",
      coords: [-125.5462, 48.9420],
      flyVia: SEATTLE_HUB,
      zoom: 7.0,
      year: 2025,
      narrative: "They went on a road trip to Vancouver Island. Each day was a surprise for Natalie. Except for the last because Arash is too easy to read.",
      photos: [
        { src: "/narsh2026/images/story/proposal/010.jpg", alt: "The proposal trip on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/020.jpg", alt: "Natalie and Arash on Vancouver Island" },
        { src: "/narsh2026/images/story/proposal/030.jpg", alt: "Engagement photo on the coast" },
        { src: "/narsh2026/images/story/proposal/040.jpg", alt: "Celebrating the proposal" }
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
      narrative: "They climbed a mountain with Natalie's dad. They didn't shower for a week and still didn't mind sharing a tent. Arash vowed to never climb again. They saw a bunch of cats (big ones).",
      photos: [
        { src: "/narsh2026/images/story/misc/kilimanjaro.jpg", alt: "Mount Kilimanjaro climb with Natalie's dad" },
        { src: "/narsh2026/images/story/misc/kilimanjaro2.jpg", alt: "Summiting Mount Kilimanjaro in Tanzania" }
      ],
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
      narrative: "Another wedding. Real original.",
      photos: [
        { src: "/narsh2026/images/story/misc/jamaica.jpg", alt: "Wedding trip to Montego Bay, Jamaica" }
      ],
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
      narrative: "11 years later, they're finally doing it. Kelowna, BC. See you all there!",
      photos: [],
      isConvergence: false
    }
  ];

  return { STOPS };
})();

// Backward compatibility alias for WIP references
const NARSH_STORY_WIP_DATA = NARSH_STORY_DATA;
