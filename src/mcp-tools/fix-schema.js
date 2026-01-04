
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

async function fixCatalog() {
    try {
        console.log('🔧 Loading catalog...');
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);
        let modified = false;

        // Fix catalogId
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catalog.catalogId)) {
            console.log(`⚠️  Invalid catalogId: ${catalog.catalogId}. Generating new UUID...`);
            catalog.catalogId = uuidv4();
            modified = true;
        }

        // Fix works
        if (catalog.works && Array.isArray(catalog.works)) {
            catalog.works.forEach((work, index) => {
                if (!work['@type']) {
                    console.log(`⚠️  Work at index ${index} missing @type. Setting to "CreativeWork"...`);
                    work['@type'] = 'CreativeWork';
                    modified = true;
                }

                if (!work.workId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(work.workId)) {
                    console.log(`⚠️  Work at index ${index} has invalid workId: ${work.workId}. Generating new UUID...`);
                    work.workId = `work-${uuidv4()}`;
                    modified = true;
                }
            });
        }

        if (modified) {
            console.log('💾 Saving fixed catalog...');
            await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
            console.log('✅ Catalog fixed and saved!');
        } else {
            console.log('✨ No fixes needed.');
        }

    } catch (error) {
        console.error('🚨 Error:', error.message);
    }
}

fixCatalog();
