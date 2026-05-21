// Narsh 2026 — Graph Module
// D3 force simulation, SVG rendering, photo-circle nodes, typed edges,
// soft colored cluster regions, and zoom/pan for the Our People page.

const NARSH_GRAPH = (() => {
  "use strict";

  const NODE_RADIUS_DEFAULT = 20;
  const NODE_RADIUS_COUPLE = 28;
  const NODE_RADIUS_TREE = 26;
  const NODE_RADIUS_TREE_COUPLE = 32;
  const EXPANDED_RADIUS = 40;
  const FORCE_CHARGE = -200;
  const FORCE_LINK_DISTANCE = 80;
  const FORCE_COLLIDE_PADDING = 8;
  const ALPHA_REHEAT = 0.3;

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_NODE_DEFAULT = "#C9928E";
  const COLOR_EDGE = "rgba(61, 43, 31, 0.15)";

  let svgEl = null;
  let simulation = null;
  let currentView = "social";
  let expandedNodeId = null;
  let zoomBehavior = null;
  let innerGroupEl = null;
  let width = 0;
  let height = 0;
  let tickCount = 0;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getInitials = (name) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const expandHull = (hull, padding) => {
    const cx = hull.reduce((sum, p) => sum + p[0], 0) / hull.length;
    const cy = hull.reduce((sum, p) => sum + p[1], 0) / hull.length;
    return hull.map((p) => {
      const dx = p[0] - cx;
      const dy = p[1] - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      return [
        p[0] + (dx / dist) * padding,
        p[1] + (dy / dist) * padding
      ];
    });
  };

  const init = (containerId) => {
    svgEl = d3.select("#" + containerId);
    const containerNode = svgEl.node();
    if (!containerNode) return;

    width = containerNode.clientWidth;
    height = containerNode.clientHeight;
    svgEl.attr("viewBox", [0, 0, width, height]);

    zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        if (innerGroupEl) {
          innerGroupEl.attr("transform", event.transform);
        }
      });
    svgEl.call(zoomBehavior);

    innerGroupEl = svgEl.append("g").attr("class", "graph-inner");

    // Layer ordering: clusters (back) -> edges (middle) -> nodes (front)
    innerGroupEl.append("g").attr("class", "cluster-regions");
    innerGroupEl.append("g").attr("class", "edges");
    innerGroupEl.append("g").attr("class", "nodes");

    renderSocialGraph();

    // Hide loading indicator
    const loadingEl = document.getElementById("graph-loading");
    if (loadingEl) loadingEl.classList.add("hidden");

    // Update graph description for accessibility
    const descEl = document.getElementById("graph-desc");
    if (descEl) {
      const socialNodes = NARSH_GUESTS.getSocialNodes();
      const socialEdges = NARSH_GUESTS.getSocialEdges(socialNodes);
      descEl.textContent = socialNodes.length + " guests shown with " + socialEdges.length + " connections";
    }

    // Mobile pinch hint
    if (window.innerWidth < 768) {
      const hintEl = document.getElementById("pinch-hint");
      if (hintEl) {
        const hideHint = () => {
          hintEl.classList.add("hidden");
          document.removeEventListener("touchstart", hideHint);
        };
        setTimeout(hideHint, 3000);
        document.addEventListener("touchstart", hideHint, { once: true });
      }
    } else {
      // Hide pinch hint on desktop
      const hintEl = document.getElementById("pinch-hint");
      if (hintEl) hintEl.classList.add("hidden");
    }
  };

  const renderSocialGraph = () => {
    const socialNodes = NARSH_GUESTS.getSocialNodes();
    const socialEdges = NARSH_GUESTS.getSocialEdges(socialNodes);

    // Set radius and initials on each node
    socialNodes.forEach((node) => {
      node.radius = node.isCouple ? NODE_RADIUS_COUPLE : NODE_RADIUS_DEFAULT;
      node.initials = getInitials(node.name);
    });

    // Create SVG defs with clipPath for each node
    const defsEl = innerGroupEl.select("defs").empty()
      ? innerGroupEl.insert("defs", ":first-child")
      : innerGroupEl.select("defs");

    defsEl.selectAll("clipPath").remove();

    socialNodes.forEach((node) => {
      defsEl.append("clipPath")
        .attr("id", "clip-" + node.id)
        .append("circle")
        .attr("r", node.radius);
    });

    // Create force simulation
    simulation = d3.forceSimulation(socialNodes)
      .force("link", d3.forceLink(socialEdges).id((d) => d.id).distance(FORCE_LINK_DISTANCE))
      .force("charge", d3.forceManyBody().strength(FORCE_CHARGE))
      .force("collide", d3.forceCollide().radius((d) => d.radius + FORCE_COLLIDE_PADDING))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.03)
      .velocityDecay(0.4);

    // Render edges
    const edgeGroupEl = innerGroupEl.select(".edges");
    edgeGroupEl.selectAll("*").remove();

    const edgeEls = edgeGroupEl.selectAll("line")
      .data(socialEdges)
      .join("line")
      .attr("stroke", COLOR_EDGE)
      .attr("stroke-width", (d) => d.type !== "group-link" ? 1.5 : 1);

    // Render nodes
    const nodeGroupEl = innerGroupEl.select(".nodes");
    nodeGroupEl.selectAll("*").remove();

    const nodeEls = nodeGroupEl.selectAll("g")
      .data(socialNodes)
      .join("g")
      .attr("class", "node")
      .attr("role", "button")
      .attr("tabindex", "0")
      .attr("aria-label", (d) => d.name);

    // For each node, add photo or initials fallback + border + label
    nodeEls.each(function(d) {
      const g = d3.select(this);

      if (d.photo) {
        g.append("image")
          .attr("href", d.photo)
          .attr("width", d.radius * 2)
          .attr("height", d.radius * 2)
          .attr("x", -d.radius)
          .attr("y", -d.radius)
          .attr("clip-path", "url(#clip-" + d.id + ")");
      } else {
        // Initials fallback
        g.append("circle")
          .attr("r", d.radius)
          .attr("fill", "#FFF8F0");
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", "14px")
          .attr("font-family", "var(--font-body)")
          .attr("fill", "#6B4F3A")
          .text(d.initials);
      }

      // Border circle
      g.append("circle")
        .attr("r", d.radius)
        .attr("fill", "none")
        .attr("stroke", d.isCouple ? COLOR_BOTH : COLOR_NODE_DEFAULT)
        .attr("stroke-width", d.isCouple ? 3 : 2);

      // Name label below node
      g.append("text")
        .attr("class", "node-label")
        .attr("dy", d.radius + 16)
        .text(d.name);
    });

    // Click handler on nodes
    nodeEls.on("click", (event, d) => {
      event.stopPropagation();
      // Expand will be implemented in Plan 02
      console.log("Node clicked:", d.id);
    });

    // Keyboard handler for nodes
    nodeEls.on("keydown", (event, d) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        console.log("Node activated:", d.id);
      }
    });

    // Click handler on SVG background to collapse
    svgEl.on("click", () => {
      // Collapse will be implemented in Plan 02
      if (expandedNodeId) {
        console.log("Background clicked, collapsing:", expandedNodeId);
        expandedNodeId = null;
      }
    });

    // Reset tick counter
    tickCount = 0;

    // Simulation tick handler
    simulation.on("tick", () => {
      tickCount++;

      // Update node positions
      nodeEls.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");

      // Update edge positions
      edgeEls
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      // Draw cluster regions (throttled to every 10 ticks for performance)
      if (tickCount % 10 === 0) {
        drawClusterRegions(socialNodes);
      }
    });
  };

  const drawClusterRegions = (socialNodes) => {
    const clusterGroupEl = innerGroupEl.select(".cluster-regions");
    clusterGroupEl.selectAll("*").remove();

    NARSH_GUESTS.GROUPS.forEach((group) => {
      const groupNodes = socialNodes.filter((n) => n.groups.includes(group.id));
      if (groupNodes.length < 3) return;

      const points = groupNodes.map((n) => [n.x, n.y]);
      const hull = d3.polygonHull(points);
      if (!hull) return;

      const expanded = expandHull(hull, 24);
      const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(1));

      clusterGroupEl.append("path")
        .attr("d", line(expanded))
        .attr("fill", group.color)
        .attr("fill-opacity", 0.08)
        .attr("stroke", "none");
    });
  };

  const zoomToNode = (nodeId) => {
    if (!svgEl || !zoomBehavior || !simulation) return;

    const nodes = simulation.nodes();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1.5)
      .translate(-node.x, -node.y);

    svgEl.transition()
      .duration(reducedMotion ? 0 : 500)
      .call(zoomBehavior.transform, transform);
  };

  const switchView = (view) => {
    // Stub for Plan 03 (family tree view)
    currentView = view;
    console.log("View switched to:", view);
  };

  const filterByGroup = (groupId) => {
    // Stub for Plan 02 (filter functionality)
    console.log("Filter by group:", groupId);
  };

  return {
    init,
    switchView,
    filterByGroup,
    zoomToNode,
    expandNode: () => {},
    collapseNode: () => {},
    getSimulation: () => simulation,
    getCurrentView: () => currentView
  };
})();
