const NARSH_CATS = (() => {
  "use strict";

  const CAT_COLORS = {
    beans: "#3D2B1F",
    biscuit: "#D4A843"
  };

  const MOVE_INTERVAL = 3000;
  const SPEED = 1.5;
  const PAWPRINT_INTERVAL = 80;
  const MAX_PAWPRINTS = 40;

  const cats = [];
  const pawprints = [];
  let animationId = null;

  const createCatSvg = (color) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("fill", "none");
    svg.innerHTML =
      '<path d="M8 12 L5 4 L12 9 L20 7 L28 9 L35 4 L32 12 L34 20 L32 28 L28 32 L20 34 L12 32 L8 28 L6 20 Z" fill="' + color + '" stroke="' + color + '" stroke-width="1" stroke-linejoin="round"/>' +
      '<circle cx="14" cy="16" r="2" fill="#FFFDFB"/>' +
      '<circle cx="26" cy="16" r="2" fill="#FFFDFB"/>' +
      '<circle cx="14" cy="16.5" r="1" fill="#2A2A2A"/>' +
      '<circle cx="26" cy="16.5" r="1" fill="#2A2A2A"/>' +
      '<ellipse cx="20" cy="21" rx="2" ry="1.2" fill="#C9928E"/>' +
      '<line x1="6" y1="19" x2="1" y2="17" stroke="' + color + '" stroke-width="0.8"/>' +
      '<line x1="6" y1="21" x2="1" y2="22" stroke="' + color + '" stroke-width="0.8"/>' +
      '<line x1="34" y1="19" x2="39" y2="17" stroke="' + color + '" stroke-width="0.8"/>' +
      '<line x1="34" y1="21" x2="39" y2="22" stroke="' + color + '" stroke-width="0.8"/>' +
      '<path d="M28 32 Q32 38 28 40" stroke="' + color + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
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

  const createCat = (name, color) => {
    const el = document.createElement("div");
    el.className = "cat";
    el.setAttribute("aria-label", name + " the cat");
    el.setAttribute("role", "img");

    const svg = createCatSvg(color);
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
      color: color,
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
          dropPawprint(cat.x + 20, cat.y + 35, cat.angle * (180 / Math.PI), cat.color);
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
    createCat("Beans", CAT_COLORS.beans);
    createCat("Biscuit", CAT_COLORS.biscuit);
    animationId = requestAnimationFrame(loop);
  };

  return { init };
})();
