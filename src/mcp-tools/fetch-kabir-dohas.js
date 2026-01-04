
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

async function fetchAndEnrich() {
    console.log('Starting Kabir Doha enrichment...');

    try {
        // Load catalog
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Find Kabir
        const kabirId = 'poet-002';
        const kabir = catalog.entities.find(e => e.entityId === kabirId);
        if (!kabir) throw new Error('Kabir not found in catalog');

        if (!catalog.works) catalog.works = [];

        let totalAdded = 0;
        let totalUpdated = 0;

        const baseUrl = 'https://raw.githubusercontent.com/vijayhardaha/kabir-ke-dohe/master/docs/collections/';
        const blobBaseUrl = 'https://github.com/vijayhardaha/kabir-ke-dohe/blob/master/docs/collections/';
        const collections = [];

        // Generate collection URLs (01-to-50 up to 2251-to-2300)
        // 2300 / 50 = 46 chunks
        for (let i = 0; i < 46; i++) {
            const start = i * 50 + 1;
            const end = (i + 1) * 50;
            const startStr = String(start).padStart(2, '0');
            const endStr = String(end).padStart(2, '0');
            const filename = `collection-${startStr}-to-${endStr}.md`;
            collections.push({
                fetchUrl: `${baseUrl}${filename}`,
                sourceUrl: `${blobBaseUrl}${filename}`
            });
        }

        for (const { fetchUrl, sourceUrl } of collections) {
            console.log(`Fetching ${fetchUrl}...`);
            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) {
                    console.error(`Failed to fetch ${fetchUrl}: ${response.statusText}`);
                    continue;
                }
                const markdown = await response.text();

                // Regex to split by separator or just find blocks
                // The separator seems to be "---"
                const blocks = markdown.split('---');

                for (const block of blocks) {
                    // Updated regex to capture Explanation (Vyakhya) as well
                    const dohaMatch = block.match(/([\s\S]+?)\n\n\*\*अर्थ:\*\*\s*([\s\S]+?)\n\n\*\*Meaning:\*\*\s*([\s\S]+?)(?:\n\n\*\*व्याख्या:\*\*\s*([\s\S]+?))?(?:\n\n|$)/);

                    if (dohaMatch) {
                        let [_, original, hindiMeaning, englishMeaning, explanation] = dohaMatch;

                        // Clean up original text
                        // Remove markdown headers (# Title) and other artifacts
                        original = original.replace(/^#.*$/gm, '').trim();

                        // Remove backslashes and normalize whitespace while preserving newlines
                        original = original.replace(/\\/g, '')
                            .split('\n')
                            .map(line => line.trim().replace(/\s+/g, ' '))
                            .filter(line => line)
                            .join('\n');

                        // Extract doha number if present (||1||)
                        const numberMatch = original.match(/।।(\d+)।।/);
                        const dohaNumber = numberMatch ? numberMatch[1] : '';

                        // Clean up meanings
                        hindiMeaning = hindiMeaning.trim();
                        englishMeaning = englishMeaning.trim();
                        explanation = explanation ? explanation.trim() : '';

                        // Use first line (or first few words) as title
                        // Remove the number from the title if present
                        const cleanOriginal = original.replace(/।।\d+।।/, '').trim();
                        const title = cleanOriginal.split(/[।!?]/)[0].trim(); // Split by sentence enders
                        const workName = title.length > 50 ? title.substring(0, 50) + '...' : title;

                        // Check for duplicates (by content roughly)
                        const existingIndex = catalog.works.findIndex(w =>
                            w.author['@id'] === kabirId &&
                            w.content &&
                            w.content.original &&
                            w.content.original.includes(original.substring(0, 20))
                        );

                        const workEntry = {
                            "@type": "CreativeWork",
                            "workId": existingIndex !== -1 ? catalog.works[existingIndex].workId : `work-kabir-doha-${dohaNumber || Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            "name": workName,
                            "author": {
                                "@type": "Person",
                                "@id": kabirId
                            },
                            "inLanguage": "Hindi", // Sadhukkadi/Hindi
                            "genre": "Doha",
                            "dateCreated": "15th Century",
                            "abstract": englishMeaning, // Use translation as abstract for card view
                            "keywords": ["Doha", "Bhakti Movement", "Kabir Ke Dohe", "Wisdom", "Spirituality"],
                            "content": {
                                "original": original,
                                "translation": englishMeaning,
                                "meaning": hindiMeaning,
                                "explanation": explanation
                            },
                            "source": {
                                "name": "vijayhardaha/kabir-ke-dohe (GitHub)",
                                "url": sourceUrl,
                                "retrievedAt": new Date().toISOString()
                            }
                        };

                        if (existingIndex !== -1) {
                            // Update existing
                            catalog.works[existingIndex] = workEntry;
                            totalUpdated++;
                            // process.stdout.write('u');
                        } else {
                            // Add new
                            catalog.works.push(workEntry);
                            totalAdded++;
                            // process.stdout.write('+');
                        }
                    }
                }
            } catch (err) {
                console.error(`Error processing ${fetchUrl}:`, err);
            }
        }

        console.log(`\n\nSuccessfully added ${totalAdded} new Dohas.`);
        console.log(`Successfully updated ${totalUpdated} existing Dohas.`);

        // Save catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Catalog saved.');

    } catch (error) {
        console.error('Enrichment failed:', error);
    }
}

fetchAndEnrich();
