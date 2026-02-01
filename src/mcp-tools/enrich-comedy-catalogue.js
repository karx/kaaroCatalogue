/**
 * Comedy Catalogue Batch Enrichment
 * Automated enrichment of comedians with Wikipedia + YouTube data
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractComedianFromWikipedia } from './sources/comedy-wikipedia.js';
import { discoverAllVideos } from './youtube-adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'comedy-index.json');
const WEB_CATALOG_PATH = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'comedy-index.json');

/**
 * Parse comedian targets from research document
 * @param {string} targetsPath - Path to the targets file
 * @returns {Promise<Array>} - List of target comedians
 */
async function parseTargetComedians(targetsPath) {
    try {
        // Use default path if none provided
        const defaultPath = path.join(__dirname, '..', '..', 'research', 'comedianTargets.md');
        const filePath = targetsPath || defaultPath;

        console.log(`Reading targets from: ${filePath}`);
        const content = await fs.readFile(filePath, 'utf-8');
        const comedians = [];

        // Simple regex to extract comedian info from markdown
        // Looks for patterns like: "3. **Biswa Kalyan Rath**"
        const namePattern = /^\d+\.\s+\*\*(.+?)\*\*/gm;
        const wikiPattern = /Wikipedia:\s+(https:\/\/en\.wikipedia\.org\/wiki\/[^\s\)]+)/g;
        const youtubePattern = /YouTube:\s+@(\w+)/g;
        const languagePattern = /Language:\s+([^\n]+)/g;

        let match;
        const lines = content.split('\n');
        let currentComedian = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // New comedian entry
            const nameMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
            if (nameMatch) {
                if (currentComedian) {
                    comedians.push(currentComedian);
                }
                currentComedian = {
                    name: nameMatch[1],
                    wikiUrl: null,
                    youtubeHandle: null,
                    language: 'en',
                    status: 'pending'
                };
                continue;
            }

            // Extract metadata for current comedian
            if (currentComedian) {
                if (line.includes('Status: ✅')) {
                    currentComedian.status = 'exists';
                } else if (line.includes('Wikipedia:')) {
                    const wMatch = line.match(/Wikipedia:\s+(https:\/\/[^\s]+)/);
                    if (wMatch) {
                        currentComedian.wikiUrl = wMatch[1];
                    }
                } else if (line.includes('YouTube:')) {
                    const yMatch = line.match(/YouTube:\s+@(\w+)/);
                    if (yMatch) {
                        currentComedian.youtubeHandle = yMatch[1];
                    }
                } else if (line.includes('Language:')) {
                    const lMatch = line.match(/Language:\s+([^\n]+)/);
                    if (lMatch) {
                        const lang = lMatch[1].trim();
                        // Map to ISO codes
                        if (lang.includes('Hindi')) currentComedian.language = 'hi';
                        else if (lang.includes('Tamil')) currentComedian.language = 'ta';
                        else if (lang.includes('Urdu')) currentComedian.language = 'ur';
                        else currentComedian.language = 'en';
                    }
                }
            }
        }

        // Don't forget the last comedian
        if (currentComedian) {
            comedians.push(currentComedian);
        }

        return comedians;

    } catch (error) {
        console.error('Failed to parse target comedians:', error.message);
        return [];
    }
}

/**
 * Enrich a single comedian
 * @param {Object} target - Target comedian info
 * @param {Object} catalog - Current catalog
 * @returns {Promise<Object>} - Enrichment result
 */
