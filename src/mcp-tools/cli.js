#!/usr/bin/env node

/**
 * KaaroCatalogue CLI
 * Command-line interface for catalog building tools
 */

import {
    discover_entities,
    extract_entity,
    review_entity,
    approve_entity,
    reject_entity,
    sync_catalog,
    search_catalog,
    get_status
} from './index.js';

const args = process.argv.slice(2);
const command = args[0];

// Parse arguments into object
function parseArgs(args) {
    const params = {};
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1]?.startsWith('--') ? true : args[i + 1];
            params[key] = value;
            if (value !== true) i++;
        }
    }
    return params;
}

async function main() {
    const params = parseArgs(args);

    try {
        let result;

        switch (command) {
            case 'discover':
                result = await discover_entities({
                    source: params.source || 'wikipedia',
                    query: params.list || params.query,
                    limit: parseInt(params.limit) || 20
                });
                console.log('\n✅ Discovery complete');
                console.log(`   New candidates: ${result.count}`);
                console.log(`   Total pending: ${result.total}`);
                if (result.candidates.length > 0) {
                    console.log('\n   Sample candidates:');
                    result.candidates.slice(0, 5).forEach(c => console.log(`   - ${c.name}`));
                }
                break;

            case 'extract':
                if (!params.name) {
                    console.error('Error: --name is required');
                    process.exit(1);
                }
                const sourceUrl = params.url || `https://en.wikipedia.org/wiki/${params.name.replace(/ /g, '_')}`;
                result = await extract_entity({ name: params.name, sourceUrl });
                console.log('\n✅ Extraction complete');
                console.log(`   Entity: ${result.entity.name}`);
                console.log(`   Language: ${result.entity.knowsLanguage || 'Unknown'}`);
                console.log(`   Queue ID: ${result.queueId}`);
                if (params.verbose) {
                    console.log('\n   Full entity:', JSON.stringify(result.entity, null, 2));
                }
                break;

            case 'review':
                result = await review_entity();
                if (!result.entity) {
                    console.log('\n📭 No entities pending review');
                } else {
                    console.log('\n📋 Next entity for review:');
                    console.log(`   Name: ${result.entity.name}`);
                    console.log(`   Language: ${result.entity.knowsLanguage || 'Unknown'}`);
                    console.log(`   Queue ID: ${result.queueId}`);
                    console.log(`   Abstract: ${(result.entity.abstract || '').slice(0, 200)}...`);
                }
                console.log('\n📊 Queue stats:');
                console.log(`   Pending: ${result.stats.pending}`);
                console.log(`   Approved: ${result.stats.approved}`);
                console.log(`   Rejected: ${result.stats.rejected}`);
                break;

            case 'approve':
                if (!params.id) {
                    console.error('Error: --id is required');
                    process.exit(1);
                }
                result = await approve_entity({ queueId: params.id });
                console.log(`\n✅ ${result.message}`);
                break;

            case 'reject':
                if (!params.id) {
                    console.error('Error: --id is required');
                    process.exit(1);
                }
                result = await reject_entity({ queueId: params.id, reason: params.reason || '' });
                console.log(`\n❌ ${result.message}`);
                break;

            case 'sync':
                result = await sync_catalog({ catalogType: params.catalog || 'poets' });
                console.log(`\n✅ ${result.message}`);
                console.log(`   Total entities: ${result.totalEntities}`);
                break;

            case 'search':
                if (!params.query) {
                    console.error('Error: --query is required');
                    process.exit(1);
                }
                result = await search_catalog({
                    catalogType: params.catalog || 'poets',
                    query: params.query
                });
                console.log(`\n🔍 Found ${result.count} results`);
                result.results.slice(0, 10).forEach(e => {
                    console.log(`   - ${e.name} (${e.knowsLanguage || 'Unknown'})`);
                });
                break;

            case 'status':
                result = await get_status();
                console.log('\n📊 Pipeline Status');
                console.log('\n   Candidates:');
                console.log(`     Pending: ${result.candidates.pending}`);
                console.log(`     Extracted: ${result.candidates.extracted}`);
                console.log('\n   Review Queue:');
                console.log(`     Pending: ${result.review.pending}`);
                console.log(`     Approved: ${result.review.approved}`);
                console.log(`     Rejected: ${result.review.rejected}`);
                break;

            case 'help':
            default:
                console.log(`
KaaroCatalogue CLI - Catalog Building Tools

Usage: node cli.js <command> [options]

Commands:
  discover    Find entities from sources
              --source wikipedia (default)
              --list "List_of_Hindi_poets"
              --limit 20

  extract     Extract entity data from source
              --name "Kabir" (required)
              --url "https://..." (optional)
              --verbose

  review      Get next entity for human review

  approve     Approve entity for catalog
              --id "review-xxx" (required)

  reject      Reject entity
              --id "review-xxx" (required)
              --reason "Not a poet"

  sync        Write approved entities to catalog
              --catalog poets|comedy

  search      Search catalog
              --query "Bhakti" (required)
              --catalog poets|comedy

  status      Show pipeline status

  help        Show this help message
        `);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (params.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
