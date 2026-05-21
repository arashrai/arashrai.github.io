// Narsh 2026 — Graph UI Module
// Search bar, view toggle, filter button wiring, family tree filter
// buttons, and expand/collapse bottom sheet for the Our People page.

const NARSH_GRAPH_UI = (() => {
  "use strict";

  let searchInputEl = null;
  let filterBarEl = null;
  let viewToggleEl = null;
  let searchAnnounceEl = null;
  let activeFilters = [];
  let currentView = "social";
  let activeFamilyFilter = "both";
  let debounceTimer = null;
  let bottomSheetEl = null;
  let previousFocusEl = null;

  const init = () => {
    searchInputEl = document.getElementById("graph-search");
    filterBarEl = document.getElementById("filter-bar");
    viewToggleEl = document.getElementById("view-toggle");
    searchAnnounceEl = document.getElementById("search-announce");
    bottomSheetEl = document.getElementById("bottom-sheet");

    // Render filter buttons from NARSH_GUESTS.GROUPS
    if (filterBarEl) {
      renderGroupFilterButtons();
    }

    // Search input listener with 300ms debounce
    if (searchInputEl) {
      searchInputEl.addEventListener("input", () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleSearch, 300);
      });
    }

    // View toggle click listeners
    if (viewToggleEl) {
      const viewBtns = viewToggleEl.querySelectorAll(".view-btn");
      viewBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = btn.getAttribute("data-view");
          handleViewSwitch(view);
        });
      });
    }

    // Filter button click listeners (delegated)
    if (filterBarEl) {
      filterBarEl.addEventListener("click", (event) => {
        const btn = event.target.closest(".filter-btn");
        if (!btn) return;

        if (currentView === "tree") {
          handleFamilyFilterClick(btn);
        } else {
          handleFilterClick(btn);
        }
      });
    }

    // Register expand/collapse callbacks with graph module
    NARSH_GRAPH.onNodeExpand = onNodeExpand;
    NARSH_GRAPH.onNodeCollapse = onNodeCollapse;

    // Bottom sheet event wiring
    initBottomSheetEvents();
  };

  const handleViewSwitch = (view) => {
    if (view === currentView) return;

    currentView = view;

    // Update toggle button states
    if (viewToggleEl) {
      const viewBtns = viewToggleEl.querySelectorAll(".view-btn");
      viewBtns.forEach((btn) => {
        const btnView = btn.getAttribute("data-view");
        if (btnView === view) {
          btn.classList.add("active");
          btn.setAttribute("aria-checked", "true");
        } else {
          btn.classList.remove("active");
          btn.setAttribute("aria-checked", "false");
        }
      });
    }

    // Swap filter bar contents
    if (filterBarEl) {
      filterBarEl.textContent = "";
      if (view === "tree") {
        renderFamilyFilterButtons();
      } else {
        renderGroupFilterButtons();
      }
    }

    // Call graph module to switch view
    if (view === "tree") {
      NARSH_GRAPH.switchView("tree", activeFamilyFilter);
    } else {
      // Reset group filters when switching back to social
      activeFilters = [];
      NARSH_GRAPH.switchView("social");
    }
  };

  const handleSearch = () => {
    const query = searchInputEl.value.trim();

    if (!query) {
      // Clear search state
      if (searchAnnounceEl) {
        searchAnnounceEl.textContent = "";
      }
      return;
    }

    const results = NARSH_GUESTS.searchGuests(query);

    if (results.length > 0) {
      NARSH_GRAPH.zoomToNode(results[0].id);
      if (searchAnnounceEl) {
        searchAnnounceEl.textContent = results.length + " guest(s) found";
      }
    } else {
      if (searchAnnounceEl) {
        searchAnnounceEl.textContent = "No guests found for \"" + query + "\". Try a different name.";
      }
    }
  };

  const handleFilterClick = (btn) => {
    const group = btn.getAttribute("data-group");

    if (group === "all") {
      // "All" deselects all specific groups
      activeFilters = [];
      const allBtns = filterBarEl.querySelectorAll(".filter-btn");
      allBtns.forEach((b) => {
        if (b.getAttribute("data-group") === "all") {
          b.classList.add("active");
          b.setAttribute("aria-pressed", "true");
        } else {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        }
      });
    } else {
      // Specific group: toggle its state
      const isActive = btn.classList.contains("active");

      if (isActive) {
        // Deactivate this group
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
        activeFilters = activeFilters.filter((f) => f !== group);
      } else {
        // Activate this group
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        activeFilters.push(group);
      }

      // Manage "All" button state
      const allBtn = filterBarEl.querySelector("[data-group='all']");
      if (allBtn) {
        if (activeFilters.length === 0) {
          // No specific groups active, reactivate "All"
          allBtn.classList.add("active");
          allBtn.setAttribute("aria-pressed", "true");
        } else {
          allBtn.classList.remove("active");
          allBtn.setAttribute("aria-pressed", "false");
        }
      }
    }

    // Call graph module to filter
    NARSH_GRAPH.filterByGroup(activeFilters);
  };

  const handleFamilyFilterClick = (btn) => {
    const family = btn.getAttribute("data-family");
    if (!family) return;

    activeFamilyFilter = family;

    // Update active states on family filter buttons
    const allBtns = filterBarEl.querySelectorAll(".filter-btn");
    allBtns.forEach((b) => {
      if (b.getAttribute("data-family") === family) {
        b.classList.add("active");
        b.setAttribute("aria-pressed", "true");
      } else {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      }
    });

    // Call graph module to filter family tree
    NARSH_GRAPH.filterFamilyTree(family);
  };

  const onNodeExpand = (guestData) => {
    // On mobile, show bottom sheet
    if (window.innerWidth < 768 && bottomSheetEl) {
      previousFocusEl = document.activeElement;
      renderBottomSheet(guestData);
      bottomSheetEl.classList.add("open");
      // Focus the close button for accessibility
      const closeBtn = bottomSheetEl.querySelector(".bottom-sheet-close");
      if (closeBtn) {
        setTimeout(() => closeBtn.focus(), 50);
      }
    }
  };

  const onNodeCollapse = () => {
    // Hide bottom sheet
    if (bottomSheetEl) {
      bottomSheetEl.classList.remove("open");
    }
    // Return focus to previously expanded node
    if (previousFocusEl) {
      previousFocusEl.focus();
      previousFocusEl = null;
    }
  };

  const renderBottomSheet = (guestData) => {
    const contentEl = bottomSheetEl.querySelector(".bottom-sheet-content");
    if (!contentEl) return;

    // Clear previous content
    contentEl.textContent = "";

    // Photo or initials
    const photoWrapEl = document.createElement("div");
    photoWrapEl.className = "bottom-sheet-photo";

    if (guestData.photo) {
      const imgEl = document.createElement("img");
      imgEl.src = guestData.photo;
      imgEl.alt = guestData.name;
      imgEl.className = "bottom-sheet-img";
      photoWrapEl.appendChild(imgEl);
    } else {
      const initialsEl = document.createElement("div");
      initialsEl.className = "bottom-sheet-initials";
      const parts = guestData.name.split(" ").filter(Boolean);
      const initials = parts.length >= 2
        ? (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
        : parts[0] ? parts[0].charAt(0).toUpperCase() : "?";
      initialsEl.textContent = initials;
      photoWrapEl.appendChild(initialsEl);
    }
    contentEl.appendChild(photoWrapEl);

    // Name
    const nameEl = document.createElement("div");
    nameEl.className = "bottom-sheet-name";
    nameEl.textContent = guestData.name;
    contentEl.appendChild(nameEl);

    // Groups
    if (guestData.groups && guestData.groups.length > 0) {
      const groupLabels = guestData.groups.map((gId) => {
        const group = NARSH_GUESTS.GROUPS.find((g) => g.id === gId);
        return group ? group.label : gId;
      });
      const groupsEl = document.createElement("div");
      groupsEl.className = "bottom-sheet-groups";
      groupsEl.textContent = groupLabels.join(", ");
      contentEl.appendChild(groupsEl);
    }

    // Connection to couple (only if present)
    if (guestData.connectionToCouple) {
      const connLabelEl = document.createElement("div");
      connLabelEl.className = "bottom-sheet-field-label";
      connLabelEl.textContent = "How we know them";
      contentEl.appendChild(connLabelEl);

      const connEl = document.createElement("div");
      connEl.className = "bottom-sheet-field-value";
      connEl.textContent = guestData.connectionToCouple;
      contentEl.appendChild(connEl);
    }

    // Fun fact (only if present)
    if (guestData.funFact) {
      const factLabelEl = document.createElement("div");
      factLabelEl.className = "bottom-sheet-field-label";
      factLabelEl.textContent = "Fun fact";
      contentEl.appendChild(factLabelEl);

      const factEl = document.createElement("div");
      factEl.className = "bottom-sheet-field-value";
      factEl.textContent = guestData.funFact;
      contentEl.appendChild(factEl);
    }

    // Update aria-label
    bottomSheetEl.setAttribute("aria-label", guestData.name + " details");
  };

  const renderGroupFilterButtons = () => {
    // "All" button (active by default)
    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.setAttribute("data-group", "all");
    allBtn.setAttribute("aria-pressed", "true");
    allBtn.textContent = "All";
    filterBarEl.appendChild(allBtn);

    // One button per group
    NARSH_GUESTS.GROUPS.forEach((group) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.setAttribute("data-group", group.id);
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = group.label;
      filterBarEl.appendChild(btn);
    });
  };

  const renderFamilyFilterButtons = () => {
    const families = [
      { id: "both", label: "Both Families" },
      { id: "natalie", label: "Natalie's Family" },
      { id: "arash", label: "Arash's Family" }
    ];

    families.forEach((family) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (family.id === activeFamilyFilter ? " active" : "");
      btn.setAttribute("data-family", family.id);
      btn.setAttribute("aria-pressed", family.id === activeFamilyFilter ? "true" : "false");
      btn.textContent = family.label;
      filterBarEl.appendChild(btn);
    });
  };

  const initBottomSheetEvents = () => {
    if (!bottomSheetEl) return;

    const closeBtn = bottomSheetEl.querySelector(".bottom-sheet-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        NARSH_GRAPH.collapseNode();
      });
    }

    // Trap focus inside bottom sheet when open
    bottomSheetEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        NARSH_GRAPH.collapseNode();
        return;
      }

      // Focus trap
      if (event.key === "Tab" && bottomSheetEl.classList.contains("open")) {
        const focusableEls = bottomSheetEl.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (focusableEls.length === 0) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    });
  };

  return { init };
})();
