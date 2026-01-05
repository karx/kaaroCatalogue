
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');
const GHAZALS_PATH = path.join(__dirname, '..', '..', 'faiz-ghazals.json');

async function ingestWorks() {
    console.log('Ingesting discovered Faiz works...');

    try {
        // Load catalog
        const catalogContent = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(catalogContent);

        // Load discovered ghazals
        const ghazalsContent = await fs.readFile(GHAZALS_PATH, 'utf-8');
        const ghazals = JSON.parse(ghazalsContent);

        // Find Faiz
        const poet = catalog.entities.find(e => e.name.includes('Faiz Ahmed Faiz'));
        if (!poet) {
            throw new Error('Faiz Ahmed Faiz not found in catalog');
        }
        const poetId = poet.entityId;

        let addedCount = 0;
        let skippedCount = 0;

        for (const item of ghazals) {
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
                "workId": `work-faiz-rekhta-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                "name": item.title,
                "author": {
                    "@type": "Person",
                    "@id": poetId
                },
                "inLanguage": "Urdu",
                "genre": "Ghazal",
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
            console.log(`+ Added: ${item.title}`);
        }

        console.log(`\nSummary: Added ${addedCount}, Skipped ${skippedCount} (duplicates).`);

        // Save catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Catalog saved.');

    } catch (error) {
        console.error('Ingestion failed:', error);
    }
}

ingestWorks();
