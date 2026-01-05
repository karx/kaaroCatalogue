/**
 * Comedy Catalogue Data Validation
 * Validates enriched comedy data against schema and quality rules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'comedy-index.json');
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema', 'catalog-schema.json');

/**
 * Validate catalog against JSON schema
 */
async function validateSchema() {
    console.log('📋 Validating against JSON Schema...\n');

    const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8'));
    const schema = JSON.parse(await fs.readFile(SCHEMA_PATH, 'utf-8'));

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(catalog);

    if (valid) {
        console.log('✅ Schema validation passed\n');
        return { valid: true };
    } else {
        console.log('❌ Schema validation failed:\n');
        validate.errors.forEach(err => {
            console.log(`  - ${err.instancePath}: ${err.message}`);
        });
        return { valid: false, errors: validate.errors };
    }
}

/**
 * Validate data quality rules
 */
async function validateQuality() {
    console.log('🔍 Validating data quality...\n');

    const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8'));
    const issues = [];

    // Check entities
    console.log(`📊 Entities: ${catalog.entities.length}`);
    catalog.entities.forEach((entity, idx) => {
        // Required fields
        if (!entity.name) {
            issues.push(`Entity ${idx}: Missing name`);
        }
        if (!entity.entityId) {
            issues.push(`Entity ${idx}: Missing entityId`);
        }
        if (!entity.knowsLanguage) {
            issues.push(`Entity ${entity.name}: Missing language`);
        }

        // Recommended fields
        if (!entity.homeLocation) {
            console.log(`  ⚠️  ${entity.name}: Missing home location`);
        }
        if (!entity.sameAs || entity.sameAs.length === 0) {
            console.log(`  ⚠️  ${entity.name}: No external references`);
        }

        // Check for duplicate entity IDs
        const duplicates = catalog.entities.filter(e => e.entityId === entity.entityId);
        if (duplicates.length > 1) {
            issues.push(`Duplicate entityId: ${entity.entityId}`);
        }
    });

    // Check videos
    if (catalog.videos) {
        console.log(`\n🎥 Videos: ${catalog.videos.length}`);
        const videoUrls = new Set();

        catalog.videos.forEach((video, idx) => {
            // Required fields
            if (!video.name) {
                issues.push(`Video ${idx}: Missing name`);
            }
            if (!video.actor || !video.actor['@id']) {
                issues.push(`Video ${video.name || idx}: Missing actor reference`);
            }
            if (!video.embedUrl && !video.contentUrl) {
                issues.push(`Video ${video.name || idx}: Missing video URL`);
            }

            // Check for duplicate URLs
            const url = video.contentUrl || video.embedUrl;
            if (url) {
                if (videoUrls.has(url)) {
                    issues.push(`Duplicate video URL: ${url}`);
                }
                videoUrls.add(url);
            }

            // Validate YouTube URLs
            if (video.embedUrl && !video.embedUrl.includes('youtube.com')) {
                console.log(`  ⚠️  ${video.name}: Non-YouTube embed URL`);
            }

            // Check actor linkage
            const actorId = video.actor?.['@id'];
            if (actorId) {
                const actorExists = catalog.entities.some(e => e.entityId === actorId);
                if (!actorExists) {
                    issues.push(`Video "${video.name}": References non-existent comedian ${actorId}`);
                }
            }
        });

        // Check comedian-video distribution
        console.log('\n📊 Videos per comedian:');
        const videoCounts = {};
        catalog.videos.forEach(v => {
            const actorId = v.actor?.['@id'];
            if (actorId) {
                videoCounts[actorId] = (videoCounts[actorId] || 0) + 1;
            }
        });

        catalog.entities.forEach(entity => {
            const count = videoCounts[entity.entityId] || 0;
            const status = count === 0 ? '❌' : count < 5 ? '⚠️ ' : '✅';
            console.log(`  ${status} ${entity.name}: ${count} videos`);
        });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (issues.length === 0) {
        console.log('✅ Quality validation passed - no critical issues');
        return { valid: true };
    } else {
        console.log(`❌ Found ${issues.length} critical issues:\n`);
        issues.forEach(issue => console.log(`  - ${issue}`));
        return { valid: false, issues };
    }
}

/**
 * Validate metadata consistency
 */
async function validateMetadata() {
    console.log('\n📊 Validating metadata...\n');

    const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf-8'));
    const issues = [];

    // Check metadata counts
    const actualEntities = catalog.entities.length;
    const metadataEntities = catalog.metadata?.totalEntities || 0;

    if (actualEntities !== metadataEntities) {
        issues.push(`Entity count mismatch: actual=${actualEntities}, metadata=${metadataEntities}`);
    }

    const actualVideos = (catalog.videos || []).length;
    const metadataVideos = catalog.metadata?.totalVideos || 0;

    if (actualVideos !== metadataVideos) {
        issues.push(`Video count mismatch: actual=${actualVideos}, metadata=${metadataVideos}`);
    }

    // Check updated timestamp
    if (!catalog.updatedAt) {
        issues.push('Missing updatedAt timestamp');
    }

    if (issues.length === 0) {
        console.log('✅ Metadata validation passed');
        console.log(`  - Entities: ${actualEntities}`);
        console.log(`  - Videos: ${actualVideos}`);
        console.log(`  - Last updated: ${catalog.updatedAt}`);
        return { valid: true };
    } else {
        console.log('❌ Metadata validation failed:\n');
        issues.forEach(issue => console.log(`  - ${issue}`));
        return { valid: false, issues };
    }
}

/**
 * Main validation function
 */
async function validate() {
    console.log('🎭 Comedy Catalogue Validation\n');
    console.log('='.repeat(60) + '\n');

    try {
        const results = {
            schema: await validateSchema(),
            quality: await validateQuality(),
            metadata: await validateMetadata()
        };

        console.log('\n' + '='.repeat(60));
        console.log('VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Schema: ${results.schema.valid ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Quality: ${results.quality.valid ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Metadata: ${results.metadata.valid ? '✅ PASS' : '❌ FAIL'}`);

        const allValid = results.schema.valid && results.quality.valid && results.metadata.valid;

        if (allValid) {
            console.log('\n🎉 All validations passed!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some validations failed. Please review above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Validation error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    validate();
}

export default validate;
