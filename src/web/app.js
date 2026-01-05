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

import { renderPoetDetail as renderPoetView, renderPoemDetail } from './renderers/poetry-renderer.js';
import { renderComedianDetail, renderVideoDetail } from './renderers/comedy-renderer.js';
import { favoritesManager } from './utils/favorites-manager.js';

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
  '/favorites': renderFavoritesPage,
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
      const entityId = route.split('/')[2];
      handler = () => renderEntityDetail(entityId);
    } else if (route.startsWith('/work/')) {
      const workId = route.split('/')[2];
      handler = () => renderWorkDetail(workId);
    } else if (route.startsWith('/video/')) {
      const videoId = route.split('/')[2];
      handler = () => renderWorkDetail(videoId);
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

function renderFavoritesPage() {
  updatePageMeta({
    title: 'Favorites',
    description: 'Your saved poems and videos'
  });

  const mainContent = document.getElementById('main-content');
  const favorites = favoritesManager.getAll();

  mainContent.innerHTML = `
    <div class="animate-fade-in">
      <h1 style="margin-bottom: var(--space-xl);">Your Favorites</h1>
      
      ${favorites.length > 0 ? `
        <div class="favorites-grid">
          ${favorites.map(item => `
            <div class="work-card" onclick="window.location.hash='/${item.type === 'video' ? 'video' : 'work'}/${item.id}'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3>${item.name}</h3>
                <span style="font-size: 1.2rem;">${item.type === 'video' ? '🎤' : '📜'}</span>
              </div>
              <p class="work-author">by ${item.author}</p>
              <p class="work-genre" style="text-transform: capitalize;">${item.type}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="no-content">
          <p>You haven't added any favorites yet.</p>
          <div style="display: flex; gap: var(--space-md); justify-content: center;">
            <a href="#/explore/poets" class="btn btn-secondary">Explore Poets</a>
            <a href="#/explore/comedy" class="btn btn-secondary">Explore Comedy</a>
          </div>
        </div>
      `}
    </div>
  `;
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
// Entity Detail (Poet or Comedian)
// ============================================
async function renderEntityDetail(entityId) {
  await loadAllCatalogs();

  const mainContent = document.getElementById('main-content');

  // Try to find in poets
  const poets = store.catalogs.poets;
  let entity = poets?.entities?.find(e => e.entityId === entityId);

  if (entity) {
    // It's a poet
    const works = poets?.works?.filter(w => {
      const authorRef = w.author?.['@id'];
      return authorRef === entityId ||
        authorRef === entityId.replace('poet-', 'poet-00') ||
        entityId.includes(authorRef?.replace('poet-', ''));
    }) || [];

    renderPoetView(mainContent, entity, works);
    return;
  }

  // Try to find in comedy
  const comedy = store.catalogs.comedy;
  entity = comedy?.entities?.find(e => e.entityId === entityId);

  if (entity) {
    // It's a comedian
    const videos = comedy?.videos?.filter(v => {
      const actorRef = v.actor?.['@id'];
      return actorRef === entityId;
    }) || [];

    renderComedianDetail(mainContent, entity, videos);
    return;
  }

  render404();
}

// ============================================
// Work/Video Detail
// ============================================
async function renderWorkDetail(workId) {
  await loadAllCatalogs();
  const mainContent = document.getElementById('main-content');

  // Try to find in poets (works)
  const poets = store.catalogs.poets;
  let work = poets?.works?.find(w => w.workId === workId);

  if (work) {
    // Find the poet
    const authorId = work.author?.['@id'];
    const poet = poets?.entities?.find(e => e.entityId === authorId) ||
      poets?.entities?.find(e => e.entityId.includes(authorId?.replace('poet-00', '')));

    renderPoemDetail(mainContent, work, poet);
    return;
  }

  // Try to find in comedy (videos)
  const comedy = store.catalogs.comedy;
  // Check if it's a video ID
  const video = comedy?.videos?.find(v => v.videoId === workId);

  if (video) {
    const actorId = video.actor?.['@id'];
    const comedian = comedy?.entities?.find(e => e.entityId === actorId);

    renderVideoDetail(mainContent, video, comedian);
    return;
  }

  render404();
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
