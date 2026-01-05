
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

async function verifySources() {
    console.log('Verifying source attributes...');

    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        let missingSourceEntities = 0;
        let missingSourceWorks = 0;

        // Check Entities
        for (const entity of catalog.entities) {
            if (!entity.source || !entity.source.name) {
                console.warn(`Entity missing source: ${entity.name}`);
                missingSourceEntities++;
            }
        }

        // Check Works
        if (catalog.works) {
            for (const work of catalog.works) {
                if (!work.source || !work.source.name) {
                    console.warn(`Work missing source: ${work.name}`);
                    missingSourceWorks++;
                }
            }
        }

        console.log('\nVerification Results:');
        console.log(`Entities missing source: ${missingSourceEntities}`);
        console.log(`Works missing source: ${missingSourceWorks}`);

        if (missingSourceEntities === 0 && missingSourceWorks === 0) {
            console.log('✅ All items have valid source attributes.');
        } else {
            console.log('❌ Verification failed.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifySources();
