// ═══════════════════════════════════════
// OpportuNet Cameroon — Profile Logic
// ═══════════════════════════════════════

var currentUser = null;
var tempSkills  = [];

// ─── Init ───────────────────────────────
window.addEventListener('load', function() {
  currentUser = Auth.requireYouth();
  if (!currentUser) return;

  updateNavbar();
  loadSidebarInfo();
  loadOverviewForm();
  loadSkills();
  loadEducation();
  loadExperience();
  updateCompletion();
});

// ─── Sidebar info ────────────────────────
function loadSidebarInfo() {
  var initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('p-avatar').textContent  = initial;
  document.getElementById('p-name').textContent    = currentUser.name;
  document.getElementById('p-region').textContent  = currentUser.region || 'Cameroon';
}

// ─── Panel navigation ────────────────────
window.showProfilePanel = function(name) {
  document.querySelectorAll('.profile-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.profile-nav-item').forEach(function(n) {
    n.classList.remove('active');
  });

  document.getElementById('pp-' + name).classList.add('active');

  var navMap = {
    'overview':   0,
    'skills':     1,
    'education':  2,
    'experience': 3,
    'cv':         4,
    'saved':      5
  };
  var items = document.querySelectorAll('.profile-nav-item');
  if (items[navMap[name]] !== undefined) {
    items[navMap[name]].classList.add('active');
  }

  if (name === 'cv') renderCV();
};

// ─── Profile completion ──────────────────
function updateCompletion() {
  var score = 0;
  if (currentUser.name)                           score += 20;
  if (currentUser.bio && currentUser.bio.length > 10) score += 20;
  if (currentUser.skills && currentUser.skills.length > 0)     score += 20;
  if (currentUser.education && currentUser.education.length > 0)   score += 20;
  if (currentUser.experience && currentUser.experience.length > 0)  score += 20;

  document.getElementById('completion-fill').style.width = score + '%';
  document.getElementById('completion-label').textContent = score + '% complete';
}

// ─── Overview form ───────────────────────
function loadOverviewForm() {
  document.getElementById('p-full-name').value    = currentUser.name    || '';
  document.getElementById('p-email').value        = currentUser.email   || '';
  document.getElementById('p-region-input').value = currentUser.region  || '';
  document.getElementById('p-phone').value        = currentUser.phone   || '';
  document.getElementById('p-bio').value          = currentUser.bio     || '';
}

window.saveOverview = function() {
  var updated = {
    name:  document.getElementById('p-full-name').value.trim(),
    phone: document.getElementById('p-phone').value.trim(),
    bio:   document.getElementById('p-bio').value.trim()
  };

  Auth.updateUser(updated);
  currentUser = Auth.getCurrentUser();
  loadSidebarInfo();
  updateCompletion();

  showAlert('overview-alert', 'Profile saved successfully!');
};

// ─── Skills ──────────────────────────────
function loadSkills() {
  tempSkills = (currentUser.skills || []).slice();
  renderSkillTags();
}

function renderSkillTags() {
  var wrap = document.getElementById('skills-wrap');
  if (!wrap) return;
  if (tempSkills.length === 0) {
    wrap.innerHTML = '<p style="font-size:13px;color:#aaa;margin-bottom:12px;">No skills added yet.</p>';
    return;
  }
  wrap.innerHTML = tempSkills.map(function(skill, i) {
    return (
      '<span class="skill-tag">' +
        skill +
        '<button class="skill-remove" onclick="removeSkill(' + i + ')">×</button>' +
      '</span>'
    );
  }).join('');
}

window.addSkill = function() {
  var input = document.getElementById('skill-input');
  var val   = input.value.trim();
  if (!val) return;
  if (tempSkills.indexOf(val) === -1) {
    tempSkills.push(val);
    renderSkillTags();
  }
  input.value = '';
};

window.removeSkill = function(i) {
  tempSkills.splice(i, 1);
  renderSkillTags();
};

window.saveSkills = function() {
  Auth.updateUser({ skills: tempSkills.slice() });
  currentUser = Auth.getCurrentUser();
  updateCompletion();
  showAlert('skills-alert', 'Skills saved successfully!');
};

