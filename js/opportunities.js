// ═══════════════════════════════════════
// OpportuNet Cameroon — Opportunities Page
// Loads static listings AND Firebase listings
// ═══════════════════════════════════════

// State object — tracks all active filters
var state = {
  query:   '',    // current search text
  types:   [],    // selected type checkboxes
  regions: [],    // selected region checkboxes
  sectors: [],    // selected sector checkboxes
  sort:    'newest' // current sort order
};

// Combined array — static + Firebase listings
var allOpportunities = [];

// ── Load all listings ─────────────────────
async function loadAllListings() {
  // Start with static data from data.js
  allOpportunities = OPPORTUNITIES.slice();

  // Try to load Firebase listings
  try {
    // Import Firebase functions
    const { firebaseGetAllListings } = await import('./firebase.js');
    var firebaseListings = await firebaseGetAllListings();

    // firebaseGetAllListings returns OPPORTUNITIES + Firebase
    // So just use it directly
    allOpportunities = firebaseListings;
  } catch(e) {
    // Firebase failed — use static data only
    console.log('Using static data only:', e);
    allOpportunities = OPPORTUNITIES.slice();
  }

  // Read URL params and render
  readURLParams();
  render();
}

// ── Read URL parameters ───────────────────
// Allows homepage search to pre-fill filters
// e.g. opportunities.html?q=web&type=job
function readURLParams() {
  var params = new URLSearchParams(window.location.search);

  if (params.get('q'))      state.query   = params.get('q');
  if (params.get('type'))   state.types   = [params.get('type')];
  if (params.get('region')) state.regions = [params.get('region')];
  if (params.get('sector')) state.sectors = [params.get('sector')];

  // Update search input to show the query
  var searchInput = document.getElementById('opp-search-input');
  if (searchInput && state.query) searchInput.value = state.query;

  // Tick the correct checkboxes
  state.types.forEach(function(v) {
    var cb = document.querySelector('input[name="type"][value="' + v + '"]');
    if (cb) cb.checked = true;
  });
  state.regions.forEach(function(v) {
    var cb = document.querySelector('input[name="region"][value="' + v + '"]');
    if (cb) cb.checked = true;
  });
}

