const NARSH_CATS = (() => {
  "use strict";

  const MOVE_INTERVAL = 3500;
  const SPEED = 1.4;
  const PAWPRINT_INTERVAL = 90;
  const MAX_PAWPRINTS = 40;

  const cats = [];
  const pawprints = [];
  let animationId = null;

  // Presto: Tuxedo cat, side-view posture
  // Charcoal body (#242424), white bib/muzzle/paws, black chin spot, one eye, terracotta collar with gold bell
  const createPrestoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 70 48");
    svg.setAttribute("fill", "none");
    const b = "#242424";
    const w = "#FFFDFB";

    svg.innerHTML =
      // Soft Ground Shadow
      '<ellipse class="shadow-ellipse" cx="35" cy="46" rx="24" ry="2.8" fill="rgba(61,43,31,0.18)" />' +
      // Tail (behind)
      '<path class="tail-path" d="M10 27 C3 22 1 13 6 7 C7.5 5 9.5 6.5 8 8.5 C4.5 13.5 6.5 21 12 25" fill="' + b + '" stroke="' + b + '" stroke-width="2.5" stroke-linecap="round"/>' +
      // Short Stubby Back legs (attached inside body)
      '<g class="leg leg-back-l"><rect x="13" y="34" width="7" height="10.5" rx="3.5" fill="' + b + '"/><ellipse cx="16.5" cy="44" rx="3.8" ry="2" fill="' + w + '"/></g>' +
      '<g class="leg leg-back-r"><rect x="21" y="34" width="7" height="10.5" rx="3.5" fill="' + b + '"/><ellipse cx="24.5" cy="44" rx="3.8" ry="2" fill="' + w + '"/></g>' +
      // Body
      '<ellipse class="cat-body" cx="28" cy="28" rx="19" ry="12" fill="' + b + '"/>' +
      // Fluffy white chest bib
      '<path class="cat-bib" d="M32 20 C32 20 43 24 42 35 C38 37 30 35 30 28 Z" fill="' + w + '"/>' +
      // Neck transition fill
      '<ellipse cx="40" cy="22" rx="7.5" ry="9.5" fill="' + b + '"/>' +
      // Short Stubby Front legs
      '<g class="leg leg-front-l"><rect x="34" y="34" width="7" height="10.5" rx="3.5" fill="' + b + '"/><ellipse cx="37.5" cy="44" rx="3.8" ry="2" fill="' + w + '"/></g>' +
      '<g class="leg leg-front-r"><rect x="41" y="34" width="7.5" height="10.5" rx="3.5" fill="' + b + '"/><ellipse cx="44.5" cy="44" rx="3.8" ry="2" fill="' + w + '"/></g>' +
      // Terracotta Collar with Gold Bell
      '<path d="M39 24 Q45 26 48 23" stroke="#C2704F" stroke-width="2.3" stroke-linecap="round"/>' +
      '<circle cx="46.5" cy="26.5" r="2.3" fill="#D4A843" stroke="#B38628" stroke-width="0.5"/>' +
      // Head Group
      '<g class="head-group">' +
        '<ellipse cx="48" cy="15" rx="12" ry="10" fill="' + b + '"/>' +
        // Left Ear
        '<g class="ear-l"><path d="M39 9 L42.5 0 L46.5 7 Z" fill="' + b + '"/><path d="M40.5 8 L42.5 1.8 L45 7 Z" fill="#E8A0A0"/></g>' +
        // Right Ear
        '<g class="ear-r"><path d="M49 7 L53 0 L56.5 9 Z" fill="' + b + '"/><path d="M50.5 7.5 L53 1.8 L55 8.5 Z" fill="#E8A0A0"/></g>' +
        // White muzzle
        '<ellipse cx="49" cy="18" rx="5.2" ry="4" fill="' + w + '"/>' +
        // Black chin spot (Presto\'s mark!)
        '<ellipse cx="49" cy="21.2" rx="2.2" ry="1.3" fill="' + b + '"/>' +
        // Right Eye Open (Default)
        '<g class="eye-open eye-right"><circle cx="51.5" cy="12.2" r="2" fill="#1C1C1C"/><circle cx="52.2" cy="11.5" r="0.6" fill="' + w + '"/><circle cx="50.9" cy="12.9" r="0.4" fill="' + w + '"/></g>' +
        // Right Eye Closed (Sleep)
        '<g class="eye-closed eye-right"><path d="M49 12.8 Q51.5 14.3 54 12.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Right Eye Squinch (Groom)
        '<g class="eye-squinch eye-right"><path d="M49 11.8 L51.5 13.8 L54 11.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Left Eye (Missing - gentle closed line, always)
        '<path d="M41.5 12.8 Q44 14.3 46.5 12.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
        // Pink Nose
        '<path d="M49 15.8 L47.5 17.5 L50.5 17.5 Z" fill="#E8A0A0" stroke="#D4868A" stroke-width="0.5" stroke-linejoin="round"/>' +
        // Normal Mouth
        '<path class="mouth-normal" d="M47.5 17.8 Q48.2 19.2 49 17.8 Q49.8 19.2 50.5 17.8" stroke="#444" stroke-width="0.8" stroke-linecap="round" fill="none"/>' +
        // Whiskers
        '<line x1="53" y1="17" x2="64" y2="15" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="53" y1="18.5" x2="64" y2="19" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="53" y1="20" x2="63" y2="22.5" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="17" x2="34" y2="15" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="18.5" x2="34" y2="19" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="20" x2="35" y2="22.5" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
      '</g>';

    return svg;
  };

  // Trino: Tortoiseshell, split-face posture
  // Espresso body (#231B15), orange patches (#D97736), gold flecks (#E09F45), split face, sage collar
  const createTrinoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 70 48");
    svg.setAttribute("fill", "none");
    const dk = "#231B15";
    const or = "#D97736";
    const w = "#FFFDFB";

    svg.innerHTML =
      // Soft Ground Shadow
      '<ellipse class="shadow-ellipse" cx="35" cy="46" rx="24" ry="2.8" fill="rgba(61,43,31,0.18)" />' +
      // Tail (espresso with orange tip)
      '<path class="tail-path" d="M10 27 C3 22 1 13 6 7 C7.5 5 9.5 6.5 8 8.5 C4.5 13.5 6.5 21 12 25" fill="' + dk + '" stroke="' + dk + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="6" cy="7.5" r="2.2" fill="' + or + '"/>' +
      // Short Stubby Back legs
      '<g class="leg leg-back-l"><rect x="13" y="34" width="7" height="10.5" rx="3.5" fill="' + dk + '"/><ellipse cx="16.5" cy="44" rx="3.8" ry="2" fill="' + dk + '"/></g>' +
      '<g class="leg leg-back-r"><rect x="21" y="34" width="7" height="10.5" rx="3.5" fill="' + or + '"/><ellipse cx="24.5" cy="44" rx="3.8" ry="2" fill="' + or + '"/></g>' +
      // Body — espresso base
      '<ellipse class="cat-body" cx="28" cy="28" rx="19" ry="12" fill="' + dk + '"/>' +
      // Tortie patches & flecks
      '<ellipse cx="22" cy="26" rx="8.5" ry="7" fill="' + or + '"/>' +
      '<ellipse cx="34" cy="31" rx="6.5" ry="4.8" fill="' + or + '" opacity="0.8"/>' +
      '<circle cx="18" cy="30" r="3" fill="#E09F45" opacity="0.6"/>' +
      '<circle cx="30" cy="24" r="2.3" fill="#E09F45" opacity="0.5"/>' +
      // Fluffy white chest bib
      '<path class="cat-bib" d="M32 21 C32 21 42 25 41 34 C38 36 31 34 31 28 Z" fill="' + w + '"/>' +
      // Neck fill
      '<ellipse cx="40" cy="22" rx="7.5" ry="9.5" fill="' + dk + '"/>' +
      // Short Stubby Front legs
      '<g class="leg leg-front-l"><rect x="34" y="34" width="7" height="10.5" rx="3.5" fill="' + dk + '"/><ellipse cx="37.5" cy="44" rx="3.8" ry="2" fill="' + w + '"/></g>' +
      '<g class="leg leg-front-r"><rect x="41" y="34" width="7" height="10.5" rx="3.5" fill="' + dk + '"/><ellipse cx="44.5" cy="44" rx="3.8" ry="2" fill="' + dk + '"/></g>' +
      // Dusty Rose / Sage Collar with Silver Tag
      '<path d="M39 24 Q45 26 48 23" stroke="#C9928E" stroke-width="2.3" stroke-linecap="round"/>' +
      '<circle cx="46.5" cy="26.5" r="2.2" fill="#D0D5DD" stroke="#98A2B3" stroke-width="0.5"/>' +
      // Head Group
      '<g class="head-group">' +
        '<ellipse cx="48" cy="15" rx="12" ry="10" fill="' + dk + '"/>' +
        // Split Face Clip (Orange left/back half)
        '<defs><clipPath id="trino-face-clip-v3"><ellipse cx="48" cy="15" rx="12" ry="10"/></clipPath></defs>' +
        '<rect x="35" y="2" width="13" height="26" fill="' + or + '" clip-path="url(#trino-face-clip-v3)"/>' +
        // Left Ear (Orange)
        '<g class="ear-l"><path d="M39 9 L42.5 0 L46.5 7 Z" fill="' + or + '"/><path d="M40.5 8 L42.5 1.8 L45 7 Z" fill="#E8A0A0"/></g>' +
        // Right Ear (Espresso)
        '<g class="ear-r"><path d="M49 7 L53 0 L56.5 9 Z" fill="' + dk + '"/><path d="M50.5 7.5 L53 1.8 L55 8.5 Z" fill="#E8A0A0"/></g>' +
        // White muzzle
        '<ellipse cx="49" cy="18" rx="5.2" ry="4" fill="' + w + '"/>' +
        // Left Eye Open
        '<g class="eye-open eye-left"><circle cx="44.5" cy="12.2" r="2" fill="#1C1C1C"/><circle cx="45.2" cy="11.5" r="0.6" fill="' + w + '"/></g>' +
        // Left Eye Closed
        '<g class="eye-closed eye-left"><path d="M42 12.8 Q44.5 14.3 47 12.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Left Eye Squinch
        '<g class="eye-squinch eye-left"><path d="M42 11.8 L44.5 13.8 L47 11.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Right Eye Open
        '<g class="eye-open eye-right"><circle cx="51.5" cy="12.2" r="2" fill="#1C1C1C"/><circle cx="52.2" cy="11.5" r="0.6" fill="' + w + '"/><circle cx="50.9" cy="12.9" r="0.4" fill="' + w + '"/></g>' +
        // Right Eye Closed
        '<g class="eye-closed eye-right"><path d="M49 12.8 Q51.5 14.3 54 12.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Right Eye Squinch
        '<g class="eye-squinch eye-right"><path d="M49 11.8 L51.5 13.8 L54 11.8" stroke="#1C1C1C" stroke-width="1.2" stroke-linecap="round" fill="none"/></g>' +
        // Black Nose
        '<path d="M49 15.8 L47.5 17.5 L50.5 17.5 Z" fill="#1C1C1C" stroke="#000" stroke-width="0.5" stroke-linejoin="round"/>' +
        // Normal Mouth
        '<path class="mouth-normal" d="M47.5 17.8 Q48.2 19.2 49 17.8 Q49.8 19.2 50.5 17.8" stroke="#444" stroke-width="0.8" stroke-linecap="round" fill="none"/>' +
        // Whiskers
        '<line x1="53" y1="17" x2="64" y2="15" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="53" y1="18.5" x2="64" y2="19" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="53" y1="20" x2="63" y2="22.5" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="17" x2="34" y2="15" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="18.5" x2="34" y2="19" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
        '<line x1="44" y1="20" x2="35" y2="22.5" stroke="#AAA" stroke-width="0.5" stroke-linecap="round"/>' +
      '</g>';

    return svg;
  };

  const createPawSvg = (color) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 12 12");
    svg.innerHTML =
      '<ellipse cx="6" cy="8" rx="2.5" ry="2" fill="' + color + '"/>' +
      '<circle cx="3.5" cy="4.5" r="1.2" fill="' + color + '"/>' +
      '<circle cx="6" cy="3.5" r="1.2" fill="' + color + '"/>' +
      '<circle cx="8.5" cy="4.5" r="1.2" fill="' + color + '"/>';
    return svg;
  };

  const pickTarget = () => {
    const controls = document.getElementById("puzzle-controls");
    if (controls && Math.random() < 0.6) {
      const rect = controls.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const side = Math.random() < 0.5 ? -60 : (rect.width + 10);
      return {
        x: Math.max(10, rect.left + scrollX + side),
        y: rect.top + scrollY - 10 + (Math.random() * 15)
      };
    }
    const margin = 70;
    return {
      x: margin + Math.random() * (window.innerWidth - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2)
    };
  };

  const setCatState = (cat, state, duration) => {
    cat.state = state;
    cat.stateTimer = duration;

    // Reset action classes
    cat.el.classList.remove("walking", "sitting", "sleeping", "grooming");

    if (state !== "idle") {
      cat.el.classList.add(state);
    } else {
      cat.el.classList.add("sitting");
    }
  };

  const createCat = (name, svgFactory, pawColor) => {
    const el = document.createElement("div");
    el.className = "cat walking";
    el.setAttribute("aria-label", name + " the cat");
    el.setAttribute("role", "img");

    const svg = svgFactory();
    el.appendChild(svg);

    // Floating Zzz element for nap time
    const zzz = document.createElement("span");
    zzz.className = "cat-zzz";
    zzz.textContent = "zZz";
    el.appendChild(zzz);

    // Floating Heart element for hover/click
    const heart = document.createElement("span");
    heart.className = "cat-heart";
    heart.textContent = "❤️";
    el.appendChild(heart);

    // Name Label on hover
    const nameLabel = document.createElement("span");
    nameLabel.className = "cat-name";
    nameLabel.textContent = name;
    el.appendChild(nameLabel);

    const startPos = pickTarget();
    el.style.left = startPos.x + "px";
    el.style.top = startPos.y + "px";

    const cat = {
      el: el,
      name: name,
      pawColor: pawColor,
      x: startPos.x,
      y: startPos.y,
      targetX: startPos.x,
      targetY: startPos.y,
      angle: 0,
      state: "walking",
      stateTimer: MOVE_INTERVAL,
      pawTimer: 0,
      pawSide: 1, // Alternates 1 (right paw) and -1 (left paw)
      clickCooldown: 0
    };

    el.addEventListener("mouseenter", () => {
      if (cat.state === "walking") {
        setCatState(cat, "sitting", 3000);
      }
    });

    el.addEventListener("mouseleave", () => {
      if (cat.state === "sitting") {
        cat.stateTimer = 500;
      }
    });

    el.addEventListener("click", () => {
      if (cat.clickCooldown > 0) return;
      cat.clickCooldown = 900;

      // Happy bounce + purr heart animation
      el.classList.remove("walking", "sitting", "sleeping", "grooming");
      el.classList.add("clicked");

      setTimeout(() => {
        el.classList.remove("clicked");
        setCatState(cat, "sitting", 2000);
      }, 700);
    });

    document.body.appendChild(el);
    cats.push(cat);
    return cat;
  };

  const dropPawprint = (x, y, angle, color) => {
    if (pawprints.length >= MAX_PAWPRINTS) {
      const old = pawprints.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }

    const el = document.createElement("div");
    el.className = "pawprint";
    el.style.left = (x - 6) + "px";
    el.style.top = (y - 6) + "px";
    el.style.transform = "rotate(" + (angle + 90) + "deg)";
    el.appendChild(createPawSvg(color));

    document.body.appendChild(el);
    pawprints.push(el);

    setTimeout(() => {
      const idx = pawprints.indexOf(el);
      if (idx > -1) pawprints.splice(idx, 1);
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4000);
  };

  const update = (dt) => {
    cats.forEach((cat) => {
      if (cat.clickCooldown > 0) {
        cat.clickCooldown -= dt;
        return;
      }

      cat.stateTimer -= dt;

      // When an action finishes, decide next behavior
      if (cat.stateTimer <= 0) {
        if (cat.state !== "walking") {
          // Finished resting/action -> start walking to new spot
          const target = pickTarget();
          cat.targetX = target.x;
          cat.targetY = target.y;
          setCatState(cat, "walking", MOVE_INTERVAL + Math.random() * 2500);
        } else {
          // Reached destination or walk timeout -> pick a new action!
          const roll = Math.random();
          if (roll < 0.45) {
            // 45% chance: Sitting & watching (2.5 - 4s)
            setCatState(cat, "sitting", 2500 + Math.random() * 1500);
          } else if (roll < 0.75) {
            // 30% chance: DEEP SLEEP (10-second clean nap with Zzz!)
            setCatState(cat, "sleeping", 10000);
          } else {
            // 25% chance: Grooming / paw licking (3.5 - 5s)
            setCatState(cat, "grooming", 3500 + Math.random() * 1500);
          }
        }
      }

      // Movement logic
      if (cat.state === "walking") {
        const dx = cat.targetX - cat.x;
        const dy = cat.targetY - cat.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 6) {
          // Arrived! Immediately pick next rest state
          cat.stateTimer = 0;
          return;
        }

        cat.angle = Math.atan2(dy, dx);
        const moveX = (dx / dist) * SPEED;
        const moveY = (dy / dist) * SPEED;
        cat.x += moveX;
        cat.y += moveY;

        const scaleX = dx < 0 ? -1 : 1;
        cat.el.style.left = cat.x + "px";
        cat.el.style.top = cat.y + "px";
        cat.el.querySelector("svg").style.transform = "scaleX(" + scaleX + ")";

        cat.pawTimer -= dt;
        if (cat.pawTimer <= 0) {
          cat.pawTimer = PAWPRINT_INTERVAL + Math.random() * 25;
          // Alternate left and right paws
          cat.pawSide = (cat.pawSide === 1) ? -1 : 1;

          // Calculate perpendicular vector for two-track pawprints
          const perpX = -Math.sin(cat.angle);
          const perpY = Math.cos(cat.angle);
          const sideOffset = cat.pawSide * 4;

          const pawX = cat.x + 25 + (perpX * sideOffset);
          const pawY = cat.y + 32 + (perpY * sideOffset);
          const pawAngleDeg = (cat.angle * (180 / Math.PI)) + (cat.pawSide * 8);

          dropPawprint(pawX, pawY, pawAngleDeg, cat.pawColor);
        }
      }
    });
  };

  let lastTime = 0;

  const loop = (time) => {
    const dt = lastTime ? time - lastTime : 16;
    lastTime = time;
    update(dt);
    animationId = requestAnimationFrame(loop);
  };

  const init = () => {
    createCat("Presto", createPrestoSvg, "#242424");
    createCat("Trino", createTrinoSvg, "#5C3A1E");
    animationId = requestAnimationFrame(loop);
  };

  return { init };
})();
