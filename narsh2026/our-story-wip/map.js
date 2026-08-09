// Narsh 2026 — Our Story WIP Map Module
const NARSH_MAP_WIP = (() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXBkbDdvaGIwY2dhMnNwcHN0MXB2MmhmIn0.jLnDHXAAGi0CZ1XSMVUArQ";

  const FLY_DURATION = 2600;
  const LINE_DRAW_DURATION = 1800;
  const BOW_DURATION = 1400;
  const INTERTWINE_AMPLITUDE = 0.3;

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";

  let mapInstance = null;
  let reducedMotion = false;
  let lineAnimationId = null;
  const lastCoords = { "line-arash": [], "line-natalie": [] };
  let bowCenterArash = null;
  let bowCenterNatalie = null;

  const init = (containerId) => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!mapboxgl.supported()) {
      return Promise.resolve(null);
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapInstance = new mapboxgl.Map({
      container: containerId,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      center: [50, 25],
      zoom: 1.8,
      attributionControl: false,
      interactive: true, // Allow pan/zoom to inspect lines!
      dragPan: true,
      scrollZoom: true
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
        try { applyWarmStyleOverrides(); } catch (e) {}
        try { setupLayers(); } catch (e) { reject(e); return; }
        resolve(map);
      };

      mapInstance.on("load", () => settle(mapInstance));
      setTimeout(() => { if (!settled && mapInstance) settle(mapInstance); }, 8000);
      mapInstance.on("error", (e) => {
        if (e && e.error && e.error.status === 401 && !settled) {
          settled = true;
          reject(e);
        }
      });
    });
  };

  const applyWarmStyleOverrides = () => {
    if (!mapInstance) return;
    try {
      if (mapInstance.setFog) {
        mapInstance.setFog({
          color: "rgb(245, 230, 211)",
          "high-color": "rgb(212, 191, 168)",
          "space-color": "rgb(255, 248, 240)",
          "horizon-blend": 0.08,
          "star-intensity": 0
        });
      }
    } catch (e) {}

    const style = mapInstance.getStyle();
    if (!style || !style.layers) return;

    style.layers.forEach((layer) => {
      if (layer.id === "land" || layer.id === "landcover") {
        mapInstance.setPaintProperty(layer.id, "fill-color", "#F5E6D3");
      }
      if (layer.id === "water") {
        mapInstance.setPaintProperty(layer.id, "fill-color", "#D4BFA8");
      }
      if (layer.id.includes("boundary") || layer.id.includes("border")) {
        if (layer.type === "line") {
          mapInstance.setPaintProperty(layer.id, "line-color", "#E0CDB8");
        }
      }
      if (layer.id.includes("country-label")) {
        mapInstance.setPaintProperty(layer.id, "text-color", "#8B7355");
      }
    });
  };

  const setupLayers = () => {
    // Arash line
    mapInstance.addSource("line-arash", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-arash-glow",
      type: "line",
      source: "line-arash",
      paint: { "line-color": COLOR_ARASH, "line-width": 6, "line-opacity": 0.35, "line-blur": 3 }
    });
    mapInstance.addLayer({
      id: "line-arash",
      type: "line",
      source: "line-arash",
      paint: { "line-color": COLOR_ARASH, "line-width": 3.5, "line-opacity": 1 },
      layout: { "line-cap": "round", "line-join": "round" }
    });

    // Natalie line
    mapInstance.addSource("line-natalie", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
    });
    mapInstance.addLayer({
      id: "line-natalie-glow",
      type: "line",
      source: "line-natalie",
      paint: { "line-color": COLOR_NATALIE, "line-width": 6, "line-opacity": 0.35, "line-blur": 3 }
    });
    mapInstance.addLayer({
      id: "line-natalie",
      type: "line",
      source: "line-natalie",
      paint: { "line-color": COLOR_NATALIE, "line-width": 3.5, "line-opacity": 1 },
      layout: { "line-cap": "round", "line-join": "round" }
    });

    // Pins
    mapInstance.addSource("stops", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });
    mapInstance.addLayer({
      id: "stop-pins",
      type: "circle",
      source: "stops",
      paint: {
        "circle-radius": ["case", ["get", "active"], 7, 5],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": COLOR_PIN_STROKE
      }
    });
  };

  const flyToStop = (coords, zoom, flyVia) => {
    if (!mapInstance) return;
    mapInstance.stop();

    const isMobile = window.innerWidth < 768;
    const padding = isMobile
      ? { top: 70, bottom: 180, left: 16, right: 16 }
      : { top: 80, bottom: 80, left: 40, right: 420 };

    if (flyVia && !reducedMotion) {
      mapInstance.flyTo({
        center: flyVia,
        zoom: Math.min(zoom || 4.5, 3.5),
        duration: 1300,
        padding: padding,
        essential: true
      });
      mapInstance.once("moveend", () => {
        if (mapInstance) {
          mapInstance.flyTo({
            center: coords,
            zoom: zoom || 4.5,
            duration: 2200,
            padding: padding,
            essential: true
          });
        }
      });
    } else if (reducedMotion) {
      mapInstance.jumpTo({ center: coords, zoom: zoom || 4.5, padding: padding });
    } else {
      mapInstance.flyTo({
        center: coords,
        zoom: zoom || 4.5,
        duration: FLY_DURATION,
        padding: padding,
        essential: true
      });
    }
  };

  const updateLines = (stopIndex, stops) => {
    if (!mapInstance) return;

    if (lineAnimationId) {
      cancelAnimationFrame(lineAnimationId);
      lineAnimationId = null;
    }

    const convergenceIndex = stops.findIndex(s => s.isConvergence);
    const woven = convergenceIndex >= 0 && stopIndex > convergenceIndex;

    const arashNodes = [];
    const natalieNodes = [];
    let convArashIdx = -1;
    let convNatalieIdx = -1;

    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];

      if (stop.arashPos) {
        if (i === convergenceIndex) convArashIdx = arashNodes.length;
        arashNodes.push(stop.arashPos);
      } else if (stop.owner === "arash" || stop.owner === "both") {
        if (i === convergenceIndex) convArashIdx = arashNodes.length;
        arashNodes.push(stop.coords);
        if (stop.isHubTrip && stop.hubCoords) {
          arashNodes.push(stop.hubCoords);
        }
      }

      if (stop.nataliePos) {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        natalieNodes.push(stop.nataliePos);
      } else if (stop.owner === "natalie" || stop.owner === "both") {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        natalieNodes.push(stop.coords);
        if (stop.isHubTrip && stop.hubCoords) {
          natalieNodes.push(stop.hubCoords);
        }
      }
    }

    const arashUnwrapped = unwrapLongitudes(arashNodes);
    const natalieUnwrapped = unwrapLongitudes(natalieNodes);

    if (convArashIdx >= 0) bowCenterArash = arashUnwrapped[convArashIdx];
    if (convNatalieIdx >= 0) bowCenterNatalie = natalieUnwrapped[convNatalieIdx];

    const arashCoords = buildLine(arashUnwrapped, woven ? convArashIdx : -1, 1);
    const natalieCoords = buildLine(natalieUnwrapped, woven ? convNatalieIdx : -1, -1);

    if (reducedMotion) {
      setLineData("line-arash", arashCoords);
      setLineData("line-natalie", natalieCoords);
    } else {
      animateReveal("line-arash", arashCoords);
      animateReveal("line-natalie", natalieCoords);
    }
  };

  const SEGMENT_STEPS = 24;

  const unwrapLongitudes = (nodes) => {
    if (nodes.length === 0) return [];
    const out = [nodes[0].slice()];
    for (let i = 1; i < nodes.length; i++) {
      let lng = nodes[i][0];
      const prevLng = out[i - 1][0];
      while (lng - prevLng > 180) lng -= 360;
      while (lng - prevLng < -180) lng += 360;
      out.push([lng, nodes[i][1]]);
    }
    return out;
  };

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
    const startCount = (prev.length >= 1 && prev.length < coords.length) ? prev.length : 1;
    if (coords.length <= startCount) {
      setLineData(sourceId, coords);
      return;
    }

    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / LINE_DRAW_DURATION, 1);
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
        geometry: { type: "LineString", coordinates: coords.length > 0 ? coords : [] }
      });
    }
  };

  const updatePins = (stopIndex, stops) => {
    if (!mapInstance) return;

    const features = [];
    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];

      if (stop.arashPos && stop.nataliePos) {
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: stop.arashPos },
          properties: { color: COLOR_ARASH, active: i === stopIndex }
        });
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: stop.nataliePos },
          properties: { color: COLOR_NATALIE, active: i === stopIndex }
        });
      } else {
        let color = COLOR_BOTH;
        if (stop.owner === "arash") {
          color = COLOR_ARASH;
        } else if (stop.owner === "natalie") {
          color = COLOR_NATALIE;
        }
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: stop.coords },
          properties: { color: color, active: i === stopIndex }
        });
      }
    }

    const source = mapInstance.getSource("stops");
    if (source) {
      source.setData({ type: "FeatureCollection", features: features });
    }
  };

  const playBowAnimation = (convergenceCoords) => {
    if (!mapInstance || reducedMotion) return;
    const arashC = bowCenterArash || convergenceCoords;
    const natalieC = bowCenterNatalie || convergenceCoords;
    const cy = convergenceCoords[1];
    const loopRadius = 0.8;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / BOW_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const pointCount = Math.floor(eased * 40);

      const arashBow = [];
      const natalieBow = [];

      for (let i = 0; i <= pointCount; i++) {
        const t = (i / 40) * Math.PI * 2;
        const ax = arashC[0] + Math.sin(t) * loopRadius;
        const ay = cy + Math.sin(t * 2) * loopRadius * 0.5;
        arashBow.push([ax, ay]);

        const nx = natalieC[0] + Math.sin(t + Math.PI) * loopRadius;
        const ny = cy + Math.sin(t * 2 + Math.PI) * loopRadius * 0.5;
        natalieBow.push([nx, ny]);
      }

      const arashSource = mapInstance.getSource("line-arash");
      const natalieSource = mapInstance.getSource("line-natalie");

      if (arashSource && arashBow.length > 1) {
        const existingArash = lastCoords["line-arash"] || [];
        arashSource.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [...existingArash, ...arashBow] }
        });
      }
      if (natalieSource && natalieBow.length > 1) {
        const existingNatalie = lastCoords["line-natalie"] || [];
        natalieSource.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [...existingNatalie, ...natalieBow] }
        });
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  return { init, flyToStop, updateLines, updatePins, playBowAnimation };
})();
