/**
 * KaaroCatalogue - Main Application
 * A beautiful catalog visualization app with client-side routing
 */

import {
  generatePersonSchema,
  generateCatalogSchema,
  updatePageSchema,
  updatePageMeta
} from './utils/schema-generator.js';

// ============================================
// Data Store
// ============================================
const store = {
  catalogs: {},
  currentCatalog: null,
  searchQuery: '',
  activeFilters: [],
};

// ============================================
// Data Loading
// ============================================
async function loadCatalog(type) {
  if (store.catalogs[type]) {
    return store.catalogs[type];
  }

  try {
    const response = await fetch(`./data/catalogs/${type}-index.json`);
    if (!response.ok) throw new Error(`Failed to load ${type} catalog`);
    const data = await response.json();
    store.catalogs[type] = data;
    return data;
  } catch (error) {
    console.error(`Error loading catalog:`, error);
    return null;
  }
}

async function loadAllCatalogs() {
  await Promise.all([
    loadCatalog('comedy'),
    loadCatalog('poets'),
  ]);
}

// ============================================
// Routing
// ============================================
const routes = {
  '/': renderInsightPage,
  '/explore': renderExplorePage,
  '/explore/comedy': () => renderExplorePage('comedy'),
  '/explore/poets': () => renderExplorePage('poets'),
};

function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

function navigate(path) {
  window.location.hash = path;
}

function updateActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const linkRoute = link.getAttribute('data-route');
    if (linkRoute === 'insight' && route === '/') {
      link.classList.add('active');
    } else if (linkRoute === 'explore' && route.startsWith('/explore')) {
      link.classList.add('active');
    }
  });
}

async function router() {
  const route = getRoute();
  updateActiveNav(route);

  // Find matching route handler
  let handler = routes[route];

  if (!handler) {
    // Check for parameterized routes
    if (route.startsWith('/poet/')) {
      const poetId = route.split('/')[2];
      handler = () => renderPoetDetail(poetId);
    } else if (route.startsWith('/work/')) {
      const workId = route.split('/')[2];
      handler = () => renderWorkDetail(workId);
    } else if (route.startsWith('/explore/')) {
      const catalogType = route.split('/')[2];
      handler = () => renderExplorePage(catalogType);
    } else {
      handler = () => render404();
    }
  }

  await handler();
}

