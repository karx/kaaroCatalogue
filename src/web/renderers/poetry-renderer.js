import { updatePageMeta } from '../utils/schema-generator.js';
import { favoritesManager } from '../utils/favorites-manager.js';

export function renderPoetDetail(mainContent, poet, works) {
  updatePageMeta({
    title: poet.name,
    description: `Biography and works of ${poet.name}, ${poet.knowsLanguage || ''} poet`
  });

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

export function renderPoemDetail(mainContent, work, poet) {
  updatePageMeta({
    title: work.name,
    description: `${work.name} by ${poet?.name || 'Unknown'} - ${work.genre || 'Poetry'}`
  });

  const isFavorite = favoritesManager.isFavorite(work.workId);

  mainContent.innerHTML = `
    <div class="animate-fade-in work-detail">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <a href="#/poet/${poet?.entityId || ''}" class="btn btn-secondary">← Back to Poet</a>
        <button class="btn-bookmark ${isFavorite ? 'active' : ''}" id="btn-bookmark" title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
          ${isFavorite ? '♥' : '♡'}
        </button>
      </div>
      
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
          ${work.content.urdu ? `
            <div class="poem-section">
              <h3>Urdu</h3>
              <div class="poem-text poem-original" style="font-family: 'Noto Nastaliq Urdu', serif; direction: rtl; text-align: right;">${formatPoetry(work.content.urdu)}</div>
            </div>
          ` : ''}
          ${work.content.hindi ? `
            <div class="poem-section">
              <h3>Hindi</h3>
              <div class="poem-text poem-original">${formatPoetry(work.content.hindi)}</div>
            </div>
          ` : ''}
          ${(work.content.transliteration || work.content.roman) ? `
            <div class="poem-section">
              <h3>Transliteration</h3>
              <div class="poem-text poem-transliteration">${formatPoetry(work.content.transliteration || work.content.roman)}</div>
            </div>
          ` : ''}
          ${work.content.translation ? `
            <div class="poem-section">
              <h3>Translation</h3>
              <div class="poem-text poem-translation">${formatPoetry(work.content.translation)}</div>
            </div>
          ` : ''}
          ${work.content.meaning ? `
            <div class="poem-section">
              <h3>Meaning</h3>
              <div class="poem-text poem-explanation">${formatPoetry(work.content.meaning)}</div>
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

  // Attach event listener
  const btnBookmark = document.getElementById('btn-bookmark');
  if (btnBookmark) {
    btnBookmark.addEventListener('click', () => {
      const item = {
        id: work.workId,
        name: work.name,
        type: 'poem',
        author: poet?.name || 'Unknown'
      };

      const added = favoritesManager.toggle(item);

      if (added) {
        btnBookmark.classList.add('active');
        btnBookmark.innerHTML = '♥';
        btnBookmark.title = 'Remove from Favorites';
      } else {
        btnBookmark.classList.remove('active');
        btnBookmark.innerHTML = '♡';
        btnBookmark.title = 'Add to Favorites';
      }
    });
  }
}

function formatPoetry(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .split('\n')
    .map(line => `<p class="verse-line">${line || '&nbsp;'}</p>`)
    .join('');
}
