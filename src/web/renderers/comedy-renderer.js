import { updatePageMeta } from '../utils/schema-generator.js';
import { favoritesManager } from '../utils/favorites-manager.js';

export function renderComedianDetail(mainContent, comedian, videos) {
  updatePageMeta({
    title: comedian.name,
    description: `Stand-up comedy by ${comedian.name}`
  });

  mainContent.innerHTML = `
    <div class="animate-fade-in comedian-detail">
      <a href="#/explore/comedy" class="btn btn-secondary" style="margin-bottom: var(--space-lg);">← Back to Comedy</a>
      
      <div class="poet-header">
        <div class="poet-avatar-large">${comedian.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
        <div class="poet-header-info">
          <h1>${comedian.name}</h1>
          <p class="poet-meta">
            ${comedian.homeLocation?.name || ''}
          </p>
          <div class="entity-tags" style="margin-top: var(--space-md);">
            ${(comedian.genre || []).map(g => `<span class="tag tag-accent">${g}</span>`).join('')}
            ${(comedian.keywords || []).map(k => `<span class="tag">${k}</span>`).join('')}
          </div>
        </div>
      </div>
      
      ${comedian.award?.length ? `
        <div class="poet-awards">
          <h3>🏆 Awards</h3>
          <ul>${comedian.award.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      <div class="poet-works">
        <h2>🎤 Videos & Specials</h2>
        ${videos.length > 0 ? `
          <div class="works-grid">
            ${videos.map(video => `
              <div class="work-card video-card" onclick="window.location.hash='/video/${video.videoId}'">
                <div class="video-thumbnail-placeholder">▶</div>
                <div class="video-info">
                  <h3>${video.name}</h3>
                  <p class="work-genre">${video.genre || 'Stand-up'}</p>
                  <div class="work-meta">
                    <span>${video.duration || ''}</span>
                    <span>${video.uploadDate || ''}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="no-works">No videos cataloged yet for this comedian.</p>
        `}
      </div>
      
      ${comedian.sameAs?.length ? `
        <div class="poet-links">
          <h3>🔗 External Links</h3>
          <ul>
            ${comedian.sameAs.map(url => `<li><a href="${url}" target="_blank">${new URL(url).hostname}</a></li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderVideoDetail(mainContent, video, comedian) {
  updatePageMeta({
    title: video.name,
    description: `${video.name} by ${comedian?.name || 'Unknown'}`
  });

  // Extract YouTube ID if possible, otherwise use embedUrl directly
  let embedUrl = video.embedUrl;
  if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
    // Simple check, in a real app we'd parse it more robustly
    // Assuming the data might already be an embed URL or a watch URL
    if (embedUrl.includes('watch?v=')) {
      const videoId = embedUrl.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  const isFavorite = favoritesManager.isFavorite(video.videoId);

  mainContent.innerHTML = `
    <div class="animate-fade-in video-detail">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <a href="#/poet/${comedian?.entityId || ''}" class="btn btn-secondary">← Back to Comedian</a>
        <button class="btn-bookmark ${isFavorite ? 'active' : ''}" id="btn-bookmark" title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
          ${isFavorite ? '♥' : '♡'}
        </button>
      </div>
      
      <div class="video-player-container">
        <iframe 
            src="${embedUrl}" 
            title="${video.name}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="video-iframe"
        ></iframe>
      </div>

      <div class="work-header" style="margin-top: var(--space-lg);">
        <h1>${video.name}</h1>
        <p class="work-author">by <a href="#/poet/${comedian?.entityId || ''}">${comedian?.name || 'Unknown'}</a></p>
        <div class="work-header-meta">
          <span class="tag tag-accent">${video.genre || 'Stand-up'}</span>
          <span class="tag">${video.duration || ''}</span>
          ${video.uploadDate ? `<span class="tag">${video.uploadDate}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  // Attach event listener
  const btnBookmark = document.getElementById('btn-bookmark');
  if (btnBookmark) {
    btnBookmark.addEventListener('click', () => {
      const item = {
        id: video.videoId,
        name: video.name,
        type: 'video',
        author: comedian?.name || 'Unknown'
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