// ============================================
// Page Renderers
// ============================================
async function renderInsightPage() {
  await loadAllCatalogs();

  const comedy = store.catalogs.comedy;
  const poets = store.catalogs.poets;

  updatePageMeta({
    title: 'Home',
    description: 'Explore curated catalogs of comedians, poets, and more'
  });

  updatePageSchema({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KaaroCatalogue",
    "description": "An ecosystem for building, maintaining, and visualizing catalogs"
  });

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section class="hero animate-fade-in">
      <h1 class="hero-title">
        Discover <span class="text-gradient">Curated</span> Catalogs
      </h1>
      <p class="hero-subtitle">
        Explore comprehensive collections of artists, poets, and creators from around the world, 
        built with schema.org standards for the semantic web.
      </p>
    </section>

    <section class="catalog-grid stagger-children">
      <article class="catalog-card" data-catalog="comedy" onclick="window.location.hash = '/explore/comedy'">
        <div class="catalog-icon">🎤</div>
        <h2 class="catalog-title">Comedy Index</h2>
        <p class="catalog-description">
          Global stand-up comedians from YouTube and verified aggregators
        </p>
        <div class="catalog-stats">
          <div class="catalog-stat">
            <div class="catalog-stat-value">${comedy?.entities?.length || 0}</div>
            <div class="catalog-stat-label">Comedians</div>
          </div>
          <div class="catalog-stat">
            <div class="catalog-stat-value">${comedy?.videos?.length || 0}</div>
            <div class="catalog-stat-label">Videos</div>
          </div>
        </div>
      </article>

      <article class="catalog-card" data-catalog="poets" onclick="window.location.hash = '/explore/poets'">
        <div class="catalog-icon">📜</div>
        <h2 class="catalog-title">Indian Poets Index</h2>
        <p class="catalog-description">
          Kavis across millennia—from Sangam to Modern era, in 15+ languages
        </p>
        <div class="catalog-stats">
          <div class="catalog-stat">
            <div class="catalog-stat-value">${poets?.entities?.length || 0}</div>
            <div class="catalog-stat-label">Poets</div>
          </div>
          <div class="catalog-stat">
            <div class="catalog-stat-value">${poets?.works?.length || 0}</div>
            <div class="catalog-stat-label">Works</div>
          </div>
        </div>
      </article>
    </section>

    <section class="stats-section" style="margin-top: var(--space-3xl);">
      <h3 style="text-align: center; margin-bottom: var(--space-xl); color: var(--color-text-secondary);">
        Catalog Insights
      </h3>
      <div class="grid grid-4 stagger-children">
        <div class="stat-card">
          <div class="stat-value">${(comedy?.entities?.length || 0) + (poets?.entities?.length || 0)}</div>
          <div class="stat-label">Total Entities</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">2</div>
          <div class="stat-label">Catalogs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${getUniqueLanguages()}</div>
          <div class="stat-label">Languages</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${getUniqueGenres()}</div>
          <div class="stat-label">Genres</div>
        </div>
      </div>
    </section>
  `;
}

async function renderExplorePage(catalogType = null) {
  await loadAllCatalogs();

  const mainContent = document.getElementById('main-content');

  if (!catalogType) {
    // Show catalog selector
    updatePageMeta({
      title: 'Explore',
      description: 'Choose a catalog to explore'
    });

    mainContent.innerHTML = `
      <div class="animate-fade-in">
        <h1 style="margin-bottom: var(--space-xl);">Choose a Catalog</h1>
        <div class="catalog-grid">
          <div class="catalog-card" onclick="window.location.hash = '/explore/comedy'">
            <div class="catalog-icon">🎤</div>
            <h2 class="catalog-title">Comedy Index</h2>
            <p class="catalog-description">Stand-up comedians worldwide</p>
          </div>
          <div class="catalog-card" onclick="window.location.hash = '/explore/poets'">
            <div class="catalog-icon">📜</div>
            <h2 class="catalog-title">Indian Poets</h2>
            <p class="catalog-description">Kavis across the ages</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const catalog = store.catalogs[catalogType];
  if (!catalog) {
    render404();
    return;
  }

  store.currentCatalog = catalogType;

  updatePageMeta({
    title: catalog.name,
    description: catalog.description
  });

  updatePageSchema(generateCatalogSchema(catalog));

  const isComedy = catalogType === 'comedy';
  const entities = catalog.entities || [];
  const allGenres = getGenresForCatalog(catalogType);

  mainContent.innerHTML = `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-lg);">
        <a href="#/" class="btn btn-secondary" style="padding: var(--space-xs) var(--space-md);">← Back</a>
        <h1>${isComedy ? '🎤' : '📜'} ${catalog.name}</h1>
      </div>
      
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-xl);">
        ${catalog.description}
      </p>
      
      <div class="search-container">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search ${isComedy ? 'comedians' : 'poets'}..." 
          id="search-input"
        >
      </div>
      
      <div class="filter-pills" style="margin-bottom: var(--space-xl);" id="filter-pills">
        <button class="filter-pill active" data-filter="all">All</button>
        ${allGenres.map(genre => `
          <button class="filter-pill" data-filter="${genre}">${genre}</button>
        `).join('')}
      </div>
      
      <div class="grid grid-auto stagger-children" id="entities-grid">
        ${renderEntityCards(entities, catalogType)}
      </div>
    </div>
  `;

  // Attach event listeners
  attachSearchListeners(catalogType);
}

function renderEntityCards(entities, catalogType) {
  const isComedy = catalogType === 'comedy';

  return entities.map(entity => {
    const initials = entity.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const subtitle = isComedy
      ? entity.homeLocation?.name || ''
      : `${entity.knowsLanguage || ''} • ${entity.birthDate || ''}`;
    const genres = (entity.genre || entity.keywords || []).slice(0, 3);

    return `
      <article class="entity-card" data-id="${entity.entityId}" data-genres="${(entity.genre || entity.keywords || []).join(',')}" onclick="window.location.hash='/poet/${entity.entityId}'" style="cursor:pointer;">
        <div class="entity-card-header">
          <div class="entity-avatar">${initials}</div>
          <div class="entity-info">
            <h3 class="entity-name">${entity.name}</h3>
            <p class="entity-subtitle">${subtitle}</p>
          </div>
          ${entity.verified ? '<span class="tag tag-accent">✓ Verified</span>' : ''}
        </div>
        <div class="entity-tags">
          ${genres.map(g => `<span class="tag">${g}</span>`).join('')}
        </div>
        <div class="entity-meta">
          <span>${entity.award?.length ? `🏆 ${entity.award.length} award(s)` : ''}</span>
          <span>${entity.sameAs?.length ? `🔗 ${entity.sameAs.length} link(s)` : ''}</span>
        </div>
      </article>
    `;
  }).join('');
}

