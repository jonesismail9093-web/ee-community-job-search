// EE Community Job Board — app.js

let allJobs = [];

const categoryColors = {
  'Practitioner': 'practitioner',
  'Leadership':   'leadership',
  'SEN':          'sen',
  'Management':   'management',
  'Admin':        'admin',
};

function slugCat(cat) {
  return categoryColors[cat] || 'default';
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function renderCard(job) {
  const catSlug = slugCat(job.category);
  const typeSlug = job.type.toLowerCase().startsWith('full') ? 'full' : 'part';

  return `
    <div class="card">
      <div class="card-top">
        <div class="company-avatar">${initials(job.company)}</div>
        <div class="card-title-wrap">
          <div class="card-title">${job.title}</div>
          <div class="card-company">${job.company}</div>
        </div>
      </div>

      <div class="badges">
        <span class="badge badge-cat-${catSlug}">${job.category}</span>
        <span class="badge badge-type-${typeSlug}">${job.type}</span>
        <span class="badge badge-location">📍 ${job.location}</span>
      </div>

      <p class="card-description">${job.description}</p>

      <div class="card-footer">
        <div>
          <div class="card-salary">${job.salary}</div>
          <div class="card-posted">Posted ${timeAgo(job.posted)}</div>
        </div>
        <a class="btn-apply" href="mailto:${job.applyEmail}?subject=Application: ${encodeURIComponent(job.title)}">Apply →</a>
      </div>
    </div>
  `;
}

function filterAndRender() {
  const q    = document.getElementById('search').value.toLowerCase();
  const cat  = document.getElementById('cat-filter').value;
  const loc  = document.getElementById('loc-filter').value;

  const filtered = allJobs.filter(j => {
    const matchQ   = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
    const matchCat = !cat || j.category === cat;
    const matchLoc = !loc || j.location.toLowerCase().includes(loc.toLowerCase());
    return matchQ && matchCat && matchLoc;
  });

  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><h3>No jobs found</h3><p>Try adjusting your search or filters.</p></div>`;
  } else {
    grid.innerHTML = filtered.map(renderCard).join('');
  }

  document.getElementById('count').textContent =
    filtered.length === allJobs.length
      ? `${allJobs.length} job${allJobs.length !== 1 ? 's' : ''} listed`
      : `${filtered.length} of ${allJobs.length} jobs`;
}

function populateFilters() {
  const cats = [...new Set(allJobs.map(j => j.category))].sort();
  const locs = [...new Set(allJobs.map(j => j.location))].sort();

  const catSel = document.getElementById('cat-filter');
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    catSel.appendChild(o);
  });

  const locSel = document.getElementById('loc-filter');
  locs.forEach(l => {
    const o = document.createElement('option');
    o.value = l; o.textContent = l;
    locSel.appendChild(o);
  });
}

async function init() {
  try {
    const res = await fetch('jobs.json');
    allJobs = await res.json();
    populateFilters();
    filterAndRender();
  } catch(e) {
    document.getElementById('grid').innerHTML =
      `<div class="empty"><div class="empty-icon">⚠️</div><h3>Couldn't load jobs</h3><p>${e.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search').addEventListener('input', filterAndRender);
  document.getElementById('cat-filter').addEventListener('change', filterAndRender);
  document.getElementById('loc-filter').addEventListener('change', filterAndRender);
  init();
});
