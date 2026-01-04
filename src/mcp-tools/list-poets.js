
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

async function listPoets() {
    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);


        const candidates = catalog.entities.filter(p =>
            p.knowsLanguage && (
                p.knowsLanguage.includes('Urdu') ||
                p.knowsLanguage.includes('Hindi') ||
                p.knowsLanguage.includes('Hindustani')
            )
        ).map(p => ({
            name: p.name,
            id: p.entityId,
            language: p.knowsLanguage,
            rekhtaUrl: p.sameAs ? p.sameAs.find(u => u.includes('rekhta.org')) : null
        }));

        console.log(`Found ${candidates.length} candidates.`);
        await fs.writeFile(path.join(__dirname, 'target-poets.json'), JSON.stringify(candidates, null, 2));
        console.log('Saved to src/mcp-tools/target-poets.json');

    } catch (error) {
        console.error('Error:', error);
    }
}

listPoets();
