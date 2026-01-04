/**
 * Poetry Sources Adapter
 * Fetches poetry content from various sources
 */

/**
 * Discover works for a poet from Wikipedia
 * @param {string} poetName - Name of the poet
 * @param {string} wikiUrl - Wikipedia URL
 * @returns {Promise<Array>} List of works
 */
export async function discoverWorksFromWikipedia(poetName, wikiUrl) {
    try {
        const pageTitle = extractPageTitle(wikiUrl);
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*&redirects=1`;

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

        const content = page.revisions?.[0]?.slots?.main?.['*'] || '';

        // Extract works from sections like "Works", "Notable works", "Bibliography"
        const works = extractWorksFromWikitext(content, poetName);

        return works;
    } catch (error) {
        console.error('Works discovery error:', error.message);
        throw error;
    }
}

/**
 * Fetch poetry content from Rekhta (for Urdu poetry)
 * @param {string} poetName - Poet name
 * @param {string} poemName - Poem/ghazal name
 * @returns {Promise<Object>} Poetry content
 */
export async function fetchFromRekhta(poetName, poemName) {
    // Note: Rekhta doesn't have a public API, so we'll structure sample data
    // In production, this would scrape or use an API
    const slug = poetName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
        source: 'rekhta',
        poetSlug: slug,
        poemName,
        content: null, // Would be populated from actual scraping
        sourceUrl: `https://www.rekhta.org/poets/${slug}`,
        message: 'Rekhta integration requires manual content addition'
    };
}

/**
 * Extract work metadata from Wikipedia infobox and sections
 */
function extractWorksFromWikitext(wikitext, poetName) {
    const works = [];

    // Look for "Notable works" or "Works" in infobox
    const notableWorksMatch = wikitext.match(/\|\s*(?:notable_?works?|major_?works?|works)\s*=\s*([^\n|]+)/i);
    if (notableWorksMatch) {
        const worksList = notableWorksMatch[1]
            .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, link, display) => display || link)
            .replace(/\{\{[^}]+\}\}/g, '')
            .split(/[,;]/)
            .map(w => w.trim())
            .filter(w => w.length > 2);

        worksList.forEach((name, index) => {
            works.push({
                name: cleanText(name),
                workId: `work-${Date.now().toString(36)}-${index}`,
                poetName,
                source: 'wikipedia_infobox',
                discoveredAt: new Date().toISOString()
            });
        });
    }

    // Look for Works/Bibliography section
    const sectionPatterns = [
        /==+\s*(?:Works|Bibliography|Major works|Notable works|Selected works|Poetry collections?|Literary works|Publications|Books)\s*==+([^=]+(?:===[^=]+===[^=]+)*)/gi
    ];

    for (const pattern of sectionPatterns) {
        const match = pattern.exec(wikitext);
        if (match) {
            const sectionContent = match[1];
            // Extract list items
            // Extract list items (wikilinks or plain text)
            const listItems = sectionContent.match(/\*+\s*(?:\[\[([^\]|]+)(?:\|[^\]]+)?\]\]|([^\n]+))/g) || [];
            listItems.forEach((item, index) => {
                let name = '';
                const linkMatch = item.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
                if (linkMatch) {
                    name = linkMatch[1];
                } else {
                    // Fallback to plain text, cleaning up * and italics
                    name = item.replace(/^\*+\s*/, '').replace(/''/g, '').trim();
                }

                if (name && name.length > 2) {
                    name = cleanText(name);
                    // Avoid duplicates
                    if (!works.some(w => w.name.toLowerCase() === name.toLowerCase())) {
                        works.push({
                            name,
                            workId: `work-${Date.now().toString(36)}-sec-${index}`,
                            poetName,
                            source: 'wikipedia_section',
                            discoveredAt: new Date().toISOString()
                        });
                    }
                }
            });
        }
    }

    return works;
}

/**
 * Fetch detailed work info from Wikipedia
 */