function render404() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="animate-fade-in" style="text-align: center; padding: var(--space-3xl);">
      <h1 style="font-size: 4rem; margin-bottom: var(--space-md);">404</h1>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-xl);">Page not found</p>
      <a href="#/" class="btn btn-primary">Go Home</a>
    </div>
  `;
}

// ============================================
// Poet Detail Page
// ============================================
async function renderPoetDetail(poetId) {
  await loadAllCatalogs();

  const poets = store.catalogs.poets;
  const poet = poets?.entities?.find(e => e.entityId === poetId);

  if (!poet) {
    render404();
    return;
  }

  // Find works for this poet (match by entityId or legacy format)
  const works = poets?.works?.filter(w => {
    const authorRef = w.author?.['@id'];
    return authorRef === poetId ||
      authorRef === poetId.replace('poet-', 'poet-00') ||
      poetId.includes(authorRef?.replace('poet-', ''));
  }) || [];

  updatePageMeta({
    title: poet.name,
    description: `Biography and works of ${poet.name}, ${poet.knowsLanguage || ''} poet`
  });

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="animate-fade-in poet-detail">
      <a href="#/explore/poets" class="btn btn-secondary" style="margin-bottom: var(--space-lg);">← Back to Poets</a>
      
      <div class="poet-header">
        <div class="poet-avatar-large">${poet.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
        <div class="poet-header-info">
          <h1>${poet.name}</h1>
          <p class="poet-meta">
            ${poet.knowsLanguage || ''} ${poet.additionalType || 'Poet'}
            ${poet.birthDate ? `• ${poet.birthDate}` : ''}
            ${poet.deathDate ? ` – ${poet.deathDate}` : ''}
          </p>
          <p class="poet-location">${poet.homeLocation?.name || ''}</p>
          <div class="entity-tags" style="margin-top: var(--space-md);">
            ${(poet.keywords || []).map(k => `<span class="tag">${k}</span>`).join('')}
          </div>
        </div>
      </div>
      
      ${poet.abstract ? `<div class="poet-bio"><p>${poet.abstract}</p></div>` : ''}
      
      ${poet.award?.length ? `
        <div class="poet-awards">
          <h3>🏆 Awards</h3>
          <ul>${poet.award.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      <div class="poet-works">
        <h2>📚 Works</h2>
        ${works.length > 0 ? `
          <div class="works-grid">
            ${works.map(work => `
              <div class="work-card" onclick="window.location.hash='/work/${work.workId}'">
                <h3>${work.name}</h3>
                <p class="work-genre">${work.genre || 'Poetry'}</p>
                <p class="work-abstract">${(work.abstract || '').slice(0, 120)}...</p>
                <div class="work-meta">
                  <span>${work.inLanguage || ''}</span>
                  <span>${work.dateCreated || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="no-works">No works cataloged yet for this poet.</p>
        `}
      </div>
      
      ${poet.sameAs?.length ? `
        <div class="poet-links">
          <h3>🔗 External Links</h3>
          <ul>
            ${poet.sameAs.map(url => `<li><a href="${url}" target="_blank">${new URL(url).hostname}</a></li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// ============================================
// Work Detail Page (Read Poetry)
// ============================================
async function renderWorkDetail(workId) {
  await loadAllCatalogs();

  const poets = store.catalogs.poets;
  const work = poets?.works?.find(w => w.workId === workId);

  if (!work) {
    render404();
    return;
  }

  // Find the poet
  const authorId = work.author?.['@id'];
  const poet = poets?.entities?.find(e => e.entityId === authorId) ||
    poets?.entities?.find(e => e.entityId.includes(authorId?.replace('poet-00', '')));

  updatePageMeta({
    title: work.name,
    description: `${work.name} by ${poet?.name || 'Unknown'} - ${work.genre || 'Poetry'}`
  });

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="animate-fade-in work-detail">
      <a href="#/poet/${poet?.entityId || ''}" class="btn btn-secondary" style="margin-bottom: var(--space-lg);">← Back to Poet</a>
      
      <div class="work-header">
        <h1>${work.name}</h1>
        <p class="work-author">by <a href="#/poet/${poet?.entityId || ''}">${poet?.name || 'Unknown Poet'}</a></p>
        <div class="work-header-meta">
          <span class="tag tag-accent">${work.genre || 'Poetry'}</span>
          <span class="tag">${work.inLanguage || ''}</span>
          ${work.dateCreated ? `<span class="tag">${work.dateCreated}</span>` : ''}
        </div>
      </div>
      
      ${work.abstract ? `
        <div class="work-abstract-full">
          <p>${work.abstract}</p>
        </div>
      ` : ''}
      
      ${work.content ? `
        <div class="poetry-reader">
          ${work.content.original ? `
            <div class="poem-section">
              <h3>Original</h3>
              <div class="poem-text poem-original">${formatPoetry(work.content.original)}</div>
            </div>
          ` : ''}
          ${work.content.transliteration ? `
            <div class="poem-section">
              <h3>Transliteration</h3>
              <div class="poem-text poem-transliteration">${formatPoetry(work.content.transliteration)}</div>
            </div>
          ` : ''}
          ${work.content.translation ? `
            <div class="poem-section">
              <h3>Translation</h3>
              <div class="poem-text poem-translation">${formatPoetry(work.content.translation)}</div>
            </div>
          ` : ''}
          ${work.content.explanation ? `
            <div class="poem-section">
              <h3>Explanation (Vyakhya)</h3>
              <div class="poem-text poem-explanation">${formatPoetry(work.content.explanation)}</div>
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="no-content">
          <p>Full text not yet available for this work.</p>
        </div>
      `}
      
      <div class="work-source-info" style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-border);">
        <p style="color: var(--color-text-secondary); font-size: 0.9rem;">
          <strong>Source:</strong> ${work.source?.name || 'Unknown'} 
          ${work.source?.url ? `(<a href="${work.source.url}" target="_blank">View Original</a>)` : ''}
        </p>
      </div>

      <div class="work-keywords">
        ${(work.keywords || []).map(k => `<span class="tag">${k}</span>`).join('')}
      </div>
    </div>
  `;
}

function formatPoetry(text) {
  return text
    .split('\n')
    .map(line => `<p class="verse-line">${line || '&nbsp;'}</p>`)
    .join('');
}


// ============================================
// Event Handlers
// ============================================
function attachSearchListeners(catalogType) {
  const searchInput = document.getElementById('search-input');
  const filterPills = document.getElementById('filter-pills');
  const entitiesGrid = document.getElementById('entities-grid');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      store.searchQuery = e.target.value.toLowerCase();
      filterEntities(catalogType);
    });
  }

  if (filterPills) {
    filterPills.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-pill')) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        store.activeFilters = filter === 'all' ? [] : [filter];
        filterEntities(catalogType);
      }
    });
  }
}

function filterEntities(catalogType) {
  const catalog = store.catalogs[catalogType];
  const entitiesGrid = document.getElementById('entities-grid');

  if (!catalog || !entitiesGrid) return;

  let filtered = catalog.entities;

  // Filter by search query
  if (store.searchQuery) {
    filtered = filtered.filter(entity =>
      entity.name.toLowerCase().includes(store.searchQuery) ||
      (entity.keywords || []).some(k => k.toLowerCase().includes(store.searchQuery))
    );
  }

  // Filter by genre/tag
  if (store.activeFilters.length > 0) {
    filtered = filtered.filter(entity => {
      const entityGenres = [...(entity.genre || []), ...(entity.keywords || [])];
      return store.activeFilters.some(f =>
        entityGenres.some(g => g.toLowerCase() === f.toLowerCase())
      );
    });
  }

  entitiesGrid.innerHTML = filtered.length > 0
    ? renderEntityCards(filtered, catalogType)
    : '<p style="color: var(--color-text-muted); text-align: center; grid-column: 1/-1;">No results found</p>';
}

// ============================================
// Helpers
// ============================================
function getUniqueLanguages() {
  const languages = new Set();
  Object.values(store.catalogs).forEach(catalog => {
    catalog?.entities?.forEach(e => {
      if (e.knowsLanguage) languages.add(e.knowsLanguage);
    });
  });
  return languages.size;
}

function getUniqueGenres() {
  const genres = new Set();
  Object.values(store.catalogs).forEach(catalog => {
    catalog?.entities?.forEach(e => {
      (e.genre || []).forEach(g => genres.add(g));
    });
  });
  return genres.size;
}

function getGenresForCatalog(catalogType) {
  const catalog = store.catalogs[catalogType];
  if (!catalog) return [];

  const genres = new Set();
  catalog.entities?.forEach(e => {
    (e.genre || e.keywords || []).forEach(g => genres.add(g));
  });
  return Array.from(genres).slice(0, 8);
}

// ============================================
// Initialize
// ============================================
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
