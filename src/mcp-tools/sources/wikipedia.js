/**
 * Wikipedia Source Adapter
 * Scrapes Wikipedia list pages and individual poet pages
 */

/**
 * Fetch and parse a Wikipedia list page to extract entity names and URLs
 * @param {string} listUrl - Wikipedia list page URL
 * @param {number} limit - Maximum entities to return
 * @returns {Promise<Array<{name: string, wikiUrl: string, snippet: string}>>}
 */
export async function discoverFromWikipediaList(listUrl, limit = 50) {
    try {
        // Use Wikipedia API to get page content
        const pageTitle = extractPageTitle(listUrl);
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&prop=links|text&origin=*`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Wikipedia page not found: ${data.error.info}`);
        }

        // Extract internal links (potential poet pages)
        const links = data.parse?.links || [];
        const candidates = links
            .filter(link => link.ns === 0) // Main namespace only
            .filter(link => !isExcludedPage(link['*']))
            .slice(0, limit)
            .map(link => ({
                name: link['*'],
                wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(link['*'].replace(/ /g, '_'))}`,
                snippet: '', // Will be populated during extraction
                source: 'wikipedia',
                discoveredAt: new Date().toISOString()
            }));

        return candidates;
    } catch (error) {
        console.error('Wikipedia discovery error:', error.message);
        throw error;
    }
}

/**
 * Fetch structured data from a Wikipedia page about a poet
 * @param {string} poetName - Name of the poet
 * @param {string} wikiUrl - Wikipedia URL
 * @returns {Promise<Object>} Extracted entity data
 */
export async function extractFromWikipedia(poetName, wikiUrl) {
    try {
        const pageTitle = extractPageTitle(wikiUrl);

        // Fetch page extract and infobox data
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageprops|revisions&exintro=1&explaintext=1&rvprop=content&rvslots=main&format=json&origin=*`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();
        const pages = data.query?.pages || {};
        const page = Object.values(pages)[0];

        if (page.missing) {
            throw new Error(`Wikipedia page not found: ${poetName}`);
        }

        const extract = page.extract || '';
        const content = page.revisions?.[0]?.slots?.main?.['*'] || '';

        // Parse infobox for structured data
        const infobox = parseInfobox(content);

        // Build entity from extracted data
        const entity = {
            "@type": "Person",
            "entityId": generateEntityId(poetName),
            "name": poetName,
            "additionalType": "Kavi",
            "birthDate": infobox.birth_date || infobox.born || '',
            "deathDate": infobox.death_date || infobox.died || '',
            "knowsLanguage": infobox.language || detectLanguage(extract),
            "homeLocation": infobox.birth_place ? {
                "@type": "Place",
                "name": cleanText(infobox.birth_place)
            } : null,
            "hasOccupation": {
                "@type": "Occupation",
                "name": infobox.occupation || "Poet"
            },
            "award": parseList(infobox.awards || infobox.notable_works),
            "sameAs": [wikiUrl],
            "keywords": extractKeywords(extract),
            "abstract": extract.slice(0, 500),
            "sourceUrl": wikiUrl,
            "extractedAt": new Date().toISOString(),
            "confidence": calculateConfidence(infobox, extract)
        };

        // Clean up null/empty fields
        return cleanEntity(entity);
    } catch (error) {
        console.error('Wikipedia extraction error:', error.message);
        throw error;
    }
}

// ============================================
// Helper Functions
// ============================================

function extractPageTitle(url) {
    const match = url.match(/\/wiki\/(.+?)(?:\?|#|$)/);
    return match ? decodeURIComponent(match[1].replace(/_/g, ' ')) : '';
}

function isExcludedPage(title) {
    const excludePatterns = [
        /^List of/i,
        /^Category:/i,
        /^Wikipedia:/i,
        /^Template:/i,
        /^Portal:/i,
        /^File:/i,
        /^Help:/i,
        /century$/i,
        /poetry$/i,
        /literature$/i,
        /language$/i
    ];
    return excludePatterns.some(pattern => pattern.test(title));
}

function parseInfobox(wikitext) {
    const infobox = {};
    // Match infobox content
    const infoboxMatch = wikitext.match(/\{\{Infobox[^}]*\}\}/is);
    if (!infoboxMatch) return infobox;

    const content = infoboxMatch[0];
    // Parse key-value pairs
    const pairs = content.matchAll(/\|\s*(\w+)\s*=\s*([^|{}]+)/g);
    for (const [, key, value] of pairs) {
        infobox[key.toLowerCase().trim()] = cleanText(value);
    }

    return infobox;
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, link, display) => display || link)
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\n/g, ' ')
        .trim();
}

function parseList(text) {
    if (!text) return [];
    return text.split(/[,;]/).map(item => cleanText(item)).filter(Boolean);
}

function detectLanguage(text) {
    const langKeywords = {
        'Hindi': ['Hindi', 'Braj', 'Avadhi', 'Hindustani'],
        'Sanskrit': ['Sanskrit', 'Prakrit'],
        'Tamil': ['Tamil', 'Sangam'],
        'Bengali': ['Bengali', 'Bangla'],
        'Urdu': ['Urdu', 'ghazal', 'Ghazal'],
        'Kannada': ['Kannada', 'Vachana'],
        'Telugu': ['Telugu'],
        'Marathi': ['Marathi', 'Abhanga'],
        'Malayalam': ['Malayalam'],
        'Punjabi': ['Punjabi', 'Gurmukhi']
    };

    for (const [lang, keywords] of Object.entries(langKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            return lang;
        }
    }
    return '';
}

function extractKeywords(text) {
    const keywordPatterns = [
        'Bhakti', 'Sufi', 'Vachana', 'Doha', 'Ghazal', 'Kavya',
        'Mahakavya', 'Sangam', 'Renaissance', 'Modern', 'Classical',
        'Medieval', 'Devotional', 'Reform', 'Romantic', 'Progressive'
    ];
    return keywordPatterns.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
}

function generateEntityId(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `poet-${slug}-${Date.now().toString(36)}`;
}

function calculateConfidence(infobox, extract) {
    let score = 0.5; // Base score
    if (infobox.birth_date || infobox.born) score += 0.1;
    if (infobox.death_date || infobox.died) score += 0.1;
    if (infobox.language) score += 0.1;
    if (infobox.occupation) score += 0.05;
    if (extract.length > 200) score += 0.1;
    if (infobox.notable_works || infobox.awards) score += 0.05;
    return Math.min(score, 1.0);
}

function cleanEntity(entity) {
    const cleaned = {};
    for (const [key, value] of Object.entries(entity)) {
        if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

// Export for CLI usage
export default {
    discoverFromWikipediaList,
    extractFromWikipedia
};
