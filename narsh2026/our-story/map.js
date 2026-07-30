// Narsh 2026 — Map Module
// Mapbox GL JS initialization, fly-to animations, progressive journey line drawing,
// stop pins, and bow animation for the Our Story page.

const NARSH_MAP = (() => {
  "use strict";

  // Mapbox public access token (pk. prefix) — safe for client-side code.
  // Restricted to arashrai.com in the Mapbox dashboard. Free tier: 50k loads/month.
  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXBkbDdvaGIwY2dhMnNwcHN0MXB2MmhmIn0.jLnDHXAAGi0CZ1XSMVUArQ";

  const FLY_DURATION = 2000;
  const LINE_DRAW_DURATION = 1200;
  const BOW_DURATION = 1500;
  const INTERTWINE_AMPLITUDE = 0.3;

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";

  const WARM_STYLE_OVERRIDES = {
    land: "#F5E6D3",
    water: "#D4BFA8",
    borders: "#E0CDB8",
    labels: "#8B7355"
  };

  let mapInstance = null;
  let reducedMotion = false;
  let lineAnimationId = null;
  const lastCoords = { "line-arash": [], "line-natalie": [] };

  const init = (containerId) => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // WebGL check
    if (!mapboxgl.supported()) {
      const errorEl = document.getElementById("map-error");
      if (errorEl) {
        errorEl.textContent = "Your browser doesn't support interactive maps. Try a different browser for the full experience.";
        errorEl.classList.remove("hidden");
      }
      return Promise.resolve(null);
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapInstance = new mapboxgl.Map({
      container: containerId,
      style: "mapbox://styles/mapbox/light-v11",
      center: [50, 25],
      zoom: 1.8,
      attributionControl: false,
      interactive: false,
      dragPan: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
      keyboard: false,
      pitchWithRotate: false,
      dragRotate: false
    });

    mapInstance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    return new Promise((resolve, reject) => {
      let settled = false;

      const settle = (map) => {
        if (settled) return;
        settled = true;
        try {
          applyWarmStyleOverrides();
        } catch (e) {
          // Style overrides are cosmetic — continue even if they fail
        }
        try {
          setupLayers();
        } catch (e) {
          // Layer setup is required — reject if it fails
          reject(e);
          return;
        }
        resolve(map);
      };

      mapInstance.on("load", () => settle(mapInstance));

      // Timeout fallback: if style loads slowly, proceed after 8 seconds
      setTimeout(() => {
        if (!settled && mapInstance) {
          settle(mapInstance);
        }
      }, 8000);

      mapInstance.on("error", (e) => {
        // Only reject on style errors, not tile errors
        if (e && e.error && e.error.status === 401) {
          if (!settled) {
            settled = true;
            reject(e);
          }
        }
      });
    });
  };

  const applyWarmStyleOverrides = () => {
    if (!mapInstance) return;

    const style = mapInstance.getStyle();
    if (!style || !style.layers) return;

    style.layers.forEach((layer) => {
      // Land / background
      if (layer.id === "land" || layer.id === "landcover") {
        mapInstance.setPaintProperty(layer.id, "fill-color", WARM_STYLE_OVERRIDES.land);
      }

      // Water
      if (layer.id === "water") {
        mapInstance.setPaintProperty(layer.id, "fill-color", WARM_STYLE_OVERRIDES.water);
      }

      // Country boundaries
      if (layer.id.includes("boundary") || layer.id.includes("border")) {
        if (layer.type === "line") {
          mapInstance.setPaintProperty(layer.id, "line-color", WARM_STYLE_OVERRIDES.borders);
        }
      }

      // Country labels — keep but restyle
      if (layer.id.includes("country-label")) {
        mapInstance.setPaintProperty(layer.id, "text-color", WARM_STYLE_OVERRIDES.labels);
      }

      // Hide city/town labels
      if (layer.id.includes("place-") ||
          layer.id.includes("settlement") ||
          layer.id.includes("city") ||
          layer.id.includes("town") ||
          layer.id.includes("village")) {
        mapInstance.setLayoutProperty(layer.id, "visibility", "none");
      }

      // Hide road labels and other clutter
      if (layer.id.includes("road") ||
          layer.id.includes("transit") ||
          layer.id.includes("poi")) {
        mapInstance.setLayoutProperty(layer.id, "visibility", "none");
      }
    });
  };

  const setupLayers = () => {
    // Arash journey line — glow
    mapInstance.addSource("line-arash", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-arash-glow",
      type: "line",
      source: "line-arash",
      paint: {
        "line-color": COLOR_ARASH,
        "line-width": 6,
        "line-opacity": 0.3,
        "line-blur": 3
      }
    });
    mapInstance.addLayer({
      id: "line-arash",
      type: "line",
      source: "line-arash",
      paint: {
        "line-color": COLOR_ARASH,
        "line-width": 3,
        "line-opacity": 1
      },
      layout: {
        "line-cap": "round",
        "line-join": "round"
      }
    });

    // Natalie journey line — glow
    mapInstance.addSource("line-natalie", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-natalie-glow",
      type: "line",
      source: "line-natalie",
      paint: {
        "line-color": COLOR_NATALIE,
        "line-width": 6,
        "line-opacity": 0.3,
        "line-blur": 3
      }
    });
    mapInstance.addLayer({
      id: "line-natalie",
      type: "line",
      source: "line-natalie",
      paint: {
        "line-color": COLOR_NATALIE,
        "line-width": 3,
        "line-opacity": 1
      },
      layout: {
        "line-cap": "round",
        "line-join": "round"
      }
    });

    // Stop pins
    mapInstance.addSource("stops", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });
    mapInstance.addLayer({
      id: "stop-pins",
      type: "circle",
      source: "stops",
      paint: {
        "circle-radius": ["case", ["get", "active"], 6.5, 5],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": COLOR_PIN_STROKE
      }
    });
  };

  const flyToStop = (coords, zoom) => {
    if (!mapInstance) return;
    mapInstance.stop();

    if (reducedMotion) {
      mapInstance.jumpTo({
        center: coords,
        zoom: zoom || 5
      });
    } else {
      mapInstance.flyTo({
        center: coords,
        zoom: zoom || 5,
        duration: FLY_DURATION,
        essential: true
      });
    }
  };

  const updateLines = (stopIndex, stops) => {
    if (!mapInstance) return;

    // Cancel any in-progress line animation
    if (lineAnimationId) {
      cancelAnimationFrame(lineAnimationId);
      lineAnimationId = null;
    }

    // Find the convergence index
    const convergenceIndex = stops.findIndex(s => s.isConvergence);
    const woven = convergenceIndex >= 0 && stopIndex > convergenceIndex;

    // Collect the exact node coordinates for each person's path, and note where
    // the convergence stop sits within each path (weaving begins there).
    const arashNodes = [];
    const natalieNodes = [];
    let convArashIdx = -1;
    let convNatalieIdx = -1;

    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];
      if (stop.owner === "arash" || stop.owner === "both") {
        if (i === convergenceIndex) convArashIdx = arashNodes.length;
        arashNodes.push(stop.coords);
      }
      if (stop.owner === "natalie" || stop.owner === "both") {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        natalieNodes.push(stop.coords);
      }
    }

    // Post-convergence shared segments bow to opposite sides (a weave) but pass
    // exactly through every node, so both lines meet at each shared stop.
    const arashCoords = buildLine(arashNodes, woven ? convArashIdx : -1, 1);
    const natalieCoords = buildLine(natalieNodes, woven ? convNatalieIdx : -1, -1);

    if (reducedMotion) {
      // Instant update
      setLineData("line-arash", arashCoords);
      setLineData("line-natalie", natalieCoords);
    } else {
      // Animate the newly-drawn growth
      animateReveal("line-arash", arashCoords);
      animateReveal("line-natalie", natalieCoords);
    }
  };

  // Densify a node path into a smooth polyline. Every segment is split into
  // SEGMENT_STEPS points so the draw-on animation is smooth. Segments at or
  // after weaveFromIndex bow perpendicular by a sine that is zero at both
  // endpoints, so the line still passes through the actual stop coordinates
  // (the two lines therefore cross exactly at each shared stop).
  const SEGMENT_STEPS = 24;

  const buildLine = (nodes, weaveFromIndex, sign) => {
    if (nodes.length === 0) return [];
    if (nodes.length === 1) return [nodes[0].slice()];

    const out = [nodes[0].slice()];
    for (let j = 0; j < nodes.length - 1; j++) {
      const a = nodes[j];
      const b = nodes[j + 1];
      const weave = weaveFromIndex >= 0 && j >= weaveFromIndex;

      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;

      for (let s = 1; s <= SEGMENT_STEPS; s++) {
        const t = s / SEGMENT_STEPS;
        const bow = weave ? Math.sin(Math.PI * t) * INTERTWINE_AMPLITUDE * sign : 0;
        out.push([a[0] + dx * t + px * bow, a[1] + dy * t + py * bow]);
      }
    }
    return out;
  };

  const animateReveal = (sourceId, coords) => {
    if (coords.length < 2) {
      setLineData(sourceId, coords);
      return;
    }

    const prev = lastCoords[sourceId] || [];
    // Reveal from wherever the line currently ends, so only new growth animates.
    const startCount = (prev.length >= 1 && prev.length < coords.length) ? prev.length : 1;
    if (coords.length <= startCount) {
      setLineData(sourceId, coords);
      return;
    }

    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / LINE_DRAW_DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const count = startCount + Math.floor((coords.length - startCount) * eased);
      setLineData(sourceId, coords.slice(0, Math.max(count, startCount)));

      if (progress < 1) {
        lineAnimationId = requestAnimationFrame(step);
      } else {
        setLineData(sourceId, coords);
      }
    };

    lineAnimationId = requestAnimationFrame(step);
  };

  const setLineData = (sourceId, coords) => {
    const source = mapInstance.getSource(sourceId);
    if (source) {
      lastCoords[sourceId] = coords.slice();
      source.setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords.length > 0 ? coords : []
        }
      });
    }
  };

  const updatePins = (stopIndex, stops) => {
    if (!mapInstance) return;

    const features = [];
    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];
      let color = COLOR_BOTH;
      if (stop.owner === "arash") {
        color = COLOR_ARASH;
      } else if (stop.owner === "natalie") {
        color = COLOR_NATALIE;
      }

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: stop.coords
        },
        properties: {
          color: color,
          active: i === stopIndex
        }
      });
    }

    const source = mapInstance.getSource("stops");
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: features
      });
    }
  };

  const playBowAnimation = (convergenceCoords) => {
    if (!mapInstance || reducedMotion) return;

    const cx = convergenceCoords[0];
    const cy = convergenceCoords[1];
    const loopRadius = 0.8;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / BOW_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 2);

      // Number of points to draw so far
      const pointCount = Math.floor(eased * 40);

      // Generate bow coordinates — two crossing loops
      const arashBow = [];
      const natalieBow = [];

      for (let i = 0; i <= pointCount; i++) {
        const t = (i / 40) * Math.PI * 2;

        // Arash loop: figure-eight pattern (phase 0)
        const ax = cx + Math.sin(t) * loopRadius;
        const ay = cy + Math.sin(t * 2) * loopRadius * 0.5;
        arashBow.push([ax, ay]);

        // Natalie loop: figure-eight pattern (phase offset)
        const nx = cx + Math.sin(t + Math.PI) * loopRadius;
        const ny = cy + Math.sin(t * 2 + Math.PI) * loopRadius * 0.5;
        natalieBow.push([nx, ny]);
      }

      // Get existing line data and append bow coordinates
      const arashSource = mapInstance.getSource("line-arash");
      const natalieSource = mapInstance.getSource("line-natalie");

      if (arashSource && arashBow.length > 1) {
        const existingArash = getExistingCoords("line-arash");
        arashSource.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [...existingArash, ...arashBow]
          }
        });
      }

      if (natalieSource && natalieBow.length > 1) {
        const existingNatalie = getExistingCoords("line-natalie");
        natalieSource.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [...existingNatalie, ...natalieBow]
          }
        });
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Pulse the convergence pin
        pulsePin();
      }
    };

    requestAnimationFrame(step);
  };

  const getExistingCoords = (sourceId) => {
    return lastCoords[sourceId] || [];
  };

  const pulsePin = () => {
    if (!mapInstance) return;
    mapInstance.setPaintProperty("stop-pins", "circle-radius",
      ["case", ["get", "active"], 8, 5]
    );
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.setPaintProperty("stop-pins", "circle-radius",
          ["case", ["get", "active"], 6.5, 5]
        );
      }
    }, 400);
  };

  const getMap = () => mapInstance;

  return { init, flyToStop, updateLines, updatePins, playBowAnimation, getMap };
})();
