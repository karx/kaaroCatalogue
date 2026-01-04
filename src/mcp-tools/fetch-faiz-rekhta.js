
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

const FAIZ_WORKS = [
    {
        name: "Gulon Mein Rang Bhare",
        type: "Ghazal",
        slug: "gulon-mein-rang-bhare-baad-e-naubahaar-chale-faiz-ahmed-faiz-ghazals",
        abstract: "One of Faiz's most famous ghazals, popularized by Mehdi Hassan. A beautiful blend of romantic imagery and political longing."
    },
    {
        name: "Hum Dekhenge",
        type: "Nazm",
        slug: "hum-dekhenge-laazim-hai-ki-hum-bhi-dekhenge-faiz-ahmed-faiz-nazms",
        abstract: "The anthem of protest. Written against the Zia regime, it uses Islamic imagery to challenge tyranny."
    },
    {
        name: "Bol Ke Lab Azaad Hain Tere",
        type: "Nazm",
        slug: "bol-ki-lab-aazaad-hain-tere-faiz-ahmed-faiz-nazms",
        abstract: "Speak, for your lips are free. A powerful call to speak truth to power."
    },
    {
        name: "Mujh Se Pehli Si Mohabbat",
        type: "Nazm",
        slug: "mujh-se-pahli-si-mohabbat-meri-mahboob-na-maang-faiz-ahmed-faiz-nazms",
        abstract: "Faiz asks his beloved not to demand the old love, as the sorrows of the world (poverty, oppression) now claim his attention."
    },
    {
        name: "Dasht-e-Tanhai",
        type: "Nazm",
        slug: "yaad-dasht-e-tanhaai-mein-ai-jaan-e-jahaan-larzaan-hain-faiz-ahmed-faiz-nazms",
        abstract: "The Desert of Solitude. A hauntingly beautiful poem about memory and separation."
    },
    {
        name: "Aaye Kuch Abr Kuch Sharaab Aaye",
        type: "Ghazal",
        slug: "aaye-kuchh-abr-kuchh-sharaab-aaye-faiz-ahmed-faiz-ghazals",
        abstract: "Let some clouds come, let some wine come. A ghazal celebrating the mood of rain and longing."
    },
    {
        name: "Dono Jahan Teri Mohabbat Mein Haar Ke",
        type: "Ghazal",
        slug: "donon-jahaan-teri-mohabbat-mein-haar-ke-faiz-ahmed-faiz-ghazals",
        abstract: "Having lost both worlds in your love. A classic expression of the lover's total surrender."
    },
    {
        name: "Raat Yun Dil Mein Teri",
        type: "Ghazal",
        slug: "raat-yun-dil-mein-teri-khoi-hui-yaad-aai-faiz-ahmed-faiz-ghazals",
        abstract: "Last night, your lost memory came to my heart... like spring coming silently into a wilderness."
    },
    {
        name: "Kab Yaad Mein Tera Saath Nahi",
        type: "Ghazal",
        slug: "kab-yaad-mein-tera-saath-nahin-kab-haath-mein-tera-haath-nahin-faiz-ahmed-faiz-ghazals",
        abstract: "When is your company not in my memory? When is your hand not in mine?"
    },
    {
        name: "Rang Pairahan Ka",
        type: "Ghazal",
        slug: "rang-pairahan-ka-khushbu-zulf-lahraane-ka-naam-faiz-ahmed-faiz-ghazals",
        abstract: "The color of the dress, the scent of waving hair... Qateel Shifai's famous ghazal often attributed to Faiz, but Faiz has a similar mood."
    }
];

async function ingestRekhtaWorks() {
    console.log('Starting Faiz Ahmed Faiz ingestion from Rekhta...');

    try {
        // Load catalog
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Find Faiz
        const poet = catalog.entities.find(e => e.name.includes('Faiz Ahmed Faiz'));
        if (!poet) {
            throw new Error('Faiz Ahmed Faiz not found in catalog');
        }
        const poetId = poet.entityId;

        // Update Poet Source to Rekhta
        poet.source = {
            name: "Rekhta",
            url: "https://www.rekhta.org/poets/faiz-ahmed-faiz",
            retrievedAt: new Date().toISOString()
        };
        // Add Rekhta to sameAs if not present
        if (!poet.sameAs) poet.sameAs = [];
        if (!poet.sameAs.includes(poet.source.url)) {
            poet.sameAs.push(poet.source.url);
        }

        console.log(`Updated poet source for ${poet.name}`);

        // Filter out old Wikipedia works for Faiz (optional, or just overwrite/append)
        // Let's keep existing ones if they are different, but we expect to replace the "empty" ones we just added
        // Actually, let's remove the ones we added in the previous step (which had source Wikipedia and might be empty)
        catalog.works = catalog.works.filter(w =>
            w.author['@id'] !== poetId ||
            (w.source && w.source.name !== 'Wikipedia') // Keep non-Wikipedia ones if any
        );

        console.log('Cleared old Wikipedia works for Faiz.');

        let totalAdded = 0;

        for (const item of FAIZ_WORKS) {
            const url = `https://www.rekhta.org/${item.type.toLowerCase()}s/${item.slug}`;

            const workEntry = {
                "@type": "CreativeWork",
                "workId": `work-faiz-rekhta-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                "name": item.name,
                "author": {
                    "@type": "Person",
                    "@id": poetId
                },
                "inLanguage": "Urdu",
                "genre": item.type,
                "abstract": item.abstract,
                "keywords": [item.type, "Urdu Poetry", "Rekhta"],
                "source": {
                    "name": "Rekhta",
                    "url": url,
                    "retrievedAt: ": new Date().toISOString()
                },
                "sameAs": [url]
            };

            catalog.works.push(workEntry);
            totalAdded++;
            console.log(`+ Added: ${item.name} (${item.type})`);
        }

        console.log(`\nSuccessfully added ${totalAdded} works from Rekhta.`);

        // Save catalog
        const updatedContent = JSON.stringify(catalog, null, 2);
        await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
        await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
        console.log('Catalog saved.');

    } catch (error) {
        console.error('Ingestion failed:', error);
    }
}

ingestRekhtaWorks();
