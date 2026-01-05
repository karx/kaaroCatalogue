/**
 * KaaroCatalogue MCP Tool Registry
 * Exposes catalog building tools for AI agent interaction
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverFromWikipediaList, extractFromWikipedia } from './sources/wikipedia.js';
import { discover_rekhta_works, ingest_rekhta_works, extract_work_content } from './rekhta-adapter.js';

// ... (existing imports)

// ... (existing code)

// ============================================
// Rekhta Integration Tools
// ============================================

/**
 * Ingest works from Rekhta for a poet
 * @param {Object} params - { poetId, worksList }
 * @returns {Promise<Object>} - Ingestion result
 */
export async function ingest_rekhta({ poetId, worksList }) {
    console.log(`[ingest_rekhta] Poet: ${poetId}, Works: ${worksList.length}`);
    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    const result = ingest_rekhta_works(poetId, worksList, catalog);

    // Save catalog
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    const webCatalogPath = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');
    await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    return {
        success: true,
        ...result
    };
}

/**
 * Extract content for specific works (or all Rekhta works)
 * @param {Object} params - { poetId, source }
 * @returns {Promise<Object>} - Extraction result
 */
export async function extract_content({ poetId, source = 'Rekhta' }) {
    console.log(`[extract_content] Poet: ${poetId}, Source: ${source}`);
    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    const works = catalog.works.filter(w =>
        (!poetId || w.author['@id'] === poetId) &&
        (!source || (w.source && w.source.name === source)) &&
        !w.content?.extracted // Only process if not already extracted (or force flag?)
    );

    console.log(`Found ${works.length} works to process.`);
    let updatedCount = 0;

    for (const work of works) {
        if (!work.source?.url) continue;

        console.log(`Processing: ${work.name}`);
        const content = await extract_work_content(work.source.url);

        if (content.roman || content.urdu || content.hindi) {
            work.content = {
                ...content,
                extracted: true,
                lastUpdated: new Date().toISOString()
            };
            updatedCount++;
        }
    }

    if (updatedCount > 0) {
        await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
        const webCatalogPath = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');
        await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    }

    return {
        success: true,
        processed: works.length,
        updated: updatedCount
    };
}

export const tools = {
    // ... (existing tools)
    ingest_rekhta: {
        name: 'ingest_rekhta',
        description: 'Ingest works from Rekhta list',
        parameters: {
            poetId: { type: 'string', required: true },
            worksList: { type: 'array', required: true }
        },
        handler: ingest_rekhta
    },
    extract_content: {
        name: 'extract_content',
        description: 'Batch extract content for works',
        parameters: {
            poetId: { type: 'string' },
            source: { type: 'string', default: 'Rekhta' }
        },
        handler: extract_content
    },
    // ... (rest of tools)
};


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

// ============================================
// Data Helpers
// ============================================

