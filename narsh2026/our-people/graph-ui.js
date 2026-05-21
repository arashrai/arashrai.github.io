// Narsh 2026 — Graph UI Module
// Search bar, view toggle, and filter button wiring for the Our People page.

const NARSH_GRAPH_UI = (() => {
  "use strict";

  let searchInputEl = null;
  let filterBarEl = null;
  let viewToggleEl = null;
  let activeFilters = [];
  let currentView = "social";

  const init = () => {
    searchInputEl = document.getElementById("graph-search");
    filterBarEl = document.getElementById("filter-bar");
    viewToggleEl = document.getElementById("view-toggle");

    // Render filter buttons from NARSH_GUESTS.GROUPS
    if (filterBarEl) {
      renderFilterButtons();
    }

    // Search input listener (search functionality for Plan 02)
    if (searchInputEl) {
      searchInputEl.addEventListener("input", () => {
        // Search will be implemented in Plan 02
        console.log("Search input:", searchInputEl.value);
      });
    }

    // View toggle click listeners (view switching for Plan 03)
    if (viewToggleEl) {
      const viewBtns = viewToggleEl.querySelectorAll(".view-btn");
      viewBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          // View switching will be implemented in Plan 03
          const view = btn.getAttribute("data-view");
          console.log("View toggle:", view);
        });
      });
    }

    // Filter button click listeners (filtering for Plan 02)
    if (filterBarEl) {
      filterBarEl.addEventListener("click", (event) => {
        const btn = event.target.closest(".filter-btn");
        if (!btn) return;
        // Filtering will be implemented in Plan 02
        const group = btn.getAttribute("data-group");
        console.log("Filter clicked:", group);
      });
    }
  };

  const renderFilterButtons = () => {
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

  return { init };
})();
