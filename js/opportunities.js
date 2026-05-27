// ═══════════════════════════════════════
// OpportuNet Cameroon — Opportunities Page
// ═══════════════════════════════════════

let state = {
  query:   '',
  types:   [],
  regions: [],
  sectors: [],
  sort:    'newest'
};

function getTagClass(type) {
  const map = {
    job:        'tag-job',
    training:   'tag-training',
    internship: 'tag-internship',
    grant:      'tag-grant'
  };
  return map[type] || 'tag-job';
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleBookmark(btn) {
  const saved    = btn.dataset.saved === 'true';
  btn.dataset.saved = !saved;
  btn.textContent   = saved ? '♡' : '♥';
  btn.style.color   = saved ? '#ccc' : '#0F6E56';
}

function filterAndSort() {
  let results = [...OPPORTUNITIES];

  if (state.query) {
    const q = state.query.toLowerCase();
    results = results.filter(o =>
      o.title.toLowerCase().includes(q)        ||
      o.organization.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q)  ||
      o.sector.toLowerCase().includes(q)       ||
      o.city.toLowerCase().includes(q)
    );
  }

  if (state.types.length > 0) {
    results = results.filter(o => state.types.includes(o.type));
  }

  if (state.regions.length > 0) {
    results = results.filter(o => state.regions.includes(o.region));
  }

  if (state.sectors.length > 0) {
    results = results.filter(o => state.sectors.includes(o.sector));
  }

  if (state.sort === 'deadline') {
    results.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else {
    results.sort((a, b) => new Date(b.posted) - new Date(a.posted));
  }

  return results;
}

function renderActiveTags() {
  const container = document.getElementById('active-filters');
  const tags = [];

  if (state.query) {
    tags.push({
      label: '"' + state.query + '"',
      clear: function() {
        state.query = '';
        document.getElementById('opp-search-input').value = '';
      }
    });
  }

  state.types.forEach(function(v) {
    tags.push({
      label: capitalise(v),
      clear: function() {
        state.types = state.types.filter(function(t) { return t !== v; });
        var cb = document.querySelector('input[name="type"][value="' + v + '"]');
        if (cb) cb.checked = false;
      }
    });
  });

  state.regions.forEach(function(v) {
    tags.push({
      label: v,
      clear: function() {
        state.regions = state.regions.filter(function(r) { return r !== v; });
        var cb = document.querySelector('input[name="region"][value="' + v + '"]');
        if (cb) cb.checked = false;
      }
    });
  });

  state.sectors.forEach(function(v) {
    tags.push({
      label: capitalise(v),
      clear: function() {
        state.sectors = state.sectors.filter(function(s) { return s !== v; });
        var cb = document.querySelector('input[name="sector"][value="' + v + '"]');
        if (cb) cb.checked = false;
      }
    });
  });

  window._tagClearFns = tags.map(function(t) { return t.clear; });

  if (tags.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tags.map(function(tag, i) {
    return '<span class="active-filter-tag">' + tag.label +
      ' <button onclick="clearTag(' + i + ')">×</button></span>';
  }).join('');
}

window.clearTag = function(i) {
  window._tagClearFns[i]();
  render();
};

function render() {
  var results = filterAndSort();
  var list    = document.getElementById('results-list');
  var count   = document.getElementById('results-count');

  count.innerHTML = 'Showing <strong>' + results.length + '</strong> opportunit' +
    (results.length === 1 ? 'y' : 'ies');

  renderActiveTags();

  if (results.length === 0) {
    list.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state-icon">🔍</div>' +
        '<h3>No opportunities found</h3>' +
        '<p>Try adjusting your filters or search terms</p>' +
      '</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < results.length; i++) {
    var opp = results[i];
    html +=
      '<div class="opp-card-full" onclick="window.location.href=\'detail.html?id=' + opp.id + '\'">' +
        '<div class="opp-card-accent"></div>' +
        '<div class="opp-card-logo">' + opp.orgShort + '</div>' +
        '<div class="opp-card-body">' +
          '<div class="opp-card-org">' + opp.organization + '</div>' +
          '<div class="opp-card-title">' + opp.title + '</div>' +
          '<div class="opp-card-pills">' +
            '<span class="tag ' + getTagClass(opp.type) + '">' + capitalise(opp.type) + '</span>' +
            '<span class="opp-card-pill">📍 ' + opp.city + '</span>' +
            '<span class="opp-card-pill">⏱ ' + opp.duration + '</span>' +
            '<span class="opp-card-pill">🏢 ' + capitalise(opp.sector) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="opp-card-right">' +
          '<span class="opp-card-salary">' + opp.salary + '</span>' +
          '<span class="opp-card-deadline">⏰ ' + opp.deadline + '</span>' +
          '<button class="opp-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this)">♡</button>' +
        '</div>' +
      '</div>';
  }
  list.innerHTML = html;
}

function resetAll() {
  state = { query: '', types: [], regions: [], sectors: [], sort: 'newest' };
  document.getElementById('opp-search-input').value = '';
  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
    cb.checked = false;
  });
  document.getElementById('sort-select').value = 'newest';
  render();
}

function readURLParams() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('q'))      state.query   = params.get('q');
  if (params.get('type'))   state.types   = [params.get('type')];
  if (params.get('region')) state.regions = [params.get('region')];
  if (params.get('sector')) state.sectors = [params.get('sector')];

  if (state.query) {
    document.getElementById('opp-search-input').value = state.query;
  }
  state.types.forEach(function(v) {
    var cb = document.querySelector('input[name="type"][value="' + v + '"]');
    if (cb) cb.checked = true;
  });
  state.regions.forEach(function(v) {
    var cb = document.querySelector('input[name="region"][value="' + v + '"]');
    if (cb) cb.checked = true;
  });
  state.sectors.forEach(function(v) {
    var cb = document.querySelector('input[name="sector"][value="' + v + '"]');
    if (cb) cb.checked = true;
  });
}

// ─── Event listeners ────────────────────
document.getElementById('opp-search-btn').addEventListener('click', function() {
  state.query = document.getElementById('opp-search-input').value.trim();
  render();
});

document.getElementById('opp-search-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    state.query = e.target.value.trim();
    render();
  }
});

document.getElementById('opp-search-input').addEventListener('input', function(e) {
  state.query = e.target.value.trim();
  render();
});

document.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
  cb.addEventListener('change', function() {
    var name  = cb.getAttribute('name');
    var value = cb.value;
    if (name === 'type') {
      state.types = cb.checked
        ? state.types.concat([value])
        : state.types.filter(function(v) { return v !== value; });
    } else if (name === 'region') {
      state.regions = cb.checked
        ? state.regions.concat([value])
        : state.regions.filter(function(v) { return v !== value; });
    } else if (name === 'sector') {
      state.sectors = cb.checked
        ? state.sectors.concat([value])
        : state.sectors.filter(function(v) { return v !== value; });
    }
    render();
  });
});

document.getElementById('sort-select').addEventListener('change', function(e) {
  state.sort = e.target.value;
  render();
});

document.getElementById('opp-clear-btn').addEventListener('click', resetAll);
document.getElementById('sidebar-clear').addEventListener('click', resetAll);

// ─── Init ───────────────────────────────
readURLParams();
render();