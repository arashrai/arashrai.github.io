// Narsh 2026 — Guest Data Module
// Placeholder guest list, typed edges, group definitions, households, and family trees
// for the interactive social graph on the Our People page.

const NARSH_GUESTS = (() => {
  "use strict";

  const GROUPS = [
    { id: "arash-family", label: "Arash's Family", color: "#2A9D8F" },
    { id: "natalie-family", label: "Natalie's Family", color: "#D4A843" },
    { id: "college", label: "College Friends", color: "#C9928E" },
    { id: "meta", label: "Meta Coworkers", color: "#C2704F" },
    { id: "seattle-friends", label: "Seattle Friends", color: "#B07D62" }
  ];

  const CITIES = [
    { id: "seattle", label: "Seattle" },
    { id: "waterloo", label: "Waterloo" },
    { id: "mumbai", label: "Mumbai" },
    { id: "grand-cayman", label: "Grand Cayman" },
    { id: "auckland", label: "Auckland" },
    { id: "new-york", label: "New York" },
    { id: "san-francisco", label: "San Francisco" }
  ];

  const GUESTS = [
    // The couple
    {
      id: "natalie",
      name: "Natalie Fleury",
      photo: "/narsh2026/images/people/natalie.jpg",
      groups: ["natalie-family"],
      cities: ["seattle", "grand-cayman", "waterloo"],
      isCouple: true,
      funFact: "Can name every iguana species native to the Cayman Islands.",
      connectionToCouple: null,
      householdId: null,
      familyTree: { family: "natalie", parentId: null, generation: 0 }
    },
    {
      id: "arash",
      name: "Arash Rai",
      photo: "/narsh2026/images/people/arash.jpg",
      groups: ["arash-family"],
      cities: ["seattle", "mumbai", "auckland", "waterloo"],
      isCouple: true,
      funFact: "Has lived on four continents before turning twenty.",
      connectionToCouple: null,
      householdId: null,
      familyTree: { family: "arash", parentId: null, generation: 0 }
    },

    // Natalie's family
    {
      id: "natalie-mom",
      name: "Claire Fleury",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman"],
      isCouple: false,
      funFact: "Makes the best rum cake in the Caribbean.",
      connectionToCouple: "Natalie's mom",
      householdId: null,
      familyTree: { family: "natalie", parentId: null, generation: 1 }
    },
    {
      id: "natalie-dad",
      name: "Marc Fleury",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Natalie's dad",
      householdId: null,
      familyTree: { family: "natalie", parentId: null, generation: 1 }
    },
    {
      id: "natalie-grandma",
      name: "Rose Fleury",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman"],
      isCouple: false,
      funFact: "Taught Natalie to swim before she could walk.",
      connectionToCouple: "Natalie's grandmother",
      householdId: null,
      familyTree: { family: "natalie", parentId: null, generation: 2 }
    },
    {
      id: "natalie-grandpa",
      name: "Henri Fleury",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Natalie's grandfather",
      householdId: null,
      familyTree: { family: "natalie", parentId: null, generation: 2 }
    },
    {
      id: "natalie-brother",
      name: "Luc Fleury",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman", "waterloo"],
      isCouple: false,
      funFact: "Undefeated at family board game night (allegedly).",
      connectionToCouple: "Natalie's brother",
      householdId: null,
      familyTree: { family: "natalie", parentId: "natalie-mom", generation: 0 }
    },
    {
      id: "natalie-aunt",
      name: "Sophie Laurent",
      photo: null,
      groups: ["natalie-family"],
      cities: ["grand-cayman"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Natalie's aunt",
      householdId: null,
      familyTree: { family: "natalie", parentId: "natalie-grandma", generation: 1 }
    },

    // Arash's family
    {
      id: "arash-mom",
      name: "Priya Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai", "auckland"],
      isCouple: false,
      funFact: "Introduced Arash to cricket at age three.",
      connectionToCouple: "Arash's mom",
      householdId: null,
      familyTree: { family: "arash", parentId: null, generation: 1 }
    },
    {
      id: "arash-dad",
      name: "Vikram Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai", "auckland"],
      isCouple: false,
      funFact: "Has a collection of over 200 vinyl records.",
      connectionToCouple: "Arash's dad",
      householdId: null,
      familyTree: { family: "arash", parentId: null, generation: 1 }
    },
    {
      id: "arash-grandma",
      name: "Anita Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Arash's grandmother",
      householdId: null,
      familyTree: { family: "arash", parentId: null, generation: 2 }
    },
    {
      id: "arash-grandpa",
      name: "Rajan Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai"],
      isCouple: false,
      funFact: "Retired professor who still gives impromptu lectures at dinner.",
      connectionToCouple: "Arash's grandfather",
      householdId: null,
      familyTree: { family: "arash", parentId: null, generation: 2 }
    },
    {
      id: "arash-sister",
      name: "Meera Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai", "san-francisco"],
      isCouple: false,
      funFact: "Once ran a half-marathon on a dare with zero training.",
      connectionToCouple: "Arash's sister",
      householdId: null,
      familyTree: { family: "arash", parentId: "arash-mom", generation: 0 }
    },
    {
      id: "arash-uncle",
      name: "Deepak Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Arash's uncle",
      householdId: "household-deepak",
      familyTree: { family: "arash", parentId: "arash-grandma", generation: 1 }
    },
    {
      id: "arash-aunt",
      name: "Sunita Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Arash's aunt (by marriage)",
      householdId: "household-deepak",
      familyTree: { family: "arash", parentId: null, generation: 1 }
    },
    {
      id: "arash-cousin",
      name: "Rohan Rai",
      photo: null,
      groups: ["arash-family"],
      cities: ["mumbai", "new-york"],
      isCouple: false,
      funFact: "Taught Arash how to code in Python when they were twelve.",
      connectionToCouple: "Arash's cousin",
      householdId: null,
      familyTree: { family: "arash", parentId: "arash-uncle", generation: 0 }
    },

    // College friends
    {
      id: "sam",
      name: "Sam Chen",
      photo: null,
      groups: ["college"],
      cities: ["waterloo", "seattle"],
      isCouple: false,
      funFact: "Once ate an entire watermelon at a summer barbecue.",
      connectionToCouple: "Natalie's best friend since frosh week",
      householdId: "household-sam",
      familyTree: null
    },
    {
      id: "jordan",
      name: "Jordan Park",
      photo: null,
      groups: ["college"],
      cities: ["waterloo", "seattle"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Met through Sam at a game night",
      householdId: "household-sam",
      familyTree: null
    },
    {
      id: "priya-c",
      name: "Priya Chakraborty",
      photo: null,
      groups: ["college"],
      cities: ["waterloo", "new-york"],
      isCouple: false,
      funFact: "Has a secret talent for improv comedy.",
      connectionToCouple: "Study group buddy turned lifelong friend",
      householdId: null,
      familyTree: null
    },
    {
      id: "alex",
      name: "Alex Nowak",
      photo: null,
      groups: ["college"],
      cities: ["waterloo", "san-francisco"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Arash's roommate for three years",
      householdId: null,
      familyTree: null
    },

    // Meta coworkers
    {
      id: "maya",
      name: "Maya Johnson",
      photo: null,
      groups: ["meta"],
      cities: ["seattle"],
      isCouple: false,
      funFact: "Collects vintage typewriters.",
      connectionToCouple: "Natalie's skip-level turned close friend",
      householdId: null,
      familyTree: null
    },
    {
      id: "david",
      name: "David Kim",
      photo: null,
      groups: ["meta"],
      cities: ["seattle", "san-francisco"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "On the same ML infrastructure team as Arash",
      householdId: null,
      familyTree: null
    },
    {
      id: "elena",
      name: "Elena Vasquez",
      photo: null,
      groups: ["meta"],
      cities: ["seattle"],
      isCouple: false,
      funFact: "Once debugged a production issue from a kayak.",
      connectionToCouple: "The person who introduced Natalie and Arash to Seattle hiking",
      householdId: "household-elena",
      familyTree: null
    },

    // Seattle friends
    {
      id: "ben",
      name: "Ben Okafor",
      photo: null,
      groups: ["seattle-friends"],
      cities: ["seattle"],
      isCouple: false,
      funFact: "Roasts his own coffee beans every Sunday morning.",
      connectionToCouple: "Neighbor who became family",
      householdId: null,
      familyTree: null
    },
    {
      id: "lily",
      name: "Lily Tanaka",
      photo: null,
      groups: ["seattle-friends"],
      cities: ["seattle"],
      isCouple: false,
      funFact: null,
      connectionToCouple: "Cat-sitter extraordinaire for Beans and Biscuit",
      householdId: "household-elena",
      familyTree: null
    }
  ];

  const EDGES = [
    // Couple bond
    { source: "natalie", target: "arash", type: "couple" },

    // Natalie's family edges
    { source: "natalie", target: "natalie-mom", type: "parent" },
    { source: "natalie", target: "natalie-dad", type: "parent" },
    { source: "natalie", target: "natalie-brother", type: "sibling" },
    { source: "natalie-mom", target: "natalie-grandma", type: "parent" },
    { source: "natalie-mom", target: "natalie-grandpa", type: "parent" },
    { source: "natalie-aunt", target: "natalie-grandma", type: "parent" },

    // Arash's family edges
    { source: "arash", target: "arash-mom", type: "parent" },
    { source: "arash", target: "arash-dad", type: "parent" },
    { source: "arash", target: "arash-sister", type: "sibling" },
    { source: "arash-mom", target: "arash-grandma", type: "parent" },
    { source: "arash-mom", target: "arash-grandpa", type: "parent" },
    { source: "arash-uncle", target: "arash-grandma", type: "parent" },
    { source: "arash-cousin", target: "arash-uncle", type: "parent" },

    // Friend edges
    { source: "natalie", target: "sam", type: "best-friend" },
    { source: "arash", target: "alex", type: "roommate" },
    { source: "sam", target: "jordan", type: "couple" },
    { source: "natalie", target: "priya-c", type: "best-friend" },
    { source: "arash", target: "david", type: "coworker" },
    { source: "natalie", target: "maya", type: "coworker" },

    // Cross-group connections
    { source: "elena", target: "ben", type: "introduced-us" },
    { source: "arash-cousin", target: "priya-c", type: "roommate" }
  ];

  const HOUSEHOLDS = [
    { id: "household-sam", members: ["sam", "jordan"], displayName: "Sam & Jordan" },
    { id: "household-deepak", members: ["arash-uncle", "arash-aunt"], displayName: "Deepak & Sunita" },
    { id: "household-elena", members: ["elena", "lily"], displayName: "Elena & Lily" }
  ];

  const FAMILY_TREES = {
    natalie: {
      id: "natalie-grandma",
      name: "Rose Fleury",
      children: [
        {
          id: "natalie-mom",
          name: "Claire Fleury",
          children: [
            { id: "natalie", name: "Natalie Fleury", children: [] },
            { id: "natalie-brother", name: "Luc Fleury", children: [] }
          ]
        },
        {
          id: "natalie-aunt",
          name: "Sophie Laurent",
          children: []
        }
      ]
    },
    arash: {
      id: "arash-grandma",
      name: "Anita Rai",
      children: [
        {
          id: "arash-mom",
          name: "Priya Rai",
          children: [
            { id: "arash", name: "Arash Rai", children: [] },
            { id: "arash-sister", name: "Meera Rai", children: [] }
          ]
        },
        {
          id: "arash-uncle",
          name: "Deepak Rai",
          children: [
            { id: "arash-cousin", name: "Rohan Rai", children: [] }
          ]
        }
      ]
    }
  };

  const getGuestById = (id) => GUESTS.find(g => g.id === id) || null;

  const getGuestsByGroup = (groupId) => GUESTS.filter(g => g.groups.includes(groupId));

  const getGuestsByCity = (cityId) => GUESTS.filter(g => g.cities.includes(cityId));

  const searchGuests = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return GUESTS.filter(g => g.name.toLowerCase().includes(q));
  };

  const getSocialNodes = () => {
    const householdMap = new Map();
    HOUSEHOLDS.forEach(h => {
      h.members.forEach(memberId => {
        householdMap.set(memberId, h);
      });
    });

    const processed = new Set();
    const socialNodes = [];

    GUESTS.forEach(guest => {
      if (processed.has(guest.id)) return;

      const household = householdMap.get(guest.id);
      if (household) {
        // Combine household members into a single node
        household.members.forEach(m => processed.add(m));
        const members = household.members.map(m => getGuestById(m)).filter(Boolean);
        const allGroups = [...new Set(members.flatMap(m => m.groups))];
        const allCities = [...new Set(members.flatMap(m => m.cities))];
        const photo = members.find(m => m.photo)?.photo || null;
        const isCouple = members.some(m => m.isCouple);

        socialNodes.push({
          id: household.id,
          name: household.displayName,
          photo: photo,
          groups: allGroups,
          cities: allCities,
          isCouple: isCouple,
          memberIds: household.members,
          isHousehold: true
        });
      } else {
        processed.add(guest.id);
        socialNodes.push({
          id: guest.id,
          name: guest.name,
          photo: guest.photo,
          groups: guest.groups,
          cities: guest.cities,
          isCouple: guest.isCouple,
          memberIds: [guest.id],
          isHousehold: false
        });
      }
    });

    return socialNodes;
  };

  const getSocialEdges = (socialNodes) => {
    const nodeIdSet = new Set(socialNodes.map(n => n.id));
    const memberToNodeId = new Map();
    socialNodes.forEach(n => {
      n.memberIds.forEach(m => {
        memberToNodeId.set(m, n.id);
      });
    });

    const edgeSet = new Set();
    const remapped = [];

    EDGES.forEach(edge => {
      const sourceId = memberToNodeId.get(edge.source) || edge.source;
      const targetId = memberToNodeId.get(edge.target) || edge.target;

      // Skip edges where both endpoints are in the same household node
      if (sourceId === targetId) return;

      // Skip edges whose endpoints are not in the node set
      if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;

      // Deduplicate
      const key = [sourceId, targetId].sort().join("--");
      if (edgeSet.has(key)) return;
      edgeSet.add(key);

      remapped.push({ source: sourceId, target: targetId, type: edge.type });
    });

    return remapped;
  };

  return {
    GROUPS,
    CITIES,
    GUESTS,
    EDGES,
    HOUSEHOLDS,
    FAMILY_TREES,
    getGuestById,
    getGuestsByGroup,
    getGuestsByCity,
    searchGuests,
    getSocialNodes,
    getSocialEdges
  };
})();
