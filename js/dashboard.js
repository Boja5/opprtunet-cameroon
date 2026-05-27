// ═══════════════════════════════════════
// OpportuNet Cameroon — Dashboard Logic
// ═══════════════════════════════════════

var currentUser  = null;
var pfType       = '';
var pfReqs       = [];

// ─── Init ───────────────────────────────
window.addEventListener('load', function() {
  currentUser = Auth.requireCompany();
  if (!currentUser) return;

  updateNavbar();
  loadCompanyInfo();
  loadStats();
  loadOverviewListings();
  loadAllListings();
  loadCompanyProfileForm();
});

// ─── Load company info into sidebar ─────
function loadCompanyInfo() {
  var initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('company-avatar').textContent = initial;
  document.getElementById('company-name').textContent   = currentUser.name;
  document.getElementById('company-type').textContent   = currentUser.companyType || 'Organization';
  document.getElementById('welcome-title').textContent  = 'Welcome, ' + currentUser.name;
}

// ─── Load stats ──────────────────────────
function loadStats() {
  var listings = Auth.getCompanyListings(currentUser.id);
  document.getElementById('stat-listings').textContent = listings.length;
  document.getElementById('stat-region').textContent   = currentUser.companyRegion || '—';
}

// ─── Panel navigation ────────────────────
window.showPanel = function(name) {
  document.querySelectorAll('.dash-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.dash-nav-item').forEach(function(n) {
    n.classList.remove('active');
  });

  document.getElementById('panel-' + name).classList.add('active');

  var navMap = {
    'overview':        0,
    'listings':        1,
    'post':            2,
    'company-profile': 3
  };
  var items = document.querySelectorAll('.dash-nav-item');
  if (items[navMap[name]]) items[navMap[name]].classList.add('active');
};

// ─── Helpers ────────────────────────────
function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function getTagBg(type) {
  var m = { job:'#E1F5EE', training:'#EBF2FF', internship:'#FFF3E0', grant:'#FEF0F0' };
  return m[type] || '#E1F5EE';
}

function getTagColor(type) {
  var m = { job:'#085041', training:'#1a4a8a', internship:'#7a4100', grant:'#8a1a1a' };
  return m[type] || '#085041';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ─── Render listing card ─────────────────
function renderListingCard(listing, showDelete) {
  return (
    '<div class="listing-card">' +
      '<div>' +
        '<div class="listing-card-title">' + listing.title + '</div>' +
        '<div style="margin-top:6px;">' +
          '<span style="font-size:11px;padding:3px 10px;border-radius:20px;' +
            'background:' + getTagBg(listing.type) + ';' +
            'color:' + getTagColor(listing.type) + ';font-weight:500;">' +
            capitalise(listing.type) +
          '</span>' +
        '</div>' +
        '<div class="listing-card-meta">' +
          '<span>📍 ' + (listing.city || listing.region) + '</span>' +
          '<span>⏱ ' + listing.duration + '</span>' +
          '<span>💰 ' + (listing.salary || 'Not specified') + '</span>' +
          '<span>⏰ Deadline: ' + (listing.deadline || listing.opp_deadline || '') + '</span>' +
          (listing.postedAt
            ? '<span>📅 Posted: ' + formatDate(listing.postedAt) + '</span>'
            : '') +
        '</div>' +
      '</div>' +
      '<div class="listing-card-actions">' +
        '<button class="btn-view" onclick="window.open(\'opportunities.html\',\'_blank\')">' +
          'View' +
        '</button>' +
        (showDelete
          ? '<button class="btn-delete" onclick="deleteListing(\'' + listing.id + '\')">' +
              'Delete' +
            '</button>'
          : '') +
      '</div>' +
    '</div>'
  );
}

// ─── Load overview listings ──────────────
function loadOverviewListings() {
  var container = document.getElementById('overview-listings');
  var listings  = Auth.getCompanyListings(currentUser.id);

  if (listings.length === 0) {
    container.innerHTML =
      '<div class="empty-listings">' +
        '<div class="empty-listings-icon">📋</div>' +
        '<h3>No listings yet</h3>' +
        '<p>Click "Post New Listing" to add your first opportunity</p>' +
      '</div>';
    return;
  }

  container.innerHTML = listings.slice(0, 3).map(function(l) {
    return renderListingCard(l, false);
  }).join('');
}

// ─── Load all listings ───────────────────
function loadAllListings() {
  var container = document.getElementById('all-listings');
  var listings  = Auth.getCompanyListings(currentUser.id);

  if (listings.length === 0) {
    container.innerHTML =
      '<div class="empty-listings">' +
        '<div class="empty-listings-icon">📋</div>' +
        '<h3>No listings yet</h3>' +
        '<p>Post your first opportunity to see it here</p>' +
      '</div>';
    return;
  }

  container.innerHTML = listings.map(function(l) {
    return renderListingCard(l, true);
  }).join('');
}

// ─── Delete listing ──────────────────────
window.deleteListing = function(id) {
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  Auth.deleteListing(id);
  loadStats();
  loadOverviewListings();
  loadAllListings();
};

// ─── Post listing form ───────────────────
window.selectPFType = function(type, el) {
  pfType = type;
  document.querySelectorAll('.pf-type-opt').forEach(function(o) {
    o.classList.remove('selected');
  });
  el.classList.add('selected');
  document.getElementById('pf-err-type').classList.remove('visible');
};

window.addPFReq = function() {
  var input = document.getElementById('pf-req-input');
  var val   = input.value.trim();
  if (!val) return;
  pfReqs.push(val);
  input.value = '';
  renderPFReqs();
};

document.addEventListener('DOMContentLoaded', function() {
  var reqInput = document.getElementById('pf-req-input');
  if (reqInput) {
    reqInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); addPFReq(); }
    });
  }
});

