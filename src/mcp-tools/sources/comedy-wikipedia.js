/**
 * Wikipedia Source for Comedy Enrichment
 * Extracts comedian metadata from Wikipedia pages
 */

import https from 'https';
import * as cheerio from 'cheerio';

/**
 * Fetch and parse Wikipedia page
 * @param {string} pageTitle - Wikipedia page title or URL
 * @returns {Promise<Object>} - Parsed page data
 */
async function fetchWikipediaPage(pageTitle) {
    const url = pageTitle.startsWith('http')
        ? pageTitle
        : `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, '_')}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const $ = cheerio.load(data);
                    resolve({ url, $ });
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Extract comedian data from Wikipedia infobox
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {Object} - Extracted comedian data
 */
function extractInfobox($) {
    const infobox = $('.infobox, .infobox-person').first();

    if (!infobox.length) {
        return {};
    }

    const data = {};
    const rows = infobox.find('tr');

    rows.each((i, row) => {
        const header = $(row).find('th').first();
        const value = $(row).find('td').first();

        if (header.length && value.length) {
            const key = header.text().trim().toLowerCase();
            const val = value.text().trim();

            if (key.includes('birth') && key.includes('name')) {
                data.birthName = val;
            } else if (key.includes('born')) {
                // Parse birth date and place
                const birthMatch = val.match(/\((\d{4}-\d{2}-\d{2})\)/);
                if (birthMatch) {
                    data.birthDate = birthMatch[1];
                } else {
                    // Try to extract year at least
                    const yearMatch = val.match(/\d{4}/);
                    if (yearMatch) {
                        data.birthDate = yearMatch[0];
                    }
                }

                // Extract birthplace
                const lines = val.split('\n');
                if (lines.length > 0) {
                    data.birthPlace = lines[lines.length - 1].trim();
                }
            } else if (key.includes('medium')) {
                data.medium = val.split(',').map(m => m.trim());
            } else if (key.includes('nationality')) {
                data.nationality = val;
            } else if (key.includes('years active')) {
                data.yearsActive = val;
            } else if (key.includes('genre')) {
                data.genres = val.split(',').map(g => g.trim().toLowerCase());
            } else if (key.includes('subject')) {
                data.subjects = val.split(',').map(s => s.trim());
            } else if (key.includes('website')) {
                const link = value.find('a').first();
                if (link.length) {
                    data.website = link.attr('href');
                }
            }
        }
    });

    return data;
}

/**
 * Extract awards from Wikipedia page
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {Array} - List of awards
 */
function extractAwards($) {
    const awards = [];

    // Look for awards section
    const headings = $('h2, h3');
    let awardsSection = null;

    headings.each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes('award') || text.includes('honour')) {
            awardsSection = $(el);
            return false; // break
        }
    });

    if (awardsSection) {
        let current = awardsSection.next();

        while (current.length && !current.is('h2, h3')) {
            if (current.is('ul')) {
                current.find('li').each((i, item) => {
                    const text = $(item).text().trim();
                    if (text) {
                        awards.push(text);
                    }
                });
            } else if (current.is('table')) {
                current.find('tr').each((i, row) => {
                    const cells = $(row).find('td');
                    if (cells.length >= 2) {
                        const award = $(cells[1]).text().trim();
                        if (award) {
                            awards.push(award);
                        }
                    }
                });
            }
            current = current.next();
        }
    }

    return awards.slice(0, 10); // Limit to top 10
}

/**
 * Extract social media links
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {Object} - Social media URLs
 */
function extractSocialMedia($) {
    const social = {};

    $('a[href]').each((i, link) => {
        const href = $(link).attr('href');

        if (!href) return;

        if (href.includes('youtube.com/@') || href.includes('youtube.com/c/') || href.includes('youtube.com/user/')) {
            social.youtube = href;
        } else if (href.includes('instagram.com/')) {
            social.instagram = href;
        } else if (href.includes('twitter.com/') || href.includes('x.com/')) {
            social.twitter = href;
        } else if (href.includes('facebook.com/')) {
            social.facebook = href;
        }
    });

    return social;
}

/**
 * Extract first paragraph summary
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {string} - Abstract/summary
 */
function extractAbstract($) {
    const content = $('#mw-content-text');
    if (!content.length) return '';

    const paragraphs = content.find('p');
    for (let i = 0; i < paragraphs.length; i++) {
        const text = $(paragraphs[i]).text().trim();
        // Skip empty paragraphs and coordinate lines
        if (text.length > 100 && !text.match(/^\d+°/)) {
            return text.substring(0, 500) + (text.length > 500 ? '...' : '');
        }
    }

    return '';
}

/**
 * Extract complete comedian entity from Wikipedia
 * @param {string} name - Comedian name
 * @param {string} wikiUrl - Wikipedia URL
 * @returns {Promise<Object>} - Comedian entity
 */
export async function extractComedianFromWikipedia(name, wikiUrl) {
    console.log(`[Wikipedia] Extracting comedian: ${name}`);

    try {
        const { url, $ } = await fetchWikipediaPage(wikiUrl || name);

        const infoboxData = extractInfobox($);
        const awards = extractAwards($);
        const socialMedia = extractSocialMedia($);
        const abstract = extractAbstract($);

        // Generate entity ID
        const entityId = `comedian-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

        const entity = {
            '@type': 'Person',
            entityId,
            name,
            alternateName: infoboxData.birthName ? [infoboxData.birthName] : [],
            additionalType: 'Comedian',
            birthDate: infoboxData.birthDate || '',
            knowsLanguage: inferLanguage(infoboxData, name),
            homeLocation: infoboxData.birthPlace ? {
                '@type': 'Place',
                name: infoboxData.birthPlace
            } : null,
            hasOccupation: {
                '@type': 'Occupation',
                name: 'Stand-up Comedian'
            },
            award: awards.slice(0, 5), // Top 5 awards
            genre: infoboxData.genres || [],
            sameAs: [url],
            keywords: extractKeywords(infoboxData, $),
            verified: false,
            abstract,
            nationality: infoboxData.nationality || '',
            yearsActive: infoboxData.yearsActive || '',
            socialMedia,
            source: {
                name: 'Wikipedia',
                url: url,
                retrievedAt: new Date().toISOString()
            }
        };

        return {
            success: true,
            entity
        };

    } catch (error) {
        console.error(`[Wikipedia] Extraction failed for ${name}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Infer primary language from comedian data
 * @param {Object} infoboxData - Infobox data
 * @param {string} name - Comedian name
 * @returns {string} - ISO language code
 */
function inferLanguage(infoboxData, name) {
    const birthPlace = (infoboxData.birthPlace || '').toLowerCase();
    const nationality = (infoboxData.nationality || '').toLowerCase();

    // Indian comedians
    if (birthPlace.includes('india') || nationality.includes('indian')) {
        // Check for regional hints
        if (birthPlace.includes('mumbai') || birthPlace.includes('maharashtra')) {
            return 'hi'; // Hindi (most common in Mumbai comedy scene)
        }
        return 'hi'; // Default to Hindi for Indian comedians
    }

    // Default to English
    return 'en';
}

/**
 * Extract keywords from page content
 * @param {Object} infoboxData - Infobox data
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {Array} - Keywords
 */
function extractKeywords(infoboxData, $) {
    const keywords = new Set();

    // Add genres as keywords
    if (infoboxData.genres) {
        infoboxData.genres.forEach(g => keywords.add(g));
    }

    // Add subjects
    if (infoboxData.subjects) {
        infoboxData.subjects.forEach(s => keywords.add(s.toLowerCase()));
    }

    // Look for common comedy keywords in the text
    const content = $('#mw-content-text').text() || '';
    const commonKeywords = [
        'netflix', 'amazon prime', 'comedy central', 'standup',
        'special', 'tour', 'youtube', 'viral', 'crowd work',
        'improvisation', 'storytelling', 'observational'
    ];

    commonKeywords.forEach(keyword => {
        if (content.toLowerCase().includes(keyword)) {
            keywords.add(keyword);
        }
    });

    return Array.from(keywords).slice(0, 10);
}

/**
 * Discover comedians from Wikipedia list page
 * @param {string} listUrl - Wikipedia list page URL
 * @param {Object} options - Discovery options
 * @returns {Promise<Object>} - Discovered comedians
 */
export async function discoverComediansFromList(listUrl, options = {}) {
    console.log(`[Wikipedia] Discovering comedians from: ${listUrl}`);

    try {
        const { $ } = await fetchWikipediaPage(listUrl);

        const comedians = [];
        $('#mw-content-text a[href^="/wiki/"]').each((i, link) => {
            const href = $(link).attr('href');
            const name = $(link).text().trim();

            // Skip non-article links
            if (href.includes(':') || href.includes('#')) return;
            if (name.length < 3 || name.includes('List of')) return;

            // Check if this looks like a person name
            if (/^[A-Z][a-z]/.test(name)) {
                comedians.push({
                    name,
                    wikiUrl: `https://en.wikipedia.org${href}`,
                    discoveredFrom: listUrl
                });

                if (options.limit && comedians.length >= options.limit) {
                    return false; // break
                }
            }
        });

        return {
            success: true,
            count: comedians.length,
            comedians
        };

    } catch (error) {
        console.error(`[Wikipedia] List discovery failed:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

export default {
    extractComedianFromWikipedia,
    discoverComediansFromList
};
