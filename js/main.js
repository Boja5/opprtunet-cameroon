// ═══════════════════════════════════════
// OpportuNet Cameroon — Homepage Logic
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ─── Render opportunity cards ───────────
  function renderCards(filter) {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;

    const filtered = filter === 'all'
      ? OPPORTUNITIES
      : OPPORTUNITIES.filter(o => o.type === filter);

    const display = filtered.slice(0, 4);

    grid.innerHTML = display.map(opp => `
      <div class="opp-card animate-in" onclick="window.location.href='detail.html?id=${opp.id}'">
        <div class="card-header">
          <div class="card-org-logo">${opp.orgShort}</div>
          <button class="card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this)" aria-label="Bookmark">
            ♡
          </button>
        </div>
        <div class="card-org-name">${opp.organization}</div>
        <div class="card-title">${opp.title}</div>
        <div class="card-pills">
          <span class="tag ${getTagClass(opp.type)}">${capitalise(opp.type)}</span>
          <span class="card-pill">📍 ${opp.city}</span>
          <span class="card-pill">⏱ ${opp.duration}</span>
        </div>
        <div class="card-footer">
          <span class="card-deadline">⏰ ${opp.deadline}</span>
          <span class="card-salary">${opp.salary}</span>
        </div>
      </div>
    `).join('');
  }

  function getTagClass(type) {
    const map = {
      job: 'tag-job',
      training: 'tag-training',
      internship: 'tag-internship',
      grant: 'tag-grant'
    };
    return map[type] || 'tag-job';
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ─── Filter tabs ────────────────────────
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCards(tab.dataset.filter);
    });
  });

  // ─── Render categories ──────────────────
  function renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = SECTORS.map(s => `
      <div class="cat-card" onclick="window.location.href='opportunities.html?sector=${s.name.toLowerCase()}'">
        <div class="cat-icon-wrap" style="background: ${s.color}">
          <span style="font-size: 24px">${s.icon}</span>
        </div>
        <div class="cat-name">${s.name}</div>
        <div class="cat-count">${s.count} listings</div>
      </div>
    `).join('');
  }

  // ─── Render region list ─────────────────
  function renderRegions() {
    const list = document.getElementById('region-list');
    if (!list) return;
    list.innerHTML = REGIONS.slice(0, 6).map((r, i) => `
      <div class="region-item ${i === 0 ? 'active' : ''}"
           onclick="highlightRegion(this)">
        <span class="region-name">📍 ${r.name}</span>
        <span class="region-count">${r.count}</span>
      </div>
    `).join('');
  }

  // ─── Search bar ─────────────────────────
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query  = document.getElementById('search-input').value.trim();
      const region = document.getElementById('search-region').value;
      const type   = document.getElementById('search-type').value;
      const params = new URLSearchParams();
      if (query)  params.set('q', query);
      if (region) params.set('region', region);
      if (type)   params.set('type', type);
      window.location.href = `opportunities.html?${params.toString()}`;
    });
  }

  // Enter key triggers search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('search-btn').click();
    });
  }

  // ─── Bookmark toggle ────────────────────
  window.toggleBookmark = function(btn) {
    const saved = btn.dataset.saved === 'true';
    btn.dataset.saved = !saved;
    btn.textContent   = saved ? '♡' : '♥';
    btn.style.color   = saved ? '' : '#0F6E56';
  };

  // ─── Region highlight ───────────────────
  window.highlightRegion = function(el) {
    document.querySelectorAll('.region-item').forEach(r => r.classList.remove('active'));
    el.classList.add('active');
  };

  // ─── Navbar scroll effect ───────────────
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.borderBottomColor = window.scrollY > 20
        ? 'rgba(255,255,255,0.1)'
        : 'transparent';
    }
  });

  // ─── Counter animation ──────────────────
  function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-num');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      if (!target) return;
      const suffix = counter.dataset.suffix || '';
      let current  = 0;
      const step   = Math.ceil(target / 60);
      const timer  = setInterval(() => {
        current = Math.min(current + step, target);
        counter.textContent = current.toLocaleString() + suffix;
        if (current >= target) clearInterval(timer);
      }, 20);
    });
  }

  // ─── Init ───────────────────────────────
  renderCards('all');
  renderCategories();
  renderRegions();
  setTimeout(animateCounters, 300);

});