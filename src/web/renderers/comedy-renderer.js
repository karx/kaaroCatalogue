import { updatePageMeta } from '../utils/schema-generator.js';
import { favoritesManager } from '../utils/favorites-manager.js';

export function renderComedianDetail(mainContent, comedian, videos) {
  updatePageMeta({
    title: comedian.name,
    description: `Stand-up comedy by ${comedian.name}`
  });

  const totalDuration = videos.reduce((sum, v) => {
    if (v.duration) {
      const match = v.duration.match(/PT(\d+)M/);
      return sum + (match ? parseInt(match[1]) : 0);
    }
    return sum;
  }, 0);

  const genres = comedian.genre || [];
  const keywords = comedian.keywords || [];
  const awards = comedian.award || [];
  const links = comedian.sameAs || [];

  mainContent.innerHTML = `
    <div class="animate-fade-in bloomberg-detail">
      <!-- Terminal Header Bar -->
      <div class="terminal-header">
        <div class="terminal-breadcrumb">
          <a href="#/explore/comedy" class="terminal-link">COMEDY</a>
          <span class="terminal-separator">›</span>
          <span class="terminal-current">${comedian.name.toUpperCase()}</span>
        </div>
        <div class="terminal-time" id="terminal-clock"></div>
      </div>

      <!-- Main Content Grid -->
      <div class="terminal-grid">
        <!-- Left Column: Profile & Stats -->
        <div class="terminal-sidebar">
          <!-- Profile Card -->
          <div class="terminal-card">
            <div class="terminal-card-header">PROFILE</div>
            <div class="comedian-profile">
              <div class="comedian-avatar-large">
                ${comedian.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h1 class="comedian-name">${comedian.name}</h1>
              ${comedian.homeLocation?.name ? `
                <div class="comedian-location">
                  <span class="terminal-icon">📍</span>
                  ${comedian.homeLocation.name}
                </div>
              ` : ''}
              ${comedian.knowsLanguage ? `
                <div class="comedian-language">
                  <span class="terminal-icon">🗣️</span>
                  ${mapLanguageCode(comedian.knowsLanguage).toUpperCase()}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="terminal-card">
            <div class="terminal-card-header">STATISTICS</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">${videos.length}</div>
                <div class="stat-label">VIDEOS</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${totalDuration}m</div>
                <div class="stat-label">RUNTIME</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${awards.length}</div>
                <div class="stat-label">AWARDS</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${genres.length}</div>
                <div class="stat-label">GENRES</div>
              </div>
            </div>
          </div>

          <!-- Genres & Tags -->
          ${genres.length > 0 || keywords.length > 0 ? `
            <div class="terminal-card">
              <div class="terminal-card-header">CLASSIFICATION</div>
              <div class="terminal-tags">
                ${genres.map(g => `<span class="terminal-tag terminal-tag-primary">${g.toUpperCase()}</span>`).join('')}
                ${keywords.map(k => `<span class="terminal-tag">${k.toUpperCase()}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Awards -->
          ${awards.length > 0 ? `
            <div class="terminal-card">
              <div class="terminal-card-header">ACCOLADES</div>
              <ul class="terminal-list">
                ${awards.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- External Links -->
          ${links.length > 0 ? `
            <div class="terminal-card">
              <div class="terminal-card-header">REFERENCES</div>
              <ul class="terminal-list terminal-list-links">
                ${links.map(url => `
                  <li>
                    <a href="${url}" target="_blank" class="terminal-link">
                      ${getDomainName(url)}
                      <span class="terminal-icon">↗</span>
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Right Column: Videos & Content -->
        <div class="terminal-main">
          <!-- Videos Table -->
          <div class="terminal-card">
            <div class="terminal-card-header">
              <span>VIDEO CATALOGUE</span>
              <span class="terminal-card-meta">${videos.length} ENTRIES</span>
            </div>
            
            ${videos.length > 0 ? `
              <div class="terminal-table-container">
                <table class="terminal-table">
                  <thead>
                    <tr>
                      <th>TITLE</th>
                      <th>GENRE</th>
                      <th>DURATION</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${videos.map((video, idx) => `
                      <tr class="terminal-table-row" onclick="window.location.hash='/video/${video.videoId}'">
                        <td>
                          <div class="video-title-cell">
                            <span class="video-index">${String(idx + 1).padStart(2, '0')}</span>
                            <span class="video-title">${truncateTitle(video.name, 60)}</span>
                          </div>
                        </td>
                        <td><span class="terminal-badge">${video.genre || 'CLIP'}</span></td>
                        <td class="terminal-mono">${formatDuration(video.duration)}</td>
                        <td class="terminal-mono">${formatDate(video.uploadDate)}</td>
                        <td class="terminal-action">
                          <span class="terminal-icon">▶</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="terminal-empty">
                <div class="terminal-empty-icon">📹</div>
                <div class="terminal-empty-text">NO VIDEOS CATALOGUED</div>
                <div class="terminal-empty-sub">Check back later for updates</div>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  // Update clock
  updateTerminalClock();
  setInterval(updateTerminalClock, 1000);
}

export function renderVideoDetail(mainContent, video, comedian) {
  updatePageMeta({
    title: video.name,
    description: `${video.name} by ${comedian?.name || 'Unknown'}`
  });

  // Extract YouTube ID
  let embedUrl = video.embedUrl;
  if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
    if (embedUrl.includes('watch?v=')) {
      const videoId = embedUrl.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  const isFavorite = favoritesManager.isFavorite(video.videoId);

  mainContent.innerHTML = `
    <div class="animate-fade-in bloomberg-detail">
      <!-- Terminal Header Bar -->
      <div class="terminal-header">
        <div class="terminal-breadcrumb">
          <a href="#/explore/comedy" class="terminal-link">COMEDY</a>
          <span class="terminal-separator">›</span>
          <a href="#/poet/${comedian?.entityId || ''}" class="terminal-link">${(comedian?.name || '').toUpperCase()}</a>
          <span class="terminal-separator">›</span>
          <span class="terminal-current">VIDEO</span>
        </div>
        <div class="terminal-actions">
          <button class="btn-bookmark-terminal ${isFavorite ? 'active' : ''}" id="btn-bookmark">
            ${isFavorite ? '♥ SAVED' : '♡ SAVE'}
          </button>
        </div>
      </div>

      <!-- Video Player Section -->
      <div class="terminal-video-layout">
        <div class="terminal-video-main">
          <div class="terminal-card terminal-card-video">
            <div class="terminal-video-player">
              <iframe 
                src="${embedUrl}" 
                title="${video.name}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="video-iframe"
              ></iframe>
            </div>
            
            <div class="terminal-video-info">
              <h1 class="terminal-video-title">${video.name}</h1>
              <div class="terminal-video-meta">
                <a href="#/poet/${comedian?.entityId || ''}" class="terminal-link">
                  ${comedian?.name || 'Unknown Comedian'}
                </a>
                <span class="terminal-separator">•</span>
                <span>${formatDate(video.uploadDate)}</span>
                <span class="terminal-separator">•</span>
                <span>${formatDuration(video.duration)}</span>
              </div>
              
              <div class="terminal-video-tags">
                <span class="terminal-tag terminal-tag-primary">${video.genre || 'STAND-UP'}</span>
                ${video.channelTitle ? `<span class="terminal-tag">VIA: ${video.channelTitle}</span>` : ''}
              </div>

              ${video.description ? `
                <div class="terminal-video-description">
                  <div class="terminal-card-header" style="margin-bottom: var(--space-md);">DESCRIPTION</div>
                  <p>${video.description}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Sidebar with comedian info -->
        <div class="terminal-video-sidebar">
          <div class="terminal-card">
            <div class="terminal-card-header">COMEDIAN</div>
            <div class="comedian-mini-profile">
              <div class="comedian-avatar">
                ${(comedian?.name || 'UK').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div class="comedian-mini-info">
                <h3>${comedian?.name || 'Unknown'}</h3>
                ${comedian?.homeLocation?.name ? `<p>${comedian.homeLocation.name}</p>` : ''}
              </div>
            </div>
            <a href="#/poet/${comedian?.entityId || ''}" class="btn-terminal">
              VIEW ALL VIDEOS →
            </a>
          </div>

          <!-- Stats -->
          <div class="terminal-card">
            <div class="terminal-card-header">VIDEO INFO</div>
            <div class="terminal-info-grid">
              <div class="info-row">
                <span class="info-label">FORMAT</span>
                <span class="info-value">${video.genre || 'Stand-up Clip'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">DURATION</span>
                <span class="info-value terminal-mono">${formatDuration(video.duration)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">PUBLISHED</span>
                <span class="info-value terminal-mono">${formatDate(video.uploadDate)}</span>
              </div>
              ${video.viewCount ? `
                <div class="info-row">
                  <span class="info-label">VIEWS</span>
                  <span class="info-value terminal-mono">${formatNumber(video.viewCount)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listener for bookmark
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
        btnBookmark.innerHTML = '♥ SAVED';
      } else {
        btnBookmark.classList.remove('active');
        btnBookmark.innerHTML = '♡ SAVE';
      }
    });
  }
}

// Helper functions
function updateTerminalClock() {
  const clockEl = document.getElementById('terminal-clock');
  if (!clockEl) return;

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  clockEl.textContent = `${date} ${time} UTC+5:30`;
}

function mapLanguageCode(code) {
  const map = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'ur': 'Urdu',
    'kn': 'Kannada'
  };
  return map[code] || code;
}

function getDomainName(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '').replace('.com', '').replace('.org', '').toUpperCase();
  } catch {
    return 'LINK';
  }
}

function truncateTitle(title, maxLength) {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

function formatDuration(duration) {
  if (!duration) return '--:--';
  const match = duration.match(/PT(\d+)M(\d+)?S?/);
  if (!match) return duration;
  const mins = match[1];
  const secs = match[2] || '00';
  return `${mins}:${secs.padStart(2, '0')}`;
}

function formatDate(date) {
  if (!date) return '----/--/--';
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch {
    return date;
  }
}

function formatNumber(num) {
  if (!num) return '0';
  return parseInt(num).toLocaleString();
}
