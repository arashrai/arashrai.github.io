// Narsh 2026 — Map Module
// Mapbox GL JS initialization, fly-to animations, progressive journey line drawing,
// stop pins, and bow animation for the Our Story page.

const NARSH_MAP = (() => {
  "use strict";

  // Mapbox public access token — restricted to arashrai.com in Mapbox dashboard.
  // Free tier: 50,000 map loads/month.
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

    // Build coordinate arrays for each line
    const arashCoords = [];
    const natalieCoords = [];

    for (let i = 0; i <= stopIndex; i++) {
      const stop = stops[i];
      const isPostConvergence = convergenceIndex >= 0 && i > convergenceIndex;

      if (stop.owner === "arash" || stop.owner === "both") {
        if (isPostConvergence && stop.owner === "both") {
          // Apply sine-wave offset for intertwining (arash: phase 0)
          const offset = computeIntertwineOffset(stop.coords, i, 0);
          arashCoords.push(offset);
        } else {
          arashCoords.push(stop.coords);
        }
      }

      if (stop.owner === "natalie" || stop.owner === "both") {
        if (isPostConvergence && stop.owner === "both") {
          // Apply sine-wave offset for intertwining (natalie: phase PI)
          const offset = computeIntertwineOffset(stop.coords, i, Math.PI);
          natalieCoords.push(offset);
        } else {
          natalieCoords.push(stop.coords);
        }
      }
    }

    if (reducedMotion) {
      // Instant update
      setLineData("line-arash", arashCoords);
      setLineData("line-natalie", natalieCoords);
    } else {
      // Animate the last segment
      animateLastSegment("line-arash", arashCoords);
      animateLastSegment("line-natalie", natalieCoords);
    }
  };

  const computeIntertwineOffset = (coords, index, phase) => {
    const offset = Math.sin(index * 2.5 + phase) * INTERTWINE_AMPLITUDE;
    return [coords[0] + offset, coords[1] + offset * 0.5];
  };

  const animateLastSegment = (sourceId, coords) => {
    if (coords.length < 2) {
      setLineData(sourceId, coords);
      return;
    }

    const prevCoords = coords.slice(0, -1);
    const targetCoord = coords[coords.length - 1];
    const fromCoord = prevCoords[prevCoords.length - 1];
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / LINE_DRAW_DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentLng = fromCoord[0] + (targetCoord[0] - fromCoord[0]) * eased;
      const currentLat = fromCoord[1] + (targetCoord[1] - fromCoord[1]) * eased;

      const animatedCoords = [...prevCoords, [currentLng, currentLat]];
      setLineData(sourceId, animatedCoords);

      if (progress < 1) {
        lineAnimationId = requestAnimationFrame(step);
      }
    };

    lineAnimationId = requestAnimationFrame(step);
  };

  const setLineData = (sourceId, coords) => {
    const source = mapInstance.getSource(sourceId);
    if (source) {
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
    const source = mapInstance.getSource(sourceId);
    if (!source || !source._data) return [];
    const data = source._data;
    if (data.geometry && data.geometry.coordinates) {
      return data.geometry.coordinates;
    }
    return [];
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
