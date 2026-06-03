// ═══════════════════════════════════════
// OpportuNet Cameroon — Detail Page
// Handles both static (number) and Firebase (string) IDs
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

// ── Read ID from URL ──────────────────────
// Works for both ?id=3 (static) and ?id=abc123 (Firebase)
function getIdFromURL() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  if (!id) return null;
  // Try numeric first (static data)
  var num = parseInt(id);
  return isNaN(num) ? id : num;
}

// ── Saved opportunities ───────────────────
function getSaved() {
  var s = localStorage.getItem('opportunet_saved');
  return s ? JSON.parse(s) : [];
}
function isSaved(id) {
  return getSaved().indexOf(String(id)) !== -1;
}
function toggleSave(id) {
  var saved = getSaved();
  var strId = String(id);
  var idx   = saved.indexOf(strId);
  if (idx === -1) { saved.push(strId); }
  else            { saved.splice(idx, 1); }
  localStorage.setItem('opportunet_saved', JSON.stringify(saved));
  return saved.indexOf(strId) !== -1;
}

function renderNotFound() {
  document.getElementById('detail-content').innerHTML =
    '<div class="not-found">' +
      '<div class="not-found-icon">🔍</div>' +
      '<h2>Opportunity Not Found</h2>' +
      '<p>This opportunity may have expired or been removed.</p>' +
      '<button class="btn-primary" onclick="window.location.href=\'opportunities.html\'" ' +
        'style="padding:12px 28px;font-size:14px;border-radius:10px;">' +
        'Browse All Opportunities' +
      '</button>' +
    '</div>';
}

