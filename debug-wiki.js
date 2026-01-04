
// import fetch from 'node-fetch'; // Not needed in Node 18+

async function debugWiki() {
    const pageTitle = 'Faiz_Ahmed_Faiz';
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${pageTitle}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*&redirects=1`;

    console.log(`Fetching ${apiUrl}...`);
    const response = await fetch(apiUrl);
    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];

    if (page.missing) {
        console.log('Page missing');
        return;
    }

    const content = page.revisions?.[0]?.slots?.main?.['*'] || '';
    console.log('Content length:', content.length);
    console.log('--- Content Snippet ---');
    console.log(content.slice(0, 500));

    console.log('--- Sections ---');
    // Print sections that might contain works
    const sections = content.match(/==+[^=]+==+/g);
    console.log('Sections found:', sections);

    // Print context around "Works"
    const worksIndex = content.search(/==+\s*(?:Works|Bibliography|Major works|Notable works)\s*==+/i);
    if (worksIndex !== -1) {
        console.log('--- Works Section Context ---');
        console.log(content.substring(worksIndex, worksIndex + 1000));
    } else {
        console.log('No "Works" section found with standard regex.');
    }
}

debugWiki();