async function enrichComedian(target, catalog) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Enriching: ${target.name}`);
    console.log(`${'='.repeat(60)}`);

    // Check if comedian already exists
    const existing = catalog.entities.find(e =>
        e.name.toLowerCase() === target.name.toLowerCase()
    );

    // Skip only if exists AND verified AND target marked as exists (unless force is used elsewhere)
    // If existing but unverified (verified: false), we proceed to enrich/update
    if (existing && target.status === 'exists' && existing.verified !== false) {
        console.log(`  ℹ️  Already in catalog as ${existing.entityId} (Verified: ${existing.verified})`);

        // Still try to add videos if missing
        const existingVideos = (catalog.videos || []).filter(v =>
            v.actor?.['@id'] === existing.entityId
        );

        if (existingVideos.length < 5) {
            console.log(`  🔍 Discovering videos (only ${existingVideos.length} found)...`);
            await enrichVideos(existing, catalog, target);
        }

        return {
            status: 'skipped',
            reason: 'already exists',
            entityId: existing.entityId
        };
    } else if (existing) {
        console.log(`  🔄 Re-enriching existing entity: ${existing.entityId} (Verified: ${existing.verified})`);
    }

    const result = {
        comedian: null,
        videos: [],
        errors: []
    };

    try {
        // Step 1: Extract comedian metadata from Wikipedia
        console.log('  📖 Extracting from Wikipedia...');
        const wikiResult = await extractComedianFromWikipedia(
            target.name,
            target.wikiUrl
        );

        if (!wikiResult.success) {
            result.errors.push(`Wikipedia extraction failed: ${wikiResult.error}`);
            return result;
        }

        result.comedian = wikiResult.entity;

        // Override language if we have better info from research
        if (target.language) {
            result.comedian.knowsLanguage = target.language;
        }

        console.log(`  ✅ Extracted metadata`);
        console.log(`     - Birth: ${result.comedian.birthDate || 'Unknown'}`);
        console.log(`     - Location: ${result.comedian.homeLocation?.name || 'Unknown'}`);
        console.log(`     - Language: ${result.comedian.knowsLanguage}`);
        console.log(`     - Awards: ${result.comedian.award.length}`);

        // Step 2: Discover videos from YouTube
        console.log('  🎥 Discovering videos from YouTube...');
        const videoResult = await discoverAllVideos(target.name, {
            language: target.language,
            maxPersonalVideos: 20
        });

        if (videoResult.success && videoResult.allVideos.length > 0) {
            console.log(`  ✅ Found ${videoResult.allVideos.length} videos`);
            console.log(`     - Personal channel: ${videoResult.channelFound ? 'Yes' : 'No'}`);
            console.log(`     - From aggregators: ${videoResult.aggregatorVideos.length}`);

            result.videos = videoResult.allVideos;

            // Add YouTube channel to sameAs if found
            if (videoResult.personalChannel) {
                const channelUrl = `https://www.youtube.com/channel/${videoResult.personalChannel.channelId}`;
                if (!result.comedian.sameAs.includes(channelUrl)) {
                    result.comedian.sameAs.push(channelUrl);
                }
            }
        } else {
            console.log(`  ⚠️  No videos found on YouTube`);
        }

        // Step 3: Add to catalog or Update existing
        if (!existing) {
            catalog.entities.push(result.comedian);
            console.log(`  ➕ Added to entities`);
        } else {
            // Update existing entity
            // Preserve ID and manually merge to avoid overwriting everything blindly
            const originalId = existing.entityId;
            Object.assign(existing, result.comedian);
            existing.entityId = originalId; // Ensure ID is preserved
            console.log(`  🔄 Updated entity metadata for ${existing.entityId}`);
        }

        // Step 4: Add videos to catalog
        if (!catalog.videos) {
            catalog.videos = [];
        }

        result.videos.forEach(video => {
            const videoEntry = {
                '@type': 'VideoObject',
                videoId: `video-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
                name: video.title,
                actor: {
                    '@type': 'Person',
                    '@id': result.comedian.entityId
                },
                duration: video.duration,
                embedUrl: video.embedUrl,
                contentUrl: video.contentUrl,
                uploadDate: video.publishedAt?.split('T')[0] || '',
                thumbnailUrl: video.thumbnailUrl,
                genre: inferVideoGenre(video.title),
                description: video.description?.substring(0, 300) || '',
                channelTitle: video.channelTitle,
                aggregatorChannel: video.aggregatorChannel || null
            };

            catalog.videos.push(videoEntry);
        });

        if (result.videos.length > 0) {
            console.log(`  ➕ Added ${result.videos.length} videos`);
        }

        // Update catalog metadata
        catalog.metadata.totalEntities = catalog.entities.length;
        catalog.metadata.totalVideos = (catalog.videos || []).length;
        catalog.updatedAt = new Date().toISOString();

        result.status = 'success';
        return result;

    } catch (error) {
        console.error(`  ❌ Enrichment failed:`, error.message);
        result.errors.push(error.message);
        result.status = 'failed';
        return result;
    }
}

/**
 * Enrich videos for existing comedian
 */
async function enrichVideos(comedian, catalog, target) {
    try {
        const videoResult = await discoverAllVideos(target.name || comedian.name, {
            language: comedian.knowsLanguage,
            maxPersonalVideos: 20
        });

        if (videoResult.success && videoResult.allVideos.length > 0) {
            if (!catalog.videos) catalog.videos = [];

            const existingVideoUrls = new Set(
                catalog.videos.map(v => v.contentUrl || v.embedUrl)
            );

            let added = 0;
            videoResult.allVideos.forEach(video => {
                if (!existingVideoUrls.has(video.contentUrl)) {
                    const videoEntry = {
                        '@type': 'VideoObject',
                        videoId: `video-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
                        name: video.title,
                        actor: {
                            '@type': 'Person',
                            '@id': comedian.entityId
                        },
                        duration: video.duration,
                        embedUrl: video.embedUrl,
                        contentUrl: video.contentUrl,
                        uploadDate: video.publishedAt?.split('T')[0] || '',
                        thumbnailUrl: video.thumbnailUrl,
                        genre: inferVideoGenre(video.title),
                        channelTitle: video.channelTitle,
                        aggregatorChannel: video.aggregatorChannel || null
                    };
                    catalog.videos.push(videoEntry);
                    added++;
                }
            });

            console.log(`  ➕ Added ${added} new videos`);
        }
    } catch (error) {
        console.error(`  ⚠️  Video enrichment failed:`, error.message);
    }
}

