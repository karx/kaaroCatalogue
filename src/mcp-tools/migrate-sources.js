
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

async function migrateSources() {
    console.log('Starting source migration...');

    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Migrate Entities
        let entityCount = 0;
        for (const entity of catalog.entities) {
            if (!entity.source) {
                // Construct source object from existing fields
                const sourceObj = {
                    name: 'Wikipedia', // Default for existing entities as they mostly came from Wiki
                    url: entity.sameAs?.[0] || entity.sourceUrl || '',
                    retrievedAt: entity.extractedAt || new Date().toISOString()
                };

                // Clean up old fields if they exist (optional, but good for schema cleanliness)
                // We keep sameAs as it's schema.org standard
                // We remove sourceUrl and extractedAt from root if we want to be strict, 
                // but for safety let's just ADD the source object for now and maybe deprecate others later.
                // Actually, let's clean up non-standard fields if they exist to avoid confusion.
                if (entity.sourceUrl) delete entity.sourceUrl;
                if (entity.extractedAt) delete entity.extractedAt;
                if (entity.discoverySource) delete entity.discoverySource;

                entity.source = sourceObj;
                entityCount++;
            }
        }
        console.log(`Migrated ${entityCount} entities.`);

        // Migrate Works
        let workCount = 0;
        if (catalog.works) {
            for (const work of catalog.works) {
                if (!work.source || typeof work.source === 'string') {
                    const sourceName = work.discoverySource === 'catalog_majorWorks' ? 'KaaroCatalogue Archive' :
                        work.discoverySource === 'wikipedia_infobox' ? 'Wikipedia Infobox' :
                            work.discoverySource === 'wikipedia_section' ? 'Wikipedia Section' :
                                'Wikipedia';

                    const sourceObj = {
                        name: sourceName,
                        url: work.sourceUrl || '',
                        retrievedAt: work.addedAt || work.extractedAt || new Date().toISOString()
                    };

                    if (work.sourceUrl) delete work.sourceUrl;
                    if (work.addedAt) delete work.addedAt;
                    if (work.extractedAt) delete work.extractedAt;
                    if (work.discoverySource) delete work.discoverySource;

                    work.source = sourceObj;
                    workCount++;
                }
            }
        }
        console.log(`Migrated ${workCount} works.`);

        // Save updated catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Migration completed and saved.');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateSources();