function renderRelated(currentOpp, allOpps) {
  var related = allOpps.filter(function(o) {
    return String(o.id) !== String(currentOpp.id) &&
      (o.type === currentOpp.type || o.sector === currentOpp.sector);
  }).slice(0, 3);

  if (related.length === 0) {
    return '<p style="font-size:13px;color:#888;">No related opportunities found.</p>';
  }
  return related.map(function(opp) {
    var orgShort = opp.orgShort ||
      (opp.organization ? opp.organization.substring(0, 2).toUpperCase() : 'OP');
    return (
      '<div class="related-card" onclick="window.location.href=\'detail.html?id=' + opp.id + '\'">' +
        '<div class="related-logo">' + orgShort + '</div>' +
        '<div>' +
          '<div class="related-title">' + opp.title + '</div>' +
          '<div class="related-org">' + (opp.organization || '') + ' · ' + (opp.city || opp.region || '') + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function buildDetailHTML(opp, allOpps) {
  var tagBg    = getTagBg(opp.type);
  var tagColor = getTagColor(opp.type);
  var saved    = isSaved(opp.id);
  var orgShort = opp.orgShort ||
    (opp.organization ? opp.organization.substring(0, 2).toUpperCase() : 'OP');

  var requirementsHTML = '';
  if (opp.requirements && opp.requirements.length > 0) {
    requirementsHTML = opp.requirements.map(function(req) {
      return (
        '<div class="detail-req-item">' +
          '<div class="detail-req-dot"></div>' +
          '<span>' + req + '</span>' +
        '</div>'
      );
    }).join('');
  } else {
    requirementsHTML = '<p style="font-size:14px;color:#888;">No specific requirements listed.</p>';
  }

  return (
    '<div class="detail-layout">' +
      '<div>' +
        '<button class="back-btn" onclick="history.back()">← Back to opportunities</button>' +
        '<div class="detail-card">' +
          '<div class="detail-card-header">' +
            '<div class="detail-org-row">' +
              '<div class="detail-org-logo">' + orgShort + '</div>' +
              '<div>' +
                '<div class="detail-org-name">' + (opp.organization || 'Organization') + '</div>' +
                '<div class="detail-org-location">📍 ' + (opp.city || '') + (opp.region ? ', ' + opp.region : '') + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="detail-title">' + opp.title + '</div>' +
            '<div class="detail-tags">' +
              '<span class="detail-tag" style="background:' + tagBg + ';color:' + tagColor + '">' +
                capitalise(opp.type) +
              '</span>' +
              (opp.sector ? '<span class="detail-tag" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)">' + capitalise(opp.sector) + '</span>' : '') +
              (opp.duration ? '<span class="detail-tag" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)">⏱ ' + opp.duration + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="detail-card-body">' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">About this opportunity</div>' +
              '<p class="detail-section-text">' + (opp.description || 'No description provided.') + '</p>' +
            '</div>' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">Requirements</div>' +
              '<div class="detail-requirements">' + requirementsHTML + '</div>' +
            '</div>' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">How to apply</div>' +
              '<p class="detail-section-text">' +
                'Send your application to <strong>' + (opp.contact || opp.email || 'See description') + '</strong>. ' +
                'Include your CV, a motivation letter, and any relevant certificates. ' +
                (opp.deadline ? 'Apply before: <strong>' + opp.deadline + '</strong>.' : '') +
              '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="detail-sidebar">' +
        '<div class="sidebar-card">' +
          '<div class="salary-display">' +
            '<div class="salary-amount">' + (opp.salary || 'See details') + '</div>' +
            '<div class="salary-period">' + capitalise(opp.type) + (opp.duration ? ' · ' + opp.duration : '') + '</div>' +
          '</div>' +
          (opp.deadline ?
            '<div class="deadline-display">' +
              '<div class="deadline-icon">⏰</div>' +
              '<div>' +
                '<div class="deadline-label">Application deadline</div>' +
                '<div class="deadline-value">' + opp.deadline + '</div>' +
              '</div>' +
            '</div>' : '') +
          '<br/>' +
          '<button class="btn-apply-full" onclick="applyNow(\'' + (opp.contact || opp.email || '') + '\')">' +
            'Apply Now →' +
          '</button>' +
          '<button class="btn-bookmark-full" id="bookmark-btn" onclick="handleSave(\'' + opp.id + '\')">' +
            (saved ? '♥ &nbsp;Saved!' : '♡ &nbsp;Save Opportunity') +
          '</button>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">Quick Info</div>' +
          '<div class="detail-meta-list">' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Organization</span><span class="detail-meta-value">' + (opp.organization || '—') + '</span></div>' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Location</span><span class="detail-meta-value">' + (opp.city || '—') + '</span></div>' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Region</span><span class="detail-meta-value">' + (opp.region || '—') + '</span></div>' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Sector</span><span class="detail-meta-value">' + capitalise(opp.sector || '—') + '</span></div>' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Duration</span><span class="detail-meta-value">' + (opp.duration || '—') + '</span></div>' +
            '<div class="detail-meta-item"><span class="detail-meta-label">Posted</span><span class="detail-meta-value">' + (opp.posted || opp.postedAt || '—').toString().substring(0,10) + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">How to Apply</div>' +
          '<p style="font-size:13px;color:#555;line-height:1.7;margin-bottom:14px;">' +
            'Send your CV and motivation letter to the contact below.' +
          '</p>' +
          '<div style="background:var(--green-50);border:1px solid var(--green-200);border-radius:8px;padding:12px;font-size:13px;color:var(--green-800);word-break:break-all;">' +
            '📧 ' + (opp.contact || opp.email || 'See description') +
          '</div>' +
          '<button onclick="copyEmail(\'' + (opp.contact || opp.email || '') + '\')" id="copy-btn" ' +
            'style="width:100%;margin-top:10px;background:transparent;color:var(--green-700);' +
            'border:1px solid var(--green-200);padding:9px;border-radius:8px;font-size:13px;' +
            'font-weight:500;cursor:pointer;font-family:var(--font-body);">' +
            '📋 Copy Email Address' +
          '</button>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">Related Opportunities</div>' +
          renderRelated(opp, allOpps) +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

// ── Apply button — copies email ───────────
window.applyNow = function(email) {
  if (email) copyEmail(email);
  var btn = document.querySelector('.btn-apply-full');
  if (btn) {
    btn.textContent      = '✓ Email Copied! Send your application';
    btn.style.background = 'var(--green-600)';
    setTimeout(function() {
      btn.textContent      = 'Apply Now →';
      btn.style.background = '';
    }, 3000);
  }
};

window.copyEmail = function(email) {
  if (!email) return;
  navigator.clipboard.writeText(email).catch(function() {
    var el = document.createElement('textarea');
    el.value = email;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
  var btn = document.getElementById('copy-btn');
  if (btn) {
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = '📋 Copy Email Address'; }, 2000);
  }
};

window.handleSave = function(id) {
  var nowSaved = toggleSave(id);
  var btn = document.getElementById('bookmark-btn');
  if (btn) {
    btn.innerHTML        = nowSaved ? '♥ &nbsp;Saved!' : '♡ &nbsp;Save Opportunity';
    btn.style.background = nowSaved ? 'var(--green-50)' : '';
    btn.style.color      = nowSaved ? 'var(--green-700)' : '';
  }
};

// ── Main render ───────────────────────────
async function renderDetail() {
  var id = getIdFromURL();
  if (!id) { renderNotFound(); return; }

  // First try static data
  var opp = OPPORTUNITIES.find(function(o) {
    return String(o.id) === String(id);
  });

  var allOpps = OPPORTUNITIES.slice();

  // If not found in static — try Firebase
  if (!opp) {
    try {
      const { firebaseGetAllListings } = await import('./firebase.js');
      allOpps = await firebaseGetAllListings();
      opp = allOpps.find(function(o) {
        return String(o.id) === String(id);
      });
    } catch(e) {
      console.log('Firebase fetch error:', e);
    }
  }

  if (!opp) { renderNotFound(); return; }

  document.title = opp.title + ' — OpportuNet Cameroon';
  document.getElementById('detail-content').innerHTML = buildDetailHTML(opp, allOpps);
}

renderDetail();