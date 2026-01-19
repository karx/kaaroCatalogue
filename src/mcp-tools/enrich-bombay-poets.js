
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

const newPoets = [
    {
        name: "Dom Moraes",
        birthDate: "1938-07-19",
        deathDate: "2004-06-02",
        knowsLanguage: "English",
        homeLocation: {
            "@type": "Place",
            "name": "Mumbai, India"
        },
        hasOccupation: {
            "@type": "Occupation",
            "name": "Poet, Writer"
        },
        award: [
            "Hawthornden Prize (1958)",
            "Sahitya Akademi Award (1994)"
        ],
        sameAs: [
            "https://en.wikipedia.org/wiki/Dom_Moraes"
        ],
        keywords: [
            "Bombay School",
            "Indian English Poetry",
            "Travel Writing"
        ],
        era: "Modern",
        century: "20th Century",
        abstract: "A foundational figure in Indian English literature. Became the first Indian to win the Hawthornden Prize at age 19. His poetry is known for its technical precision and confessional tone.",
        majorWorks: [
            "A Beginning",
            "My Son's Father",
            "Serendip"
        ],
        source: {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Dom_Moraes",
            "retrievedAt": new Date().toISOString()
        }
    },
    {
        name: "Arun Kolatkar",
        birthDate: "1932-11-01",
        deathDate: "2004-09-25",
        knowsLanguage: "Marathi, English",
        homeLocation: {
            "@type": "Place",
            "name": "Mumbai, India"
        },
        hasOccupation: {
            "@type": "Occupation",
            "name": "Poet, Graphic Designer"
        },
        award: [
            "Commonwealth Poetry Prize (1977)",
            "Sahitya Akademi Award (2005)"
        ],
        sameAs: [
            "https://en.wikipedia.org/wiki/Arun_Kolatkar"
        ],
        keywords: [
            "Bilingual",
            "Jejuri",
            "Bombay School",
            "Modernism"
        ],
        era: "Modern",
        century: "20th Century",
        abstract: "A bilingual poet who wrote in Marathi and English. His 'Jejuri' is a landmark in Indian English poetry, known for its skeptical yet observant view of pilgrimage and tradition.",
        majorWorks: [
            "Jejuri",
            "Kala Ghoda Poems",
            "Sarpa Satra"
        ],
        source: {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Arun_Kolatkar",
            "retrievedAt": new Date().toISOString()
        }
    },
    {
        name: "Eunice de Souza",
        birthDate: "1940-08-01",
        deathDate: "2017-07-29",
        knowsLanguage: "English",
        homeLocation: {
            "@type": "Place",
            "name": "Mumbai, India"
        },
        hasOccupation: {
            "@type": "Occupation",
            "name": "Poet, Literary Critic"
        },
        award: [],
        sameAs: [
            "https://en.wikipedia.org/wiki/Eunice_de_Souza"
        ],
        keywords: [
            "Women Poets",
            "Goan Catholic",
            "Confessional",
            "Satire"
        ],
        era: "Modern",
        century: "20th-21st Century",
        abstract: "Known for her sparse, acerbic, and confessional style. She often explored themes of gender, her Goan Catholic heritage, and the hypocrisy of social conventions.",
        majorWorks: [
            "Fix",
            "Women in Dutch Painting",
            "Ways of Belonging"
        ],
        source: {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Eunice_de_Souza",
            "retrievedAt": new Date().toISOString()
        }
    },
    {
        name: "Adil Jussawalla",
        birthDate: "1940-04-08",
        knowsLanguage: "English",
        homeLocation: {
            "@type": "Place",
            "name": "Mumbai, India"
        },
        hasOccupation: {
            "@type": "Occupation",
            "name": "Poet, Editor"
        },
        award: [
            "Sahitya Akademi Award (2014)"
        ],
        sameAs: [
            "https://en.wikipedia.org/wiki/Adil_Jussawalla"
        ],
        keywords: [
            "Bombay School",
            "Missing Person",
            "Alienation"
        ],
        era: "Modern",
        century: "20th-21st Century",
        abstract: "A key figure in the Bombay school of poetry. His work deals with themes of exile, alienation, and the fragmented identity of the modern individual.",
        majorWorks: [
            "Land's End",
            "Missing Person",
            "Trying to Say Goodbye"
        ],
        source: {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Adil_Jussawalla",
            "retrievedAt": new Date().toISOString()
        }
    },
    {
        name: "Gieve Patel",
        birthDate: "1940-08-18",
        deathDate: "2023-11-03",
        knowsLanguage: "English",
        homeLocation: {
            "@type": "Place",
            "name": "Mumbai, India"
        },
        hasOccupation: {
            "@type": "Occupation",
            "name": "Poet, Playwright, Painter, Physician"
        },
        award: [],
        sameAs: [
            "https://en.wikipedia.org/wiki/Gieve_Patel"
        ],
        keywords: [
            "Green Movement",
            "Body",
            "Painter-Poet"
        ],
        era: "Modern",
        century: "20th-21st Century",
        abstract: "A poet, playwright, painter, and physician. His poetry is known for its unsentimental look at the human body and nature, often highlighting violence and decay.",
        majorWorks: [
            "Poems",
            "How Do You Withstand, Body",
            "Mirrored, Mirroring"
        ],
        source: {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Gieve_Patel",
            "retrievedAt": new Date().toISOString()
        }
    }
];

