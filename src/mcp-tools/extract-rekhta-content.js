
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');

async function extractContent() {
    try {
        const content = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(content);

        // Find Faiz's works from Rekhta
        const faizWorks = catalog.works.filter(w =>
            w.author['@id'] === 'poet-008' &&
            w.source && w.source.name === 'Rekhta'
        );

        console.log(`Found ${faizWorks.length} Rekhta works for Faiz.`);

        let updatedCount = 0;

        for (const work of faizWorks) {
            console.log(`Processing: ${work.name}...`);

            const content = {};

            // Helper to fetch and extract
            const fetchAndExtract = async (url, langName) => {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    const $ = cheerio.load(html);

                    let text = '';

                    // Try .pMC .c p (lines)
                    const lines = [];
                    $('.pMC .c p').each((i, el) => {
                        lines.push($(el).text().trim());
                    });

                    if (lines.length > 0) {
                        text = lines.join('\n');
                    } else {
                        // Fallback to .pMC text if no p tags
                        text = $('.pMC').text().trim();
                    }

                    // Clean up
                    if (text) {
                        return text
                            .split('\n')
                            .map(l => l.trim())
                            .filter(l => l.length > 0)
                            .join('\n');
                    }
                    return null;
                } catch (e) {
                    console.error(`Error fetching ${langName}: ${e.message}`);
                    return null;
                }
            };

            // 1. Roman (Default)
            console.log('  -> Fetching Roman...');
            content.roman = await fetchAndExtract(work.source.url, 'Roman');
            await new Promise(r => setTimeout(r, 1000)); // Delay

            // 2. Urdu
            console.log('  -> Fetching Urdu...');
            content.urdu = await fetchAndExtract(`${work.source.url}?lang=ur`, 'Urdu');
            await new Promise(r => setTimeout(r, 1000));

            // 3. Hindi
            console.log('  -> Fetching Hindi...');
            content.hindi = await fetchAndExtract(`${work.source.url}?lang=hi`, 'Hindi');
            await new Promise(r => setTimeout(r, 1000));

            if (content.roman || content.urdu || content.hindi) {
                work.content = {
                    ...content,
                    extracted: true,
                    lastUpdated: new Date().toISOString()
                };
                updatedCount++;
                console.log(`  -> Extracted: Roman(${!!content.roman}), Urdu(${!!content.urdu}), Hindi(${!!content.hindi})`);
            } else {
                console.log('  -> No content extracted.');
            }
        }

        if (updatedCount > 0) {
            const updatedContent = JSON.stringify(catalog, null, 2);
            await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
            await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
            console.log(`\nUpdated ${updatedCount} works with content.`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

extractContent();
