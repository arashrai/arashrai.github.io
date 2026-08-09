// Narsh 2026 — Our Story WIP Map Module
// Camera-Synchronized Line Tracing Engine & 3D Globe Renderer.

const NARSH_MAP_WIP = (() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXBkbDdvaGIwY2dhMnNwcHN0MXB2MmhmIn0.jLnDHXAAGi0CZ1XSMVUArQ";

  const CAMERA_SPEED = 0.5;  // Smooth, stately camera motion
  const CAMERA_CURVE = 1.2;  // Gentle trajectory height

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";

  let mapInstance = null;
  let reducedMotion = false;

  let targetArashCoords = [];
  let targetNatalieCoords = [];

  let startArashCount = 0;
  let endArashCount = 0;
  let startNatalieCount = 0;
  let endNatalieCount = 0;

  let flightActive = false;
  let flightStartTime = 0;
  let flightDurationMs = 3000;

  let bowCenterArash = null;
  let bowCenterNatalie = null;

  // Great Circle Geodesic Arc Interpolation
  const getGreatCirclePoints = (start, end, numPoints = 24) => {
    if (!start || !end) return [];
    const rad = Math.PI / 180;
    const lat1 = start[1] * rad;
    const lon1 = start[0] * rad;
    const lat2 = end[1] * rad;
    let lon2 = end[0] * rad;

    let dLon = lon2 - lon1;
    while (dLon > Math.PI) { lon2 -= 2 * Math.PI; dLon = lon2 - lon1; }
    while (dLon < -Math.PI) { lon2 += 2 * Math.PI; dLon = lon2 - lon1; }

    const dLat = lat2 - lat1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (d === 0) return [start.slice()];

    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const f = i / numPoints;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);

      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / rad;
      const lon = Math.atan2(y, x) / rad;
      points.push([lon, lat]);
    }
    return points;
  };

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
      interactive: true,
      dragPan: true,
      scrollZoom: true
    });

    mapInstance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    // Synchronize line geometries on every frame the camera moves
    mapInstance.on("move", onCameraMove);

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

  // Synchronized camera frame handler
  const onCameraMove = () => {
    if (!flightActive || reducedMotion) return;

    const elapsed = performance.now() - flightStartTime;
    const t = Math.min(1.0, Math.max(0, elapsed / flightDurationMs));
    // Smooth camera-synced easing curve
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const countArash = Math.round(startArashCount + (endArashCount - startArashCount) * eased);
    const countNatalie = Math.round(startNatalieCount + (endNatalieCount - startNatalieCount) * eased);

    setLineData("line-arash", targetArashCoords.slice(0, Math.max(0, countArash)));
    setLineData("line-natalie", targetNatalieCoords.slice(0, Math.max(0, countNatalie)));

    if (t >= 1.0) {
      flightActive = false;
    }
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

  const flyToStop = (coords, zoom, flyVia, wideCoords, wideZoom, isHubTrip, hubCoords, isBackward) => {
    if (!mapInstance) return;
    mapInstance.stop();

    const isMobile = window.innerWidth < 768;
    const padding = isMobile
      ? { top: 70, bottom: 180, left: 16, right: 16 }
      : { top: 80, bottom: 80, left: 40, right: 420 };

    if (reducedMotion) {
      mapInstance.jumpTo({ center: coords, zoom: zoom || 4.5, padding: padding });
      setLineData("line-arash", targetArashCoords);
      setLineData("line-natalie", targetNatalieCoords);
      return;
    }

    // Prepare line start & end counts for synchronized camera tracking
    const currentArashLen = (lastCoords["line-arash"] || []).length;
    const currentNatalieLen = (lastCoords["line-natalie"] || []).length;

    startArashCount = currentArashLen;
    endArashCount = targetArashCoords.length;
    startNatalieCount = currentNatalieLen;
    endNatalieCount = targetNatalieCoords.length;

    // Handle Waypoint Flight (ONLY when moving forward)
    if (flyVia && !isBackward) {
      const flight1Ms = 1800;
      const flight2Ms = 3200;

      flightDurationMs = flight1Ms + flight2Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: flyVia,
        zoom: Math.min(zoom || 4.5, 3.5),
        speed: CAMERA_SPEED,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (mapInstance) {
          mapInstance.flyTo({
            center: coords,
            zoom: zoom || 4.5,
            speed: CAMERA_SPEED,
            curve: CAMERA_CURVE,
            padding: padding,
            essential: true
          });
        }
      });
      return;
    }

    // Handle Dual Travel Wide Zoom Out
    if (wideCoords) {
      const flight1Ms = 2400;
      const flight2Ms = 2400;

      flightDurationMs = flight1Ms + flight2Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: wideCoords,
        zoom: wideZoom || 3.0,
        speed: CAMERA_SPEED,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (mapInstance) {
          mapInstance.flyTo({
            center: coords,
            zoom: zoom || 5.0,
            speed: CAMERA_SPEED,
            curve: CAMERA_CURVE,
            padding: padding,
            essential: true
          });
        }
      });
      return;
    }

    // Standard camera flight (forward or backward)
    flightDurationMs = 3600;
    flightStartTime = performance.now();
    flightActive = true;

    mapInstance.flyTo({
      center: coords,
      zoom: zoom || 4.5,
      speed: CAMERA_SPEED,
      curve: CAMERA_CURVE,
      padding: padding,
      essential: true
    });
  };

  const updateLines = (stopIndex, stops) => {
    if (!mapInstance) return;

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
          const returnPoints = getGreatCirclePoints(stop.coords, stop.hubCoords, 16);
          returnPoints.forEach(p => arashNodes.push(p));
        }
      }

      if (stop.nataliePos) {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        natalieNodes.push(stop.nataliePos);
      } else if (stop.owner === "natalie" || stop.owner === "both") {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        natalieNodes.push(stop.coords);
        if (stop.isHubTrip && stop.hubCoords) {
          const returnPoints = getGreatCirclePoints(stop.coords, stop.hubCoords, 16);
          returnPoints.forEach(p => natalieNodes.push(p));
        }
      }
    }

    const arashUnwrapped = unwrapLongitudes(arashNodes);
    const natalieUnwrapped = unwrapLongitudes(natalieNodes);

    if (convArashIdx >= 0) bowCenterArash = arashUnwrapped[convArashIdx];
    if (convNatalieIdx >= 0) bowCenterNatalie = natalieUnwrapped[convNatalieIdx];

    targetArashCoords = buildLine(arashUnwrapped, woven ? convArashIdx : -1, 1);
    targetNatalieCoords = buildLine(natalieUnwrapped, woven ? convNatalieIdx : -1, -1);

    if (reducedMotion) {
      setLineData("line-arash", targetArashCoords);
      setLineData("line-natalie", targetNatalieCoords);
    }
  };

  const SEGMENT_STEPS = 20;

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

      const gcArc = getGreatCirclePoints(a, b, SEGMENT_STEPS);

      for (let s = 1; s < gcArc.length; s++) {
        const pt = gcArc[s];
        const t = s / SEGMENT_STEPS;
        const bow = weave ? Math.sin(Math.PI * t) * INTERTWINE_AMPLITUDE * sign : 0;
        out.push([pt[0] + bow, pt[1]]);
      }
    }
    return out;
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
      const progress = Math.min(elapsed / 1400, 1);
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
