/**
 * KaaroCatalogue MCP Tool Registry
 * Exposes catalog building tools for AI agent interaction
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverFromWikipediaList, extractFromWikipedia } from './sources/wikipedia.js';
import { discoverWorksFromWikipedia, extractWorkFromWikipedia, samplePoetryContent } from './sources/poetry-sources.js';

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
            wikiUrl = poet.sameAs?.[0] || `https://en.wikipedia.org/wiki/${poet.name.replace(/ /g, '_')}`;
        }
    }

    if (!wikiUrl) {
        wikiUrl = `https://en.wikipedia.org/wiki/${poetName.replace(/ /g, '_')}`;
    }

    const works = await discoverWorksFromWikipedia(poetName, wikiUrl);

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
                    source: 'sample_library',
                    extractedAt: new Date().toISOString()
                }
            };
        }
    }

    // Extract from Wikipedia
    const work = await extractWorkFromWikipedia(workName, wikiUrl);

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
        sourceUrl: work.sourceUrl || '',
        addedAt: new Date().toISOString()
    };

    // Check for duplicates
    const existing = catalog.works.find(w =>
        w.name.toLowerCase() === work.name.toLowerCase() &&
        w.author?.['@id'] === poetId
    );

    if (existing) {
        // Update existing
        Object.assign(existing, workEntry);
        existing.updatedAt = new Date().toISOString();
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

export const tools = {
    discover_entities: {
        name: 'discover_entities',
        description: 'Find poet candidates from Wikipedia list pages',
        parameters: {
            source: { type: 'string', default: 'wikipedia', description: 'Data source (wikipedia)' },
            query: { type: 'string', required: true, description: 'Wikipedia list page title or URL' },
            limit: { type: 'number', default: 20, description: 'Max candidates to fetch' }
        },
        handler: discover_entities
    },
    extract_entity: {
        name: 'extract_entity',
        description: 'Extract structured entity data from Wikipedia',
        parameters: {
            name: { type: 'string', required: true, description: 'Entity name' },
            sourceUrl: { type: 'string', required: true, description: 'Wikipedia URL' }
        },
        handler: extract_entity
    },
    review_entity: {
        name: 'review_entity',
        description: 'Get next entity pending human review',
        parameters: {},
        handler: review_entity
    },
    approve_entity: {
        name: 'approve_entity',
        description: 'Approve an entity for cataloging',
        parameters: {
            queueId: { type: 'string', required: true, description: 'Review queue ID' }
        },
        handler: approve_entity
    },
    reject_entity: {
        name: 'reject_entity',
        description: 'Reject an entity from cataloging',
        parameters: {
            queueId: { type: 'string', required: true, description: 'Review queue ID' },
            reason: { type: 'string', description: 'Rejection reason' }
        },
        handler: reject_entity
    },
    update_entity: {
        name: 'update_entity',
        description: 'Update entity data in review queue',
        parameters: {
            queueId: { type: 'string', required: true, description: 'Review queue ID' },
            updates: { type: 'object', required: true, description: 'Fields to update' }
        },
        handler: update_entity
    },
    sync_catalog: {
        name: 'sync_catalog',
        description: 'Write approved entities to catalog JSON',
        parameters: {
            catalogType: { type: 'string', default: 'poets', description: 'Catalog type (poets/comedy)' }
        },
        handler: sync_catalog
    },
    search_catalog: {
        name: 'search_catalog',
        description: 'Search existing catalog entries',
        parameters: {
            catalogType: { type: 'string', default: 'poets', description: 'Catalog type' },
            query: { type: 'string', required: true, description: 'Search query' }
        },
        handler: search_catalog
    },
    get_status: {
        name: 'get_status',
        description: 'Get pipeline status (candidates, review queue)',
        parameters: {},
        handler: get_status
    },
    // Work Discovery & Extraction Tools
    discover_works: {
        name: 'discover_works',
        description: 'Discover works for a poet from Wikipedia',
        parameters: {
            poetId: { type: 'string', description: 'Poet entity ID' },
            poetName: { type: 'string', description: 'Poet name' },
            wikiUrl: { type: 'string', description: 'Wikipedia URL' }
        },
        handler: discover_works
    },
    extract_work: {
        name: 'extract_work',
        description: 'Extract work content from sources',
        parameters: {
            workName: { type: 'string', required: true, description: 'Work/poem name' },
            wikiUrl: { type: 'string', description: 'Wikipedia URL for work' },
            useSample: { type: 'boolean', default: false, description: 'Use sample poetry library' }
        },
        handler: extract_work
    },
    add_work_to_catalog: {
        name: 'add_work_to_catalog',
        description: 'Add a work to the catalog linked to a poet',
        parameters: {
            poetId: { type: 'string', required: true, description: 'Poet entity ID' },
            work: { type: 'object', required: true, description: 'Work object with name, content, etc.' }
        },
        handler: add_work_to_catalog
    },
    get_poet_works: {
        name: 'get_poet_works',
        description: 'Get all works for a poet',
        parameters: {
            poetId: { type: 'string', required: true, description: 'Poet entity ID' }
        },
        handler: get_poet_works
    }
};

export default tools;

