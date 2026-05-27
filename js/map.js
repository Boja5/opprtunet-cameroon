// ═══════════════════════════════════════
// OpportuNet Cameroon — Map Page
// ═══════════════════════════════════════

var currentFilter = 'all';
var currentRegion = null;
var map           = null;
var markers       = [];

var REGION_COORDS = {
  'Centre':     [3.867,  11.517],
  'Littoral':   [4.061,  9.777],
  'West':       [5.479,  10.418],
  'North West': [6.0,    10.15],
  'South West': [4.157,  9.240],
  'Adamaoua':   [7.329,  13.577],
  'North':      [9.3,    13.4],
  'Far North':  [10.9,   14.3],
  'South':      [2.9,    11.5],
  'East':       [4.5,    13.8],
  'National':   [5.5,    12.3]
};

// ─── Helpers ────────────────────────────
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTagBg(type) {
  var map = { job:'#E1F5EE', training:'#EBF2FF', internship:'#FFF3E0', grant:'#FEF0F0' };
  return map[type] || '#E1F5EE';
}

function getTagColor(type) {
  var map = { job:'#085041', training:'#1a4a8a', internship:'#7a4100', grant:'#8a1a1a' };
  return map[type] || '#085041';
}

// ─── Get filtered list ──────────────────
function getFiltered() {
  var results = OPPORTUNITIES.slice();

  if (currentFilter !== 'all') {
    results = results.filter(function(o) { return o.type === currentFilter; });
  }
  if (currentRegion) {
    results = results.filter(function(o) { return o.region === currentRegion; });
  }

  var searchEl = document.getElementById('map-search');
  if (searchEl) {
    var q = searchEl.value.trim().toLowerCase();
    if (q) {
      results = results.filter(function(o) {
        return o.title.toLowerCase().includes(q) ||
               o.organization.toLowerCase().includes(q) ||
               o.city.toLowerCase().includes(q);
      });
    }
  }

  return results;
}

// ─── Render left panel ──────────────────
function renderPanel() {
  var list    = document.getElementById('map-panel-list');
  var header  = document.getElementById('panel-header');
  var filtered = getFiltered();

  if (header) {
    header.textContent = filtered.length +
      ' opportunit' + (filtered.length === 1 ? 'y' : 'ies') +
      (currentRegion ? ' in ' + currentRegion : '');
  }

  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML =
      '<div class="empty-panel">' +
        '<div class="empty-panel-icon">🔍</div>' +
        '<p>No opportunities found</p>' +
      '</div>';
    return;
  }

  var html = '';
  filtered.forEach(function(opp) {
    html +=
      '<div class="map-list-card" id="card-' + opp.id + '" ' +
           'onclick="focusOpportunity(' + opp.id + ')" ' +
           'style="padding:12px;border-radius:10px;cursor:pointer;' +
                  'border:1px solid transparent;margin-bottom:4px;' +
                  'transition:0.2s ease;">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
          '<div style="width:32px;height:32px;border-radius:6px;' +
                      'background:#E1F5EE;display:flex;align-items:center;' +
                      'justify-content:center;font-weight:700;font-size:11px;' +
                      'color:#085041;flex-shrink:0;">' +
            opp.orgShort +
          '</div>' +
          '<div>' +
            '<div style="font-size:13px;font-weight:600;color:#0A0F0D;line-height:1.3;">' +
              opp.title +
            '</div>' +
            '<div style="font-size:11px;color:#888;margin-top:1px;">' +
              opp.organization +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
          '<span style="font-size:10px;padding:2px 8px;border-radius:20px;' +
                       'background:' + getTagBg(opp.type) + ';' +
                       'color:' + getTagColor(opp.type) + ';">' +
            capitalise(opp.type) +
          '</span>' +
          '<span style="font-size:10px;padding:2px 8px;border-radius:20px;' +
                       'background:#F4F7F5;color:#666;">📍 ' + opp.city + '</span>' +
          '<span style="font-size:10px;padding:2px 8px;border-radius:20px;' +
                       'background:#F4F7F5;color:#666;">' + opp.salary + '</span>' +
        '</div>' +
      '</div>';
  });

  list.innerHTML = html;
}

// ─── Render region stats bar ─────────────
function renderRegionStats() {
  var bar = document.getElementById('region-stats-inner');
  if (!bar) return;

  var html =
    '<div class="region-stat-pill ' + (currentRegion === null ? 'active' : '') + '" ' +
         'onclick="filterByRegion(null, this)">' +
      '<span class="region-stat-name">🌍 All Regions</span>' +
      '<span class="region-stat-count">' + OPPORTUNITIES.length + '</span>' +
    '</div>';

  REGIONS.forEach(function(r) {
    var count  = OPPORTUNITIES.filter(function(o) { return o.region === r.name; }).length;
    var active = currentRegion === r.name ? 'active' : '';
    html +=
      '<div class="region-stat-pill ' + active + '" ' +
           'onclick="filterByRegion(\'' + r.name + '\', this)">' +
        '<span class="region-stat-name">📍 ' + r.name + '</span>' +
        '<span class="region-stat-count">' + count + '</span>' +
      '</div>';
  });

  bar.innerHTML = html;
}

