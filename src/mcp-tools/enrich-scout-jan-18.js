
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

const newPoets = [
    {
        name: "Sarala Das",
        additionalType: "Kavi",
        birthDate: "15th Century",
        knowsLanguage: "Odia",
        homeLocation: { "@type": "Place", "name": "Jagatsinghpur, Odisha" },
        hasOccupation: { "@type": "Occupation", "name": "Poet, Soldier" },
        sameAs: ["https://en.wikipedia.org/wiki/Sarala_Das"],
        keywords: ["Adi Kabi", "Odia Mahabharata", "Gajapati Empire", "Soldier Poet"],
        era: "Medieval",
        century: "15th Century",
        titles: ["Adi Kabi", "First Poet of Odia"],
        abstract: "The first scholar to write in Odia and revered as the Adi Kabi. He served as a soldier in the army of the Gajapati King of Odisha.",
        majorWorks: ["Sarala Mahabharata", "Vilanka Ramayana", "Chandi Purana"],
        source: {
            name: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Sarala_Das",
            retrievedAt: new Date().toISOString()
        }
    },
    {
        name: "Fakir Mohan Senapati",
        additionalType: "Kavi",
        birthDate: "13 January 1843",
        deathDate: "14 June 1918",
        knowsLanguage: "Odia",
        homeLocation: { "@type": "Place", "name": "Balasore, Odisha" },
        hasOccupation: { "@type": "Occupation", "name": "Novelist, Social Reformer" },
        sameAs: ["https://en.wikipedia.org/wiki/Fakir_Mohan_Senapati"],
        keywords: ["Vyasa Kabi", "Social Realism", "Odia Nationalism", "Modern Odia Literature"],
        era: "Modern",
        century: "19th-20th Century",
        titles: ["Utkala Byasa Kabi", "Father of Modern Odia Literature"],
        abstract: "Regarded as the father of Odia nationalism and modern Odia literature. His works, especially 'Chha Maana Atha Guntha', deal with the harsh realities of rural life and exploitation.",
        majorWorks: ["Chha Maana Atha Guntha", "Rebati", "Utkala Bhramanam"],
        source: {
            name: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Fakir_Mohan_Senapati",
            retrievedAt: new Date().toISOString()
        }
    },
    {
        name: "Upendra Bhanja",
        additionalType: "Kavi",
        birthDate: "1670",
        deathDate: "1740",
        knowsLanguage: "Odia",
        homeLocation: { "@type": "Place", "name": "Ghumusar, Odisha" },
        hasOccupation: { "@type": "Occupation", "name": "King, Poet" },
        sameAs: ["https://en.wikipedia.org/wiki/Upendra_Bhanja"],
        keywords: ["Kavi Samrat", "Riti Age", "Ornate Poetry", "Odissi Music"],
        era: "Medieval",
        century: "17th-18th Century",
        titles: ["Kavi Samrat", "Emperor of Poets"],
        abstract: "The 'Kavi Samrat' of Odia literature, known for his ornate style (Riti) and significant contribution to Odissi music through his Kavyas.",
        majorWorks: ["Baidehisa Bilasa", "Labanyabati", "Koti Brahmanda Sundari"],
        source: {
            name: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Upendra_Bhanja",
            retrievedAt: new Date().toISOString()
        }
    },
    {
        name: "Harivansh Rai Bachchan",
        additionalType: "Kavi",
        birthDate: "27 November 1907",
        deathDate: "18 January 2003",
        knowsLanguage: "Hindi, Awadhi",
        homeLocation: { "@type": "Place", "name": "Allahabad, Uttar Pradesh" },
        hasOccupation: { "@type": "Occupation", "name": "Poet, Writer" },
        sameAs: ["https://en.wikipedia.org/wiki/Harivansh_Rai_Bachchan"],
        keywords: ["Chhayavaad", "Madhushala", "Halaavada", "Nayi Kavita"],
        era: "Modern",
        century: "20th Century",
        titles: ["Padma Bhushan"],
        abstract: "A celebrated Hindi poet and writer, best known for his early work 'Madhushala'. He was a key figure of the Nayi Kavita movement.",
        majorWorks: ["Madhushala", "Madhubala", "Nisha Nimantran"],
        source: {
            name: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Harivansh_Rai_Bachchan",
            retrievedAt: new Date().toISOString()
        }
    }
];

