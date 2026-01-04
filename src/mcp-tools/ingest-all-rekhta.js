
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ingest_rekhta_works, extract_work_content } from './rekhta-adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const DISCOVERED_PATH = path.join(__dirname, 'discovered-works.json');
const TARGET_POETS_PATH = path.join(__dirname, 'target-poets.json');

async function ingestAll() {
    try {
        console.log('🔧 Loading data...');
        const catalogContent = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(catalogContent);

        const discoveredContent = await fs.readFile(DISCOVERED_PATH, 'utf-8');
        const discoveredWorks = JSON.parse(discoveredContent);

        const targetPoetsContent = await fs.readFile(TARGET_POETS_PATH, 'utf-8');
        const targetPoets = JSON.parse(targetPoetsContent);

        let totalAdded = 0;
        let totalSkipped = 0;

        for (const [poetName, works] of Object.entries(discoveredWorks)) {
            if (works.length === 0) {
                console.log(`⚠️  No works found for ${poetName}. Skipping.`);
                continue;
            }

            const poetInfo = targetPoets.find(p => p.name === poetName);
            if (!poetInfo) {
                console.log(`⚠️  Poet ${poetName} not found in target list. Skipping.`);
                continue;
            }

            console.log(`\nProcessing ${poetName} (${works.length} works)...`);
            const { added, skipped } = ingest_rekhta_works(poetInfo.id, works, catalog);
            console.log(`  - Added: ${added}, Skipped: ${skipped}`);
            totalAdded += added;
            totalSkipped += skipped;

            // Extract content for new works
            // We need to find the newly added works to extract content
            // Or just iterate works and check if content is missing
            // For simplicity, let's extract for the works we just tried to add (if they are in catalog)

            for (const workItem of works) {
                const catalogWork = catalog.works.find(w => w.sameAs && w.sameAs.includes(workItem.url));
                if (catalogWork && (!catalogWork.content || !catalogWork.content.roman)) {
                    console.log(`  - Extracting content for: ${catalogWork.name}`);
                    const content = await extract_work_content(workItem.url);
                    if (content) {
                        catalogWork.content = {
                            ...catalogWork.content,
                            ...content,
                            lastUpdated: new Date().toISOString()
                        };
                        console.log('    ✅ Content extracted.');
                    }
                }
            }
        }

        if (totalAdded > 0) {
            console.log('\n💾 Saving catalog...');
            await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
            console.log('✅ Catalog updated!');
        } else {
            console.log('\n✨ No new works added.');
        }

    } catch (error) {
        console.error('🚨 Error:', error);
    }
}

ingestAll();
