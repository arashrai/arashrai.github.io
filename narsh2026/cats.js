const NARSH_CATS = (() => {
  "use strict";

  const MOVE_INTERVAL = 3000;
  const SPEED = 1.5;
  const PAWPRINT_INTERVAL = 80;
  const MAX_PAWPRINTS = 40;

  const cats = [];
  const pawprints = [];
  let animationId = null;

  // Presto: tuxedo cat, side-view walking pose
  // Black body, white chest/muzzle/paws, black chin spot, one eye (left missing)
  const createPrestoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 70 50");
    svg.setAttribute("fill", "none");
    const b = "#2A2A2A";
    svg.innerHTML =
      // Tail (behind everything)
      '<path d="M8 28 C3 24 1 16 5 10" stroke="' + b + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      // Back legs (behind body)
      '<rect x="13" y="38" width="7" height="11" rx="3.5" fill="' + b + '"/>' +
      '<rect x="21" y="38" width="7" height="11" rx="3.5" fill="' + b + '"/>' +
      // Back paws (white)
      '<ellipse cx="16.5" cy="48.5" rx="3.8" ry="2" fill="#FFFDFB"/>' +
      '<ellipse cx="24.5" cy="48.5" rx="3.8" ry="2" fill="#FFFDFB"/>' +
      // Body
      '<ellipse cx="28" cy="30" rx="19" ry="12" fill="' + b + '"/>' +
      // White chest bib
      '<ellipse cx="38" cy="34" rx="8" ry="7" fill="#FFFDFB"/>' +
      // Neck fill (bridges body and head)
      '<ellipse cx="40" cy="24" rx="8" ry="10" fill="' + b + '"/>' +
      // Front legs (in front of body, tucked under chest)
      '<rect x="34" y="38" width="7" height="11" rx="3.5" fill="' + b + '"/>' +
      '<rect x="41" y="38" width="7" height="11" rx="3.5" fill="' + b + '"/>' +
      // Front paws (white)
      '<ellipse cx="37.5" cy="48.5" rx="3.8" ry="2" fill="#FFFDFB"/>' +
      '<ellipse cx="44.5" cy="48.5" rx="3.8" ry="2" fill="#FFFDFB"/>' +
      // Head
      '<circle cx="48" cy="17" r="12" fill="' + b + '"/>' +
      // Ears (connected to head — triangles overlapping the circle)
      '<path d="M40 11 L43 0 L47 9 Z" fill="' + b + '"/>' +
      '<path d="M49 9 L53 0 L56 11 Z" fill="' + b + '"/>' +
      // Inner ears (pink)
      '<path d="M41.5 10.5 L43 2.5 L45.5 9.5 Z" fill="#D4A0A0"/>' +
      '<path d="M50.5 9.5 L53 2.5 L54.5 10.5 Z" fill="#D4A0A0"/>' +
      // White muzzle (centered on face)
      '<ellipse cx="49" cy="20" rx="5" ry="4" fill="#FFFDFB"/>' +
      // Black chin spot (Presto's mark!)
      '<ellipse cx="49" cy="22.5" rx="2.2" ry="1.3" fill="' + b + '"/>' +
      // Right eye (visible — front of face)
      '<circle cx="51" cy="14" r="2" fill="#222"/>' +
      '<circle cx="51.6" cy="13.6" r="0.6" fill="#FFFDFB"/>' +
      // Left eye (missing — gentle closed line, behind)
      '<path d="M42 15 Q44 16.5 46 15" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      // Pink nose
      '<path d="M49 18.5 L48 19.5 L50 19.5 Z" fill="#E8A0A0"/>' +
      // Mouth
      '<path d="M48 20.2 Q49 21.2 50 20.2" stroke="#777" stroke-width="0.6" fill="none" stroke-linecap="round"/>' +
      // Whiskers — right side (forward)
      '<line x1="53" y1="19" x2="64" y2="17" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="53" y1="20.5" x2="64" y2="21" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="53" y1="22" x2="63" y2="24" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      // Whiskers — left side (behind)
      '<line x1="45" y1="19" x2="36" y2="17" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="45" y1="20.5" x2="36" y2="21" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="45" y1="22" x2="37" y2="24" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>';
    return svg;
  };

  // Trino: tortoiseshell, side-view walking pose
  // Split face (orange/black), white chest, mixed paws
  const createTrinoSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 70 50");
    svg.setAttribute("fill", "none");
    const dk = "#2A2216";
    const or = "#CC7A3E";
    svg.innerHTML =
      // Tail (dark with orange tip)
      '<path d="M8 28 C3 24 1 16 5 10" stroke="' + dk + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="5" cy="10.5" r="2" fill="' + or + '"/>' +
      // Back legs
      '<rect x="13" y="38" width="7" height="11" rx="3.5" fill="' + dk + '"/>' +
      '<rect x="21" y="38" width="7" height="11" rx="3.5" fill="' + or + '"/>' +
      // Back paws
      '<ellipse cx="16.5" cy="48.5" rx="3.8" ry="2" fill="' + dk + '"/>' +
      '<ellipse cx="24.5" cy="48.5" rx="3.8" ry="2" fill="' + or + '"/>' +
      // Body — dark base
      '<ellipse cx="28" cy="30" rx="19" ry="12" fill="' + dk + '"/>' +
      // Orange patches on body
      '<ellipse cx="22" cy="28" rx="8" ry="7" fill="' + or + '"/>' +
      '<ellipse cx="34" cy="32" rx="6" ry="5" fill="' + or + '" opacity="0.7"/>' +
      // Tortie flecks
      '<circle cx="18" cy="32" r="3" fill="#5C3A1E" opacity="0.4"/>' +
      '<circle cx="30" cy="27" r="2" fill="#5C3A1E" opacity="0.3"/>' +
      // White chest bib
      '<ellipse cx="38" cy="34" rx="7" ry="6" fill="#FFFDFB"/>' +
      // Neck fill
      '<ellipse cx="40" cy="24" rx="8" ry="10" fill="' + dk + '"/>' +
      // Front legs (tucked under chest)
      '<rect x="34" y="38" width="7" height="11" rx="3.5" fill="' + dk + '"/>' +
      '<rect x="41" y="38" width="7" height="11" rx="3.5" fill="' + dk + '"/>' +
      // Front paws — left white (like photo), right dark
      '<ellipse cx="37.5" cy="48.5" rx="3.8" ry="2" fill="#FFFDFB"/>' +
      '<ellipse cx="44.5" cy="48.5" rx="3.8" ry="2" fill="' + dk + '"/>' +
      // Head — dark base
      '<circle cx="48" cy="17" r="12" fill="' + dk + '"/>' +
      // Orange half of face (left/back half of head when facing right)
      '<defs><clipPath id="trino-face-clip"><circle cx="48" cy="17" r="12"/></clipPath></defs>' +
      '<rect x="36" y="5" width="12" height="24" fill="' + or + '" clip-path="url(#trino-face-clip)"/>' +
      // Ears — left orange, right dark (matching face split)
      '<path d="M40 11 L43 0 L47 9 Z" fill="' + or + '"/>' +
      '<path d="M49 9 L53 0 L56 11 Z" fill="' + dk + '"/>' +
      // Inner ears
      '<path d="M41.5 10.5 L43 2.5 L45.5 9.5 Z" fill="#D4A0A0"/>' +
      '<path d="M50.5 9.5 L53 2.5 L54.5 10.5 Z" fill="#D4A0A0"/>' +
      // White muzzle (centered on face)
      '<ellipse cx="49" cy="20" rx="5" ry="4" fill="#FFFDFB"/>' +
      // Eyes (both visible — front of face)
      '<circle cx="45" cy="14" r="2" fill="#222"/>' +
      '<circle cx="45.6" cy="13.6" r="0.6" fill="#FFFDFB"/>' +
      '<circle cx="51" cy="14" r="2" fill="#222"/>' +
      '<circle cx="51.6" cy="13.6" r="0.6" fill="#FFFDFB"/>' +
      // Pink nose
      '<path d="M49 18.5 L48 19.5 L50 19.5 Z" fill="#E8A0A0"/>' +
      // Mouth
      '<path d="M48 20.2 Q49 21.2 50 20.2" stroke="#777" stroke-width="0.6" fill="none" stroke-linecap="round"/>' +
      // Whiskers — right side (forward)
      '<line x1="53" y1="19" x2="64" y2="17" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="53" y1="20.5" x2="64" y2="21" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="53" y1="22" x2="63" y2="24" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      // Whiskers — left side (behind)
      '<line x1="45" y1="19" x2="36" y2="17" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="45" y1="20.5" x2="36" y2="21" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>' +
      '<line x1="45" y1="22" x2="37" y2="24" stroke="#888" stroke-width="0.5" stroke-linecap="round"/>';
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
          dropPawprint(cat.x + 25, cat.y + 38, cat.angle * (180 / Math.PI), cat.pawColor);
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