async function readJSON(filename) {
    const filePath = path.join(DATA_DIR, filename);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

async function writeJSON(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================
// MCP Tools
// ============================================

/**
 * Discover entities from a source
 * @param {Object} params - { source: 'wikipedia', query: 'List_of_Hindi_poets', limit: 20 }
 * @returns {Promise<Object>} - { success, count, candidates }
 */
export async function discover_entities({ source = 'wikipedia', query, limit = 20 }) {
    console.log(`[discover] Source: ${source}, Query: ${query}, Limit: ${limit}`);

    if (source !== 'wikipedia') {
        throw new Error(`Unsupported source: ${source}. Currently only 'wikipedia' is supported.`);
    }

    const listUrl = query.startsWith('http')
        ? query
        : `https://en.wikipedia.org/wiki/${query.replace(/ /g, '_')}`;

    const candidates = await discoverFromWikipediaList(listUrl, limit);

    // Load existing candidates and merge
    const existing = await readJSON('candidates.json') || { pending: [], extracted: [] };
    const existingNames = new Set([
        ...existing.pending.map(c => c.name),
        ...existing.extracted.map(c => c.name)
    ]);

    const newCandidates = candidates.filter(c => !existingNames.has(c.name));
    existing.pending.push(...newCandidates);

    await writeJSON('candidates.json', existing);

    return {
        success: true,
        count: newCandidates.length,
        total: existing.pending.length,
        candidates: newCandidates.slice(0, 10) // Return first 10 for display
    };
}

/**
 * Extract structured entity data from a source
 * @param {Object} params - { name: 'Kabir', sourceUrl: 'https://...' }
 * @returns {Promise<Object>} - Extracted entity
 */
export async function extract_entity({ name, sourceUrl }) {
    console.log(`[extract] Name: ${name}, Source: ${sourceUrl}`);

    const entity = await extractFromWikipedia(name, sourceUrl);

    // Move from candidates.pending to review queue
    const candidates = await readJSON('candidates.json') || { pending: [], extracted: [] };
    candidates.pending = candidates.pending.filter(c => c.name !== name);
    candidates.extracted.push({ name, extractedAt: new Date().toISOString() });
    await writeJSON('candidates.json', candidates);

    // Add source info to entity
    entity.source = {
        name: 'Wikipedia',
        url: sourceUrl,
        retrievedAt: new Date().toISOString()
    };

    // Add to review queue
    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };
    reviewQueue.pending.push({
        queueId: `review-${Date.now().toString(36)}`,
        entity,
        addedAt: new Date().toISOString()
    });
    await writeJSON('review-queue.json', reviewQueue);

    return {
        success: true,
        entity,
        queueId: reviewQueue.pending[reviewQueue.pending.length - 1].queueId
    };
}

/**
 * Get next entity pending review
 * @returns {Promise<Object>} - Next pending entity or null
 */
export async function review_entity() {
    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };

    if (reviewQueue.pending.length === 0) {
        return {
            success: true,
            entity: null,
            message: 'No entities pending review',
            stats: {
                pending: 0,
                approved: reviewQueue.approved.length,
                rejected: reviewQueue.rejected.length
            }
        };
    }

    const next = reviewQueue.pending[0];
    return {
        success: true,
        entity: next.entity,
        queueId: next.queueId,
        stats: {
            pending: reviewQueue.pending.length,
            approved: reviewQueue.approved.length,
            rejected: reviewQueue.rejected.length
        }
    };
}

/**
 * Approve an entity for cataloging
 * @param {Object} params - { queueId: 'review-xxx' }
 * @returns {Promise<Object>} - Approval result
 */
export async function approve_entity({ queueId }) {
    console.log(`[approve] QueueId: ${queueId}`);

    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };
    const index = reviewQueue.pending.findIndex(r => r.queueId === queueId);

    if (index === -1) {
        throw new Error(`Queue item not found: ${queueId}`);
    }

    const item = reviewQueue.pending.splice(index, 1)[0];
    item.approvedAt = new Date().toISOString();
    reviewQueue.approved.push(item);

    await writeJSON('review-queue.json', reviewQueue);

    return {
        success: true,
        message: `Approved: ${item.entity.name}`,
        entityId: item.entity.entityId
    };
}

/**
 * Reject an entity
 * @param {Object} params - { queueId: 'review-xxx', reason: 'Not a poet' }
 * @returns {Promise<Object>} - Rejection result
 */
export async function reject_entity({ queueId, reason = '' }) {
    console.log(`[reject] QueueId: ${queueId}, Reason: ${reason}`);

    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };
    const index = reviewQueue.pending.findIndex(r => r.queueId === queueId);

    if (index === -1) {
        throw new Error(`Queue item not found: ${queueId}`);
    }

    const item = reviewQueue.pending.splice(index, 1)[0];
    item.rejectedAt = new Date().toISOString();
    item.rejectionReason = reason;
    reviewQueue.rejected.push(item);

    await writeJSON('review-queue.json', reviewQueue);

    return {
        success: true,
        message: `Rejected: ${item.entity.name}`,
        reason
    };
}

/**
 * Update an entity in the review queue
 * @param {Object} params - { queueId: 'review-xxx', updates: { ... } }
 * @returns {Promise<Object>} - Updated entity
 */
export async function update_entity({ queueId, updates }) {
    console.log(`[update] QueueId: ${queueId}`);

    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };
    const item = reviewQueue.pending.find(r => r.queueId === queueId);

    if (!item) {
        throw new Error(`Queue item not found: ${queueId}`);
    }

    // Merge updates into entity
    Object.assign(item.entity, updates);
    item.updatedAt = new Date().toISOString();

    await writeJSON('review-queue.json', reviewQueue);

    return {
        success: true,
        entity: item.entity
    };
}

/**
 * Sync approved entities to the catalog
 * @param {Object} params - { catalogType: 'poets' }
 * @returns {Promise<Object>} - Sync result
 */
