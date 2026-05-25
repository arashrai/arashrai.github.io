const NARSH_CATS = (() => {
  "use strict";

  const MOVE_INTERVAL = 3000;
  const SPEED = 1.5;
  const PAWPRINT_INTERVAL = 80;
  const MAX_PAWPRINTS = 40;

  const cats = [];
  const pawprints = [];
  let animationId = null;

  // Presto: tuxedo cat, black with white chest/muzzle, black chin spot,
  // only one eye (right eye visible, left eye missing/closed)
  const createPrestoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("fill", "none");

    // Body — black
    const body = '<path d="M8 12 L5 4 L12 9 L20 7 L28 9 L35 4 L32 12 L34 20 L32 28 L28 32 L20 34 L12 32 L8 28 L6 20 Z" fill="#2A2A2A" stroke="#2A2A2A" stroke-width="1" stroke-linejoin="round"/>';

    // White chest/bib
    const chest = '<ellipse cx="20" cy="28" rx="6" ry="5" fill="#FFFDFB"/>';

    // White muzzle area
    const muzzle = '<ellipse cx="20" cy="20.5" rx="5.5" ry="4" fill="#FFFDFB"/>';

    // Black chin spot (Presto's distinctive mark)
    const chin = '<ellipse cx="20" cy="23.5" rx="2.5" ry="1.8" fill="#2A2A2A"/>';

    // Right eye (visible) — green-gold like in the photo
    const rightEye = '<circle cx="26" cy="16" r="2.2" fill="#FFFDFB"/>' +
      '<circle cx="26" cy="16.3" r="1.3" fill="#8B9A46"/>' +
      '<circle cx="26" cy="16.5" r="0.6" fill="#2A2A2A"/>';

    // Left eye — missing, shown as a gentle closed line
    const leftEye = '<line x1="12" y1="16" x2="16" y2="16" stroke="#1A1A1A" stroke-width="1" stroke-linecap="round"/>';

    // Pink nose
    const nose = '<ellipse cx="20" cy="19" rx="1.5" ry="1" fill="#E8A0A0"/>';

    // Whiskers (dark on white muzzle)
    const whiskers =
      '<line x1="10" y1="19" x2="4" y2="17.5" stroke="#555" stroke-width="0.6"/>' +
      '<line x1="10" y1="20.5" x2="4" y2="21.5" stroke="#555" stroke-width="0.6"/>' +
      '<line x1="30" y1="19" x2="36" y2="17.5" stroke="#555" stroke-width="0.6"/>' +
      '<line x1="30" y1="20.5" x2="36" y2="21.5" stroke="#555" stroke-width="0.6"/>';

    // White paws
    const paws = '<ellipse cx="13" cy="33" rx="2.5" ry="1.5" fill="#FFFDFB"/>' +
      '<ellipse cx="27" cy="33" rx="2.5" ry="1.5" fill="#FFFDFB"/>';

    // Tail
    const tail = '<path d="M28 32 Q33 37 29 40" stroke="#2A2A2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>';

    // Inner ears (pink)
    const ears = '<path d="M7 11 L5.5 5.5 L11 9" fill="#D4A0A0"/>' +
      '<path d="M33 11 L34.5 5.5 L29 9" fill="#D4A0A0"/>';

    svg.innerHTML = body + chest + muzzle + chin + ears + rightEye + leftEye + nose + whiskers + paws + tail;
    return svg;
  };

  // Trino: tortoiseshell cat, face split down the middle —
  // left side orange, right side black, white chest/paw
  const createTrinoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("fill", "none");

    // Clip path for split face
    const defs = '<defs>' +
      '<clipPath id="trino-left"><rect x="0" y="0" width="20" height="40"/></clipPath>' +
      '<clipPath id="trino-right"><rect x="20" y="0" width="20" height="40"/></clipPath>' +
      '</defs>';

    const bodyPath = 'M8 12 L5 4 L12 9 L20 7 L28 9 L35 4 L32 12 L34 20 L32 28 L28 32 L20 34 L12 32 L8 28 L6 20 Z';

    // Left half — orange/ginger
    const leftBody = '<path d="' + bodyPath + '" fill="#CC7A3E" stroke="#CC7A3E" stroke-width="1" stroke-linejoin="round" clip-path="url(#trino-left)"/>';

    // Right half — dark black/brown
    const rightBody = '<path d="' + bodyPath + '" fill="#2A2216" stroke="#2A2216" stroke-width="1" stroke-linejoin="round" clip-path="url(#trino-right)"/>';

    // Subtle tortie patches (dark flecks on the orange side, warm flecks on dark side)
    const patches =
      '<circle cx="10" cy="24" r="2" fill="#5C3A1E" opacity="0.5"/>' +
      '<circle cx="15" cy="14" r="1.5" fill="#5C3A1E" opacity="0.4"/>' +
      '<circle cx="30" cy="24" r="1.8" fill="#8B5E3C" opacity="0.35"/>';

    // White chest/bib
    const chest = '<ellipse cx="20" cy="29" rx="5" ry="4.5" fill="#FFFDFB"/>';

    // Muzzle — pink/white center
    const muzzle = '<ellipse cx="20" cy="20.5" rx="4.5" ry="3.5" fill="#FFFDFB"/>';

    // Both eyes — green like in the photo
    const eyes = '<circle cx="14" cy="16" r="2.2" fill="#FFFDFB"/>' +
      '<circle cx="14" cy="16.3" r="1.3" fill="#7D9A3E"/>' +
      '<circle cx="14" cy="16.5" r="0.6" fill="#2A2A2A"/>' +
      '<circle cx="26" cy="16" r="2.2" fill="#FFFDFB"/>' +
      '<circle cx="26" cy="16.3" r="1.3" fill="#7D9A3E"/>' +
      '<circle cx="26" cy="16.5" r="0.6" fill="#2A2A2A"/>';

    // Pink nose
    const nose = '<ellipse cx="20" cy="19" rx="1.5" ry="1" fill="#E8A0A0"/>';

    // Whiskers
    const whiskers =
      '<line x1="10" y1="19" x2="4" y2="17.5" stroke="#7A5C3A" stroke-width="0.6"/>' +
      '<line x1="10" y1="20.5" x2="4" y2="21.5" stroke="#7A5C3A" stroke-width="0.6"/>' +
      '<line x1="30" y1="19" x2="36" y2="17.5" stroke="#555" stroke-width="0.6"/>' +
      '<line x1="30" y1="20.5" x2="36" y2="21.5" stroke="#555" stroke-width="0.6"/>';

    // White front paw (left) and dark paw (right) — matching the photo
    const paws = '<ellipse cx="13" cy="33" rx="2.5" ry="1.5" fill="#FFFDFB"/>' +
      '<ellipse cx="27" cy="33" rx="2.5" ry="1.5" fill="#2A2216"/>';

    // Tail — dark with orange tip
    const tail = '<path d="M28 32 Q33 37 29 40" stroke="#2A2216" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="29" cy="39.5" r="1.2" fill="#CC7A3E"/>';

    // Inner ears
    const ears = '<path d="M7 11 L5.5 5.5 L11 9" fill="#D4A0A0"/>' +
      '<path d="M33 11 L34.5 5.5 L29 9" fill="#D4A0A0"/>';

    svg.innerHTML = defs + leftBody + rightBody + patches + chest + muzzle + ears + eyes + nose + whiskers + paws + tail;
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
    const margin = 60;
    return {
      x: margin + Math.random() * (window.innerWidth - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2)
    };
  };

  const createCat = (name, svgFactory, pawColor) => {
    const el = document.createElement("div");
    el.className = "cat";
    el.setAttribute("aria-label", name + " the cat");
    el.setAttribute("role", "img");

    const svg = svgFactory();
    el.appendChild(svg);

    const heart = document.createElement("span");
    heart.className = "cat-heart";
    heart.textContent = "❤️";
    el.appendChild(heart);

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
      state: "idle",
      stateTimer: 0,
      pawTimer: 0,
      clickCooldown: 0
    };

    el.addEventListener("mouseenter", () => {
      if (cat.state === "walking") {
        cat.state = "idle";
        cat.stateTimer = 2000;
        el.classList.remove("walking");
        el.classList.add("sleeping");
      }
    });

    el.addEventListener("mouseleave", () => {
      el.classList.remove("sleeping");
    });

    el.addEventListener("click", () => {
      if (cat.clickCooldown > 0) return;
      cat.clickCooldown = 800;
      el.classList.remove("walking", "sleeping");
      el.classList.add("clicked");
      setTimeout(() => {
        el.classList.remove("clicked");
      }, 600);
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

      if (cat.state === "idle" && cat.stateTimer <= 0) {
        const target = pickTarget();
        cat.targetX = target.x;
        cat.targetY = target.y;
        cat.state = "walking";
        cat.stateTimer = MOVE_INTERVAL + Math.random() * 2000;
        cat.el.classList.remove("sleeping");
        cat.el.classList.add("walking");
      }

      if (cat.state === "walking") {
        const dx = cat.targetX - cat.x;
        const dy = cat.targetY - cat.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          cat.state = "idle";
          cat.stateTimer = 1500 + Math.random() * 3000;
          cat.el.classList.remove("walking");
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
          cat.pawTimer = PAWPRINT_INTERVAL + Math.random() * 40;
          dropPawprint(cat.x + 20, cat.y + 35, cat.angle * (180 / Math.PI), cat.pawColor);
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
    createCat("Presto", createPrestoSvg, "#2A2A2A");
    createCat("Trino", createTrinoSvg, "#5C3A1E");
    animationId = requestAnimationFrame(loop);
  };

  return { init };
})();
