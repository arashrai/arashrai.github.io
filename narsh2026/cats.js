const NARSH_CATS = (() => {
  "use strict";

  const MOVE_INTERVAL = 3000;
  const SPEED = 1.5;
  const PAWPRINT_INTERVAL = 80;
  const MAX_PAWPRINTS = 40;

  const cats = [];
  const pawprints = [];
  let animationId = null;

  // Presto: tuxedo, black chin, one eye (left missing)
  // Pusheen-style: round blob body, tiny ears, dot eyes, w-mouth, stubby paws
  const createPrestoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 50 40");
    svg.setAttribute("fill", "none");
    svg.innerHTML =
      // Ears (dark)
      '<polygon points="12,10 15,3 19,10" fill="#2A2A2A" stroke="#222" stroke-width="0.8" stroke-linejoin="round"/>' +
      '<polygon points="31,10 35,3 38,10" fill="#2A2A2A" stroke="#222" stroke-width="0.8" stroke-linejoin="round"/>' +
      // Inner ears
      '<polygon points="13.5,10 15.5,5 17.5,10" fill="#D4A0A0"/>' +
      '<polygon points="32.5,10 34.5,5 36.5,10" fill="#D4A0A0"/>' +
      // Body — dark tuxedo
      '<ellipse cx="25" cy="24" rx="16" ry="13" fill="#2A2A2A" stroke="#222" stroke-width="1.2"/>' +
      // White chest bib
      '<ellipse cx="25" cy="27" rx="8" ry="8" fill="#FFFDFB"/>' +
      // White muzzle
      '<ellipse cx="25" cy="19" rx="6" ry="4" fill="#FFFDFB"/>' +
      // Black chin spot (Presto's mark)
      '<ellipse cx="25" cy="22" rx="2.5" ry="1.5" fill="#2A2A2A"/>' +
      // Right eye (visible) — simple dot
      '<circle cx="29" cy="16" r="1.3" fill="#222"/>' +
      // Left eye — closed/missing, gentle line
      '<line x1="19" y1="16" x2="22" y2="16" stroke="#222" stroke-width="1.2" stroke-linecap="round"/>' +
      // Nose
      '<ellipse cx="25" cy="18.5" rx="1" ry="0.7" fill="#E8A0A0"/>' +
      // w-mouth
      '<path d="M23 20 Q24 21.5 25 20 Q26 21.5 27 20" stroke="#222" stroke-width="0.8" fill="none" stroke-linecap="round"/>' +
      // Whiskers
      '<line x1="15" y1="18" x2="8" y2="16.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="15" y1="19.5" x2="8" y2="20.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="35" y1="18" x2="42" y2="16.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="35" y1="19.5" x2="42" y2="20.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      // Stubby front paws (white like real Presto)
      '<ellipse cx="17" cy="35" rx="3.5" ry="2" fill="#FFFDFB" stroke="#222" stroke-width="0.8"/>' +
      '<ellipse cx="33" cy="35" rx="3.5" ry="2" fill="#FFFDFB" stroke="#222" stroke-width="0.8"/>' +
      // Tail
      '<path d="M40 26 Q46 22 44 16" stroke="#2A2A2A" stroke-width="3" fill="none" stroke-linecap="round"/>';
    return svg;
  };

  // Trino: tortie, split face (left orange, right black), white chest
  const createTrinoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 50 40");
    svg.setAttribute("fill", "none");
    svg.innerHTML =
      // Ears
      '<polygon points="12,10 15,3 19,10" fill="#CC7A3E" stroke="#222" stroke-width="0.8" stroke-linejoin="round"/>' +
      '<polygon points="31,10 35,3 38,10" fill="#2A2216" stroke="#222" stroke-width="0.8" stroke-linejoin="round"/>' +
      // Inner ears
      '<polygon points="13.5,10 15.5,5 17.5,10" fill="#D4A0A0"/>' +
      '<polygon points="32.5,10 34.5,5 36.5,10" fill="#D4A0A0"/>' +
      // Body — base dark
      '<ellipse cx="25" cy="24" rx="16" ry="13" fill="#2A2216" stroke="#222" stroke-width="1.2"/>' +
      // Orange left half overlay (clip to left side)
      '<defs><clipPath id="trino-l"><rect x="0" y="0" width="25" height="40"/></clipPath></defs>' +
      '<ellipse cx="25" cy="24" rx="16" ry="13" fill="#CC7A3E" clip-path="url(#trino-l)"/>' +
      // Tortie patches
      '<circle cx="15" cy="26" r="2.5" fill="#5C3A1E" opacity="0.4"/>' +
      '<circle cx="33" cy="26" r="2" fill="#8B5E3C" opacity="0.3"/>' +
      // White chest bib
      '<ellipse cx="25" cy="28" rx="7" ry="7" fill="#FFFDFB"/>' +
      // Muzzle
      '<ellipse cx="25" cy="19" rx="6" ry="4" fill="#FFFDFB"/>' +
      // Eyes — simple dots
      '<circle cx="21" cy="16" r="1.3" fill="#222"/>' +
      '<circle cx="29" cy="16" r="1.3" fill="#222"/>' +
      // Nose
      '<ellipse cx="25" cy="18.5" rx="1" ry="0.7" fill="#E8A0A0"/>' +
      // w-mouth
      '<path d="M23 20 Q24 21.5 25 20 Q26 21.5 27 20" stroke="#222" stroke-width="0.8" fill="none" stroke-linecap="round"/>' +
      // Whiskers
      '<line x1="15" y1="18" x2="8" y2="16.5" stroke="#7A5C3A" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="15" y1="19.5" x2="8" y2="20.5" stroke="#7A5C3A" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="35" y1="18" x2="42" y2="16.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      '<line x1="35" y1="19.5" x2="42" y2="20.5" stroke="#555" stroke-width="0.6" stroke-linecap="round"/>' +
      // Stubby paws — white left (like photo), dark right
      '<ellipse cx="17" cy="35" rx="3.5" ry="2" fill="#FFFDFB" stroke="#222" stroke-width="0.8"/>' +
      '<ellipse cx="33" cy="35" rx="3.5" ry="2" fill="#2A2216" stroke="#222" stroke-width="0.8"/>' +
      // Tail — dark with orange tip
      '<path d="M40 26 Q46 22 44 16" stroke="#2A2216" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="44" cy="16.5" r="1.5" fill="#CC7A3E"/>';
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