export async function sync_catalog({ catalogType = 'poets' }) {
    console.log(`[sync] Catalog: ${catalogType}`);

    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };

    if (reviewQueue.approved.length === 0) {
        return {
            success: true,
            message: 'No approved entities to sync',
            synced: 0
        };
    }

    // Load existing catalog
    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', `${catalogType}-index.json`);
    let catalog;
    try {
        const content = await fs.readFile(catalogPath, 'utf-8');
        catalog = JSON.parse(content);
    } catch (error) {
        throw new Error(`Catalog not found: ${catalogType}-index.json`);
    }

    // Merge approved entities
    const existingIds = new Set(catalog.entities.map(e => e.name));
    const newEntities = reviewQueue.approved
        .map(r => r.entity)
        .filter(e => !existingIds.has(e.name));

    catalog.entities.push(...newEntities);
    catalog.metadata.totalEntities = catalog.entities.length;
    catalog.updatedAt = new Date().toISOString();

    // Write catalog
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Also update the web copy
    const webCatalogPath = path.join(__dirname, '..', 'web', 'data', 'catalogs', `${catalogType}-index.json`);
    await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Clear approved queue
    reviewQueue.approved = [];
    await writeJSON('review-queue.json', reviewQueue);

    return {
        success: true,
        message: `Synced ${newEntities.length} entities to ${catalogType} catalog`,
        synced: newEntities.length,
        totalEntities: catalog.entities.length
    };
}

/**
 * Search existing catalog
 * @param {Object} params - { catalogType: 'poets', query: 'Kabir' }
 * @returns {Promise<Object>} - Search results
 */
export async function search_catalog({ catalogType = 'poets', query }) {
    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', `${catalogType}-index.json`);

    let catalog;
    try {
        const content = await fs.readFile(catalogPath, 'utf-8');
        catalog = JSON.parse(content);
    } catch (error) {
        throw new Error(`Catalog not found: ${catalogType}-index.json`);
    }

    const queryLower = query.toLowerCase();
    const results = catalog.entities.filter(e =>
        e.name.toLowerCase().includes(queryLower) ||
        (e.keywords || []).some(k => k.toLowerCase().includes(queryLower)) ||
        (e.knowsLanguage || '').toLowerCase().includes(queryLower)
    );

    return {
        success: true,
        count: results.length,
        results: results.slice(0, 20)
    };
}

/**
 * Get pipeline status
 * @returns {Promise<Object>} - Current status of all queues
 */
export async function get_status() {
    const candidates = await readJSON('candidates.json') || { pending: [], extracted: [] };
    const reviewQueue = await readJSON('review-queue.json') || { pending: [], approved: [], rejected: [] };

    return {
        candidates: {
            pending: candidates.pending.length,
            extracted: candidates.extracted.length
        },
        review: {
            pending: reviewQueue.pending.length,
            approved: reviewQueue.approved.length,
            rejected: reviewQueue.rejected.length
        }
    };
}

// ============================================
// Work Discovery & Extraction Tools
// ============================================

/**
 * Discover works for a poet
 * @param {Object} params - { poetId: 'poet-001' }
 * @returns {Promise<Object>} - Discovered works
 */
export async function discover_works({ poetId, poetName, wikiUrl }) {
    console.log(`[discover_works] Poet: ${poetName || poetId}`);

    // Get poet info if we only have ID
    if (!wikiUrl && poetId) {
        const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
        const content = await fs.readFile(catalogPath, 'utf-8');
        const catalog = JSON.parse(content);
        const poet = catalog.entities.find(e => e.entityId === poetId);
        if (poet) {
            poetName = poet.name;
            wikiUrl = poet.sameAs?.[0] || poet.source?.url || `https://en.wikipedia.org/wiki/${poet.name.replace(/ /g, '_')}`;
        }
    }

    if (!wikiUrl) {
        wikiUrl = `https://en.wikipedia.org/wiki/${poetName.replace(/ /g, '_')}`;
    }

    const works = await discoverWorksFromWikipedia(poetName, wikiUrl);

    // Merge with majorWorks from catalog if available
    if (poetId || poetName) {
        const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
        const content = await fs.readFile(catalogPath, 'utf-8');
        const catalog = JSON.parse(content);

        const poet = catalog.entities.find(e =>
            e.entityId === poetId ||
            e.name.toLowerCase() === poetName.toLowerCase()
        );

        if (poet && poet.majorWorks) {
            poet.majorWorks.forEach((workName, index) => {
                // Check if already found via Wikipedia
                if (!works.some(w => w.name.toLowerCase() === workName.toLowerCase())) {
                    works.push({
                        name: workName,
                        workId: `work-${poet.entityId}-major-${index}`,
                        poetName: poet.name,
                        source: 'catalog_majorWorks',
                        discoveredAt: new Date().toISOString()
                    });
                }
            });
        }
    }

    return {
        success: true,
        poetName,
        count: works.length,
        works: works.slice(0, 20)
    };
}

