// ═══════════════════════════════════════
// OpportuNet Cameroon — Homepage
// Uses central store for fluid connection
// ═══════════════════════════════════════

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

// ── Render opportunity cards ──────────────
function renderCards(filter) {
  var grid = document.getElementById('cards-grid');
  if (!grid) return;

  var listings = OpportuNet.listings || OPPORTUNITIES;

  var filtered = filter === 'all'
    ? listings
    : listings.filter(function(o) { return o.type === filter; });

  var display = filtered.slice(0, 4);

  if (display.length === 0) {
    grid.innerHTML =
      '<div style="text-align:center;padding:40px;color:#888;grid-column:1/-1;">' +
        '<p>No listings found for this category yet.</p>' +
      '</div>';
    return;
  }

  grid.innerHTML = display.map(function(opp) {
    var tagBg    = getTagBg(opp.type);
    var tagColor = getTagColor(opp.type);
    var orgShort = opp.orgShort ||
      (opp.organization ? opp.organization.substring(0, 2).toUpperCase() : 'OP');

    return (
      '<div class="opp-card" onclick="window.location.href=\'detail.html?id=' + opp.id + '\'">' +
        '<div class="opp-card-inner">' +
          '<div class="opp-card-top">' +
            '<div class="opp-org-logo">' + orgShort + '</div>' +
            '<div class="opp-card-meta">' +
              '<div class="opp-org-name">' + (opp.organization || 'Organization') + '</div>' +
              '<div class="opp-location">📍 ' + (opp.city || opp.region || '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="opp-title">' + opp.title + '</div>' +
          '<div class="opp-tags">' +
            '<span class="opp-tag" style="background:' + tagBg + ';color:' + tagColor + '">' +
              capitalise(opp.type) +
            '</span>' +
            (opp.sector ? '<span class="opp-tag">' + capitalise(opp.sector) + '</span>' : '') +
            (opp.duration ? '<span class="opp-tag">⏱ ' + opp.duration + '</span>' : '') +
          '</div>' +
          '<div class="opp-card-footer">' +
            '<span class="opp-salary">' + (opp.salary || 'See details') + '</span>' +
            '<span class="opp-deadline">⏰ ' + (opp.deadline || '') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

// ── Filter tabs ───────────────────────────
function initFilterTabs() {
  var tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderCards(tab.dataset.filter || 'all');
    });
  });
}

// ── Region list ───────────────────────────
function renderRegions() {
  var list = document.getElementById('region-list');
  if (!list) return;

  var listings = OpportuNet.listings || OPPORTUNITIES;

  list.innerHTML = REGIONS.slice(0, 6).map(function(region) {
    var count = listings.filter(function(o) {
      return o.region === region.name || o.region === 'National';
    }).length;
    return (
      '<a href="opportunities.html?region=' + encodeURIComponent(region.name) + '" ' +
        'class="region-item">' +
        '<span class="region-name">📍 ' + region.name + '</span>' +
        '<span class="region-count">' + (count || region.count) + '</span>' +
      '</a>'
    );
  }).join('');
}

// ── Sector categories ─────────────────────
function renderCategories() {
  var grid = document.getElementById('categories-grid');
  if (!grid) return;

  var listings = OpportuNet.listings || OPPORTUNITIES;

  grid.innerHTML = SECTORS.map(function(sector) {
    var count = listings.filter(function(o) {
      return o.sector && o.sector.toLowerCase() === sector.name.toLowerCase();
    }).length;
    return (
      '<a href="opportunities.html?sector=' + encodeURIComponent(sector.name.toLowerCase()) + '" ' +
        'class="category-card">' +
        '<div class="category-icon" style="background:' + sector.color + '">' + sector.icon + '</div>' +
        '<div class="category-name">' + sector.name + '</div>' +
        '<div class="category-count">' + (count || sector.count) + ' listings</div>' +
      '</a>'
    );
  }).join('');
}

// ── Hero counter animation ────────────────
function animateCounters() {
  var counters = document.querySelectorAll('.hero-stat-num');
  counters.forEach(function(counter) {
    var target = parseInt(counter.dataset.target);
    if (!target) return;
    var suffix  = counter.dataset.suffix || '';
    var current = 0;
    var step    = Math.ceil(target / 60);
    var timer   = setInterval(function() {
      current = Math.min(current + step, target);
      counter.textContent = current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

// ── Search bar ────────────────────────────
function initSearch() {
  var btn = document.getElementById('search-btn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var q      = document.getElementById('search-input').value.trim();
    var region = document.getElementById('search-region').value;
    var type   = document.getElementById('search-type').value;
    var params = new URLSearchParams();
    if (q)      params.set('q',      q);
    if (region) params.set('region', region);
    if (type)   params.set('type',   type);
    window.location.href = 'opportunities.html?' + params.toString();
  });

  var input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') btn.click();
    });
  }
}

// ── Init ──────────────────────────────────
window.addEventListener('load', async function() {
  // Start animations and UI immediately
  initFilterTabs();
  initSearch();
  setTimeout(animateCounters, 300);

  // Show static cards immediately while Firebase loads
  renderCards('all');
  renderRegions();
  renderCategories();

  // Load from central store (static + Firebase)
  await OpportuNet.load();

  // Re-render with full data
  renderCards('all');
  renderRegions();
  renderCategories();
});