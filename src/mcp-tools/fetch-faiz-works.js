
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverWorksFromWikipedia, extractWorkFromWikipedia } from './sources/poetry-sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

async function fetchFaizWorks() {
    console.log('Starting Faiz Ahmed Faiz ingestion...');

    try {
        // Load catalog
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Find Faiz
        let poet = catalog.entities.find(e => e.name.includes('Faiz Ahmed Faiz'));
        if (!poet) {
            console.log('Faiz not found, creating entity...');
            // Create basic entity if not found (though we expect him to be there or added via CLI)
            poet = {
                "@type": "Person",
                "entityId": `poet-${Date.now()}`,
                "name": "Faiz Ahmed Faiz",
                "knowsLanguage": "Urdu",
                "birthDate": "1911-02-13",
                "deathDate": "1984-11-20",
                "homeLocation": { "@type": "Place", "name": "Sialkot, Punjab" },
                "description": "Celebrated Urdu poet and intellectual.",
                "verified": true
            };
            catalog.entities.push(poet);
        }

        const poetId = poet.entityId;
        console.log(`Using Poet ID: ${poetId} for ${poet.name}`);

        if (!catalog.works) catalog.works = [];

        // Discover works
        console.log('Discovering works from Wikipedia...');
        const wikiUrl = 'https://en.wikipedia.org/wiki/Faiz_Ahmed_Faiz';
        const discoveredWorks = await discoverWorksFromWikipedia(poet.name, wikiUrl);

        console.log(`Found ${discoveredWorks.length} potential works.`);

        let totalAdded = 0;
        let totalUpdated = 0;

        for (const workCandidate of discoveredWorks) {
            console.log(`Processing: ${workCandidate.name}...`);

            // Check if already exists
            const existingIndex = catalog.works.findIndex(w =>
                w.author['@id'] === poetId &&
                w.name.toLowerCase() === workCandidate.name.toLowerCase()
            );

            if (existingIndex !== -1) {
                console.log(`  - Already exists, skipping (or could update)`);
                continue;
            }

            // Extract details
            try {
                const details = await extractWorkFromWikipedia(workCandidate.name);

                if (details.found) {
                    const workEntry = {
                        ...details,
                        workId: `work-faiz-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        author: {
                            "@type": "Person",
                            "@id": poetId
                        },
                        source: {
                            name: "Wikipedia",
                            url: details.sourceUrl,
                            retrievedAt: new Date().toISOString()
                        }
                    };

                    // Remove internal flags
                    delete workEntry.found;
                    delete workEntry.extractedAt;

                    catalog.works.push(workEntry);
                    totalAdded++;
                    console.log(`  + Added: ${workEntry.name}`);

                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log(`  - Details not found for ${workCandidate.name}`);
                }
            } catch (err) {
                console.error(`  ! Error extracting ${workCandidate.name}:`, err.message);
            }
        }

        console.log(`\n\nSuccessfully added ${totalAdded} new works.`);

        // Save catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Catalog saved.');

    } catch (error) {
        console.error('Ingestion failed:', error);
    }
}

fetchFaizWorks();