function renderPFReqs() {
  var list = document.getElementById('pf-req-list');
  if (!list) return;
  list.innerHTML = pfReqs.map(function(r, i) {
    return (
      '<div class="req-item">' +
        '<div class="req-dot"></div>' +
        '<span class="req-text">' + r + '</span>' +
        '<button class="req-rm" onclick="removePFReq(' + i + ')">×</button>' +
      '</div>'
    );
  }).join('');
}

window.removePFReq = function(i) {
  pfReqs.splice(i, 1);
  renderPFReqs();
};

function validatePostForm() {
  var valid = true;

  function check(id, errId, condition) {
    var el  = document.getElementById(id);
    var err = document.getElementById(errId);
    if (!condition) {
      if (el)  el.classList.add('error');
      if (err) err.classList.add('visible');
      valid = false;
    } else {
      if (el)  el.classList.remove('error');
      if (err) err.classList.remove('visible');
    }
  }

  if (!pfType) {
    document.getElementById('pf-err-type').classList.add('visible');
    valid = false;
  }

  check('pf-title',       'pf-err-title',       document.getElementById('pf-title').value.trim() !== '');
  check('pf-sector',      'pf-err-sector',       document.getElementById('pf-sector').value !== '');
  check('pf-duration',    'pf-err-duration',     document.getElementById('pf-duration').value.trim() !== '');
  check('pf-description', 'pf-err-description',  document.getElementById('pf-description').value.trim().length > 10);
  check('pf-region',      'pf-err-region',       document.getElementById('pf-region').value !== '');
  check('pf-city',        'pf-err-city',         document.getElementById('pf-city').value.trim() !== '');
  check('pf-deadline',    'pf-err-deadline',      document.getElementById('pf-deadline').value !== '');

  return valid;
}

window.submitListing = function() {
  var alert = document.getElementById('post-alert');
  alert.className = 'post-alert';

  if (!validatePostForm()) return;

  var deadline = document.getElementById('pf-deadline').value;
  var dateStr  = new Date(deadline).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  var listing = {
    title:        document.getElementById('pf-title').value.trim(),
    type:         pfType,
    sector:       document.getElementById('pf-sector').value,
    duration:     document.getElementById('pf-duration').value.trim(),
    description:  document.getElementById('pf-description').value.trim(),
    region:       document.getElementById('pf-region').value,
    city:         document.getElementById('pf-city').value.trim(),
    salary:       document.getElementById('pf-salary').value.trim() || 'Not specified',
    deadline:     dateStr,
    requirements: pfReqs.slice(),
    organization: currentUser.name,
    orgShort:     currentUser.name.substring(0, 2).toUpperCase(),
    contact:      currentUser.email,
    posted:       new Date().toLocaleDateString('en-GB'),
    postedBy:     currentUser.id
  };

  Auth.saveListing(listing);

  alert.textContent = '✅ Listing published successfully!';
  alert.className   = 'post-alert success';

  // Reset form
  document.getElementById('pf-title').value       = '';
  document.getElementById('pf-sector').value      = '';
  document.getElementById('pf-duration').value    = '';
  document.getElementById('pf-description').value = '';
  document.getElementById('pf-region').value      = '';
  document.getElementById('pf-city').value        = '';
  document.getElementById('pf-salary').value      = '';
  document.getElementById('pf-deadline').value    = '';
  pfType = '';
  pfReqs = [];
  renderPFReqs();
  document.querySelectorAll('.pf-type-opt').forEach(function(o) {
    o.classList.remove('selected');
  });

  loadStats();
  loadOverviewListings();
  loadAllListings();

  setTimeout(function() { showPanel('listings'); }, 1200);
};

// ─── Company profile form ────────────────
function loadCompanyProfileForm() {
  var initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profile-avatar-big').textContent = initial;
  document.getElementById('profile-name-big').textContent   = currentUser.name;
  document.getElementById('profile-type-big').textContent   = currentUser.companyType || 'Organization';

  document.getElementById('cp-name').value    = currentUser.name || '';
  document.getElementById('cp-desc').value    = currentUser.companyDescription || '';
  document.getElementById('cp-website').value = currentUser.companyWebsite || '';
  document.getElementById('cp-region').value  = currentUser.companyRegion || '';
}

window.saveCompanyProfile = function() {
  var updated = {
    name:               document.getElementById('cp-name').value.trim(),
    companyDescription: document.getElementById('cp-desc').value.trim(),
    companyWebsite:     document.getElementById('cp-website').value.trim()
  };

  Auth.updateUser(updated);
  currentUser = Auth.getCurrentUser();
  loadCompanyInfo();
  loadCompanyProfileForm();

  var cpAlert = document.getElementById('cp-alert');
  cpAlert.style.display = 'block';
  setTimeout(function() { cpAlert.style.display = 'none'; }, 2500);
};