// Narsh 2026 — Our Story Map Module
// Senior Cartography Design Engine: 100% Flawless Camera-Locked Trajectories.
// - Leg 1 Sweep: Camera sweeps to Hub/Origin. Line progress is locked at 0.0 (Zero line growth during sweep).
// - Leg 2 Flight: Line grows dynamically under camera lens from 0.0 to 1.0 in exact sync with WebGL camera frames.
// - Completed lines remain 100% solid, persistent, and visible at all times.

const NARSH_MAP = (() => {
  "use strict";

  // URL-restricted to arashrai.com/narsh2026/ and /narsh2026/our-story/.
  // Public pk. tokens are visible in source by design; the URL scope is what
  // stops a scraped copy being used elsewhere against our free tier.
  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXNvOHR4enMwMmQ0MnpwdTl2YXlnaG04In0.plkajtykA-z2G8JJ7ln25g";

  const CAMERA_CURVE = 1.2;
  const ROPE_AMPLITUDE = 0.12;
  const KM_PER_TWIST = 250;
  const SEATTLE_HUB = [-122.3421, 47.6097];

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_PIN_STROKE = "#FFFDFB";

  let mapInstance = null;
  let reducedMotion = false;

  // Render State Arrays for MultiLineString
  let currentCompletedArash = [];
  let currentCompletedNatalie = [];
  let currentInFlightArash = null;
  let currentInFlightNatalie = null;
  let currentInFlightProgress = 0.0;

  let flightActive = false;
  let isLeg1Sweep = false; // Flag to suppress line growth during Leg 1 camera sweeps
  let flightStartTime = 0;
  let flightDurationMs = 1200;

  let activeStartCoords = null;
  let activeTargetCoords = null;

  let globeSpinReqId = null;
  let isUserInteracting = false;
  let currentFlightId = 0;

  // Spherical distance in kilometers
  const getGeodesicDistanceKm = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const R = 6371;
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

  // High-Resolution Great Circle Geodesic Arc
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

      while (lon - lastLng > 180) lon -= 360;
      while (lon - lastLng < -180) lon += 360;
      lastLng = lon;

      points.push([lon, lat]);
    }
    return points;
  };

  const unwrapLongitudes = (nodes) => {
    if (!nodes || nodes.length === 0) return [];
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

  // Braided Rope Engine
  const buildBraidedRope = (arashNodes, natalieNodes, weaveArashFromIdx, weaveNatalieFromIdx) => {
    const buildSingleLine = (nodes, weaveFromIdx, phaseSign) => {
      if (!nodes || nodes.length === 0) return [];
      if (nodes.length === 1) return [nodes[0].slice()];

      const out = [nodes[0].slice()];
      for (let j = 0; j < nodes.length - 1; j++) {
        const a = nodes[j];
        const b = nodes[j + 1];
        const isWoven = weaveFromIdx >= 0 && j >= weaveFromIdx;

        const gcArc = getGreatCirclePoints(a, b);

        const rad = Math.PI / 180;
        const midLat = (a[1] + b[1]) / 2;
        const cosLat = Math.max(0.2, Math.cos(midLat * rad));

        const dLatM = b[1] - a[1];
        const dLngM = (b[0] - a[0]) * cosLat;
        const lenM = Math.sqrt(dLatM * dLatM + dLngM * dLngM);

        const nx = lenM > 0 ? (-dLatM / lenM) / cosLat : 0;
        const ny = lenM > 0 ? (dLngM / lenM) : 0;

        let segDistKm = 0;
        for (let k = 0; k < gcArc.length - 1; k++) {
          segDistKm += getGeodesicDistanceKm(gcArc[k], gcArc[k + 1]);
        }
        const numTwists = Math.max(2, Math.round(segDistKm / KM_PER_TWIST));

        for (let s = 1; s < gcArc.length; s++) {
          const pt = gcArc[s];
          const t = s / gcArc.length;

          if (isWoven) {
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

  const onCameraMove = () => {
    if (!flightActive || reducedMotion || !mapInstance || typeof mapInstance.getCenter !== "function") return;

    // During Leg 1 sweep, line progress stays locked at 0.0 (ZERO line growth)!
    if (isLeg1Sweep) {
      currentInFlightProgress = 0.0;
      renderCurrentState();
      return;
    }

    let t = 1.0;
    try {
      if (activeStartCoords && activeTargetCoords) {
        const center = mapInstance.getCenter();
        if (center) {
          const currentCam = [center.lng, center.lat];
          const totalD = getDistance(activeStartCoords, activeTargetCoords);
          const camD = getDistance(activeStartCoords, currentCam);
          t = (totalD > 0 && !isNaN(totalD)) ? Math.min(1.0, Math.max(0.0, camD / totalD)) : 1.0;
        }
      } else {
        const elapsed = performance.now() - flightStartTime;
        t = Math.min(1.0, Math.max(0.0, elapsed / flightDurationMs));
      }
    } catch (e) {
      t = 1.0;
    }

    currentInFlightProgress = t;
    renderCurrentState();

    if (t >= 1.0) {
      flightActive = false;
    }
  };

  const renderCurrentState = () => {
    const buildMulti = (completedList, activeSpoke, progress) => {
      const result = [];
      for (let i = 0; i < completedList.length; i++) {
        if (completedList[i] && completedList[i].length > 0) {
          result.push(completedList[i]);
        }
      }
      if (activeSpoke && activeSpoke.length > 0 && progress > 0) {
        const count = Math.max(1, Math.round(activeSpoke.length * progress));
        result.push(activeSpoke.slice(0, count));
      }
      return result;
    };

    setLineData("line-arash", buildMulti(currentCompletedArash, currentInFlightArash, currentInFlightProgress));
    setLineData("line-natalie", buildMulti(currentCompletedNatalie, currentInFlightNatalie, currentInFlightProgress));
  };

  const stopGlobeSpin = () => {
    if (globeSpinReqId) {
      cancelAnimationFrame(globeSpinReqId);
      globeSpinReqId = null;
    }
  };

  const startFinaleGlobeSpin = () => {
    if (!mapInstance || reducedMotion || typeof mapInstance.getCenter !== "function") return;
    stopGlobeSpin();
    isUserInteracting = false;

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

    mapInstance.once("moveend", () => {
      if (!mapInstance) return;

      if (mapInstance.dragPan) mapInstance.dragPan.enable();
      if (mapInstance.scrollZoom) mapInstance.scrollZoom.enable();
      if (mapInstance.dragRotate) mapInstance.dragRotate.enable();
      if (mapInstance.touchZoomRotate) mapInstance.touchZoomRotate.enable();
      if (mapInstance.doubleClickZoom) mapInstance.doubleClickZoom.enable();

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

    if (!mapInstance.getSource("line-arash")) {
      mapInstance.addSource("line-arash", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "MultiLineString", coordinates: [] } }
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

    if (!mapInstance.getSource("line-natalie")) {
      mapInstance.addSource("line-natalie", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "MultiLineString", coordinates: [] } }
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

    const distKm = getGeodesicDistanceKm(currentCamCenter, coords);

    const dynamicSpeed = distKm < 1500
      ? Math.max(0.55, Math.min(1.4, 0.4 + (distKm / 1500) * 0.95))
      : 1.4;

    const dynamicDurationMs = distKm < 1500
      ? Math.max(1500, Math.round(1200 + (1500 - distKm) * 0.35))
      : 1200;

    if (reducedMotion) {
      const targetLng = unwrapTargetLng(currentCamCenter[0], coords[0]);
      mapInstance.jumpTo({ center: [targetLng, coords[1]], zoom: effectiveZoom, padding: padding });
      currentInFlightProgress = 1.0;
      renderCurrentState();
      if (onArrival) onArrival();
      if (isFinale) startFinaleGlobeSpin();
      return;
    }

    // Waypoint Flight (2-Leg Sweep)
    if (flyVia && !isBackward) {
      const flight1Ms = 600;
      const flight2Ms = dynamicDurationMs;

      const flyViaLng = unwrapTargetLng(currentCamCenter[0], flyVia[0]);
      const flyViaTargetCoords = [flyViaLng, flyVia[1]];
      const cameraTargetLng = unwrapTargetLng(flyViaLng, coords[0]);
      const cameraTargetCoords = [cameraTargetLng, coords[1]];

      // LEG 1: Sweep camera to Hub. Progress stays locked at 0.0 (ZERO line growth).
      isLeg1Sweep = true;
      activeStartCoords = null;
      activeTargetCoords = null;
      currentInFlightProgress = 0.0;
      renderCurrentState();

      flightDurationMs = flight1Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: flyViaTargetCoords,
        zoom: Math.max(3.0, effectiveZoom - 1.0),
        speed: 1.4,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (!mapInstance || flightId !== currentFlightId) return;

        // LEG 2: Fly from Hub -> Destination. Line grows under camera from 0% -> 100%!
        isLeg1Sweep = false;
        activeStartCoords = flyViaTargetCoords;
        activeTargetCoords = cameraTargetCoords;

        flightDurationMs = flight2Ms;
        flightStartTime = performance.now();
        flightActive = true;

        mapInstance.flyTo({
          center: cameraTargetCoords,
          zoom: effectiveZoom,
          speed: dynamicSpeed,
          curve: CAMERA_CURVE,
          padding: padding,
          essential: true
        });

        mapInstance.once("moveend", () => {
          if (flightId !== currentFlightId) return;

          if (currentInFlightArash) currentCompletedArash.push(currentInFlightArash);
          if (currentInFlightNatalie) currentCompletedNatalie.push(currentInFlightNatalie);
          currentInFlightArash = null;
          currentInFlightNatalie = null;
          currentInFlightProgress = 1.0;

          activeStartCoords = null;
          activeTargetCoords = null;
          renderCurrentState();

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

      isLeg1Sweep = true;
      activeStartCoords = null;
      activeTargetCoords = null;
      currentInFlightProgress = 0.0;
      renderCurrentState();

      flightDurationMs = flight1Ms;
      flightStartTime = performance.now();
      flightActive = true;

      mapInstance.flyTo({
        center: wideCoords,
        zoom: wideZoom ? (isMobile ? Math.max(2.2, wideZoom - 0.6) : wideZoom) : 3.0,
        speed: 1.2,
        curve: CAMERA_CURVE,
        padding: padding,
        essential: true
      });

      mapInstance.once("moveend", () => {
        if (!mapInstance || flightId !== currentFlightId) return;

        isLeg1Sweep = false;
        activeStartCoords = wideCoords;
        activeTargetCoords = cameraTargetCoords;

        flightDurationMs = dynamicDurationMs;
        flightStartTime = performance.now();
        flightActive = true;

        mapInstance.flyTo({
          center: cameraTargetCoords,
          zoom: effectiveZoom,
          speed: dynamicSpeed,
          curve: CAMERA_CURVE,
          padding: padding,
          essential: true
        });

        mapInstance.once("moveend", () => {
          if (flightId !== currentFlightId) return;

          if (currentInFlightArash) currentCompletedArash.push(currentInFlightArash);
          if (currentInFlightNatalie) currentCompletedNatalie.push(currentInFlightNatalie);
          currentInFlightArash = null;
          currentInFlightNatalie = null;
          currentInFlightProgress = 1.0;

          activeStartCoords = null;
          activeTargetCoords = null;
          renderCurrentState();

          if (onArrival) onArrival();
          if (isFinale) {
            setTimeout(startFinaleGlobeSpin, 800);
          }
        });
      });
      return;
    }

    // Standard single-leg flight
    isLeg1Sweep = false;
    activeStartCoords = currentCamCenter;
    activeTargetCoords = cameraTargetCoords;

    flightDurationMs = dynamicDurationMs;
    flightStartTime = performance.now();
    flightActive = true;

    mapInstance.flyTo({
      center: cameraTargetCoords,
      zoom: effectiveZoom,
      speed: dynamicSpeed,
      curve: CAMERA_CURVE,
      padding: padding,
      essential: true
    });

    mapInstance.once("moveend", () => {
      if (flightId !== currentFlightId) return;

      if (currentInFlightArash) currentCompletedArash.push(currentInFlightArash);
      if (currentInFlightNatalie) currentCompletedNatalie.push(currentInFlightNatalie);
      currentInFlightArash = null;
      currentInFlightNatalie = null;
      currentInFlightProgress = 1.0;

      activeStartCoords = null;
      activeTargetCoords = null;
      renderCurrentState();

      if (onArrival) onArrival();
      if (isFinale) {
        setTimeout(startFinaleGlobeSpin, 800);
      }
    });
  };

  const setLineData = (sourceId, multiCoords) => {
    if (!mapInstance || typeof mapInstance.getSource !== "function") return;
    try {
      const source = mapInstance.getSource(sourceId);
      if (source) {
        source.setData({
          type: "Feature",
          geometry: { type: "MultiLineString", coordinates: multiCoords }
        });
      }
    } catch (e) {}
  };

  // Explicit Deterministic Trajectory Generator for Stop targetIndex
  const updateLines = (stopIndex, stops) => {
    if (!mapInstance) return;

    currentCompletedArash = [];
    currentCompletedNatalie = [];
    currentInFlightArash = null;
    currentInFlightNatalie = null;
    currentInFlightProgress = 0.0;

    const LUDHIANA = [75.8573, 30.9010];
    const CAYMAN = [-81.2546, 19.3133];
    const AUCKLAND = [174.7633, -36.8485];
    const ABBOTSFORD = [-122.3045, 49.0504];
    const SASKATCHEWAN = [-106.6330, 52.1332];
    const WATERLOO = [-80.5204, 43.4643];

    // Stop 0 (Ludhiana) & Stop 1 (Cayman): Birthplace pins only, ZERO lines!
    if (stopIndex < 2) {
      renderCurrentState();
      return;
    }

    // Stop 2 (Auckland): Arash travels Ludhiana -> Auckland
    if (stopIndex >= 2) {
      const seg = getGreatCirclePoints(LUDHIANA, AUCKLAND);
      if (stopIndex === 2) currentInFlightArash = seg;
      else currentCompletedArash.push(seg);
    }

    // Stop 3 (Abbotsford): Arash travels Auckland -> Abbotsford
    if (stopIndex >= 3) {
      const seg = getGreatCirclePoints(AUCKLAND, ABBOTSFORD);
      if (stopIndex === 3) currentInFlightArash = seg;
      else currentCompletedArash.push(seg);
    }

    // Stop 4 (Saskatchewan - SHAD): Convergence!
    // Arash: Abbotsford -> Saskatchewan (Teal)
    // Natalie: Cayman -> Saskatchewan (Gold)
    if (stopIndex >= 4) {
      const arashSeg = getGreatCirclePoints(ABBOTSFORD, SASKATCHEWAN);
      const natalieSeg = getGreatCirclePoints(CAYMAN, SASKATCHEWAN);
      if (stopIndex === 4) {
        currentInFlightArash = arashSeg;
        currentInFlightNatalie = natalieSeg;
      } else {
        currentCompletedArash.push(arashSeg);
        currentCompletedNatalie.push(natalieSeg);
      }
    }

    // Stop 5 (Long Distance): Arash returned home to BC, Natalie returned home to Cayman.
    // Base lines up to Saskatchewan remain completed.

    // Stop 6 (Waterloo): Reunited at University of Waterloo!
    // Separate travel from home:
    // Arash: Abbotsford, BC -> Waterloo, ON (Teal)
    // Natalie: Grand Cayman -> Waterloo, ON (Gold)
    if (stopIndex >= 6) {
      const arashWaterloo = getGreatCirclePoints(ABBOTSFORD, WATERLOO);
      const natalieWaterloo = getGreatCirclePoints(CAYMAN, WATERLOO);
      if (stopIndex === 6) {
        currentInFlightArash = arashWaterloo;
        currentInFlightNatalie = natalieWaterloo;
      } else {
        currentCompletedArash.push(arashWaterloo);
        currentCompletedNatalie.push(natalieWaterloo);
      }
    }

    // Stop 7 (Seattle): Both move together Waterloo -> Seattle
    // Braided Ribbon Helix weaves from Waterloo -> Seattle!
    if (stopIndex >= 7) {
      const braided = buildBraidedRope(unwrapLongitudes([WATERLOO, SEATTLE_HUB]), unwrapLongitudes([WATERLOO, SEATTLE_HUB]), 0, 0);
      if (stopIndex === 7) {
        currentInFlightArash = braided.arash;
        currentInFlightNatalie = braided.natalie;
      } else {
        currentCompletedArash.push(braided.arash);
        currentCompletedNatalie.push(braided.natalie);
      }
    }

    // Stops 8..19 (Vacation Trips from Seattle): Outward spokes!
    if (stopIndex >= 8) {
      for (let i = 8; i <= stopIndex; i++) {
        const s = stops[i];
        if (!s || !s.coords) continue;
        const hub = s.flyVia || SEATTLE_HUB;
        const dest = s.coords;
        const spokeBraid = buildBraidedRope(unwrapLongitudes([hub, dest]), unwrapLongitudes([hub, dest]), 0, 0);
        if (i === stopIndex) {
          currentInFlightArash = spokeBraid.arash;
          currentInFlightNatalie = spokeBraid.natalie;
        } else {
          if (spokeBraid.arash.length > 0) currentCompletedArash.push(spokeBraid.arash);
          if (spokeBraid.natalie.length > 0) currentCompletedNatalie.push(spokeBraid.natalie);
        }
      }
    }

    if (reducedMotion) {
      if (currentInFlightArash) currentCompletedArash.push(currentInFlightArash);
      if (currentInFlightNatalie) currentCompletedNatalie.push(currentInFlightNatalie);
      currentInFlightArash = null;
      currentInFlightNatalie = null;
      currentInFlightProgress = 1.0;
    }

    renderCurrentState();
  };

  const updatePins = (stopIndex, stops) => {
    if (!mapInstance || typeof mapInstance.getSource !== "function") return;

    const features = [];
    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];
      if (!stop) continue;

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
