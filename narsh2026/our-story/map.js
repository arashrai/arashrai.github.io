// Narsh 2026 — Our Story Map Module
// Senior Cartography Design Engine: Precise Separate Early Lines (Arash Teal, Natalie Gold), 2-Leg Sweeps (Leg 1 = Zero Line Growth, Leg 2 = Camera-Locked Growth), Braided Helix from Waterloo Onward.

const NARSH_MAP = (() => {
  "use strict";

  const MAPBOX_TOKEN = "pk.eyJ1IjoibmF0YWxpZWZsZXVyeSIsImEiOiJjbXBkbDdvaGIwY2dhMnNwcHN0MXB2MmhmIn0.jLnDHXAAGi0CZ1XSMVUArQ";

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

  // Fully completed line arrays (stops 0 .. current-1)
  let completedArashSpokes = [];
  let completedNatalieSpokes = [];

  // Active in-flight spoke currently being drawn (ONLY during Leg 2)
  let activeArashSpoke = null;
  let activeNatalieSpoke = null;

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

  // High-Resolution Dynamic Great Circle Geodesic Arc Interpolation
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

  // Synchronized camera frame handler: line growth is locked directly to camera location
  const onCameraMove = () => {
    if (!flightActive || reducedMotion || !mapInstance || typeof mapInstance.getCenter !== "function") return;

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

    renderCurrentProgress(t);

    if (t >= 1.0) {
      flightActive = false;
    }
  };

  const renderCurrentProgress = (t) => {
    const buildMulti = (completedList, activeSpoke) => {
      const result = [];
      for (let i = 0; i < completedList.length; i++) {
        if (completedList[i] && completedList[i].length > 0) {
          result.push(completedList[i]);
        }
      }
      if (activeSpoke && activeSpoke.length > 0) {
        const count = Math.max(1, Math.round(activeSpoke.length * t));
        result.push(activeSpoke.slice(0, count));
      }
      return result;
    };

    setLineData("line-arash", buildMulti(completedArashSpokes, activeArashSpoke));
    setLineData("line-natalie", buildMulti(completedNatalieSpokes, activeNatalieSpoke));
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
      renderCurrentProgress(1.0);
      if (onArrival) onArrival();
      if (isFinale) startFinaleGlobeSpin();
      return;
    }

    // Handle Waypoint Flight (2-Leg Sweep)
    // Leg 1: Sweeps camera back to Hub (Seattle or India). ZERO line growth during Leg 1!
    // Leg 2: Flies camera to Destination. Line grows dynamically under camera during Leg 2!
    if (flyVia && !isBackward) {
      const flight1Ms = 600;
      const flight2Ms = dynamicDurationMs;

      const flyViaLng = unwrapTargetLng(currentCamCenter[0], flyVia[0]);
      const flyViaTargetCoords = [flyViaLng, flyVia[1]];
      const cameraTargetLng = unwrapTargetLng(flyViaLng, coords[0]);
      const cameraTargetCoords = [cameraTargetLng, coords[1]];

      // LEG 1: ZERO line growth during sweep to Hub! Active spokes are null.
      activeStartCoords = null;
      activeTargetCoords = null;
      flightDurationMs = flight1Ms;
      flightStartTime = performance.now();
      flightActive = true;

      // Keep active spokes null during Leg 1 so no new line segment draws while sweeping!
      const pendingArashSpoke = activeArashSpoke;
      const pendingNatalieSpoke = activeNatalieSpoke;
      activeArashSpoke = null;
      activeNatalieSpoke = null;

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

        // LEG 2: Restore active spokes and grow line dynamically from Hub -> Destination!
        activeArashSpoke = pendingArashSpoke;
        activeNatalieSpoke = pendingNatalieSpoke;
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

          if (activeArashSpoke) completedArashSpokes.push(activeArashSpoke);
          if (activeNatalieSpoke) completedNatalieSpokes.push(activeNatalieSpoke);
          activeArashSpoke = null;
          activeNatalieSpoke = null;

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

      const pendingArashSpoke = activeArashSpoke;
      const pendingNatalieSpoke = activeNatalieSpoke;
      activeArashSpoke = null;
      activeNatalieSpoke = null;

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

        activeArashSpoke = pendingArashSpoke;
        activeNatalieSpoke = pendingNatalieSpoke;
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

          if (activeArashSpoke) completedArashSpokes.push(activeArashSpoke);
          if (activeNatalieSpoke) completedNatalieSpokes.push(activeNatalieSpoke);
          activeArashSpoke = null;
          activeNatalieSpoke = null;

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

    // Standard camera flight
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

      if (activeArashSpoke) completedArashSpokes.push(activeArashSpoke);
      if (activeNatalieSpoke) completedNatalieSpokes.push(activeNatalieSpoke);
      activeArashSpoke = null;
      activeNatalieSpoke = null;

      activeStartCoords = null;
      activeTargetCoords = null;
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

    const waterlooIndex = stops.findIndex(s => s.id === "waterloo");
    const seattleIndex = stops.findIndex(s => s.id === "seattle");
    const currentStop = stops[stopIndex];
    if (!currentStop) return;

    completedArashSpokes = [];
    completedNatalieSpokes = [];
    activeArashSpoke = null;
    activeNatalieSpoke = null;

    // 1. EARLY STOPS BEFORE SEATTLE (stops 0 .. seattleIndex)
    if (stopIndex <= seattleIndex) {
      // Arash nodes up to stopIndex
      const arashNodes = [];
      const natalieNodes = [];

      for (let i = 0; i <= stopIndex; i++) {
        const s = stops[i];
        if (s.arashPos) pushUniqueNode(arashNodes, s.arashPos);
        else if (s.owner === "arash" || s.owner === "both") pushUniqueNode(arashNodes, s.coords);

        if (s.nataliePos) pushUniqueNode(natalieNodes, s.nataliePos);
        else if (s.owner === "natalie" || s.owner === "both") pushUniqueNode(natalieNodes, s.coords);
      }

      const arashUnwrapped = unwrapLongitudes(arashNodes);
      const natalieUnwrapped = unwrapLongitudes(natalieNodes);

      // Unbraided single Teal/Gold lines before Waterloo; Braided rope helix from Waterloo onward
      const braidedCur = buildBraidedRope(arashUnwrapped, natalieUnwrapped, waterlooIndex, waterlooIndex);

      if (stopIndex > 0) {
        // Line growth is active for the current step
        activeArashSpoke = braidedCur.arash;
        activeNatalieSpoke = braidedCur.natalie;
      } else {
        // At Stop 0 (Ludhiana), line is 0 length (just the pin)
        activeArashSpoke = null;
        activeNatalieSpoke = null;
      }
      return;
    }

    // 2. STOPS FROM SEATTLE ONWARD (Vacation Hub & Spoke Trips)
    // Base journey up to Seattle is completed
    const baseArashNodes = [];
    const baseNatalieNodes = [];
    for (let i = 0; i <= seattleIndex; i++) {
      const s = stops[i];
      if (s.arashPos) pushUniqueNode(baseArashNodes, s.arashPos);
      else if (s.owner === "arash" || s.owner === "both") pushUniqueNode(baseArashNodes, s.coords);

      if (s.nataliePos) pushUniqueNode(baseNatalieNodes, s.nataliePos);
      else if (s.owner === "natalie" || s.owner === "both") pushUniqueNode(baseNatalieNodes, s.coords);
    }
    const baseArashUnwrapped = unwrapLongitudes(baseArashNodes);
    const baseNatalieUnwrapped = unwrapLongitudes(baseNatalieNodes);
    const braidedBase = buildBraidedRope(baseArashUnwrapped, baseNatalieUnwrapped, waterlooIndex, waterlooIndex);
    if (braidedBase.arash.length > 0) completedArashSpokes.push(braidedBase.arash);
    if (braidedBase.natalie.length > 0) completedNatalieSpokes.push(braidedBase.natalie);

    // Completed vacation spokes for prior vacation stops (seattleIndex+1 .. stopIndex-1)
    for (let i = seattleIndex + 1; i <= stopIndex - 1; i++) {
      const s = stops[i];
      if (!s) continue;
      const hub = s.flyVia || SEATTLE_HUB;
      const dest = s.coords;
      const hubUnwrapped = unwrapLongitudes([hub, dest]);
      const spokeBraid = buildBraidedRope(hubUnwrapped, hubUnwrapped, 0, 0);
      if (spokeBraid.arash.length > 0) completedArashSpokes.push(spokeBraid.arash);
      if (spokeBraid.natalie.length > 0) completedNatalieSpokes.push(spokeBraid.natalie);
    }

    // Active in-flight spoke for current vacation stop (Leg 2 growth)
    if (currentStop.flyVia) {
      const hub = currentStop.flyVia;
      const dest = currentStop.coords;
      const hubUnwrapped = unwrapLongitudes([hub, dest]);
      const spokeBraid = buildBraidedRope(hubUnwrapped, hubUnwrapped, 0, 0);
      activeArashSpoke = spokeBraid.arash;
      activeNatalieSpoke = spokeBraid.natalie;
    }

    if (reducedMotion) {
      if (activeArashSpoke) completedArashSpokes.push(activeArashSpoke);
      if (activeNatalieSpoke) completedNatalieSpokes.push(activeNatalieSpoke);
      activeArashSpoke = null;
      activeNatalieSpoke = null;
      renderCurrentProgress(1.0);
    }
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

  // Senior Design Hat Braided Rope Helix with Geodesic Metric Normal Vectors
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
