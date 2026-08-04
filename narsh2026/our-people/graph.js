// Narsh 2026 — Graph Module
// D3 force simulation, SVG rendering, photo-circle nodes, typed edges,
// soft colored cluster regions, zoom/pan, search zoom-to with pulse,
// group filtering, expand-in-place node interaction, and family tree
// layout view for the Our People page.

const NARSH_GRAPH = (() => {
  "use strict";

  const NODE_RADIUS_DEFAULT = 20;
  const NODE_RADIUS_COUPLE = 28;
  const NODE_RADIUS_TREE = 26;
  const NODE_RADIUS_TREE_COUPLE = 32;
  const EXPANDED_RADIUS = 40;
  const EXPANDED_RADIUS_COUPLE = 48;
  const FORCE_CHARGE = -200;
  const FORCE_LINK_DISTANCE = 80;
  const FORCE_COLLIDE_PADDING = 8;
  const ALPHA_REHEAT = 0.3;
  // Group-clustering force: per-group anchors sit on an ellipse that fills the
  // viewport (fractions of width/height, so groups spread apart without going
  // off-screen). Group-less people park just outside that ellipse.
  const GROUP_ANCHOR_X_FRAC = 0.40;
  const GROUP_ANCHOR_Y_FRAC = 0.40;
  const GROUP_PERIPHERY_FACTOR = 1.18;
  const GROUP_FORCE_STRENGTH = 0.40;

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_NODE_DEFAULT = "#C9928E";
  const COLOR_EDGE = "rgba(61, 43, 31, 0.15)";
  const COLOR_EDGE_HIGHLIGHT = "rgba(61, 43, 31, 0.5)";

  // Family-tree layout: gold = Natalie's side, teal = Arash's side.
  const SIDE_COLORS = { natalie: COLOR_NATALIE, arash: COLOR_ARASH };
  const TREE_H_SPACING = 180; // horizontal gap between sibling units
  const TREE_V_SPACING = 160; // vertical gap between generations
  const TREE_ROOT_GAP = 110;  // gap between adjacent root subtrees on a side
  const TREE_SIDE_GAP = 180;  // gap between Natalie's and Arash's forests
  const TREE_MEMBER_OFFSET = 58; // half-distance between the two people in a couple

  let svgEl = null;
  let simulation = null;
  let currentView = "social";
  let expandedNodeId = null;
  let zoomBehavior = null;
  let innerGroupEl = null;
  let width = 0;
  let height = 0;
  let tickCount = 0;

  // Current full data sets (kept for filter restore)
  let allSocialNodes = [];
  let allSocialEdges = [];

  // Currently visible data (after filtering)
  let visibleNodes = [];
  let visibleEdges = [];

  // D3 selections for enter/update/exit
  let nodeEls = null;
  let edgeEls = null;

  // Escape keydown handler reference (attached/removed on expand/collapse)
  let escapeHandler = null;

  // Tree view state
  let treeNodeData = []; // flat array of rendered tree nodes for zoomToNode lookup
  let currentFamilyFilter = "both";

  // Callbacks for UI module (set by graph-ui.js during init)
  let onNodeExpandCallback = null;
  let onNodeCollapseCallback = null;

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

  // Anchor each group at a point on a circle around the center. Cached so the
  // same group always sits in the same place (stable across filtering).
  let groupAnchors = null;
  const computeGroupAnchors = () => {
    const groups = NARSH_GUESTS.GROUPS;
    const cx = width / 2;
    const cy = height / 2;
    const rx = width * GROUP_ANCHOR_X_FRAC;
    const ry = height * GROUP_ANCHOR_Y_FRAC;
    const anchors = {};
    groups.forEach((g, i) => {
      // Start at the top and go clockwise; -PI/2 puts group 0 at 12 o'clock.
      const angle = (i / groups.length) * 2 * Math.PI - Math.PI / 2;
      anchors[g.id] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
    });
    return anchors;
  };

  // Custom force: pull each node toward the mean of ITS groups' anchors, so a
  // one-group person lands on that group's anchor and a multi-group person lands
  // in the overlap between them (Venn-like). Group-less people are pushed OUT to
  // a peripheral ring (spread by golden angle) so they never land inside a blob.
  const groupClusterForce = () => {
    let nodes = [];
    const cx = width / 2;
    const cy = height / 2;
    const ringRx = width * GROUP_ANCHOR_X_FRAC * GROUP_PERIPHERY_FACTOR;
    const ringRy = height * GROUP_ANCHOR_Y_FRAC * GROUP_PERIPHERY_FACTOR;
    const strength = GROUP_FORCE_STRENGTH;
    const force = (alpha) => {
      nodes.forEach((n, i) => {
        const gs = n.groups.filter((gid) => groupAnchors[gid]);
        let tx, ty, k;
        if (gs.length === 0) {
          // No group: park on a peripheral ellipse, outside every blob. The
          // golden angle (~137.5°) spreads them evenly around the outside.
          const angle = i * 2.399963229728653;
          tx = cx + ringRx * Math.cos(angle);
          ty = cy + ringRy * Math.sin(angle);
          k = strength * 0.5 * alpha;
        } else {
          tx = 0; ty = 0;
          for (const gid of gs) { tx += groupAnchors[gid].x; ty += groupAnchors[gid].y; }
          tx /= gs.length; ty /= gs.length;
          k = strength * alpha;
        }
        n.vx += (tx - n.x) * k;
        n.vy += (ty - n.y) * k;
      });
    };
    force.initialize = (n) => { nodes = n; };
    return force;
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

    // Layer ordering: cluster blobs + watermarks (back) -> edges -> nodes (front)
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
      descEl.textContent = allSocialNodes.length + " guests shown with " + allSocialEdges.length + " connections";
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

    // Click handler on SVG background to collapse
    svgEl.on("click", (event) => {
      // Only collapse if click is on the SVG itself or inner group (not on a node)
      const target = event.target;
      if (target === svgEl.node() || target === innerGroupEl.node() || target.tagName === "svg") {
        if (expandedNodeId) {
          if (currentView === "tree") {
            collapseTreeNode();
          } else {
            collapseNode();
          }
        }
      }
    });
  };

  const renderSocialGraph = () => {
    allSocialNodes = NARSH_GUESTS.getSocialNodes();
    allSocialEdges = NARSH_GUESTS.getSocialEdges(allSocialNodes);

    // Set radius and initials on each node
    allSocialNodes.forEach((node) => {
      node.radius = node.isCouple ? NODE_RADIUS_COUPLE : NODE_RADIUS_DEFAULT;
      node.baseRadius = node.radius;
      node.initials = getInitials(node.name);
    });

    // Start with all nodes visible
    visibleNodes = allSocialNodes.slice();
    visibleEdges = allSocialEdges.slice();

    // Create SVG defs with clipPath for each node
    const defsEl = innerGroupEl.select("defs").empty()
      ? innerGroupEl.insert("defs", ":first-child")
      : innerGroupEl.select("defs");

    defsEl.selectAll("clipPath").remove();

    allSocialNodes.forEach((node) => {
      defsEl.append("clipPath")
        .attr("id", "clip-" + node.id)
        .append("circle")
        .attr("r", node.radius);
    });

    // Anchors for the group-clustering force (computed once per render).
    groupAnchors = computeGroupAnchors();

    // Create force simulation. Center gravity is weak (0.012) so the group
    // force can pull each group's members apart into their own region; the
    // group force keeps the whole graph centered around the anchor circle.
    simulation = d3.forceSimulation(visibleNodes)
      .force("link", d3.forceLink(visibleEdges).id((d) => d.id).distance(FORCE_LINK_DISTANCE))
      .force("charge", d3.forceManyBody().strength(FORCE_CHARGE))
      .force("collide", d3.forceCollide().radius((d) => d.radius + FORCE_COLLIDE_PADDING))
      .force("group", groupClusterForce())
      .force("x", d3.forceX(width / 2).strength(0.012))
      .force("y", d3.forceY(height / 2).strength(0.012))
      .alphaDecay(0.03)
      .velocityDecay(0.4);

    // Render edges
    updateEdges();

    // Render nodes
    updateNodes();

    // Reset tick counter
    tickCount = 0;

    // Simulation tick handler
    simulation.on("tick", onTick);
  };

  const updateEdges = () => {
    const edgeGroupEl = innerGroupEl.select(".edges");

    edgeEls = edgeGroupEl.selectAll("line")
      .data(visibleEdges, (d) => {
        const srcId = typeof d.source === "object" ? d.source.id : d.source;
        const tgtId = typeof d.target === "object" ? d.target.id : d.target;
        return srcId + "--" + tgtId;
      })
      .join(
        (enter) => enter.append("line")
          .attr("stroke", COLOR_EDGE)
          .attr("stroke-width", (d) => d.type !== "group-link" ? 1.5 : 1)
          .attr("opacity", 0)
          .call((sel) => sel.transition()
            .duration(reducedMotion ? 0 : 200)
            .attr("opacity", 1)),
        (update) => update,
        (exit) => exit
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .attr("opacity", 0)
          .remove()
      );
  };

  const updateNodes = () => {
    const nodeGroupEl = innerGroupEl.select(".nodes");

    nodeEls = nodeGroupEl.selectAll("g.node")
      .data(visibleNodes, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append("g")
            .attr("class", "node")
            .attr("role", "button")
            .attr("tabindex", "0")
            .attr("aria-label", (d) => d.name)
            .attr("opacity", 0);

          // For each entering node, add photo or initials fallback + border + label
          g.each(function(d) {
            const nodeG = d3.select(this);
            renderNodeContents(nodeG, d);
          });

          // Fade in
          g.transition()
            .duration(reducedMotion ? 0 : 200)
            .attr("opacity", 1);

          return g;
        },
        (update) => update,
        (exit) => exit
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .attr("opacity", 0)
          .remove()
      );

    // Click handler on nodes
    nodeEls.on("click", (event, d) => {
      event.stopPropagation();
      expandNode(d.id);
    });

    // Keyboard handler for nodes
    nodeEls.on("keydown", (event, d) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        expandNode(d.id);
      }
    });
  };

  // Photos for a node: a household of two people with different photos shows
  // both as side-by-side vertical strips (each cropped to fill, clipped to the
  // circle); a shared photo file dedupes to one and fills the whole circle.
  const nodePhotos = (d) => (d.photos && d.photos.length ? d.photos : (d.photo ? [d.photo] : []));

  const layoutNodePhotos = (g, d, radius, dur) => {
    const photos = nodePhotos(d);
    const stripW = (radius * 2) / photos.length;
    const clip = "url(#clip-" + d.id + ")";

    const sel = g.selectAll("image.node-photo").data(photos, (p, i) => i);
    sel.exit().remove();
    const merged = sel.enter().append("image")
        .attr("class", "node-photo")
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("clip-path", clip)
      .merge(sel);
    merged
      .attr("href", (p) => p)
      .transition().duration(dur)
      .attr("x", (p, i) => -radius + i * stripW)
      .attr("y", -radius)
      .attr("width", stripW)
      .attr("height", radius * 2);

    // Thin dividers between strips (clipped to the circle), so two faces read
    // as two people rather than one merged image.
    g.selectAll("line.photo-divider").remove();
    for (let i = 1; i < photos.length; i++) {
      const x = -radius + i * stripW;
      g.append("line")
        .attr("class", "photo-divider")
        .attr("clip-path", clip)
        .attr("x1", x).attr("y1", -radius)
        .attr("x2", x).attr("y2", radius)
        .attr("stroke", "#FFF8F0")
        .attr("stroke-width", 1.5)
        .attr("pointer-events", "none");
    }
  };

  const renderNodeContents = (g, d) => {
    if (nodePhotos(d).length > 0) {
      layoutNodePhotos(g, d, d.radius, 0);
    } else {
      // Initials fallback
      g.append("circle")
        .attr("class", "node-bg")
        .attr("r", d.radius)
        .attr("fill", "#FFF8F0");
      g.append("text")
        .attr("class", "node-initials")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "14px")
        .attr("font-family", "var(--font-body)")
        .attr("fill", "#6B4F3A")
        .text(d.initials);
    }

    // Border circle
    g.append("circle")
      .attr("class", "node-border")
      .attr("r", d.radius)
      .attr("fill", "none")
      .attr("stroke", d.isCouple ? COLOR_BOTH : COLOR_NODE_DEFAULT)
      .attr("stroke-width", d.isCouple ? 3 : 2);

    // Name label below node
    g.append("text")
      .attr("class", "node-label")
      .attr("dy", d.radius + 16)
      .text(d.name);
  };

  const onTick = () => {
    tickCount++;

    // Update node positions
    if (nodeEls) {
      nodeEls.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
    }

    // Update edge positions
    if (edgeEls) {
      edgeEls
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    }

    // Draw cluster regions (throttled to every 10 ticks for performance)
    if (tickCount % 10 === 0) {
      drawClusterRegions(visibleNodes);
    }
  };

  const drawClusterRegions = (nodes) => {
    const clusterGroupEl = innerGroupEl.select(".cluster-regions");
    clusterGroupEl.selectAll("*").remove();

    const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(1));

    NARSH_GUESTS.GROUPS.forEach((group) => {
      const groupNodes = nodes.filter((n) => n.groups.includes(group.id));
      if (groupNodes.length < 3) return;

      const points = groupNodes.map((n) => [n.x, n.y]);
      const hull = d3.polygonHull(points);
      if (!hull) return;

      const expanded = expandHull(hull, 14);
      const darker = d3.color(group.color).darker(1.2).formatHex();

      // Tiled watermark of the group name, filling the blob as part of its
      // design. It lives in the back layer, so nodes/edges/labels draw on top.
      const patternId = "wm-" + group.id;
      const fontSize = 12;
      const tileW = group.label.length * fontSize * 0.62 + 40;
      const tileH = 26;
      const pattern = clusterGroupEl.append("pattern")
        .attr("id", patternId)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", tileW)
        .attr("height", tileH)
        .attr("patternTransform", "rotate(-22)");
      pattern.append("text")
        .attr("x", 0)
        .attr("y", fontSize)
        .attr("font-family", "var(--font-heading, var(--font-body))")
        .attr("font-size", fontSize + "px")
        .attr("font-weight", "700")
        .attr("letter-spacing", "0.08em")
        .attr("fill", darker)
        .attr("fill-opacity", 0.16)
        .text(group.label);

      // Soft colored blob.
      clusterGroupEl.append("path")
        .attr("d", line(expanded))
        .attr("fill", group.color)
        .attr("fill-opacity", 0.08)
        .attr("stroke", group.color)
        .attr("stroke-opacity", 0.25)
        .attr("stroke-width", 1.5);

      // Watermark text, clipped to the blob by filling the same path.
      clusterGroupEl.append("path")
        .attr("d", line(expanded))
        .attr("fill", "url(#" + patternId + ")")
        .attr("stroke", "none")
        .attr("pointer-events", "none");
    });
  };

  const zoomToNode = (nodeId) => {
    if (!svgEl || !zoomBehavior) return;

    let nodeX, nodeY, nodeRadius;

    if (currentView === "tree") {
      // Find node in tree data
      const treeNode = treeNodeData.find((d) => d.id === nodeId);
      if (!treeNode) return;
      nodeX = treeNode.px;
      nodeY = treeNode.py;
      nodeRadius = treeNode.radius;
    } else {
      // Find node in simulation data
      if (!simulation) return;
      const nodes = simulation.nodes();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      nodeX = node.x;
      nodeY = node.y;
      nodeRadius = node.radius;
    }

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(1.5)
      .translate(-nodeX, -nodeY);

    svgEl.transition()
      .duration(reducedMotion ? 0 : 500)
      .call(zoomBehavior.transform, transform);

    // Pulse animation on target node (scale 1.2x then back to 1.0x)
    if (!reducedMotion) {
      const nodeGroupEl = innerGroupEl.select(".nodes");
      const nodeSelector = currentView === "tree" ? "g.tree-node" : "g.node";
      const targetNodeEl = nodeGroupEl.selectAll(nodeSelector)
        .filter(function() {
          const label = d3.select(this).attr("aria-label");
          const guest = NARSH_GUESTS.getGuestById(nodeId);
          return guest && label === guest.name;
        });

      if (!targetNodeEl.empty()) {
        const borderCircle = targetNodeEl.select(".node-border");

        borderCircle
          .transition()
          .delay(300)
          .duration(150)
          .attr("r", nodeRadius * 1.2)
          .transition()
          .duration(150)
          .attr("r", nodeRadius);

        const bgCircle = targetNodeEl.select(".node-bg");
        if (!bgCircle.empty()) {
          bgCircle
            .transition()
            .delay(300)
            .duration(150)
            .attr("r", nodeRadius * 1.2)
            .transition()
            .duration(150)
            .attr("r", nodeRadius);
        }

        const clipId = currentView === "tree" ? "#clip-tree-" + nodeId : "#clip-" + nodeId;
        const clipCircle = innerGroupEl.select(clipId + " circle");
        if (!clipCircle.empty()) {
          clipCircle
            .transition()
            .delay(300)
            .duration(150)
            .attr("r", nodeRadius * 1.2)
            .transition()
            .duration(150)
            .attr("r", nodeRadius);
        }
      }
    }
  };

  const filterByGroup = (groupIds) => {
    // Collapse any expanded node first
    if (expandedNodeId) {
      collapseNode();
    }

    if (!groupIds || groupIds.length === 0) {
      // Show all nodes
      visibleNodes = allSocialNodes.slice();
    } else {
      // Filter to nodes whose groups include at least one of the active groupIds
      visibleNodes = allSocialNodes.filter((node) => {
        return node.groups.some((g) => groupIds.includes(g));
      });
    }

    // Filter edges: only show where both source and target are visible
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    visibleEdges = allSocialEdges.filter((edge) => {
      const srcId = typeof edge.source === "object" ? edge.source.id : edge.source;
      const tgtId = typeof edge.target === "object" ? edge.target.id : edge.target;
      return visibleNodeIds.has(srcId) && visibleNodeIds.has(tgtId);
    });

    // Re-resolve edge references to the actual node objects in visibleNodes
    const nodeMap = new Map(visibleNodes.map((n) => [n.id, n]));
    visibleEdges = visibleEdges.map((edge) => {
      const srcId = typeof edge.source === "object" ? edge.source.id : edge.source;
      const tgtId = typeof edge.target === "object" ? edge.target.id : edge.target;
      return {
        source: nodeMap.get(srcId) || srcId,
        target: nodeMap.get(tgtId) || tgtId,
        type: edge.type
      };
    });

    // Update simulation with filtered data
    simulation.nodes(visibleNodes);
    simulation.force("link", d3.forceLink(visibleEdges).id((d) => d.id).distance(FORCE_LINK_DISTANCE));
    simulation.alpha(ALPHA_REHEAT).restart();

    // Update D3 selections with enter/exit/update
    updateEdges();
    updateNodes();

    // Redraw cluster regions
    drawClusterRegions(visibleNodes);

    // Reset tick counter for cluster redraw
    tickCount = 0;
  };

  const expandNode = (nodeId) => {
    // If this node is already expanded, do nothing
    if (expandedNodeId === nodeId) return;

    // If another node is expanded, collapse it first
    if (expandedNodeId) {
      collapseNode();
    }

    expandedNodeId = nodeId;
    const nodes = simulation.nodes();
    const expandedNode = nodes.find((n) => n.id === nodeId);
    if (!expandedNode) return;

    // Grow the target node radius
    const targetRadius = expandedNode.isCouple ? EXPANDED_RADIUS_COUPLE : EXPANDED_RADIUS;
    expandedNode.radius = targetRadius;

    // Update collision force: expanded node gets bigger collision
    simulation.force("collide").radius((d) =>
      d.id === nodeId ? targetRadius + 20 : d.baseRadius + FORCE_COLLIDE_PADDING
    );

    // Reheat simulation for re-settle
    simulation.alpha(ALPHA_REHEAT).restart();

    // Update the clipPath circle size
    const clipCircle = innerGroupEl.select("#clip-" + nodeId + " circle");
    if (!clipCircle.empty()) {
      clipCircle.transition()
        .duration(reducedMotion ? 0 : 300)
        .ease(d3.easeQuadOut)
        .attr("r", targetRadius);
    }

    // Update node visual elements
    const nodeGroupEl = innerGroupEl.select(".nodes");
    const targetNodeEl = nodeGroupEl.selectAll("g.node")
      .filter((d) => d.id === nodeId);

    if (!targetNodeEl.empty()) {
      // Re-layout photo strips at the larger radius (if any photos)
      if (nodePhotos(expandedNode).length > 0) {
        layoutNodePhotos(targetNodeEl, expandedNode, targetRadius, reducedMotion ? 0 : 300);
      }

      // Update background circle (if initials)
      targetNodeEl.select(".node-bg")
        .transition()
        .duration(reducedMotion ? 0 : 300)
        .ease(d3.easeQuadOut)
        .attr("r", targetRadius);

      // Update border circle
      targetNodeEl.select(".node-border")
        .transition()
        .duration(reducedMotion ? 0 : 300)
        .ease(d3.easeQuadOut)
        .attr("r", targetRadius);

      // Update label position
      targetNodeEl.select(".node-label")
        .transition()
        .duration(reducedMotion ? 0 : 300)
        .attr("dy", targetRadius + 16);

      // Set aria-expanded
      targetNodeEl.attr("aria-expanded", "true");

      // Raise expanded node to front so detail card renders above everything
      targetNodeEl.raise();
    }

    // Connection highlighting: build set of connected node IDs
    const connectedIds = new Set();
    connectedIds.add(nodeId);

    visibleEdges.forEach((edge) => {
      const srcId = typeof edge.source === "object" ? edge.source.id : edge.source;
      const tgtId = typeof edge.target === "object" ? edge.target.id : edge.target;
      if (srcId === nodeId) connectedIds.add(tgtId);
      if (tgtId === nodeId) connectedIds.add(srcId);
    });

    // Dim non-connected nodes
    nodeGroupEl.selectAll("g.node")
      .transition()
      .duration(reducedMotion ? 0 : 200)
      .attr("opacity", (d) => connectedIds.has(d.id) ? 1 : 0.25);

    // Make connected node labels semibold
    nodeGroupEl.selectAll("g.node")
      .select(".node-label")
      .attr("font-weight", (d) => connectedIds.has(d.id) && d.id !== nodeId ? 700 : "");

    // Dim non-connected edges, highlight connected edges
    const edgeGroupEl = innerGroupEl.select(".edges");
    edgeGroupEl.selectAll("line")
      .transition()
      .duration(reducedMotion ? 0 : 200)
      .attr("stroke", (d) => {
        const srcId = typeof d.source === "object" ? d.source.id : d.source;
        const tgtId = typeof d.target === "object" ? d.target.id : d.target;
        return (srcId === nodeId || tgtId === nodeId) ? COLOR_EDGE_HIGHLIGHT : COLOR_EDGE;
      })
      .attr("stroke-width", (d) => {
        const srcId = typeof d.source === "object" ? d.source.id : d.source;
        const tgtId = typeof d.target === "object" ? d.target.id : d.target;
        return (srcId === nodeId || tgtId === nodeId) ? 2 : (d.type !== "group-link" ? 1.5 : 1);
      })
      .attr("opacity", (d) => {
        const srcId = typeof d.source === "object" ? d.source.id : d.source;
        const tgtId = typeof d.target === "object" ? d.target.id : d.target;
        return (srcId === nodeId || tgtId === nodeId) ? 1 : 0.05;
      });

    // Show edge type labels on highlighted edges
    edgeGroupEl.selectAll("text.edge-label").remove();
    visibleEdges.forEach((edge) => {
      const srcId = typeof edge.source === "object" ? edge.source.id : edge.source;
      const tgtId = typeof edge.target === "object" ? edge.target.id : edge.target;
      if (srcId === nodeId || tgtId === nodeId) {
        const src = typeof edge.source === "object" ? edge.source : nodes.find((n) => n.id === srcId);
        const tgt = typeof edge.target === "object" ? edge.target : nodes.find((n) => n.id === tgtId);
        if (src && tgt && edge.type) {
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          edgeGroupEl.append("text")
            .attr("class", "edge-label")
            .attr("x", midX)
            .attr("y", midY - 6)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-family", "var(--font-body)")
            .attr("fill", "#6B4F3A")
            .attr("pointer-events", "none")
            .text(edge.type);
        }
      }
    });

    // Show detail card on desktop (foreignObject)
    if (window.innerWidth >= 768) {
      showDesktopDetailCard(expandedNode, targetNodeEl);
    }

    // Attach Escape key handler
    escapeHandler = (event) => {
      if (event.key === "Escape") {
        collapseNode();
      }
    };
    document.addEventListener("keydown", escapeHandler);

    // Notify UI module (for mobile bottom sheet)
    if (onNodeExpandCallback) {
      // Look up the original guest data for full details
      const guestData = lookupGuestData(nodeId);
      onNodeExpandCallback(guestData);
    }
  };

  const showDesktopDetailCard = (nodeData, targetNodeEl) => {
    // Look up full guest data
    const guestData = lookupGuestData(nodeData.id);

    // Create foreignObject for inline detail card
    const foWidth = 200;

    const fo = targetNodeEl.append("foreignObject")
      .attr("class", "expanded-detail-fo")
      .attr("x", nodeData.radius + 12)
      .attr("y", -40)
      .attr("width", foWidth)
      .attr("height", 1)
      .attr("overflow", "visible");

    const cardDiv = fo.append("xhtml:div")
      .attr("class", "expanded-detail")
      .style("background", "var(--color-warm-white)")
      .style("border-radius", "var(--radius-md)")
      .style("box-shadow", "var(--shadow-medium)")
      .style("padding", "var(--space-md)")
      .style("max-width", foWidth + "px")
      .style("font-family", "var(--font-body)")
      .style("color", "var(--color-text-primary)");

    // Name
    const nameDiv = cardDiv.append("xhtml:div")
      .style("font-size", "17px")
      .style("font-weight", "600")
      .style("margin-bottom", "var(--space-sm)");
    nameDiv.node().textContent = guestData.name;

    // Groups
    if (guestData.groups && guestData.groups.length > 0) {
      const groupLabels = guestData.groups.map((gId) => {
        const group = NARSH_GUESTS.GROUPS.find((g) => g.id === gId);
        return group ? group.label : gId;
      });
      const groupsDiv = cardDiv.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", "var(--color-text-secondary)")
        .style("margin-bottom", "var(--space-sm)");
      groupsDiv.node().textContent = groupLabels.join(", ");
    }

    // Connection to couple (only if present)
    if (guestData.connectionToCouple) {
      const connLabel = cardDiv.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", "var(--color-text-secondary)")
        .style("font-weight", "600")
        .style("margin-top", "var(--space-sm)");
      connLabel.node().textContent = "How we know them";

      const connValue = cardDiv.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", "var(--color-text-secondary)");
      connValue.node().textContent = guestData.connectionToCouple;
    }

    // Fun fact (only if present)
    if (guestData.funFact) {
      const factLabel = cardDiv.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", "var(--color-text-secondary)")
        .style("font-weight", "600")
        .style("margin-top", "var(--space-sm)");
      factLabel.node().textContent = "Fun fact";

      const factValue = cardDiv.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", "var(--color-text-secondary)");
      factValue.node().textContent = guestData.funFact;
    }
  };

  const lookupGuestData = (nodeId) => {
    // For household nodes, get data from first member
    const node = allSocialNodes.find((n) => n.id === nodeId);
    if (!node) return { id: nodeId, name: "Unknown", groups: [], photo: null, funFact: null, connectionToCouple: null };

    if (node.isHousehold && node.memberIds && node.memberIds.length > 0) {
      const firstMember = NARSH_GUESTS.getGuestById(node.memberIds[0]);
      return {
        id: nodeId,
        name: node.name,
        photo: node.photo,
        groups: node.groups,
        funFact: firstMember ? firstMember.funFact : null,
        connectionToCouple: firstMember ? firstMember.connectionToCouple : null
      };
    }

    const guest = NARSH_GUESTS.getGuestById(nodeId);
    if (guest) {
      return {
        id: nodeId,
        name: guest.name,
        photo: guest.photo,
        groups: guest.groups,
        funFact: guest.funFact,
        connectionToCouple: guest.connectionToCouple
      };
    }

    return { id: nodeId, name: node.name, groups: node.groups, photo: node.photo, funFact: null, connectionToCouple: null };
  };

  const collapseNode = () => {
    if (!expandedNodeId) return;

    const nodes = simulation.nodes();
    const expandedNode = nodes.find((n) => n.id === expandedNodeId);

    if (expandedNode) {
      // Reset radius to original
      expandedNode.radius = expandedNode.baseRadius;

      // Reset collision force
      simulation.force("collide").radius((d) => d.baseRadius + FORCE_COLLIDE_PADDING);

      // Gentle reheat for re-settle
      simulation.alpha(0.1).restart();

      // Reset clipPath circle
      const clipCircle = innerGroupEl.select("#clip-" + expandedNodeId + " circle");
      if (!clipCircle.empty()) {
        clipCircle.transition()
          .duration(reducedMotion ? 0 : 200)
          .ease(d3.easeQuadIn)
          .attr("r", expandedNode.baseRadius);
      }

      // Reset node visual elements
      const nodeGroupEl = innerGroupEl.select(".nodes");
      const targetNodeEl = nodeGroupEl.selectAll("g.node")
        .filter((d) => d.id === expandedNodeId);

      if (!targetNodeEl.empty()) {
        const baseR = expandedNode.baseRadius;

        // Re-layout photo strips back to base radius (if any photos)
        if (nodePhotos(expandedNode).length > 0) {
          layoutNodePhotos(targetNodeEl, expandedNode, baseR, reducedMotion ? 0 : 200);
        }

        targetNodeEl.select(".node-bg")
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .ease(d3.easeQuadIn)
          .attr("r", baseR);

        targetNodeEl.select(".node-border")
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .ease(d3.easeQuadIn)
          .attr("r", baseR);

        targetNodeEl.select(".node-label")
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .attr("dy", baseR + 16);

        // Remove aria-expanded
        targetNodeEl.attr("aria-expanded", null);

        // Remove detail foreignObject
        targetNodeEl.selectAll(".expanded-detail-fo").remove();
      }
    }

    // Restore all node opacities
    const nodeGroupEl = innerGroupEl.select(".nodes");
    nodeGroupEl.selectAll("g.node")
      .transition()
      .duration(reducedMotion ? 0 : 200)
      .attr("opacity", 1);

    // Reset label font weights
    nodeGroupEl.selectAll("g.node")
      .select(".node-label")
      .attr("font-weight", "");

    // Restore all edge opacities and styles
    const edgeGroupEl = innerGroupEl.select(".edges");
    edgeGroupEl.selectAll("line")
      .transition()
      .duration(reducedMotion ? 0 : 200)
      .attr("stroke", COLOR_EDGE)
      .attr("stroke-width", (d) => d.type !== "group-link" ? 1.5 : 1)
      .attr("opacity", 1);

    // Remove edge type labels
    edgeGroupEl.selectAll("text.edge-label").remove();

    // Remove Escape handler
    if (escapeHandler) {
      document.removeEventListener("keydown", escapeHandler);
      escapeHandler = null;
    }

    expandedNodeId = null;

    // Notify UI module
    if (onNodeCollapseCallback) {
      onNodeCollapseCallback();
    }
  };

  const switchView = (view, familyFilter) => {
    if (view === currentView && view !== "tree") return;

    // Collapse any expanded node first
    if (expandedNodeId) {
      collapseNode();
    }

    currentView = view;

    // Store the current zoom transform to preserve across view switches
    const currentTransform = svgEl ? d3.zoomTransform(svgEl.node()) : null;

    if (reducedMotion) {
      // Instant swap: clear and render new view
      clearSvgContent();
      if (view === "social") {
        renderSocialGraph();
      } else {
        currentFamilyFilter = familyFilter || "both";
        renderFamilyTree(currentFamilyFilter);
      }
      // Restore zoom transform
      if (currentTransform && zoomBehavior) {
        svgEl.call(zoomBehavior.transform, currentTransform);
      }
    } else {
      // Crossfade: fade out over 200ms, swap content, fade in over 200ms
      innerGroupEl.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", () => {
          clearSvgContent();
          if (view === "social") {
            renderSocialGraph();
          } else {
            currentFamilyFilter = familyFilter || "both";
            renderFamilyTree(currentFamilyFilter);
          }
          // Restore zoom transform
          if (currentTransform && zoomBehavior) {
            svgEl.call(zoomBehavior.transform, currentTransform);
          }
          innerGroupEl.transition()
            .duration(200)
            .style("opacity", 1);
        });
    }
  };

  const clearSvgContent = () => {
    innerGroupEl.select(".cluster-regions").selectAll("*").remove();
    innerGroupEl.select(".edges").selectAll("*").remove();
    innerGroupEl.select(".nodes").selectAll("*").remove();
    // Remove any tree-specific elements (couple connector, defs for tree clips)
    innerGroupEl.selectAll(".couple-connector").remove();
  };

  const renderFamilyTree = (familyFilter) => {
    // Tree view is statically laid out — stop the force simulation.
    if (simulation) {
      simulation.stop();
    }

    treeNodeData = [];
    const filter = familyFilter || "both";
    const showNatalie = (filter === "both" || filter === "natalie");
    const showArash = (filter === "both" || filter === "arash");

    const edgesGroup = innerGroupEl.select(".edges");
    const nodesGroup = innerGroupEl.select(".nodes");
    const defsEl = innerGroupEl.select("defs").empty()
      ? innerGroupEl.insert("defs", ":first-child")
      : innerGroupEl.select("defs");
    defsEl.selectAll("clipPath").remove();

    const topY = 90;

    // Lay out each side's forest, placed side by side (gold | teal).
    const layouts = [];
    let originX = 0;
    if (showNatalie) {
      const L = layoutSide("natalie", originX, topY);
      layouts.push(L);
      originX += L.width + TREE_SIDE_GAP;
    }
    if (showArash) {
      const L = layoutSide("arash", originX, topY);
      layouts.push(L);
      originX += L.width + TREE_SIDE_GAP;
    }

    const totalWidth = Math.max(0, originX - TREE_SIDE_GAP);
    const centerShift = (width - totalWidth) / 2;

    const posById = new Map();
    const allNodes = [];
    // Person pairs joined only by a layout-only in-law nesting — never parentage.
    const suppressedPairs = new Set();
    layouts.forEach((L) => {
      (L.suppressedPairs || []).forEach((k) => suppressedPairs.add(k));
      L.nodes.forEach((n) => {
        n.px += centerShift;
        allNodes.push(n);
        posById.set(n.id, n);
      });
    });

    // Order the two people in a couple so the one whose own parent sits further
    // left takes the left slot (shortens/uncrosses that parent line). Only fires
    // when BOTH spouses have a parent in the tree (e.g. Shawna+William).
    const firstParentPos = (id) => {
      const g = NARSH_GUESTS.getGuestById(id);
      if (!g) return null;
      for (const p of g.parents) { if (posById.has(p)) return posById.get(p); }
      return null;
    };
    NARSH_GUESTS.MARRIAGES.forEach((m) => {
      const a = posById.get(m.a);
      const b = posById.get(m.b);
      if (!a || !b) return;
      const pa = firstParentPos(m.a);
      const pb = firstParentPos(m.b);
      if (!pa || !pb) return;
      const aShouldBeLeft = pa.px <= pb.px;
      const aIsLeft = a.px <= b.px;
      if (aShouldBeLeft !== aIsLeft) { const t = a.px; a.px = b.px; b.px = t; }
    });

    // Solid lines = true parentage. When both of a child's parents are a married
    // couple, draw ONE line from the midpoint of their dashed marriage line
    // (fewer crossing lines); otherwise draw a line to each known parent.
    const marriedKey = (a, b) => [a, b].sort().join("+");
    const marriedSet = new Set(NARSH_GUESTS.MARRIAGES.map((m) => marriedKey(m.a, m.b)));
    const drawBranch = (x1, y1, x2, y2, side) => {
      edgesGroup.append("path")
        .attr("class", "tree-branch")
        .attr("d", "M" + x1 + "," + y1 + " L" + x2 + "," + y2)
        .attr("stroke", SIDE_COLORS[side] || COLOR_NODE_DEFAULT)
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.65);
    };
    // Belt and braces: today every parentage line comes from `guest.parents`, and
    // nothing at all is drawn from the unit hierarchy, so this guard removes no
    // line that currently appears. It exists because `layoutSide` can nest an
    // in-law lineage under an unrelated ancestor purely for positioning — if
    // anyone later draws links from that hierarchy, this is what stops a false
    // parent/child connector (e.g. Balbir Rai -> Amrit's mom) from appearing.
    // Keep it.
    const isSuppressedPair = (a, b) => suppressedPairs.has([a, b].sort().join("|"));
    allNodes.forEach((n) => {
      const guest = NARSH_GUESTS.getGuestById(n.id);
      if (!guest) return;
      const parentPos = guest.parents
        .map((pid) => posById.get(pid))
        .filter(Boolean)
        .filter((p) => !isSuppressedPair(p.id, n.id));

      // If two of the child's parents are married, drop one line from their midpoint.
      let unionDrawn = false;
      for (let i = 0; i < parentPos.length && !unionDrawn; i++) {
        for (let k = i + 1; k < parentPos.length && !unionDrawn; k++) {
          if (marriedSet.has(marriedKey(parentPos[i].id, parentPos[k].id))) {
            const mx = (parentPos[i].px + parentPos[k].px) / 2;
            const my = (parentPos[i].py + parentPos[k].py) / 2;
            drawBranch(mx, my, n.px, n.py, n.side);
            unionDrawn = true;
          }
        }
      }
      if (!unionDrawn) {
        parentPos.forEach((p) => drawBranch(p.px, p.py, n.px, n.py, n.side));
      }
    });

    // Dashed lines = marriage.
    NARSH_GUESTS.MARRIAGES.forEach((m) => {
      const a = posById.get(m.a);
      const b = posById.get(m.b);
      if (!a || !b) return;
      edgesGroup.append("path")
        .attr("class", "marriage-link")
        .attr("d", "M" + a.px + "," + a.py + " L" + b.px + "," + b.py)
        .attr("stroke", SIDE_COLORS[m.side] || COLOR_BOTH)
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6 4")
        .attr("fill", "none");
    });

    // Dashed connector between the couple when both sides are shown.
    if (showNatalie && showArash) {
      const na = posById.get("natalie");
      const ar = posById.get("arash");
      if (na && ar) {
        edgesGroup.append("path")
          .attr("class", "couple-connector")
          .attr("d", "M" + na.px + "," + na.py + " L" + ar.px + "," + ar.py)
          .attr("stroke", COLOR_BOTH)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "6 4")
          .attr("fill", "none");
      }
    }

    // Render nodes on top of the lines.
    allNodes.forEach((n) => {
      treeNodeData.push({ id: n.id, px: n.px, py: n.py, radius: n.radius, isCouple: n.isCouple });

      defsEl.append("clipPath")
        .attr("id", "clip-tree-" + n.id)
        .append("circle")
        .attr("r", n.radius);

      const g = nodesGroup.append("g")
        .attr("class", "tree-node")
        .attr("role", "button")
        .attr("tabindex", "0")
        .attr("aria-label", n.name)
        .attr("transform", "translate(" + n.px + "," + n.py + ")");

      if (n.photo) {
        g.append("image")
          .attr("href", n.photo)
          .attr("width", n.radius * 2)
          .attr("height", n.radius * 2)
          .attr("x", -n.radius)
          .attr("y", -n.radius)
          .attr("clip-path", "url(#clip-tree-" + n.id + ")");
      } else {
        g.append("circle")
          .attr("class", "node-bg")
          .attr("r", n.radius)
          .attr("fill", "#FFF8F0");
        g.append("text")
          .attr("class", "node-initials")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", "14px")
          .attr("font-family", "var(--font-body)")
          .attr("fill", "#6B4F3A")
          .text(getInitials(n.name));
      }

      g.append("circle")
        .attr("class", "node-border")
        .attr("r", n.radius)
        .attr("fill", "none")
        .attr("stroke", SIDE_COLORS[n.side] || COLOR_NODE_DEFAULT)
        .attr("stroke-width", n.isCouple ? 3 : 2);

      g.append("text")
        .attr("class", "node-label")
        .attr("dy", n.radius + 16)
        .text(n.name);

      g.on("click", (event) => {
        event.stopPropagation();
        expandTreeNode(n.id, g, n.px, n.py, n.radius);
      });

      g.on("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          expandTreeNode(n.id, g, n.px, n.py, n.radius);
        }
      });
    });

    const descEl = document.getElementById("graph-desc");
    if (descEl) {
      descEl.textContent = treeNodeData.length + " family members shown in family tree view";
    }
  };

  // Lay out one family side as a genealogy chart: married pairs are grouped
  // into a single "unit" (two people rendered adjacently, sharing a row), their
  // children hang below the pair, and generations line up across the side.
  // The couple member (Natalie / Arash) is pulled to the inner edge so the two
  // of them end up next to each other. Returns positioned nodes + total width.
  const layoutSide = (side, originX, topY) => {
    const members = NARSH_GUESTS.GUESTS.filter((g) => g.side === side);
    if (!members.length) return { nodes: [], width: 0, suppressedPairs: new Set() };
    const idSet = new Set(members.map((m) => m.id));
    const guestById = (id) => NARSH_GUESTS.getGuestById(id);
    const inSideParents = (id) => guestById(id).parents.filter((p) => idSet.has(p));
    // CSV row order — used so siblings render left-to-right in the order their
    // rows appear in guests.csv (a lever you can reorder to control placement).
    const guestIndex = new Map(NARSH_GUESTS.GUESTS.map((g, i) => [g.id, i]));

    // --- Group members into couple units (union-find over same-side marriages) ---
    const uf = {};
    members.forEach((m) => { uf[m.id] = m.id; });
    const find = (x) => { while (uf[x] !== x) { uf[x] = uf[uf[x]]; x = uf[x]; } return x; };
    NARSH_GUESTS.MARRIAGES.forEach((m) => {
      if (idSet.has(m.a) && idSet.has(m.b)) uf[find(m.a)] = find(m.b);
    });
    const unitMembers = {};
    members.forEach((m) => { const r = find(m.id); (unitMembers[r] = unitMembers[r] || []).push(m.id); });
    const unitOf = {};
    Object.keys(unitMembers).forEach((u) => unitMembers[u].forEach((id) => { unitOf[id] = u; }));

    // --- Blood distance: hops from the couple member over in-side parentage ---
    // Lets the spine follow the bloodline instead of whichever parent happened
    // to be found first, so a married-in branch can never steal the trunk.
    const target = side === "natalie" ? "natalie" : "arash";
    const childrenOfId = {};
    members.forEach((g) => inSideParents(g.id).forEach((p) => {
      (childrenOfId[p] = childrenOfId[p] || []).push(g.id);
    }));
    const bloodDist = new Map();
    if (idSet.has(target)) {
      bloodDist.set(target, 0);
      const bq = [target];
      while (bq.length) {
        const x = bq.shift();
        const d = bloodDist.get(x);
        [...inSideParents(x), ...(childrenOfId[x] || [])].forEach((n) => {
          if (!bloodDist.has(n)) { bloodDist.set(n, d + 1); bq.push(n); }
        });
      }
    }
    const bloodDistOf = (id) => (bloodDist.has(id) ? bloodDist.get(id) : Infinity);

    // --- Primary parent unit per unit (keeps the hierarchy a tree) + roots ---
    // Among every member's in-side parents, take the one whose child is closest
    // to the couple member by blood. Ties (and the no-blood-signal case) fall
    // back to member iteration order, so today's layout is preserved.
    const primaryParentUnit = {};
    Object.keys(unitMembers).forEach((u) => {
      const candidates = [];
      unitMembers[u].forEach((mid) => {
        inSideParents(mid).forEach((p) => {
          if (unitOf[p] && unitOf[p] !== u) candidates.push({ memberId: mid, parentUnit: unitOf[p] });
        });
      });
      if (!candidates.length) { primaryParentUnit[u] = null; return; }
      const ranked = candidates
        .map((c, i) => ({ c: c, i: i }))
        .sort((a, b) => {
          const da = bloodDistOf(a.c.memberId);
          const db = bloodDistOf(b.c.memberId);
          if (da !== db) return da < db ? -1 : 1;
          return a.i - b.i;
        });
      primaryParentUnit[u] = ranked[0].c.parentUnit;
    });
    const childUnits = {};
    Object.keys(unitMembers).forEach((u) => { childUnits[u] = []; });
    Object.keys(unitMembers).forEach((u) => {
      if (primaryParentUnit[u]) childUnits[primaryParentUnit[u]].push(u);
    });
    const rootUnits = Object.keys(unitMembers).filter((u) => !primaryParentUnit[u]);
    const rootAncestor = (u) => { let c = u, g = 0; while (primaryParentUnit[c] && g++ < 1000) c = primaryParentUnit[c]; return c; };

    // --- Which units lead to the couple member? (for edge-pulling) ---
    const toInnerEnd = side === "natalie"; // Natalie -> right edge; Arash -> left edge
    const containsTarget = {};
    const dfsContains = (u) => {
      if (u in containsTarget) return containsTarget[u];
      containsTarget[u] = false; // guard against cycles
      let has = unitMembers[u].includes(target);
      childUnits[u].forEach((c) => { if (dfsContains(c)) has = true; });
      containsTarget[u] = has;
      return has;
    };
    Object.keys(unitMembers).forEach(dfsContains);

    // Sort siblings left-to-right by CSV row order (of the bloodline child in
    // each unit), then pull the couple's branch to the inner edge.
    const unitSortKey = (u) => {
      const bloodline = unitMembers[u].filter((mid) => inSideParents(mid).some((p) => unitOf[p] && unitOf[p] !== u));
      const pool = bloodline.length ? bloodline : unitMembers[u];
      return Math.min.apply(null, pool.map((id) => (guestIndex.has(id) ? guestIndex.get(id) : 1e9)));
    };
    Object.keys(childUnits).forEach((u) => { childUnits[u].sort((a, b) => unitSortKey(a) - unitSortKey(b)); });

    const orderEdge = (arr) => {
      const others = arr.filter((c) => !containsTarget[c]);
      const tgt = arr.filter((c) => containsTarget[c]);
      return toInnerEnd ? [...others, ...tgt] : [...tgt, ...others];
    };
    Object.keys(childUnits).forEach((u) => { childUnits[u] = orderEdge(childUnits[u]); });

    // --- Nest parentless sibling root units under one unrendered virtual node ---
    // A sibling set whose members have no parents anywhere in the data would
    // otherwise render as several disconnected lineages spread across the row.
    // Hanging them off a virtual (never-drawn) node makes them one contiguous
    // block and drops the side's root-lineage count.
    const siblingGroups = (NARSH_GUESTS.SIBLING_GROUPS || []);
    const virtualChildren = {};
    const virtualOfUnit = {};
    siblingGroups.forEach((group, gi) => {
      const groupRoots = [];
      group.forEach((mid) => {
        if (!idSet.has(mid) || inSideParents(mid).length) return;
        const u = unitOf[mid];
        if (!u || primaryParentUnit[u] || virtualOfUnit[u]) return;
        if (groupRoots.indexOf(u) < 0) groupRoots.push(u);
      });
      if (groupRoots.length < 2) return;
      const vid = "__sibgroup-" + gi;
      groupRoots.sort((a, b) => unitSortKey(a) - unitSortKey(b));
      virtualChildren[vid] = orderEdge(groupRoots);
      groupRoots.forEach((u) => { virtualOfUnit[u] = vid; });
    });
    const isVirtual = (u) => !unitMembers[u];
    const childrenOfNode = (u) => (isVirtual(u) ? virtualChildren[u] : childUnits[u]);
    const nodeContainsTarget = (u) => (isVirtual(u)
      ? virtualChildren[u].some((c) => containsTarget[c])
      : containsTarget[u]);
    // Top-level lineages: grouped roots collapse into their virtual node, in place.
    const topRoots = [];
    rootUnits.forEach((u) => {
      const vid = virtualOfUnit[u];
      if (!vid) { topRoots.push(u); return; }
      if (topRoots.indexOf(vid) < 0) topRoots.push(vid);
    });
    const topAncestor = (u) => { const r = rootAncestor(u); return virtualOfUnit[r] || r; };

    // --- Generation depth + owning top-level node, per real unit ---
    // A virtual sibling-group node is seeded at depth -1 and a real top node at
    // depth 0, mirroring the `yShift` the render loop applies below. That way a
    // real root hanging off a virtual node still reads depth 0, and a depth here
    // always means the same rendered generation row across the whole side.
    const WALK_STEP_CAP = 1000;
    const unitDepth = {};
    const unitTop = {};
    const recomputeDepths = () => {
      Object.keys(unitDepth).forEach((u) => { delete unitDepth[u]; });
      Object.keys(unitTop).forEach((u) => { delete unitTop[u]; });
      topRoots.forEach((r) => {
        const stack = [{ u: r, d: isVirtual(r) ? -1 : 0 }];
        let steps = 0;
        while (stack.length && steps++ < WALK_STEP_CAP) {
          const cur = stack.pop();
          if (!isVirtual(cur.u)) { unitDepth[cur.u] = cur.d; unitTop[cur.u] = r; }
          childrenOfNode(cur.u).forEach((c) => stack.push({ u: c, d: cur.d + 1 }));
        }
      });
    };
    recomputeDepths();

    // --- Nest an in-law root lineage inside the tree it married into ---
    // Someone's parents can be a whole separate parentless lineage (e.g. Amrit's
    // mom + dad) that only touches the family through their child, who lives in
    // another tree because of their own marriage. That lineage would otherwise
    // render as a disconnected top-level tree parked beside the family. Hang it
    // off the right ancestor instead, at the generation the link implies:
    //   d = d_child - 1 - d_parent   (the child's would-be row in the in-law tree)
    // This is LAYOUT ONLY — see `layoutOnlyLinks` / `suppressedPairs` below; no
    // parentage line is ever drawn for the hierarchy edge it creates.
    const attachCandidates = [];
    members.forEach((g) => inSideParents(g.id).forEach((p) => {
      const uC = unitOf[g.id];
      const uP = unitOf[p];
      if (!uC || !uP || uC === uP) return;
      const R = unitTop[uP];
      const T = unitTop[uC];
      if (!R || !T || R === T) return;
      // The bloodline lineage is the spine — it never gets nested inside another
      // tree. Skipping it also keeps `containsTarget` valid without recomputing.
      if (nodeContainsTarget(R)) return;
      // A virtual sibling-group node only ever works as a TOP node: the render
      // loop's yShift is keyed on the top node being virtual, so nesting one
      // would drop all of its children a generation. Silent internal limit.
      if (isVirtual(R)) return;
      attachCandidates.push({
        R: R,
        T: T,
        d: unitDepth[uC] - 1 - unitDepth[uP],
        anchorFrom: uC,
        viaParent: p,
        viaChild: g.id,
        order: guestIndex.has(g.id) ? guestIndex.get(g.id) : 1e9
      });
    }));

    // One attachment per root, picked deterministically: shallowest link first,
    // ties broken by CSV row order so the result never depends on object order.
    const unitLabel = (u) => (isVirtual(u)
      ? virtualChildren[u].map(unitLabel).join(" / ")
      : unitMembers[u].map((mid) => { const g = guestById(mid); return g ? g.name : mid; }).join(" + "));
    const candidatesByRoot = {};
    attachCandidates.forEach((c) => { (candidatesByRoot[c.R] = candidatesByRoot[c.R] || []).push(c); });
    const layoutOnlyLinks = [];
    const fallbackCandidates = [];
    Object.keys(candidatesByRoot).forEach((R) => {
      const group = candidatesByRoot[R].slice().sort((a, b) => (a.d !== b.d ? a.d - b.d : a.order - b.order));
      const chosen = group[0];
      if (group.length > 1) {
        const parentG = guestById(chosen.viaParent);
        const childG = guestById(chosen.viaChild);
        console.info("Family tree: \"" + unitLabel(R) + "\" had " + group.length
          + " possible places to nest; used the link from \"" + (parentG ? parentG.name : chosen.viaParent)
          + "\" to \"" + (childG ? childG.name : chosen.viaChild) + "\".");
      }
      // d < 1 means there is no ancestor row to hang off — handled by the
      // guarded top-level reorder further down instead.
      if (chosen.d < 1) { fallbackCandidates.push(chosen); return; }

      // Anchor = the ancestor of the linking child that sits one row above `d`.
      let anchor = chosen.anchorFrom;
      let up = 0;
      while (anchor && unitDepth[anchor] > chosen.d - 1 && up++ < WALK_STEP_CAP) {
        anchor = primaryParentUnit[anchor];
      }
      if (!anchor || unitDepth[anchor] !== chosen.d - 1) return; // ran out or overshot

      // Cycle guard: R must not already be an ancestor of the anchor.
      let probe = anchor;
      let steps = 0;
      let cyclic = false;
      while (probe && steps++ < WALK_STEP_CAP) {
        if (probe === R) { cyclic = true; break; }
        probe = primaryParentUnit[probe];
      }
      if (cyclic) return;

      primaryParentUnit[R] = anchor;
      childUnits[anchor].push(R);
      childUnits[anchor].sort((a, b) => unitSortKey(a) - unitSortKey(b));
      childUnits[anchor] = orderEdge(childUnits[anchor]);
      layoutOnlyLinks.push({ parentUnit: anchor, childUnit: R });
    });

    if (layoutOnlyLinks.length) {
      rootUnits.splice(0, rootUnits.length);
      Object.keys(unitMembers).forEach((u) => { if (!primaryParentUnit[u]) rootUnits.push(u); });
      topRoots.splice(0, topRoots.length);
      rootUnits.forEach((u) => {
        const vid = virtualOfUnit[u];
        if (!vid) { topRoots.push(u); return; }
        if (topRoots.indexOf(vid) < 0) topRoots.push(vid);
      });
      recomputeDepths();
    }

    // --- Order roots: cluster the target root's connected lineages next to it ---
    const radj = {};
    topRoots.forEach((r) => { radj[r] = new Set(); });
    members.forEach((g) => inSideParents(g.id).forEach((p) => {
      const ra = topAncestor(unitOf[g.id]);
      const rb = topAncestor(unitOf[p]);
      if (ra !== rb && radj[ra] && radj[rb]) { radj[ra].add(rb); radj[rb].add(ra); }
    }));
    const targetRoot = topRoots.find((r) => nodeContainsTarget(r));
    const comp = [];
    const seen = new Set();
    if (targetRoot) {
      const st = [targetRoot];
      while (st.length) {
        const x = st.pop();
        if (seen.has(x)) continue;
        seen.add(x);
        comp.push(x);
        [...radj[x]].forEach((n) => { if (!seen.has(n)) st.push(n); });
      }
    }
    const rest = topRoots.filter((r) => !seen.has(r));
    // Natalie: isolated roots on the left, target lineage on the right (target last).
    // Arash: target lineage on the left (target first), isolated roots on the right.
    const orderedRoots = toInnerEnd ? [...rest, ...comp.reverse()] : [...comp, ...rest];

    // Fallback for an in-law root that could not nest (d < 1 — the link points at
    // the very top row, so there is no ancestor to hang off). Park it immediately
    // to the right of the tree it married into instead. GUARDED: the move is
    // rejected if it would change which lineage occupies the inner-edge terminal
    // slot, because that slot is what keeps Natalie and Arash adjacent.
    const innerTerminal = (arr) => (toInnerEnd ? arr[arr.length - 1] : arr[0]);
    fallbackCandidates.forEach((c) => {
      if (c.R === c.T) return;
      if (orderedRoots.indexOf(c.R) < 0 || orderedRoots.indexOf(c.T) < 0) return;
      const without = orderedRoots.filter((x) => x !== c.R);
      const at = without.indexOf(c.T);
      if (at < 0) return;
      const moved = [...without.slice(0, at + 1), c.R, ...without.slice(at + 1)];
      if (innerTerminal(moved) !== innerTerminal(orderedRoots)) return;
      orderedRoots.splice(0, orderedRoots.length, ...moved);
    });

    // The layout-only hierarchy edges, expanded to every person pair they span.
    // renderFamilyTree consults this before drawing a parentage line so a nested
    // in-law lineage can never sprout a false parent/child connector.
    const suppressedPairs = new Set();
    layoutOnlyLinks.forEach((l) => {
      unitMembers[l.parentUnit].forEach((a) => unitMembers[l.childUnit].forEach((b) => {
        suppressedPairs.add([a, b].sort().join("|"));
      }));
    });

    // --- Lay out unit hierarchy with d3.tree; expand each unit to its people ---
    const nodes = [];
    let cursorX = originX;
    orderedRoots.forEach((rootU) => {
      const hierData = (function build(u) {
        return { u: u, children: childrenOfNode(u).map(build) };
      })(rootU);
      const root = d3.hierarchy(hierData);
      d3.tree().nodeSize([TREE_H_SPACING, TREE_V_SPACING])(root);

      // A virtual root occupies y=0 and pushes real people down one generation;
      // pull the whole subtree back up so generations stay aligned side-wide.
      const yShift = isVirtual(rootU) ? -TREE_V_SPACING : 0;

      let minX = Infinity;
      let maxX = -Infinity;
      root.each((d) => { if (d.x < minX) minX = d.x; if (d.x > maxX) maxX = d.x; });
      const shift = cursorX - (minX - TREE_MEMBER_OFFSET);

      root.each((d) => {
        const mem = unitMembers[d.data.u];
        if (!mem) return; // virtual grouping node — never drawn
        const ux = d.x + shift;
        const uy = topY + d.y + yShift;
        mem.forEach((mid, i) => {
          const guest = guestById(mid);
          const isCouple = guest ? guest.isCouple : false;
          const mx = mem.length === 1 ? ux : (i === 0 ? ux - TREE_MEMBER_OFFSET : ux + TREE_MEMBER_OFFSET);
          nodes.push({
            id: mid,
            name: guest ? guest.name : mid,
            photo: guest ? guest.photo : null,
            isCouple: isCouple,
            side: side,
            px: mx,
            py: uy,
            radius: isCouple ? NODE_RADIUS_TREE_COUPLE : NODE_RADIUS_TREE
          });
        });
      });

      cursorX = shift + maxX + TREE_MEMBER_OFFSET + TREE_ROOT_GAP;
    });

    return { nodes: nodes, width: cursorX - originX, suppressedPairs: suppressedPairs };
  };

  const expandTreeNode = (nodeId, nodeEl, px, py, radius) => {
    // If this node is already expanded, do nothing
    if (expandedNodeId === nodeId) return;

    // If another node is expanded, collapse it first
    if (expandedNodeId) {
      collapseTreeNode();
    }

    expandedNodeId = nodeId;

    // Set aria-expanded
    nodeEl.attr("aria-expanded", "true");

    // Attach Escape key handler
    escapeHandler = (event) => {
      if (event.key === "Escape") {
        collapseTreeNode();
      }
    };
    document.addEventListener("keydown", escapeHandler);

    // Raise expanded tree node to front so detail card renders above everything
    nodeEl.raise();

    // Show detail card on desktop (below the node)
    if (window.innerWidth >= 768) {
      const guestData = lookupTreeGuestData(nodeId);
      const foWidth = 200;

      const fo = nodeEl.append("foreignObject")
        .attr("class", "expanded-detail-fo")
        .attr("x", -foWidth / 2)
        .attr("y", radius + 20)
        .attr("width", foWidth)
        .attr("height", 1)
        .attr("overflow", "visible");

      const cardDiv = fo.append("xhtml:div")
        .attr("class", "expanded-detail")
        .style("background", "var(--color-warm-white)")
        .style("border-radius", "var(--radius-md)")
        .style("box-shadow", "var(--shadow-medium)")
        .style("padding", "var(--space-md)")
        .style("max-width", foWidth + "px")
        .style("font-family", "var(--font-body)")
        .style("color", "var(--color-text-primary)");

      // Name
      const nameDiv = cardDiv.append("xhtml:div")
        .style("font-size", "17px")
        .style("font-weight", "600")
        .style("margin-bottom", "var(--space-sm)");
      nameDiv.node().textContent = guestData.name;

      // Groups
      if (guestData.groups && guestData.groups.length > 0) {
        const groupLabels = guestData.groups.map((gId) => {
          const group = NARSH_GUESTS.GROUPS.find((g) => g.id === gId);
          return group ? group.label : gId;
        });
        const groupsDiv = cardDiv.append("xhtml:div")
          .style("font-size", "14px")
          .style("color", "var(--color-text-secondary)")
          .style("margin-bottom", "var(--space-sm)");
        groupsDiv.node().textContent = groupLabels.join(", ");
      }

      // Connection to couple
      if (guestData.connectionToCouple) {
        const connLabel = cardDiv.append("xhtml:div")
          .style("font-size", "14px")
          .style("color", "var(--color-text-secondary)")
          .style("font-weight", "600")
          .style("margin-top", "var(--space-sm)");
        connLabel.node().textContent = "How we know them";

        const connValue = cardDiv.append("xhtml:div")
          .style("font-size", "14px")
          .style("color", "var(--color-text-secondary)");
        connValue.node().textContent = guestData.connectionToCouple;
      }

      // Fun fact
      if (guestData.funFact) {
        const factLabel = cardDiv.append("xhtml:div")
          .style("font-size", "14px")
          .style("color", "var(--color-text-secondary)")
          .style("font-weight", "600")
          .style("margin-top", "var(--space-sm)");
        factLabel.node().textContent = "Fun fact";

        const factValue = cardDiv.append("xhtml:div")
          .style("font-size", "14px")
          .style("color", "var(--color-text-secondary)");
        factValue.node().textContent = guestData.funFact;
      }
    }

    // Notify UI module for mobile bottom sheet
    if (onNodeExpandCallback) {
      const guestData = lookupTreeGuestData(nodeId);
      onNodeExpandCallback(guestData);
    }
  };

  const collapseTreeNode = () => {
    if (!expandedNodeId) return;

    // Remove detail cards
    const nodesGroup = innerGroupEl.select(".nodes");
    nodesGroup.selectAll(".expanded-detail-fo").remove();

    // Reset aria-expanded on all tree nodes
    nodesGroup.selectAll(".tree-node")
      .attr("aria-expanded", null);

    // Remove Escape handler
    if (escapeHandler) {
      document.removeEventListener("keydown", escapeHandler);
      escapeHandler = null;
    }

    expandedNodeId = null;

    // Notify UI module
    if (onNodeCollapseCallback) {
      onNodeCollapseCallback();
    }
  };

  const lookupTreeGuestData = (nodeId) => {
    const guest = NARSH_GUESTS.getGuestById(nodeId);
    if (guest) {
      return {
        id: nodeId,
        name: guest.name,
        photo: guest.photo,
        groups: guest.groups,
        funFact: guest.funFact,
        connectionToCouple: guest.connectionToCouple
      };
    }
    return { id: nodeId, name: "Unknown", groups: [], photo: null, funFact: null, connectionToCouple: null };
  };

  const filterFamilyTree = (family) => {
    // Collapse any expanded node first
    if (expandedNodeId) {
      collapseTreeNode();
    }

    currentFamilyFilter = family || "both";

    // Clear tree content and re-render
    clearSvgContent();
    renderFamilyTree(currentFamilyFilter);
  };

  return {
    init,
    switchView,
    filterByGroup,
    filterFamilyTree,
    zoomToNode,
    expandNode,
    collapseNode,
    getSimulation: () => simulation,
    getCurrentView: () => currentView,
    set onNodeExpand(cb) { onNodeExpandCallback = cb; },
    set onNodeCollapse(cb) { onNodeCollapseCallback = cb; }
  };
})();