const worksData = [
    // Dom Moraes
    { name: "A Beginning", poet: "Dom Moraes", genre: "Poetry Collection", date: "1957", abstract: "His debut collection which won the Hawthornden Prize." },
    { name: "My Son's Father", poet: "Dom Moraes", genre: "Autobiography", date: "1968", abstract: "An autobiography detailing his early life and relationship with his father." },
    { name: "Serendip", poet: "Dom Moraes", genre: "Poetry Collection", date: "1990", abstract: "A later collection that won the Sahitya Akademi Award." },

    // Arun Kolatkar
    { name: "Jejuri", poet: "Arun Kolatkar", genre: "Poetry Sequence", date: "1976", abstract: "A sequence of 31 poems describing a visit to the temple town of Jejuri in Maharashtra." },
    { name: "Kala Ghoda Poems", poet: "Arun Kolatkar", genre: "Poetry Collection", date: "2004", abstract: "Poems focusing on the street life of Mumbai's Kala Ghoda art district." },
    { name: "Sarpa Satra", poet: "Arun Kolatkar", genre: "Long Poem", date: "2004", abstract: "An English version of a poem with a similar name in Bhijki Vahi, mixing myth and allegory." },

    // Eunice de Souza
    { name: "Fix", poet: "Eunice de Souza", genre: "Poetry Collection", date: "1979", abstract: "Her first collection, establishing her sharp, ironic voice." },
    { name: "Women in Dutch Painting", poet: "Eunice de Souza", genre: "Poetry Collection", date: "1988", abstract: "Poems exploring art, women's roles, and personal history." },
    { name: "Ways of Belonging", poet: "Eunice de Souza", genre: "Poetry Collection", date: "1990", abstract: "Selected and new poems dealing with themes of identity and belonging." },

    // Adil Jussawalla
    { name: "Land's End", poet: "Adil Jussawalla", genre: "Poetry Collection", date: "1962", abstract: "His first book of poems, written while he was in Europe." },
    { name: "Missing Person", poet: "Adil Jussawalla", genre: "Poetry Collection", date: "1976", abstract: "A landmark work addressing the crisis of identity in post-colonial India." },
    { name: "Trying to Say Goodbye", poet: "Adil Jussawalla", genre: "Poetry Collection", date: "2011", abstract: "Published after a long hiatus, winning the Sahitya Akademi Award." },

    // Gieve Patel
    { name: "Poems", poet: "Gieve Patel", genre: "Poetry Collection", date: "1966", abstract: "His debut collection launched by Nissim Ezekiel." },
    { name: "How Do You Withstand, Body", poet: "Gieve Patel", genre: "Poetry Collection", date: "1976", abstract: "Poems dealing with the physical body, pain, and medical experiences." },
    { name: "Mirrored, Mirroring", poet: "Gieve Patel", genre: "Poetry Collection", date: "1991", abstract: "A collection reflecting on nature, god, and the self." }
];

async function enrichCatalog() {
    try {
        console.log('📖 Reading catalog...');
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        let addedCount = 0;
        let addedWorksCount = 0;
        const nameToIdMap = {};

        // 1. Add Poets
        for (const poetData of newPoets) {
            // Check for duplicates
            const existing = catalog.entities.find(e => e.name.toLowerCase() === poetData.name.toLowerCase());
            if (existing) {
                console.log(`⚠️  Poet ${poetData.name} already exists. Skipping.`);
                nameToIdMap[poetData.name] = existing.entityId;
                continue;
            }

            const poetId = `poet-${uuidv4()}`;
            const poetEntry = {
                "@type": "Person",
                "entityId": poetId,
                "additionalType": "Kavi",
                ...poetData
            };

            catalog.entities.push(poetEntry);
            nameToIdMap[poetData.name] = poetId;
            console.log(`✅ Added poet: ${poetData.name}`);
            addedCount++;
        }

        // 2. Add Works
        for (const workData of worksData) {
            const authorId = nameToIdMap[workData.poet];
            if (!authorId) {
                console.warn(`⚠️  Author ID not found for ${workData.poet} (maybe skipped?). Skipping work.`);
                continue;
            }

            // Check if work already exists (simple check by name)
            const existingWork = catalog.works.find(w => w.name.toLowerCase() === workData.name.toLowerCase());
            if (existingWork) {
                 console.log(`⚠️  Work ${workData.name} already exists. Skipping.`);
                 continue;
            }

            const workEntry = {
                "@type": "Book", // Assuming mostly books/collections for these modern poets
                "workId": `work-${uuidv4()}`,
                "name": workData.name,
                "author": {
                    "@type": "Person",
                    "@id": authorId
                },
                "inLanguage": "English",
                "dateCreated": workData.date,
                "genre": workData.genre,
                "abstract": workData.abstract,
                "keywords": [workData.genre, "Indian English Poetry", "Bombay School"],
                "source": {
                    "name": "Wikipedia",
                    "url": newPoets.find(p => p.name === workData.poet).source.url,
                    "retrievedAt": new Date().toISOString()
                }
            };

            catalog.works.push(workEntry);
            console.log(`✅ Added work: ${workData.name}`);
            addedWorksCount++;
        }

        if (addedCount > 0 || addedWorksCount > 0) {
            catalog.updatedAt = new Date().toISOString();
            catalog.metadata.totalEntities = catalog.entities.length;

            await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
            console.log(`\n🎉 Success! Added ${addedCount} poets and ${addedWorksCount} works.`);
        } else {
            console.log('\nℹ️  No changes made.');
        }

    } catch (error) {
        console.error('🚨 Error:', error);
        process.exit(1);
    }
}

enrichCatalog();
