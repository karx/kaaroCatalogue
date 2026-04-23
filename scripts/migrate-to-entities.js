#!/usr/bin/env node
/**
 * One-time migration: splits monolithic catalog JSONs into per-entity files
 * and builds the sameAs registry index.
 *
 * Run once: node scripts/migrate-to-entities.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildSameAsIndex(entities, existing = {}) {
  const index = { ...existing };
  for (const entity of entities) {
    const id = entity.entityId || entity.videoId;
    if (!id) continue;
    const urls = Array.isArray(entity.sameAs) ? entity.sameAs : [];
    for (const url of urls) {
      if (url && typeof url === 'string') {
        if (index[url] && index[url] !== id) {
          console.warn(`  ⚠ sameAs collision: ${url} → ${index[url]} vs ${id}`);
        } else {
          index[url] = id;
        }
      }
    }
  }
  return index;
}

function migrateEntities(entities, outDir, type) {
  let written = 0;
  for (const entity of entities) {
    const id = entity.entityId || entity.videoId;
    if (!id) {
      console.warn(`  ⚠ Skipping entity with no id: ${entity.name}`);
      continue;
    }
    const outPath = join(outDir, `${id}.json`);
    if (existsSync(outPath)) {
      console.log(`  ↷ Already exists, skipping: ${id}.json`);
      continue;
    }
    writeJson(outPath, entity);
    written++;
  }
  return written;
}

async function main() {
  console.log('🔄 Migrating to file-per-entity structure...\n');

  // Load source catalogs
  const poetsIndex = readJson(join(ROOT, 'src/data/catalogs/poets-index.json'));
  const comedyIndex = readJson(join(ROOT, 'src/data/catalogs/comedy-index.json'));

  // Migrate poets
  console.log(`📚 Poets: ${poetsIndex.entities.length} entities`);
  const poetsWritten = migrateEntities(
    poetsIndex.entities,
    join(ROOT, 'src/data/entities/poets'),
    'poets'
  );
  console.log(`  ✓ Wrote ${poetsWritten} poet files\n`);

  // Migrate comedians
  console.log(`🎤 Comedians: ${comedyIndex.entities.length} entities`);
  const comedyWritten = migrateEntities(
    comedyIndex.entities,
    join(ROOT, 'src/data/entities/comedy'),
    'comedy'
  );
  console.log(`  ✓ Wrote ${comedyWritten} comedian files\n`);

  // Migrate poetry works
  const works = poetsIndex.works || [];
  console.log(`📜 Works: ${works.length} entities`);
  const worksWritten = migrateEntities(
    works,
    join(ROOT, 'src/data/entities/works'),
    'works'
  );
  console.log(`  ✓ Wrote ${worksWritten} work files\n`);

  // Migrate videos
  const videos = comedyIndex.videos || [];
  console.log(`🎬 Videos: ${videos.length} entities`);
  const videosWritten = migrateEntities(
    videos,
    join(ROOT, 'src/data/entities/videos'),
    'videos'
  );
  console.log(`  ✓ Wrote ${videosWritten} video files\n`);

  // Build sameAs index
  console.log('🔗 Building sameAs registry...');
  let sameAsIndex = {};
  sameAsIndex = buildSameAsIndex(poetsIndex.entities, sameAsIndex);
  sameAsIndex = buildSameAsIndex(comedyIndex.entities, sameAsIndex);
  sameAsIndex = buildSameAsIndex(videos, sameAsIndex);

  const registryPath = join(ROOT, 'src/data/registry/sameas-index.json');
  writeJson(registryPath, sameAsIndex);
  console.log(`  ✓ ${Object.keys(sameAsIndex).length} URLs indexed\n`);

  // Write catalog manifests (metadata without entities/videos)
  const poetsManifest = {
    catalogId: poetsIndex.catalogId,
    catalogType: poetsIndex.catalogType,
    name: poetsIndex.name,
    description: poetsIndex.description,
    createdAt: poetsIndex.createdAt,
    metadata: poetsIndex.metadata,
  };
  const comedyManifest = {
    catalogId: comedyIndex.catalogId,
    catalogType: comedyIndex.catalogType,
    name: comedyIndex.name,
    description: comedyIndex.description,
    createdAt: comedyIndex.createdAt,
    metadata: comedyIndex.metadata,
  };
  writeJson(join(ROOT, 'src/data/registry/poets-manifest.json'), poetsManifest);
  writeJson(join(ROOT, 'src/data/registry/comedy-manifest.json'), comedyManifest);
  console.log('📋 Catalog manifests written to src/data/registry/\n');

  console.log('✅ Migration complete!');
  console.log('   Next: run `npm run build:catalog` to regenerate index files.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
