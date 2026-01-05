
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Rekhta Adapter
 * Handles interactions with Rekhta.org for discovering and extracting Urdu poetry.
 */

// Helper to fetch and extract content from a work page
async function fetchAndExtract(url, langName) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        let text = '';

        // Try .pMC .c p (lines) - standard format
        const lines = [];
        $('.pMC .c p').each((i, el) => {
            lines.push($(el).text().trim());
        });

        if (lines.length > 0) {
            text = lines.join('\n');
        } else {
            // Fallback to .pMC text if no p tags
            text = $('.pMC').text().trim();
        }

        // Clean up
        if (text) {
            return text
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .join('\n');
        }
        return null;
    } catch (e) {
        console.error(`Error fetching ${langName} from ${url}: ${e.message}`);
        return null;
    }
}

/**
 * Extracts content for a specific work URL in multiple languages.
 * Note: Rekhta often loads native scripts dynamically, so this might return Roman for all if not rendered server-side.
 * @param {string} workUrl 
 */
export async function extract_work_content(workUrl) {
    const content = {};

    // 1. Roman (Default)
    console.log('  -> Fetching Roman...');
    content.roman = await fetchAndExtract(workUrl, 'Roman');
    await new Promise(r => setTimeout(r, 1000)); // Polite delay

    // 2. Urdu
    console.log('  -> Fetching Urdu...');
    content.urdu = await fetchAndExtract(`${workUrl}?lang=ur`, 'Urdu');
    await new Promise(r => setTimeout(r, 1000));

    // 3. Hindi
    console.log('  -> Fetching Hindi...');
    content.hindi = await fetchAndExtract(`${workUrl}?lang=hi`, 'Hindi');
    await new Promise(r => setTimeout(r, 1000));

    return content;
}

/**
 * Ingests works from a list of objects { title, url } into the catalog.
 * @param {string} poetId - The entityId of the poet in the catalog
 * @param {Array} worksList - Array of { title, url }
 * @param {Object} catalog - The full catalog object
 * @returns {Object} - { added: number, skipped: number }
 */
export function ingest_rekhta_works(poetId, worksList, catalog) {
    let addedCount = 0;
    let skippedCount = 0;

    for (const item of worksList) {
        // Check if work already exists (by URL or name)
        const exists = catalog.works.some(w =>
            w.author['@id'] === poetId &&
            (w.name === item.title || (w.sameAs && w.sameAs.includes(item.url)))
        );

        if (exists) {
            skippedCount++;
            continue;
        }

        const workEntry = {
            "@type": "CreativeWork",
            "workId": `work-rekhta-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            "name": item.title,
            "author": {
                "@type": "Person",
                "@id": poetId
            },
            "inLanguage": "Urdu", // Default, can be updated
            "genre": "Ghazal", // Default, logic could be improved to detect genre from URL or title
            "keywords": ["Ghazal", "Urdu Poetry", "Rekhta"],
            "source": {
                "name": "Rekhta",
                "url": item.url,
                "retrievedAt": new Date().toISOString()
            },
            "sameAs": [item.url]
        };

        catalog.works.push(workEntry);
        addedCount++;
    }

    return { added: addedCount, skipped: skippedCount };
}

/**
 * Discovers works from a Rekhta poet profile.
 * CURRENTLY LIMITED: Rekhta uses client-side rendering for lists.
 * This function attempts to parse the server-rendered HTML, but might need browser automation for full results.
 * @param {string} profileUrl 
 */
export async function discover_rekhta_works(profileUrl) {
    // TODO: Implement robust discovery. 
    // For now, this is a placeholder that warns about the limitation or tries basic scraping.
    console.log('⚠️  Note: Rekhta work discovery often requires browser automation.');
    console.log('   For best results, provide a list of works or use the browser-based discovery tool.');

    try {
        const response = await fetch(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const works = [];

        // Try to find any direct links to ghazals (often in "Top 20" or similar sections if rendered)
        $('a[href*="/ghazals/"]').each((i, el) => {
            const url = $(el).attr('href');
            const title = $(el).text().trim();
            if (url && title && !works.some(w => w.url === url)) {
                works.push({ title, url });
            }
        });

        return works;
    } catch (e) {
        console.error('Discovery failed:', e.message);
        return [];
    }
}