// ── Tag colours ───────────────────────────
function getTagBg(type) {
  var m = { job:'#E1F5EE', training:'#EBF2FF', internship:'#FFF3E0', grant:'#FEF0F0' };
  return m[type] || '#E1F5EE';
}
function getTagColor(type) {
  var m = { job:'#085041', training:'#1a4a8a', internship:'#7a4100', grant:'#8a1a1a' };
  return m[type] || '#085041';
}
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Main render function ──────────────────
// Called every time a filter changes
function render() {
  var q       = state.query.toLowerCase().trim();
  var types   = state.types;
  var regions = state.regions;
  var sectors = state.sectors;

  // Filter the combined array
  var filtered = allOpportunities.filter(function(opp) {
    // Search match
    var matchQ = !q ||
      (opp.title        && opp.title.toLowerCase().includes(q)) ||
      (opp.organization && opp.organization.toLowerCase().includes(q)) ||
      (opp.description  && opp.description.toLowerCase().includes(q)) ||
      (opp.city         && opp.city.toLowerCase().includes(q));

    // Filter matches
    var matchType   = types.length   === 0 || types.indexOf(opp.type)     !== -1;
    var matchRegion = regions.length === 0 || regions.indexOf(opp.region) !== -1;
    var matchSector = sectors.length === 0 || sectors.indexOf(opp.sector) !== -1;

    return matchQ && matchType && matchRegion && matchSector;
  });

  // Sort results
  if (state.sort === 'newest') {
    filtered.sort(function(a, b) {
      return new Date(b.postedAt || b.posted || 0) -
             new Date(a.postedAt || a.posted || 0);
    });
  }

  // Update results count
  var countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.innerHTML =
      'Showing <strong>' + filtered.length + '</strong> opportunit' +
      (filtered.length === 1 ? 'y' : 'ies');
  }

  // Render active filter tags
  renderActiveTags();

  // Render the results list
  var list = document.getElementById('results-list');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state-icon">🔍</div>' +
        '<h3>No opportunities found</h3>' +
        '<p>Try adjusting your search or filters.</p>' +
        '<button class="opp-search-btn" onclick="clearAll()" ' +
          'style="margin-top:14px;">Clear All Filters</button>' +
      '</div>';
    return;
  }

  list.innerHTML = filtered.map(function(opp) {
    var tagBg    = getTagBg(opp.type);
    var tagColor = getTagColor(opp.type);
    var orgShort = opp.orgShort ||
      (opp.organization ? opp.organization.substring(0, 2).toUpperCase() : 'OP');

    return (
      '<div class="opp-card-full" onclick="window.location.href=' +
        '\'detail.html?id=' + (opp.id || '') + '\'">' +
        '<div class="opp-card-accent"></div>' +
        '<div class="opp-card-logo">' + orgShort + '</div>' +
        '<div class="opp-card-body">' +
          '<div class="opp-card-org">' + (opp.organization || 'Organization') + '</div>' +
          '<div class="opp-card-title">' + (opp.title || 'Opportunity') + '</div>' +
          '<div class="opp-card-pills">' +
            '<span class="opp-card-pill" style="background:' + tagBg + ';color:' + tagColor + '">' +
              capitalise(opp.type) +
            '</span>' +
            '<span class="opp-card-pill">📍 ' + (opp.city || opp.region || '') + '</span>' +
            '<span class="opp-card-pill">⏱ ' + (opp.duration || 'N/A') + '</span>' +
            (opp.sector ? '<span class="opp-card-pill">' + capitalise(opp.sector) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="opp-card-right">' +
          '<div class="opp-card-salary">' + (opp.salary || 'See details') + '</div>' +
          '<div class="opp-card-deadline">⏰ ' + (opp.deadline || '') + '</div>' +
          '<button class="opp-card-bookmark">♡</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

// ── Active filter tags ────────────────────
function renderActiveTags() {
  var container = document.getElementById('active-filters');
  if (!container) return;

  var tags = [];
  if (state.query) {
    tags.push({ label: '🔍 ' + state.query, clear: function() { state.query = ''; var el = document.getElementById('opp-search-input'); if (el) el.value = ''; } });
  }
  state.types.forEach(function(v) {
    tags.push({ label: capitalise(v), clear: function(val) { return function() { state.types = state.types.filter(function(x) { return x !== val; }); var cb = document.querySelector('input[name="type"][value="' + val + '"]'); if (cb) cb.checked = false; }; }(v) });
  });
  state.regions.forEach(function(v) {
    tags.push({ label: '📍 ' + v, clear: function(val) { return function() { state.regions = state.regions.filter(function(x) { return x !== val; }); var cb = document.querySelector('input[name="region"][value="' + val + '"]'); if (cb) cb.checked = false; }; }(v) });
  });

  if (tags.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = tags.map(function(tag, i) {
    return '<span class="active-filter-tag" data-idx="' + i + '">' +
      tag.label + '<button onclick="clearTag(' + i + ')">×</button></span>';
  }).join('');

  window._activeTags = tags;
}

window.clearTag = function(i) {
  if (window._activeTags && window._activeTags[i]) {
    window._activeTags[i].clear();
    render();
  }
};

// ── Clear all filters ─────────────────────
window.clearAll = function() {
  state.query   = '';
  state.types   = [];
  state.regions = [];
  state.sectors = [];
  state.sort    = 'newest';

  var searchInput = document.getElementById('opp-search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.sidebar input[type="checkbox"]').forEach(function(cb) {
    cb.checked = false;
  });

  var sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'newest';

  render();
};

// ── Event listeners ───────────────────────
window.addEventListener('load', function() {
  // Search button
  var searchBtn = document.getElementById('opp-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      var input = document.getElementById('opp-search-input');
      state.query = input ? input.value : '';
      render();
    });
  }

  // Search input — search on Enter key
  var searchInput = document.getElementById('opp-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        state.query = searchInput.value;
        render();
      }
    });
    // Live search as you type
    searchInput.addEventListener('input', function() {
      state.query = searchInput.value;
      render();
    });
  }

  // Clear button
  var clearBtn = document.getElementById('opp-clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', clearAll);

  // Sidebar reset
  var sidebarClear = document.getElementById('sidebar-clear');
  if (sidebarClear) sidebarClear.addEventListener('click', clearAll);

  // Sort select
  var sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      state.sort = sortSelect.value;
      render();
    });
  }

  // Checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var name = cb.getAttribute('name');
      var val  = cb.value;

      if (name === 'type') {
        if (cb.checked) {
          if (state.types.indexOf(val) === -1) state.types.push(val);
        } else {
          state.types = state.types.filter(function(v) { return v !== val; });
        }
      }
      if (name === 'region') {
        if (cb.checked) {
          if (state.regions.indexOf(val) === -1) state.regions.push(val);
        } else {
          state.regions = state.regions.filter(function(v) { return v !== val; });
        }
      }
      if (name === 'sector') {
        if (cb.checked) {
          if (state.sectors.indexOf(val) === -1) state.sectors.push(val);
        } else {
          state.sectors = state.sectors.filter(function(v) { return v !== val; });
        }
      }
      render();
    });
  });

  // Load all listings (static + Firebase)
  loadAllListings();
});