// ─── Render map markers ──────────────────
function renderMarkers() {
  markers.forEach(function(m) { map.removeLayer(m); });
  markers = [];

  var filtered = getFiltered();
  var byRegion = {};

  filtered.forEach(function(opp) {
    if (!byRegion[opp.region]) byRegion[opp.region] = [];
    byRegion[opp.region].push(opp);
  });

  Object.keys(byRegion).forEach(function(region) {
    var coords = REGION_COORDS[region];
    if (!coords) return;

    var opps  = byRegion[region];
    var count = opps.length;

    var icon = L.divIcon({
      html:
        '<div style="' +
          'background:#0F6E56;color:white;border-radius:50%;' +
          'width:44px;height:44px;' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-weight:700;font-size:15px;' +
          'border:3px solid white;' +
          'box-shadow:0 2px 12px rgba(0,0,0,0.25);' +
          'cursor:pointer;' +
        '">' + count + '</div>',
      className:   '',
      iconSize:    [44, 44],
      iconAnchor:  [22, 22],
      popupAnchor: [0, -26]
    });

    var marker = L.marker(coords, { icon: icon }).addTo(map);

    var popupHTML =
      '<div class="map-popup">' +
        '<div class="map-popup-region">' + region + '</div>' +
        '<div class="map-popup-count">'  + count  + '</div>' +
        '<div class="map-popup-label">opportunit' + (count === 1 ? 'y' : 'ies') + ' available</div>';

    opps.slice(0, 3).forEach(function(opp) {
      popupHTML +=
        '<div style="padding:8px 0;border-top:1px solid #f0f0f0;cursor:pointer;" ' +
             'onclick="window.location.href=\'detail.html?id=' + opp.id + '\'">' +
          '<div style="font-size:12px;font-weight:600;color:#111;margin-bottom:2px;">' + opp.title + '</div>' +
          '<div style="font-size:11px;color:#888;">' + opp.organization + '</div>' +
        '</div>';
    });

    if (count > 3) {
      popupHTML += '<div style="font-size:11px;color:#888;padding-top:6px;">+' + (count - 3) + ' more</div>';
    }

    popupHTML +=
      '<a class="map-popup-btn" href="opportunities.html?region=' + encodeURIComponent(region) + '">' +
        'View all in ' + region +
      '</a>' +
    '</div>';

    marker.bindPopup(popupHTML, { maxWidth: 260 });
    marker.on('click', function() {
      currentRegion = region;
      renderPanel();
      renderRegionStats();
    });

    markers.push(marker);
  });
}

// ─── Focus opportunity ───────────────────
window.focusOpportunity = function(id) {
  var opp = OPPORTUNITIES.find(function(o) { return o.id === id; });
  if (!opp) return;

  document.querySelectorAll('[id^="card-"]').forEach(function(c) {
    c.style.background    = '';
    c.style.borderColor   = 'transparent';
  });

  var card = document.getElementById('card-' + id);
  if (card) {
    card.style.background  = '#E1F5EE';
    card.style.borderColor = '#9FE1CB';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  var coords = REGION_COORDS[opp.region];
  if (coords) map.flyTo(coords, 8, { duration: 1 });
};

// ─── Filter by region ────────────────────
window.filterByRegion = function(region, el) {
  currentRegion = region;

  document.querySelectorAll('.region-stat-pill').forEach(function(p) {
    p.classList.remove('active');
  });
  if (el) el.classList.add('active');

  if (region && REGION_COORDS[region]) {
    map.flyTo(REGION_COORDS[region], 8, { duration: 1 });
  } else {
    map.flyTo([5.5, 12.3], 6, { duration: 1 });
  }

  renderMarkers();
  renderPanel();
};

// ─── Filter by type ──────────────────────
window.setFilter = function(filter, el) {
  currentFilter = filter;

  document.querySelectorAll('.map-type-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  if (el) el.classList.add('active');

  document.querySelectorAll('.map-filter-chip').forEach(function(c) {
    c.classList.remove('active');
    if (c.dataset.filter === filter) c.classList.add('active');
  });

  renderMarkers();
  renderPanel();
};

// ─── Panel chips ─────────────────────────
document.querySelectorAll('.map-filter-chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    currentFilter = chip.dataset.filter;

    document.querySelectorAll('.map-filter-chip').forEach(function(c) {
      c.classList.remove('active');
    });
    chip.classList.add('active');

    document.querySelectorAll('.map-type-tab').forEach(function(t) {
      t.classList.remove('active');
    });
    document.querySelectorAll('.map-type-tab').forEach(function(t) {
      if (t.textContent.trim().toLowerCase() === currentFilter ||
         (currentFilter === 'all' && t.textContent.trim() === 'All')) {
        t.classList.add('active');
      }
    });

    renderMarkers();
    renderPanel();
  });
});

// ─── Search ──────────────────────────────
document.getElementById('map-search').addEventListener('input', function() {
  renderMarkers();
  renderPanel();
});

// ─── Init map ───────────────────────────
window.addEventListener('load', function() {
  map = L.map('map', {
    center:           [5.5, 12.3],
    zoom:             6,
    zoomControl:      true,
    scrollWheelZoom:  true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  renderMarkers();
  renderPanel();
  renderRegionStats();
});