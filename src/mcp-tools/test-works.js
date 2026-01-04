
import { discover_works, extract_work } from './index.js';

async function test() {
    console.log('Testing discover_works for Kalidasa...');
    try {
        const result = await discover_works({ poetName: 'Kalidasa' });
        console.log('Discovery Result:', JSON.stringify(result, null, 2));

        if (result.works && result.works.length > 0) {
            const firstWork = result.works[0];
            console.log(`\nTesting extract_work for ${firstWork.name}...`);
            const extraction = await extract_work({
                workName: firstWork.name,
                wikiUrl: firstWork.wikiUrl
            });
            console.log('Extraction Result:', JSON.stringify(extraction, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
