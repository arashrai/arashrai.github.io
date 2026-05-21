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

  const COLOR_ARASH = "#2A9D8F";
  const COLOR_NATALIE = "#D4A843";
  const COLOR_BOTH = "#C2704F";
  const COLOR_NODE_DEFAULT = "#C9928E";
  const COLOR_EDGE = "rgba(61, 43, 31, 0.15)";
  const COLOR_EDGE_HIGHLIGHT = "rgba(61, 43, 31, 0.5)";

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

    // Create force simulation
    simulation = d3.forceSimulation(visibleNodes)
      .force("link", d3.forceLink(visibleEdges).id((d) => d.id).distance(FORCE_LINK_DISTANCE))
      .force("charge", d3.forceManyBody().strength(FORCE_CHARGE))
      .force("collide", d3.forceCollide().radius((d) => d.radius + FORCE_COLLIDE_PADDING))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
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

  const renderNodeContents = (g, d) => {
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

    NARSH_GUESTS.GROUPS.forEach((group) => {
      const groupNodes = nodes.filter((n) => n.groups.includes(group.id));
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
      // Update image size (if photo)
      targetNodeEl.select("image")
        .transition()
        .duration(reducedMotion ? 0 : 300)
        .ease(d3.easeQuadOut)
        .attr("width", targetRadius * 2)
        .attr("height", targetRadius * 2)
        .attr("x", -targetRadius)
        .attr("y", -targetRadius);

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
    const foHeight = 180;

    const fo = targetNodeEl.append("foreignObject")
      .attr("class", "expanded-detail-fo")
      .attr("x", nodeData.radius + 12)
      .attr("y", -foHeight / 2)
      .attr("width", foWidth)
      .attr("height", foHeight);

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

        targetNodeEl.select("image")
          .transition()
          .duration(reducedMotion ? 0 : 200)
          .ease(d3.easeQuadIn)
          .attr("width", baseR * 2)
          .attr("height", baseR * 2)
          .attr("x", -baseR)
          .attr("y", -baseR);

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
    // Stop and clear the force simulation
    if (simulation) {
      simulation.stop();
    }

    treeNodeData = [];
    const filter = familyFilter || "both";

    const natalieTreeData = NARSH_GUESTS.FAMILY_TREES.natalie;
    const arashTreeData = NARSH_GUESTS.FAMILY_TREES.arash;

    const natalieRoot = d3.hierarchy(natalieTreeData);
    const arashRoot = d3.hierarchy(arashTreeData);

    const treeLayout = d3.tree().nodeSize([100, 140]);
    treeLayout(natalieRoot);
    treeLayout(arashRoot);

    // Determine which trees to render based on filter
    const showNatalie = (filter === "both" || filter === "natalie");
    const showArash = (filter === "both" || filter === "arash");

    // Calculate offsets for side-by-side layout
    let natalieOffsetX = 0;
    let arashOffsetX = 0;
    let totalWidth = 0;

    if (showNatalie && showArash) {
      // Compute natalie tree width
      const natalieXValues = [];
      natalieRoot.each((d) => natalieXValues.push(d.x));
      const natalieMinX = Math.min.apply(null, natalieXValues);
      const natalieMaxX = Math.max.apply(null, natalieXValues);
      const natalieWidth = natalieMaxX - natalieMinX;

      // Offset natalie to start from 0
      natalieOffsetX = -natalieMinX;

      // Compute arash tree width
      const arashXValues = [];
      arashRoot.each((d) => arashXValues.push(d.x));
      const arashMinX = Math.min.apply(null, arashXValues);

      // Arash tree starts after natalie tree + 120px gap
      arashOffsetX = natalieWidth + 120 - arashMinX;

      // Compute total width for centering
      const arashMaxX = Math.max.apply(null, arashXValues);
      totalWidth = (natalieWidth) + 120 + (arashMaxX - arashMinX);
    } else if (showNatalie) {
      const natalieXValues = [];
      natalieRoot.each((d) => natalieXValues.push(d.x));
      const natalieMinX = Math.min.apply(null, natalieXValues);
      natalieOffsetX = -natalieMinX;
      totalWidth = Math.max.apply(null, natalieXValues) - natalieMinX;
    } else if (showArash) {
      const arashXValues = [];
      arashRoot.each((d) => arashXValues.push(d.x));
      const arashMinX = Math.min.apply(null, arashXValues);
      arashOffsetX = -arashMinX;
      totalWidth = Math.max.apply(null, arashXValues) - arashMinX;
    }

    // Center the tree(s) in the viewport
    const centerOffsetX = (width - totalWidth) / 2;
    const centerOffsetY = 80; // top padding for tree

    const edgesGroup = innerGroupEl.select(".edges");
    const nodesGroup = innerGroupEl.select(".nodes");

    // Ensure defs exist for tree clip paths
    const defsEl = innerGroupEl.select("defs").empty()
      ? innerGroupEl.insert("defs", ":first-child")
      : innerGroupEl.select("defs");
    defsEl.selectAll("clipPath").remove();

    // Draw tree branches and nodes for each family
    if (showNatalie) {
      drawTreeBranches(natalieRoot, natalieOffsetX + centerOffsetX, centerOffsetY, COLOR_NATALIE, edgesGroup);
      drawTreeNodes(natalieRoot, natalieOffsetX + centerOffsetX, centerOffsetY, nodesGroup, defsEl);
    }

    if (showArash) {
      drawTreeBranches(arashRoot, arashOffsetX + centerOffsetX, centerOffsetY, COLOR_ARASH, edgesGroup);
      drawTreeNodes(arashRoot, arashOffsetX + centerOffsetX, centerOffsetY, nodesGroup, defsEl);
    }

    // Draw couple connector line when showing both families
    if (showNatalie && showArash) {
      // Find Natalie and Arash nodes in the rendered tree data
      const natalieNode = treeNodeData.find((d) => d.id === "natalie");
      const arashNode = treeNodeData.find((d) => d.id === "arash");

      if (natalieNode && arashNode) {
        edgesGroup.append("path")
          .attr("class", "couple-connector")
          .attr("d", "M" + natalieNode.px + "," + natalieNode.py + " L" + arashNode.px + "," + arashNode.py)
          .attr("stroke", COLOR_BOTH)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "6 4")
          .attr("fill", "none");
      }
    }

    // Update accessibility description
    const descEl = document.getElementById("graph-desc");
    if (descEl) {
      descEl.textContent = treeNodeData.length + " family members shown in family tree view";
    }
  };

  const drawTreeBranches = (root, offsetX, offsetY, color, edgesGroup) => {
    const linkGenerator = d3.linkVertical()
      .x((d) => d.x + offsetX)
      .y((d) => d.y + offsetY);

    root.links().forEach((link) => {
      edgesGroup.append("path")
        .attr("class", "tree-branch")
        .attr("d", linkGenerator(link))
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-linecap", "round");
    });
  };

  const drawTreeNodes = (root, offsetX, offsetY, nodesGroup, defsEl) => {
    root.each((d) => {
      const guest = NARSH_GUESTS.getGuestById(d.data.id);
      const isCouple = guest ? guest.isCouple : false;
      const radius = isCouple ? NODE_RADIUS_TREE_COUPLE : NODE_RADIUS_TREE;
      const px = d.x + offsetX;
      const py = d.y + offsetY;

      // Track for zoomToNode
      treeNodeData.push({
        id: d.data.id,
        px: px,
        py: py,
        radius: radius,
        isCouple: isCouple
      });

      // Create clip path for this tree node
      defsEl.append("clipPath")
        .attr("id", "clip-tree-" + d.data.id)
        .append("circle")
        .attr("r", radius);

      const g = nodesGroup.append("g")
        .attr("class", "tree-node")
        .attr("role", "button")
        .attr("tabindex", "0")
        .attr("aria-label", d.data.name)
        .attr("transform", "translate(" + px + "," + py + ")");

      // Photo or initials fallback
      if (guest && guest.photo) {
        g.append("image")
          .attr("href", guest.photo)
          .attr("width", radius * 2)
          .attr("height", radius * 2)
          .attr("x", -radius)
          .attr("y", -radius)
          .attr("clip-path", "url(#clip-tree-" + d.data.id + ")");
      } else {
        g.append("circle")
          .attr("class", "node-bg")
          .attr("r", radius)
          .attr("fill", "#FFF8F0");
        g.append("text")
          .attr("class", "node-initials")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", "14px")
          .attr("font-family", "var(--font-body)")
          .attr("fill", "#6B4F3A")
          .text(getInitials(d.data.name));
      }

      // Border circle
      g.append("circle")
        .attr("class", "node-border")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", isCouple ? COLOR_BOTH : COLOR_NODE_DEFAULT)
        .attr("stroke-width", isCouple ? 3 : 2);

      // Name label (always visible in tree view per D-16)
      g.append("text")
        .attr("class", "node-label")
        .attr("dy", radius + 16)
        .text(d.data.name);

      // Click handler for expand-in-place
      g.on("click", (event) => {
        event.stopPropagation();
        expandTreeNode(d.data.id, g, px, py, radius);
      });

      // Keyboard handler
      g.on("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          expandTreeNode(d.data.id, g, px, py, radius);
        }
      });
    });
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

    // Show detail card on desktop (below the node)
    if (window.innerWidth >= 768) {
      const guestData = lookupTreeGuestData(nodeId);
      const foWidth = 200;
      const foHeight = 180;

      const fo = nodeEl.append("foreignObject")
        .attr("class", "expanded-detail-fo")
        .attr("x", -foWidth / 2)
        .attr("y", radius + 20)
        .attr("width", foWidth)
        .attr("height", foHeight);

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
