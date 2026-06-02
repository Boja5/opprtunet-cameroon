// ═══════════════════════════════════════
// OpportuNet Cameroon — Detail Page
// ═══════════════════════════════════════

function getTagClass(type) {
  var map = { job:'tag-job', training:'tag-training', internship:'tag-internship', grant:'tag-grant' };
  return map[type] || 'tag-job';
}

function capitalise(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function getTagBg(type) {
  var map = { job:'#E1F5EE', training:'#EBF2FF', internship:'#FFF3E0', grant:'#FEF0F0' };
  return map[type] || '#E1F5EE';
}

function getTagColor(type) {
  var map = { job:'#085041', training:'#1a4a8a', internship:'#7a4100', grant:'#8a1a1a' };
  return map[type] || '#085041';
}

function getIdFromURL() {
  var params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

function getSaved() {
  var s = localStorage.getItem('opportunet_saved');
  return s ? JSON.parse(s) : [];
}

function isSaved(id) {
  return getSaved().indexOf(id) !== -1;
}

function toggleSave(id) {
  var saved = getSaved();
  var idx   = saved.indexOf(id);
  if (idx === -1) { saved.push(id); }
  else            { saved.splice(idx, 1); }
  localStorage.setItem('opportunet_saved', JSON.stringify(saved));
  return saved.indexOf(id) !== -1;
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

function renderRelated(currentOpp) {
  var related = OPPORTUNITIES.filter(function(o) {
    return o.id !== currentOpp.id &&
      (o.type === currentOpp.type || o.sector === currentOpp.sector);
  }).slice(0, 3);

  if (related.length === 0) {
    return '<p style="font-size:13px;color:#888;">No related opportunities found.</p>';
  }

  return related.map(function(opp) {
    return (
      '<div class="related-card" onclick="window.location.href=\'detail.html?id=' + opp.id + '\'">' +
        '<div class="related-logo">' + opp.orgShort + '</div>' +
        '<div>' +
          '<div class="related-title">' + opp.title + '</div>' +
          '<div class="related-org">' + opp.organization + ' · ' + opp.city + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function renderDetail() {
  var id  = getIdFromURL();
  var opp = OPPORTUNITIES.find(function(o) { return o.id === id; });

  if (!opp) { renderNotFound(); return; }

  document.title = opp.title + ' — OpportuNet Cameroon';

  var tagBg    = getTagBg(opp.type);
  var tagColor = getTagColor(opp.type);
  var saved    = isSaved(id);

  var requirementsHTML = opp.requirements.map(function(req) {
    return (
      '<div class="detail-req-item">' +
        '<div class="detail-req-dot"></div>' +
        '<span>' + req + '</span>' +
      '</div>'
    );
  }).join('');

  var html =
    '<div class="detail-layout">' +
      '<div>' +
        '<button class="back-btn" onclick="history.back()">← Back to opportunities</button>' +
        '<div class="detail-card">' +
          '<div class="detail-card-header">' +
            '<div class="detail-org-row">' +
              '<div class="detail-org-logo">' + opp.orgShort + '</div>' +
              '<div>' +
                '<div class="detail-org-name">' + opp.organization + '</div>' +
                '<div class="detail-org-location">📍 ' + opp.city + ', ' + opp.region + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="detail-title">' + opp.title + '</div>' +
            '<div class="detail-tags">' +
              '<span class="detail-tag" style="background:' + tagBg + ';color:' + tagColor + '">' +
                capitalise(opp.type) +
              '</span>' +
              '<span class="detail-tag" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)">' +
                capitalise(opp.sector) +
              '</span>' +
              '<span class="detail-tag" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)">⏱ ' +
                opp.duration +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="detail-card-body">' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">About this opportunity</div>' +
              '<p class="detail-section-text">' + opp.description + '</p>' +
            '</div>' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">Requirements</div>' +
              '<div class="detail-requirements">' + requirementsHTML + '</div>' +
            '</div>' +
            '<div class="detail-section">' +
              '<div class="detail-section-title">How to apply</div>' +
              '<p class="detail-section-text">' +
                'Send your application to <strong>' + opp.contact + '</strong>. ' +
                'Include your CV, a motivation letter, and any relevant certificates. ' +
                'Apply before: <strong>' + opp.deadline + '</strong>.' +
              '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="detail-sidebar">' +

        '<div class="sidebar-card">' +
          '<div class="salary-display">' +
            '<div class="salary-amount">' + opp.salary + '</div>' +
            '<div class="salary-period">' + capitalise(opp.type) + ' · ' + opp.duration + '</div>' +
          '</div>' +
          '<div class="deadline-display">' +
            '<div class="deadline-icon">⏰</div>' +
            '<div>' +
              '<div class="deadline-label">Application deadline</div>' +
              '<div class="deadline-value">' + opp.deadline + '</div>' +
            '</div>' +
          '</div>' +
          '<br/>' +
          '<button class="btn-apply-full" onclick="applyNow(\'' + opp.contact + '\')">' +
            'Apply Now →' +
          '</button>' +
          '<button class="btn-bookmark-full" id="bookmark-btn" onclick="handleSave(' + id + ')">' +
            (saved ? '♥ &nbsp;Saved!' : '♡ &nbsp;Save Opportunity') +
          '</button>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">Quick Info</div>' +
          '<div class="detail-meta-list">' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Organization</span>' +
              '<span class="detail-meta-value">' + opp.organization + '</span>' +
            '</div>' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Location</span>' +
              '<span class="detail-meta-value">' + opp.city + '</span>' +
            '</div>' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Region</span>' +
              '<span class="detail-meta-value">' + opp.region + '</span>' +
            '</div>' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Sector</span>' +
              '<span class="detail-meta-value">' + capitalise(opp.sector) + '</span>' +
            '</div>' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Duration</span>' +
              '<span class="detail-meta-value">' + opp.duration + '</span>' +
            '</div>' +
            '<div class="detail-meta-item">' +
              '<span class="detail-meta-label">Posted</span>' +
              '<span class="detail-meta-value">' + opp.posted + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">How to Apply</div>' +
          '<p style="font-size:13px;color:#555;line-height:1.7;margin-bottom:14px;">' +
            'Send your CV and motivation letter to the contact below. ' +
            'Mention OpportuNet Cameroon in your subject line.' +
          '</p>' +
          '<div style="background:var(--green-50);border:1px solid var(--green-200);' +
               'border-radius:8px;padding:12px;font-size:13px;color:var(--green-800);' +
               'word-break:break-all;">' +
            '📧 ' + opp.contact +
          '</div>' +
          '<button onclick="copyEmail(\'' + opp.contact + '\')" id="copy-btn" ' +
            'style="width:100%;margin-top:10px;background:transparent;color:var(--green-700);' +
            'border:1px solid var(--green-200);padding:9px;border-radius:8px;font-size:13px;' +
            'font-weight:500;cursor:pointer;font-family:var(--font-body);">' +
            '📋 Copy Email Address' +
          '</button>' +
        '</div>' +

        '<div class="sidebar-card">' +
          '<div class="sidebar-card-title">Related Opportunities</div>' +
          renderRelated(opp) +
        '</div>' +

      '</div>' +
    '</div>';

  document.getElementById('detail-content').innerHTML = html;
}

window.applyNow = function(email) {
  copyEmail(email);
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

renderDetail();