// Enter key for skill input
document.addEventListener('DOMContentLoaded', function() {
  var si = document.getElementById('skill-input');
  if (si) {
    si.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    });
  }
});

// ─── Education ───────────────────────────
function loadEducation() {
  renderEducation();
}

function renderEducation() {
  var list = document.getElementById('edu-list');
  if (!list) return;
  var edu  = currentUser.education || [];

  if (edu.length === 0) {
    list.innerHTML = '<p style="font-size:13px;color:#aaa;margin-bottom:12px;">No education added yet.</p>';
    return;
  }

  list.innerHTML = edu.map(function(e, i) {
    return (
      '<div class="edu-item">' +
        '<div class="edu-icon">🎓</div>' +
        '<div style="flex:1;">' +
          '<div class="edu-title">' + e.degree + '</div>' +
          '<div class="edu-sub">' + e.school + ' · ' + e.year + '</div>' +
          (e.grade ? '<div class="edu-sub">' + e.grade + '</div>' : '') +
        '</div>' +
        '<button class="edu-delete" onclick="deleteEducation(' + i + ')">🗑</button>' +
      '</div>'
    );
  }).join('');
}

window.toggleEduForm = function() {
  var form = document.getElementById('edu-form');
  form.classList.toggle('visible');
};

window.addEducation = function() {
  var school = document.getElementById('edu-school').value.trim();
  var degree = document.getElementById('edu-degree').value.trim();
  var year   = document.getElementById('edu-year').value.trim();
  var grade  = document.getElementById('edu-grade').value.trim();

  if (!school || !degree) {
    showAlert('edu-alert', 'Please fill in institution and degree.', true);
    return;
  }

  var edu = (currentUser.education || []).slice();
  edu.push({ school: school, degree: degree, year: year, grade: grade });
  Auth.updateUser({ education: edu });
  currentUser = Auth.getCurrentUser();

  document.getElementById('edu-school').value = '';
  document.getElementById('edu-degree').value = '';
  document.getElementById('edu-year').value   = '';
  document.getElementById('edu-grade').value  = '';
  document.getElementById('edu-form').classList.remove('visible');

  renderEducation();
  updateCompletion();
  showAlert('edu-alert', 'Education added!');
};

window.deleteEducation = function(i) {
  var edu = (currentUser.education || []).slice();
  edu.splice(i, 1);
  Auth.updateUser({ education: edu });
  currentUser = Auth.getCurrentUser();
  renderEducation();
  updateCompletion();
};

// ─── Experience ──────────────────────────
function loadExperience() {
  renderExperience();
}

function renderExperience() {
  var list = document.getElementById('exp-list');
  if (!list) return;
  var exp  = currentUser.experience || [];

  if (exp.length === 0) {
    list.innerHTML = '<p style="font-size:13px;color:#aaa;margin-bottom:12px;">No experience added yet.</p>';
    return;
  }

  list.innerHTML = exp.map(function(e, i) {
    return (
      '<div class="exp-item">' +
        '<div class="exp-icon">💼</div>' +
        '<div style="flex:1;">' +
          '<div class="exp-title">' + e.title + '</div>' +
          '<div class="exp-sub">' + e.company + ' · ' + (e.location || '') + '</div>' +
          '<div class="exp-sub">' + (e.period || '') + '</div>' +
          (e.desc ? '<div style="font-size:12px;color:#555;margin-top:4px;line-height:1.6;">' + e.desc + '</div>' : '') +
        '</div>' +
        '<button class="exp-delete" onclick="deleteExperience(' + i + ')">🗑</button>' +
      '</div>'
    );
  }).join('');
}

window.toggleExpForm = function() {
  var form = document.getElementById('exp-form');
  form.classList.toggle('visible');
};