const newWorks = [
    {
        name: "Sarala Mahabharata",
        authorName: "Sarala Das",
        inLanguage: "Odia",
        genre: "Epic",
        abstract: "A retelling of the Mahabharata by Sarala Das, incorporating local legends, folklore, and military insights from the Gajapati era.",
        keywords: ["Mahabharata", "Epic", "Odia", "Folklore"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Sarala_Das" }
    },
    {
        name: "Vilanka Ramayana",
        authorName: "Sarala Das",
        inLanguage: "Odia",
        genre: "Epic Poetry",
        abstract: "A poem narrating the fight between Rama and Sahasrasira Ravana (thousand-headed Ravana).",
        keywords: ["Ramayana", "Epic", "Mythology"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Sarala_Das" }
    },
    {
        name: "Chha Maana Atha Guntha",
        authorName: "Fakir Mohan Senapati",
        inLanguage: "Odia",
        genre: "Novel",
        abstract: "Often cited as the first Indian novel to deal with the exploitation of landless peasants by a feudal Lord. It is a masterpiece of social realism.",
        keywords: ["Social Realism", "Peasants", "Exploitation", "Novel"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Chha_Maana_Atha_Guntha" }
    },
    {
        name: "Rebati",
        authorName: "Fakir Mohan Senapati",
        inLanguage: "Odia",
        genre: "Short Story",
        abstract: "Widely recognized as the first Odia short story. It tells the tragic tale of a young girl's desire for education in a conservative society.",
        keywords: ["Short Story", "Education", "Women's Rights", "Tragedy"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Rebati" }
    },
    {
        name: "Baidehisa Bilasa",
        authorName: "Upendra Bhanja",
        inLanguage: "Odia",
        genre: "Kavya",
        abstract: "A famous Kavya where every line begins with the letter 'Ba'. It narrates the story of the Ramayana in an ornate style.",
        keywords: ["Kavya", "Ramayana", "Ornate Poetry", "Alliteration"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Upendra_Bhanja" }
    },
    {
        name: "Labanyabati",
        authorName: "Upendra Bhanja",
        inLanguage: "Odia",
        genre: "Kavya",
        abstract: "A romantic Kavya considered a masterpiece of the Riti style, describing the love story of Labanyabati and Chandrabhanu.",
        keywords: ["Romance", "Kavya", "Riti Style"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Upendra_Bhanja" }
    },
    {
        name: "Madhushala",
        authorName: "Harivansh Rai Bachchan",
        inLanguage: "Hindi",
        genre: "Poetry Collection",
        abstract: "A book of 135 quatrains (rubaiyat) using wine (madhu), woman (saaki), and tavern (madhushala) as metaphors for the complexities of life.",
        keywords: ["Rubaiyat", "Metaphor", "Life", "Philosophy"],
        source: { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Madhushala" }
    }
];

async function enrich() {
    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Add Poets
        for (const poet of newPoets) {
            // Check for duplicates
            if (catalog.entities.some(p => p.name === poet.name)) {
                console.log(`Skipping existing poet: ${poet.name}`);
                continue;
            }

            const poetId = `poet-${crypto.randomUUID()}`;
            poet.entityId = poetId;
            poet["@type"] = "Person"; // Ensure type is present
            catalog.entities.push(poet);
            console.log(`Added poet: ${poet.name} (${poetId})`);

            // Add Works for this poet
            const poetWorks = newWorks.filter(w => w.authorName === poet.name);
            for (const work of poetWorks) {
                const workId = `work-${crypto.randomUUID()}`;
                const workEntry = {
                    "@type": work.genre.includes("Novel") || work.genre.includes("Book") ? "Book" : "CreativeWork",
                    "workId": workId,
                    "name": work.name,
                    "author": {
                        "@type": "Person",
                        "@id": poetId
                    },
                    "inLanguage": work.inLanguage,
                    "genre": work.genre,
                    "abstract": work.abstract,
                    "keywords": work.keywords,
                    "source": {
                        ...work.source,
                        "retrievedAt": new Date().toISOString()
                    }
                };
                catalog.works.push(workEntry);
                console.log(`  Added work: ${work.name} (${workId})`);
            }
        }

        // Update Metadata
        catalog.updatedAt = new Date().toISOString();
        catalog.metadata.totalEntities = catalog.entities.length;

        await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
        console.log('Catalog updated successfully.');

    } catch (error) {
        console.error('Error updating catalog:', error);
    }
}

enrich();
