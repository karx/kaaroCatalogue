import { discoverWorksFromWikipedia } from './sources/poetry-sources.js';

async function debugKabir() {
    console.log('Debugging Kabir discovery...');
    try {
        // We'll call the internal function to get more insight if needed, 
        // but for now let's just see what discoverWorksFromWikipedia returns and maybe log inside the source file if needed.
        // Actually, let's modify the source file to log the content if a flag is set, or just use a temporary debug function here that replicates the fetch.

        const pageTitle = 'Kabir';
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*`;

        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];
        const content = page.revisions[0].slots.main['*'];

        console.log('--- Raw Wikitext Start ---');
        console.log(content.slice(0, 2000)); // Print first 2000 chars to check infobox
        console.log('--- ... ---');

        // Check for "Works" sections
        const allHeaders = content.match(/^==+[^=]+==+$/gm);
        console.log('All Section Headers:', allHeaders);

        const poetrySection = content.match(/==\s*Poetry\s*==([^=]+)/i);
        if (poetrySection) {
            console.log('--- Poetry Section Content ---');
            console.log(poetrySection[1].slice(0, 1000));
        }

        // Check for Infobox works
        const infoboxWorks = content.match(/\|\s*(?:notable_?works?|major_?works?|works)\s*=\s*([^\n|]+)/i);
        console.log('Infobox Works found:', infoboxWorks);

    } catch (error) {
        console.error('Error:', error);
    }
}

debugKabir();
