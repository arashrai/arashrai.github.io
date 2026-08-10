// Narsh 2026 — Our Story Map Module
// Senior Cartography Design Engine: Dynamic Arc Resolution Sampling, Zero Atmosphere Ring Glow & High-Resolution Geodesic Trajectories.

const NARSH_MAP = (() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXBkbDdvaGIwY2dhMnNwcHN0MXB2MmhmIn0.jLnDHXAAGi0CZ1XSMVUArQ";

  const CAMERA_SPEED = 1.4;   // Rapid, responsive camera speed
  const CAMERA_CURVE = 1.2;   // Gentle trajectory height
  const ROPE_AMPLITUDE = 0.12; // Scale-harmonized braided rope offset
  const KM_PER_TWIST = 250;    // Balanced twist density: 1 crossover per 250 km along path

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";

  let mapInstance = null;
  let reducedMotion = false;
  const lastCoords = { "line-arash": [], "line-natalie": [] };

  let targetArashCoords = [];
  let targetNatalieCoords = [];

  let startArashCount = 0;
  let endArashCount = 0;
  let startNatalieCount = 0;
  let endNatalieCount = 0;

  let flightActive = false;
  let flightStartTime = 0;
  let flightDurationMs = 1200;

  let activeStartCoords = null;
  let activeTargetCoords = null;

  let globeSpinReqId = null;
  let isUserInteracting = false;

  // Flight Token Guard against rapid navigation clicks / key skips
  let currentFlightId = 0;

  // Spherical distance in kilometers
  const getGeodesicDistanceKm = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const R = 6371; // Earth radius in km
    const rad = Math.PI / 180;
    const dLat = (p2[1] - p1[1]) * rad;
    const dLon = (p2[0] - p1[0]) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[1] * rad) * Math.cos(p2[1] * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getDistance = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const rad = Math.PI / 180;
    const dLat = (p2[1] - p1[1]) * rad;
    const dLon = (p2[0] - p1[0]) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[1] * rad) * Math.cos(p2[1] * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // High-Resolution Dynamic Great Circle Geodesic Arc Interpolation (sample point every ~30 km)
  const getGreatCirclePoints = (start, end) => {
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

    const distKm = 6371 * d;
    const numPoints = Math.max(24, Math.round(distKm / 30));

    const points = [];
    let lastLng = start[0];
    for (let i = 0; i <= numPoints; i++) {
      const f = i / numPoints;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);

      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / rad;
      let lon = Math.atan2(y, x) / rad;

      // Continuously unwrap longitude to prevent Date Line flip jumps
      while (lon - lastLng > 180) lon -= 360;
      while (lon - lastLng < -180) lon += 360;
      lastLng = lon;

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

    return new Promise((resolve) => {
      let settled = false;

      const settle = (map) => {
        if (settled) return;
        settled = true;
        try { applyWarmStyleOverrides(); } catch (e) {}
        try { setupLayers(); } catch (e) {}
        resolve(map);
      };

      mapInstance.on("load", () => settle(mapInstance));
      mapInstance.on("style.load", () => settle(mapInstance));
      setTimeout(() => { if (mapInstance) settle(mapInstance); }, 1200);
    });
  };

  // Synchronized camera frame handler locked directly to camera location
  const onCameraMove = () => {
    if (!flightActive || reducedMotion || !mapInstance || typeof mapInstance.getCenter !== "function") return;

    let t = 0;
    try {
      if (activeStartCoords && activeTargetCoords) {
        const center = mapInstance.getCenter();
        if (!center) return;
        const currentCam = [center.lng, center.lat];
        const totalD = getDistance(activeStartCoords, activeTargetCoords);
        const camD = getDistance(activeStartCoords, currentCam);
        t = totalD > 0 ? Math.min(1.0, Math.max(0.0, camD / totalD)) : 1.0;
      } else {
        const elapsed = performance.now() - flightStartTime;
        t = Math.min(1.0, Math.max(0, elapsed / flightDurationMs));
      }
    } catch (e) {
      t = 1.0;
    }

    const countArash = Math.round(startArashCount + (endArashCount - startArashCount) * t);
    const countNatalie = Math.round(startNatalieCount + (endNatalieCount - startNatalieCount) * t);

    setLineData("line-arash", targetArashCoords.slice(0, Math.max(0, countArash)));
    setLineData("line-natalie", targetNatalieCoords.slice(0, Math.max(0, countNatalie)));

    if (t >= 1.0) {
      flightActive = false;
    }
  };

  const stopGlobeSpin = () => {
    if (globeSpinReqId) {
      cancelAnimationFrame(globeSpinReqId);
      globeSpinReqId = null;
    }
  };

  // Finale Zoom Out & User Interaction Control Guard
  const startFinaleGlobeSpin = () => {
    if (!mapInstance || reducedMotion || typeof mapInstance.getCenter !== "function") return;
    stopGlobeSpin();
    isUserInteracting = false;

    // DISABLE manual user interactions while camera zoom out animation is in progress
    if (mapInstance.dragPan) mapInstance.dragPan.disable();
    if (mapInstance.scrollZoom) mapInstance.scrollZoom.disable();
    if (mapInstance.dragRotate) mapInstance.dragRotate.disable();
    if (mapInstance.touchZoomRotate) mapInstance.touchZoomRotate.disable();

    mapInstance.flyTo({
      center: [15, 25],
      zoom: 2.1,
      speed: 0.6,
      curve: 1.4,
      essential: true
    });

    // ONLY AFTER zoom out completes, enable controls & start auto-spin!
    mapInstance.once("moveend", () => {
      if (!mapInstance) return;

      // Enable 100% full interactive manual controls for user
      if (mapInstance.dragPan) mapInstance.dragPan.enable();
      if (mapInstance.scrollZoom) mapInstance.scrollZoom.enable();
      if (mapInstance.dragRotate) mapInstance.dragRotate.enable();
      if (mapInstance.touchZoomRotate) mapInstance.touchZoomRotate.enable();
      if (mapInstance.doubleClickZoom) mapInstance.doubleClickZoom.enable();

      // Attach user interaction listeners now that zoom out has completed!
      const canvas = mapInstance.getCanvas();
      if (canvas) {
        const handleUserInteraction = () => {
          isUserInteracting = true;
          stopGlobeSpin();
        };
        canvas.addEventListener("mousedown", handleUserInteraction);
        canvas.addEventListener("touchstart", handleUserInteraction);
        canvas.addEventListener("pointerdown", handleUserInteraction);
        mapInstance.on("dragstart", handleUserInteraction);
      }

      const spin = () => {
        if (isUserInteracting || !mapInstance || typeof mapInstance.getCenter !== "function") return;
        try {
          const c = mapInstance.getCenter();
          if (c) {
            c.lng = (c.lng + 0.2) % 360;
            mapInstance.setCenter(c);
            globeSpinReqId = requestAnimationFrame(spin);
          }
        } catch (e) {}
      };
      globeSpinReqId = requestAnimationFrame(spin);
    });
  };

  const applyWarmStyleOverrides = () => {
    if (!mapInstance || typeof mapInstance.getStyle !== "function") return;
    try {
      // Remove atmosphere glow ring completely by setting horizon-blend: 0 and uniform background color
      if (mapInstance.setFog) {
        mapInstance.setFog({
          color: "#F5E6D3",
          "high-color": "#F5E6D3",
          "space-color": "#F5E6D3",
          "horizon-blend": 0,
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
    if (!mapInstance || typeof mapInstance.getSource !== "function") return;

    // Arash line (Teal)
    if (!mapInstance.getSource("line-arash")) {
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
    }

    // Natalie line (Gold)
    if (!mapInstance.getSource("line-natalie")) {
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
    }

    // Pins
    if (!mapInstance.getSource("stops")) {
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
    }
  };

  const unwrapTargetLng = (startLng, targetLng) => {
    let lng = targetLng;
    while (lng - startLng > 180) lng -= 360;
    while (lng - startLng < -180) lng += 360;
    return lng;
  };

  const flyToStop = (coords, zoom, flyVia, wideCoords, wideZoom, isHubTrip, hubCoords, isBackward, onArrival, isFinale) => {
    if (!mapInstance || typeof mapInstance.getCenter !== "function") return;
    stopGlobeSpin();
    mapInstance.stop();

    const flightId = ++currentFlightId;

    const isMobile = window.innerWidth < 768;
    const padding = isMobile
      ? { top: 60, bottom: Math.round(window.innerHeight * 0.42), left: 16, right: 16 }
      : { top: 80, bottom: 80, left: 40, right: 420 };

    const effectiveZoom = isMobile
      ? Math.max(3.2, (zoom || 4.5) - 1.0)
      : (zoom || 4.5);

    let currentCamCenter = [50, 25];
    try {
      const c = mapInstance.getCenter();
      if (c) currentCamCenter = [c.lng, c.lat];
    } catch (e) {}

    if (reducedMotion) {
      const targetLng = unwrapTargetLng(currentCamCenter[0], coords[0]);
      mapInstance.jumpTo({ center: [targetLng, coords[1]], zoom: effectiveZoom, padding: padding });
      setLineData("line-arash", targetArashCoords);
      setLineData("line-natalie", targetNatalieCoords);
      if (onArrival) onArrival();
      if (isFinale) startFinaleGlobeSpin();
      return;
    }

    const currentArashLen = (lastCoords["line-arash"] || []).length;
    const currentNatalieLen = (lastCoords["line-natalie"] || []).length;

    startArashCount = currentArashLen;
    endArashCount = targetArashCoords.length;
    startNatalieCount = currentNatalieLen;
    endNatalieCount = targetNatalieCoords.length;

    // Handle Waypoint Flight (e.g. Cayman -> India -> NZ, OR Trip A -> Seattle -> Trip B)
    if (flyVia && !isBackward) {
      const flight1Ms = 600;
      const flight2Ms = 1200;

      const flyViaLng = unwrapTargetLng(currentCamCenter[0], flyVia[0]);
      const flyViaTargetCoords = [flyViaLng, flyVia[1]];
      const cameraTargetLng = unwrapTargetLng(flyViaLng, coords[0]);
      const cameraTargetCoords = [cameraTargetLng, coords[1]];

      startArashCount = currentArashLen;
      endArashCount = currentArashLen;
      startNatalieCount = currentNatalieLen;
      endNatalieCount = currentNatalieLen;

      activeStartCoords = null;
      activeTargetCoords = null;

      flightDurationMs = flight1Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: flyViaTargetCoords,
        zoom: Math.max(3.0, effectiveZoom - 1.0),
        speed: CAMERA_SPEED,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (!mapInstance || flightId !== currentFlightId) return;
        startArashCount = currentArashLen;
        endArashCount = targetArashCoords.length;
        startNatalieCount = currentNatalieLen;
        endNatalieCount = targetNatalieCoords.length;

        activeStartCoords = flyViaTargetCoords;
        activeTargetCoords = cameraTargetCoords;

        flightDurationMs = flight2Ms;
        flightStartTime = performance.now();
        flightActive = true;

        mapInstance.flyTo({
          center: cameraTargetCoords,
          zoom: effectiveZoom,
          speed: CAMERA_SPEED,
          curve: CAMERA_CURVE,
          padding: padding,
          essential: true
        });

        mapInstance.once("moveend", () => {
          if (flightId !== currentFlightId) return;
          activeStartCoords = null;
          activeTargetCoords = null;
          if (onArrival) onArrival();
          if (isFinale) {
            setTimeout(startFinaleGlobeSpin, 800);
          }
        });
      });
      return;
    }

    const cameraTargetLng = unwrapTargetLng(currentCamCenter[0], coords[0]);
    const cameraTargetCoords = [cameraTargetLng, coords[1]];

    // Handle Dual Travel Wide Zoom Out (Saskatchewan & Waterloo)
    if (wideCoords) {
      const flight1Ms = 800;

      activeStartCoords = null;
      activeTargetCoords = null;

      flightDurationMs = flight1Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: wideCoords,
        zoom: wideZoom ? (isMobile ? Math.max(2.2, wideZoom - 0.6) : wideZoom) : 3.0,
        speed: CAMERA_SPEED,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (!mapInstance || flightId !== currentFlightId) return;
        mapInstance.flyTo({
          center: cameraTargetCoords,
          zoom: effectiveZoom,
          speed: CAMERA_SPEED,
          curve: CAMERA_CURVE,
          padding: padding,
          essential: true
        });
        mapInstance.once("moveend", () => {
          if (flightId !== currentFlightId) return;
          if (onArrival) onArrival();
          if (isFinale) {
            setTimeout(startFinaleGlobeSpin, 800);
          }
        });
      });
      return;
    }

    // Standard fast camera flight (forward or backward)
    flightDurationMs = 1200;
    flightStartTime = performance.now();
    flightActive = true;

    mapInstance.flyTo({
      center: cameraTargetCoords,
      zoom: effectiveZoom,
      speed: CAMERA_SPEED,
      curve: CAMERA_CURVE,
      padding: padding,
      essential: true
    });

    mapInstance.once("moveend", () => {
      if (flightId !== currentFlightId) return;
      if (onArrival) onArrival();
      if (isFinale) {
        setTimeout(startFinaleGlobeSpin, 800);
      }
    });
  };

  const pushUniqueNode = (arr, pt) => {
    if (!pt) return;
    if (arr.length === 0) {
      arr.push(pt.slice());
    } else {
      const last = arr[arr.length - 1];
      if (Math.abs(last[0] - pt[0]) > 0.0001 || Math.abs(last[1] - pt[1]) > 0.0001) {
        arr.push(pt.slice());
      }
    }
  };

  const updateLines = (stopIndex, stops) => {
    if (!mapInstance) return;

    const convergenceIndex = stops.findIndex(s => s.isConvergence);
    const waterlooIndex = stops.findIndex(s => s.id === "waterloo");

    const arashNodes = [];
    const natalieNodes = [];
    let convArashIdx = -1;
    let convNatalieIdx = -1;
    let braidStartArashIdx = -1;
    let braidStartNatalieIdx = -1;

    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];

      // For vacation trips departing from Seattle (flyVia), start the new segment FROM Seattle!
      if (stop.flyVia) {
        if (stop.owner === "arash" || stop.owner === "both") pushUniqueNode(arashNodes, stop.flyVia);
        if (stop.owner === "natalie" || stop.owner === "both") pushUniqueNode(natalieNodes, stop.flyVia);
      }

      if (stop.arashPos) {
        if (i === convergenceIndex) convArashIdx = arashNodes.length;
        pushUniqueNode(arashNodes, stop.arashPos);
      } else if (stop.owner === "arash" || stop.owner === "both") {
        if (i === convergenceIndex) convArashIdx = arashNodes.length;
        if (i === waterlooIndex) braidStartArashIdx = arashNodes.length;
        pushUniqueNode(arashNodes, stop.coords);
      }

      if (stop.nataliePos) {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        pushUniqueNode(natalieNodes, stop.nataliePos);
      } else if (stop.owner === "natalie" || stop.owner === "both") {
        if (i === convergenceIndex) convNatalieIdx = natalieNodes.length;
        if (i === waterlooIndex) braidStartNatalieIdx = natalieNodes.length;
        pushUniqueNode(natalieNodes, stop.coords);
      }
    }

    const arashUnwrapped = unwrapLongitudes(arashNodes);
    const natalieUnwrapped = unwrapLongitudes(natalieNodes);

    // Braiding ONLY begins when they travel together from Waterloo (waterlooIndex) onward!
    const braided = buildBraidedRope(arashUnwrapped, natalieUnwrapped, braidStartArashIdx, braidStartNatalieIdx);
    targetArashCoords = braided.arash;
    targetNatalieCoords = braided.natalie;

    if (reducedMotion) {
      setLineData("line-arash", targetArashCoords);
      setLineData("line-natalie", targetNatalieCoords);
    }
  };

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

  // Senior Design Hat Braided Rope Helix with Geodesic Metric Normal Vectors (Even Ribbon Braid across East-West & North-South flights!)
  const buildBraidedRope = (arashNodes, natalieNodes, weaveArashFromIdx, weaveNatalieFromIdx) => {
    const buildSingleLine = (nodes, weaveFromIdx, phaseSign) => {
      if (nodes.length === 0) return [];
      if (nodes.length === 1) return [nodes[0].slice()];

      const out = [nodes[0].slice()];
      for (let j = 0; j < nodes.length - 1; j++) {
        const a = nodes[j];
        const b = nodes[j + 1];
        const isWoven = weaveFromIdx >= 0 && j >= weaveFromIdx;

        // Dynamic High-Resolution Arc Sampling: 1 point every 30 km along path!
        const gcArc = getGreatCirclePoints(a, b);

        const rad = Math.PI / 180;
        const midLat = (a[1] + b[1]) / 2;
        const cosLat = Math.max(0.2, Math.cos(midLat * rad));

        // Metric-scaled delta for uniform perpendicular normal vector
        const dLatM = b[1] - a[1];
        const dLngM = (b[0] - a[0]) * cosLat;
        const lenM = Math.sqrt(dLatM * dLatM + dLngM * dLngM);

        const nx = lenM > 0 ? (-dLatM / lenM) / cosLat : 0;
        const ny = lenM > 0 ? (dLngM / lenM) : 0;

        // Calculate path distance along the actual Great Circle arc
        let segDistKm = 0;
        for (let k = 0; k < gcArc.length - 1; k++) {
          segDistKm += getGeodesicDistanceKm(gcArc[k], gcArc[k + 1]);
        }
        // Harmonized 250km twist density for crisp, elegant braids across ocean & overland flights!
        const numTwists = Math.max(2, Math.round(segDistKm / KM_PER_TWIST));

        for (let s = 1; s < gcArc.length; s++) {
          const pt = gcArc[s];
          const t = s / gcArc.length;

          if (isWoven) {
            // Metric-scaled elegant micro-braid (1 twist per 250km, amplitude 0.12)
            const wave = Math.sin(t * Math.PI * numTwists) * ROPE_AMPLITUDE * phaseSign;
            out.push([pt[0] + nx * wave, pt[1] + ny * wave]);
          } else {
            out.push(pt.slice());
          }
        }
      }
      return out;
    };

    return {
      arash: buildSingleLine(arashNodes, weaveArashFromIdx, 1),
      natalie: buildSingleLine(natalieNodes, weaveNatalieFromIdx, -1)
    };
  };

  const setLineData = (sourceId, coords) => {
    if (!mapInstance || typeof mapInstance.getSource !== "function") return;
    try {
      const source = mapInstance.getSource(sourceId);
      if (source) {
        lastCoords[sourceId] = coords.slice();
        source.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords.length > 0 ? coords : [] }
        });
      }
    } catch (e) {}
  };

  const updatePins = (stopIndex, stops) => {
    if (!mapInstance || typeof mapInstance.getSource !== "function") return;

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

    try {
      const source = mapInstance.getSource("stops");
      if (source) {
        source.setData({ type: "FeatureCollection", features: features });
      }
    } catch (e) {}
  };

  return {
    init,
    flyToStop,
    updateLines,
    updatePins,
    stopGlobeSpin,
    playBowAnimation: () => {} // Safe no-op export guard
  };
})();

// Backward compatibility alias for WIP references
const NARSH_MAP_WIP = NARSH_MAP;
