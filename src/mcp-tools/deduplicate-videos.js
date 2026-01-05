/**
 * Deduplicate comedy catalogue videos
 * Removes duplicate video entries based on URL
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'comedy-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'comedy-index.json');


async function deduplicateVideos() {
    console.log('🔧 Deduplicating comedy catalogue videos...\n');

    const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8'));

    if (!catalog.videos || catalog.videos.length === 0) {
        console.log('No videos to deduplicate');
        return;
    }

    const originalCount = catalog.videos.length;
    const seen = new Map();
    const deduplicated = [];

    catalog.videos.forEach((video, idx) => {
        const url = video.contentUrl || video.embedUrl;

        if (!url) {
            console.log(`⚠️  Video ${idx} has no URL, keeping anyway`);
            deduplicated.push(video);
            return;
        }

        if (seen.has(url)) {
            console.log(`🗑️  Removing duplicate: ${video.name}`);
            console.log(`    Original at index ${seen.get(url)}, duplicate at ${idx}`);
        } else {
            seen.set(url, idx);
            deduplicated.push(video);
        }
    });

    catalog.videos = deduplicated;
    catalog.metadata.totalVideos = deduplicated.length;
    catalog.updatedAt = new Date().toISOString();

    const removedCount = originalCount - deduplicated.length;

    console.log(`\n📊 Summary:`);
    console.log(`  Original videos: ${originalCount}`);
    console.log(`  Deduplicated videos: ${deduplicated.length}`);
    console.log(`  Removed duplicates: ${removedCount}`);

    // Save
    const content = JSON.stringify(catalog, null, 2);
    await fs.writeFile(CATALOG_PATH, content, 'utf-8');
    await fs.writeFile(WEB_CATALOG_PATH, content, 'utf-8');

    console.log(`\n✅ Catalog saved`);
}

// Run
deduplicateVideos().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