/**
 * Infer video genre from title
 */
function inferVideoGenre(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('special') || lowerTitle.includes('full show')) {
        return 'Stand-Up Special';
    } else if (lowerTitle.includes('crowd work') || lowerTitle.includes('heckler')) {
        return 'Crowd Work';
    } else if (lowerTitle.includes('short') || lowerTitle.includes('#shorts')) {
        return 'Short';
    } else if (lowerTitle.includes('live') || lowerTitle.includes('performance')) {
        return 'Live Performance';
    } else {
        return 'Clip';
    }
}

/**
 * Main enrichment function
 */
async function enrichAll(options = {}) {
    console.log('🎭 Comedy Catalogue Enrichment Started');
    console.log('='.repeat(60));

    try {
        // Load catalog
        const catalogContent = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(catalogContent);

        // Parse target comedians
        console.log('\n📋 Parsing target comedians...');
        const targets = await parseTargetComedians(options.targetsFile);

        // Filter out those that already exist (unless force option)
        // Note: enrichComedian will also check verified status, so we pass 'exists' ones if force is false but let enrichComedian decide
        // But to be efficient, we filter here too.
        // If we provided a custom file, we likely want to process all of them.

        let toEnrich;
        if (options.force || options.targetsFile) {
             toEnrich = targets;
        } else {
             toEnrich = targets.filter(t => t.status !== 'exists');
        }

        console.log(`Found ${targets.length} total, ${toEnrich.length} to enrich`);

        if (toEnrich.length === 0) {
            console.log('\n✨ Nothing to enrich!');
            return;
        }

        // Limit to batch size
        const batchSize = options.limit || toEnrich.length;
        const batch = toEnrich.slice(0, batchSize);

        console.log(`\nEnriching ${batch.length} comedians...\n`);

        const results = {
            success: [],
            failed: [],
            skipped: []
        };

        for (const target of batch) {
            const result = await enrichComedian(target, catalog);

            if (result.status === 'success') {
                results.success.push(target.name);
            } else if (result.status === 'failed') {
                results.failed.push({ name: target.name, errors: result.errors });
            } else {
                results.skipped.push(target.name);
            }

            // Rate limiting: wait between comedians
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Save updated catalog
        if (!options.dryRun) {
            console.log('\n💾 Saving catalog...');
            const updatedContent = JSON.stringify(catalog, null, 2);
            await fs.writeFile(CATALOG_PATH, updatedContent, 'utf-8');
            await fs.writeFile(WEB_CATALOG_PATH, updatedContent, 'utf-8');
            console.log('✅ Catalog saved');
        } else {
            console.log('\n🔍 Dry run - no changes saved');
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 ENRICHMENT SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${results.success.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`⏭️  Skipped: ${results.skipped.length}`);
        console.log(`📁 Total entities: ${catalog.entities.length}`);
        console.log(`🎥 Total videos: ${(catalog.videos || []).length}`);

        if (results.failed.length > 0) {
            console.log('\n❌ Failed comedians:');
            results.failed.forEach(f => {
                console.log(`  - ${f.name}: ${f.errors.join(', ')}`);
            });
        }

    } catch (error) {
        console.error('\n💥 Enrichment process failed:', error);
        throw error;
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        force: args.includes('--force'),
        limit: parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || null,
        targetsFile: args.find(a => a.startsWith('--file='))?.split('=')[1] || null
    };

    enrichAll(options).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

export default enrichAll;