window.addExperience = function() {
  var title   = document.getElementById('exp-title').value.trim();
  var company = document.getElementById('exp-company').value.trim();
  var period  = document.getElementById('exp-period').value.trim();
  var location= document.getElementById('exp-location').value.trim();
  var desc    = document.getElementById('exp-desc').value.trim();

  if (!title || !company) {
    showAlert('exp-alert', 'Please fill in job title and company.', true);
    return;
  }

  var exp = (currentUser.experience || []).slice();
  exp.push({ title: title, company: company, period: period, location: location, desc: desc });
  Auth.updateUser({ experience: exp });
  currentUser = Auth.getCurrentUser();

  document.getElementById('exp-title').value    = '';
  document.getElementById('exp-company').value  = '';
  document.getElementById('exp-period').value   = '';
  document.getElementById('exp-location').value = '';
  document.getElementById('exp-desc').value     = '';
  document.getElementById('exp-form').classList.remove('visible');

  renderExperience();
  updateCompletion();
  showAlert('exp-alert', 'Experience added!');
};

window.deleteExperience = function(i) {
  var exp = (currentUser.experience || []).slice();
  exp.splice(i, 1);
  Auth.updateUser({ experience: exp });
  currentUser = Auth.getCurrentUser();
  renderExperience();
  updateCompletion();
};

// ─── CV Render ───────────────────────────
function renderCV() {
  var cv   = document.getElementById('cv-preview');
  var user = Auth.getCurrentUser();
  if (!cv || !user) return;

  var skillsHTML = (user.skills && user.skills.length > 0)
    ? '<div class="cv-skills-wrap">' +
        user.skills.map(function(s) {
          return '<span class="cv-skill">' + s + '</span>';
        }).join('') +
      '</div>'
    : '<p style="font-size:13px;color:#aaa;">No skills added yet.</p>';

  var eduHTML = (user.education && user.education.length > 0)
    ? user.education.map(function(e) {
        return (
          '<div class="cv-edu-item">' +
            '<div class="cv-edu-title">' + e.degree + '</div>' +
            '<div class="cv-edu-sub">' + e.school +
              (e.year  ? ' · ' + e.year  : '') +
              (e.grade ? ' · ' + e.grade : '') +
            '</div>' +
          '</div>'
        );
      }).join('')
    : '<p style="font-size:13px;color:#aaa;">No education added yet.</p>';

  var expHTML = (user.experience && user.experience.length > 0)
    ? user.experience.map(function(e) {
        return (
          '<div class="cv-edu-item">' +
            '<div class="cv-edu-title">' + e.title + ' — ' + e.company + '</div>' +
            '<div class="cv-edu-sub">' +
              (e.period   ? e.period + ' · '   : '') +
              (e.location ? e.location : '') +
            '</div>' +
            (e.desc
              ? '<div style="font-size:13px;color:#555;margin-top:4px;line-height:1.65;">' +
                  e.desc + '</div>'
              : '') +
          '</div>'
        );
      }).join('')
    : '<p style="font-size:13px;color:#aaa;">No experience added yet.</p>';

  cv.innerHTML =
    '<div class="cv-header">' +
      '<div class="cv-avatar">' + user.name.charAt(0).toUpperCase() + '</div>' +
      '<div>' +
        '<div class="cv-name">' + user.name + '</div>' +
        '<div class="cv-contact">' +
          user.email +
          (user.phone  ? ' · ' + user.phone  : '') +
          (user.region ? ' · ' + user.region : '') +
        '</div>' +
      '</div>' +
    '</div>' +

    (user.bio
      ? '<div class="cv-section">' +
          '<div class="cv-section-title">Profile</div>' +
          '<div class="cv-bio">' + user.bio + '</div>' +
        '</div>'
      : '') +

    '<div class="cv-section">' +
      '<div class="cv-section-title">Skills</div>' +
      skillsHTML +
    '</div>' +

    '<div class="cv-section">' +
      '<div class="cv-section-title">Education</div>' +
      eduHTML +
    '</div>' +

    '<div class="cv-section">' +
      '<div class="cv-section-title">Experience</div>' +
      expHTML +
    '</div>';
}

// ─── Alert helper ────────────────────────
function showAlert(id, message, isError) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className   = 'p-alert visible';
  if (isError) {
    el.style.background   = '#FEF0F0';
    el.style.color        = '#8a1a1a';
    el.style.borderColor  = '#f5c6c6';
  } else {
    el.style.background   = '';
    el.style.color        = '';
    el.style.borderColor  = '';
  }
  setTimeout(function() {
    el.classList.remove('visible');
  }, 2500);
}