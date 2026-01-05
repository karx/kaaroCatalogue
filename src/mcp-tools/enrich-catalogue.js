
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { discover_works } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

async function enrichAll() {
    console.log('Starting catalogue enrichment...');

    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        if (!catalog.works) {
            catalog.works = [];
        }

        let totalAdded = 0;

        for (const poet of catalog.entities) {
            console.log(`Processing ${poet.name}...`);

            try {
                const result = await discover_works({
                    poetId: poet.entityId,
                    poetName: poet.name,
                    wikiUrl: poet.sameAs?.[0]
                });

                if (result.works && result.works.length > 0) {
                    let addedForPoet = 0;
                    for (const work of result.works) {
                        // Check if work already exists
                        const exists = catalog.works.some(w =>
                            w.name.toLowerCase() === work.name.toLowerCase() &&
                            w.author['@id'] === poet.entityId
                        );

                        if (!exists) {
                            catalog.works.push({
                                "@type": "CreativeWork",
                                "workId": work.workId || `work-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
                                "name": work.name,
                                "author": {
                                    "@type": "Person",
                                    "@id": poet.entityId
                                },
                                "inLanguage": poet.knowsLanguage,
                                "source": {
                                    "name": work.source === 'catalog_majorWorks' ? 'KaaroCatalogue Archive' : 'Wikipedia',
                                    "url": `https://en.wikipedia.org/wiki/${work.name.replace(/ /g, '_')}`,
                                    "retrievedAt": new Date().toISOString()
                                }
                            });
                            addedForPoet++;
                        }
                    }
                    console.log(`  + Added ${addedForPoet} works`);
                    totalAdded += addedForPoet;
                }
            } catch (err) {
                console.error(`  Failed to process ${poet.name}:`, err.message);
            }

            // Small delay to be nice to Wikipedia API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\nTotal new works added: ${totalAdded}`);

        // Save updated catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Catalog saved successfully.');

    } catch (error) {
        console.error('Enrichment failed:', error);
    }
}

enrichAll();