export async function extractWorkFromWikipedia(workName, wikiUrl) {
    try {
        const pageTitle = wikiUrl ? extractPageTitle(wikiUrl) : workName;
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|revisions&exintro=1&explaintext=1&rvprop=content&rvslots=main&format=json&origin=*`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();
        const pages = data.query?.pages || {};
        const page = Object.values(pages)[0];

        if (page.missing) {
            return {
                name: workName,
                abstract: null,
                content: null,
                found: false
            };
        }

        const extract = page.extract || '';
        const content = page.revisions?.[0]?.slots?.main?.['*'] || '';

        // Parse infobox for work details
        const infobox = parseWorkInfobox(content);

        return {
            name: workName,
            "@type": infobox.type || "CreativeWork",
            abstract: extract.slice(0, 500),
            inLanguage: infobox.language || '',
            dateCreated: infobox.published || infobox.written || '',
            genre: infobox.genre || '',
            author: infobox.author || '',
            sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
            content: infobox.text ? {
                original: infobox.text
            } : null,
            found: true,
            extractedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Work extraction error:', error.message);
        throw error;
    }
}

// ============================================
// Helper Functions
// ============================================

function extractPageTitle(url) {
    if (!url) return '';
    const match = url.match(/\/wiki\/(.+?)(?:\?|#|$)/);
    return match ? decodeURIComponent(match[1].replace(/_/g, ' ')) : url;
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, link, display) => display || link)
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/'''?/g, '')
        .replace(/\n/g, ' ')
        .trim();
}

function parseWorkInfobox(wikitext) {
    const info = {};
    const infoboxMatch = wikitext.match(/\{\{Infobox[^}]*\}\}/is);
    if (!infoboxMatch) return info;

    const content = infoboxMatch[0];
    const pairs = content.matchAll(/\|\s*(\w+)\s*=\s*([^|{}]+)/g);
    for (const [, key, value] of pairs) {
        info[key.toLowerCase().trim()] = cleanText(value);
    }

    // Determine type from infobox
    if (content.includes('Infobox book') || content.includes('Infobox poem')) {
        info.type = 'Book';
    } else if (content.includes('Infobox song')) {
        info.type = 'MusicComposition';
    }

    return info;
}

// ============================================
// Sample Poetry Data (for demo)
// ============================================

export const samplePoetryContent = {
    'ghalib-hazaaron': {
        name: 'Hazaaron Khwahishen Aisi',
        original: `ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے

نکلنا خُلد سے آدم کا سنتے آئے ہیں لیکن
بہت بے آبرو ہو کر ترے کوچے سے ہم نکلے

مگر لکھوائے کوئی اس کو خط تو ہم سے لکھوائے
ہوئی صبح اور گھر سے کان پر رکھ کر قلم نکلے`,
        transliteration: `Hazaaron khwahishen aisi ke har khwahish pe dam nikle
Bahut nikle mere armaan lekin phir bhi kam nikle

Nikalna khuld se Adam ka sunte aaye hain lekin
Bahut be-aabru ho kar tere kooche se hum nikle

Magar likhwaaye koi us ko khat to hum se likhwaaye
Hui subah aur ghar se kaan par rakh kar qalam nikle`,
        translation: `A thousand desires such that each desire steals my breath
Many of my yearnings came out, but still too few

We have heard of Adam being expelled from paradise
But we left your street even more dishonored

But if someone wants a letter written, let them get it from me
Morning came and from home with pen tucked behind ear, I left`
    },
    'kabir-moko': {
        name: 'Moko Kahan Dhundhe Re Bande',
        original: `मोको कहाँ ढूँढे रे बंदे
मैं तो तेरे पास में

न तीरथ में न मूरत में
न एकांत निवास में

न मंदिर में न मस्जिद में
न काबे कैलाश में

मैं तो तेरे पास में बंदे
मैं तो तेरे पास में`,
        transliteration: `Moko Kahan Dhundhe Re Bande
Main To Tere Paas Mein

Na Tirath Mein Na Murat Mein
Na Ekant Niwas Mein

Na Mandir Mein Na Masjid Mein
Na Kabe Kailash Mein

Main To Tere Paas Mein Bande
Main To Tere Paas Mein`,
        translation: `Where do you search for me, O seeker?
I am right beside you

Not in pilgrimages, not in idols
Not in solitary meditation

Not in temples, not in mosques
Not in Kaaba, not in Kailash

I am right beside you, O seeker
I am right beside you`
    },
    'mir-dil': {
        name: 'Dil Hi To Hai',
        original: `دل ہی تو ہے نہ سنگ و خشت درد سے بھر نہ آئے کیوں
روئیں گے ہم ہزار بار کوئی ہمیں ستائے کیوں`,
        transliteration: `Dil hi to hai na sang o khisht, dard se bhar na aaye kyun
Royenge hum hazaar baar, koi humein sataaye kyun`,
        translation: `It is but a heart, not stone or brick, why would it not fill with pain?
We shall weep a thousand times, why would anyone torment us?`
    }
};

export default {
    discoverWorksFromWikipedia,
    extractWorkFromWikipedia,
    fetchFromRekhta,
    samplePoetryContent
};