/**
 * Extract full work content
 * @param {Object} params - { workName, wikiUrl, useSample }
 * @returns {Promise<Object>} - Extracted work with content
 */
export async function extract_work({ workName, wikiUrl, useSample = false }) {
    console.log(`[extract_work] Work: ${workName}`);

    // Check for sample poetry first
    if (useSample) {
        const sampleKey = Object.keys(samplePoetryContent).find(k =>
            samplePoetryContent[k].name.toLowerCase().includes(workName.toLowerCase()) ||
            workName.toLowerCase().includes(k)
        );

        if (sampleKey) {
            const sample = samplePoetryContent[sampleKey];
            return {
                success: true,
                work: {
                    "@type": "CreativeWork",
                    name: sample.name,
                    content: {
                        original: sample.original,
                        transliteration: sample.transliteration,
                        translation: sample.translation
                    },
                    source: {
                        name: 'Sample Library',
                        url: '',
                        retrievedAt: new Date().toISOString()
                    }
                }
            };
        }
    }

    // Extract from Wikipedia
    const work = await extractWorkFromWikipedia(workName, wikiUrl);

    // Add source object if found
    if (work.found) {
        work.source = {
            name: 'Wikipedia',
            url: work.sourceUrl || wikiUrl || '',
            retrievedAt: new Date().toISOString()
        };
        delete work.sourceUrl;
        delete work.extractedAt;
    }

    return {
        success: true,
        work,
        found: work.found
    };
}

/**
 * Add a work to the catalog linked to a poet
 * @param {Object} params - { poetId, work }
 * @returns {Promise<Object>} - Result
 */
export async function add_work_to_catalog({ poetId, work }) {
    console.log(`[add_work] Poet: ${poetId}, Work: ${work.name}`);

    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    // Find poet
    const poet = catalog.entities.find(e => e.entityId === poetId);
    if (!poet) {
        throw new Error(`Poet not found: ${poetId}`);
    }

    // Initialize works array if needed
    if (!catalog.works) {
        catalog.works = [];
    }

    // Create work entry
    const workEntry = {
        "@type": work["@type"] || "CreativeWork",
        workId: work.workId || `work-${Date.now().toString(36)}`,
        name: work.name,
        author: {
            "@type": "Person",
            "@id": poetId
        },
        inLanguage: work.inLanguage || poet.knowsLanguage,
        genre: work.genre || '',
        dateCreated: work.dateCreated || '',
        abstract: work.abstract || '',
        content: work.content || null,
        keywords: work.keywords || [],
        source: work.source || {
            name: 'Manual Entry',
            url: '',
            retrievedAt: new Date().toISOString()
        }
    };

    // Check for duplicates
    const existing = catalog.works.find(w =>
        w.name.toLowerCase() === work.name.toLowerCase() &&
        w.author?.['@id'] === poetId
    );

    if (existing) {
        // Update existing
        Object.assign(existing, workEntry);
        existing.source.retrievedAt = new Date().toISOString(); // Update timestamp
    } else {
        catalog.works.push(workEntry);
    }

    // Save catalog
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Also update web copy
    const webCatalogPath = path.join(__dirname, '..', 'web', 'data', 'catalogs', 'poets-index.json');
    await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    return {
        success: true,
        workId: workEntry.workId,
        message: `Added work "${work.name}" to ${poet.name}'s catalog`
    };
}

/**
 * Get all works for a poet
 * @param {Object} params - { poetId }
 * @returns {Promise<Object>} - Poet's works
 */
export async function get_poet_works({ poetId }) {
    const catalogPath = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    const poet = catalog.entities.find(e => e.entityId === poetId);
    if (!poet) {
        throw new Error(`Poet not found: ${poetId}`);
    }

    const works = (catalog.works || []).filter(w =>
        w.author?.['@id'] === poetId ||
        w.author?.['@id']?.includes(poetId.replace('poet-', ''))
    );

    return {
        success: true,
        poetName: poet.name,
        count: works.length,
        works
    };
}

// ============================================
// Tool Registry (for MCP server integration)
// ============================================



