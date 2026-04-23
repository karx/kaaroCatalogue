#!/usr/bin/env node
/**
 * Renames entity files from opaque IDs (poet-001, comedian-mk087xaa)
 * to human-readable slug IDs (poet-kalidasa, comedian-biswa-kalyan-rath).
 *
 * Safe to run multiple times — already-readable IDs are left untouched.
 *
 * Steps:
 *   1. Build old → new ID mapping for poets and comedians
 *   2. Rename entity files + update entityId field inside each file
 *   3. Patch video files: update actor.@id using the comedian mapping
 *   4. Rebuild sameas-index.json with new IDs
 *   5. Print summary
 *
 * Run: node scripts/re-slug-entities.js [--dry-run]
 * Then: npm run build:catalog
 */

import {
  readFileSync, writeFileSync, renameSync, readdirSync, existsSync, mkdirSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nameToSlug, isOpaqueId, deriveSlugId } from './lib/slug.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENTITIES = join(ROOT, 'src/data/entities');
const REGISTRY = join(ROOT, 'src/data/registry');
const DRY_RUN = process.argv.includes('--dry-run');

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function loadDir(subdir) {
  const dir = join(ENTITIES, subdir);
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ path: join(dir, f), file: f, data: readJson(join(dir, f)) }));
}

function buildRenameMap(entries) {
  // First pass: collect all current IDs (including already-readable ones)
  const taken = new Set(entries.map(e => e.data.entityId).filter(Boolean));
  const mapping = new Map(); // oldId → newId

  for (const { data } of entries) {
    const oldId = data.entityId;
    if (!oldId) continue;
    if (!isOpaqueId(oldId)) {
      mapping.set(oldId, oldId); // already readable, keep
      continue;
    }

    // Remove old ID from taken so deriveSlugId can use it if the slug happens to match
    taken.delete(oldId);
    const newId = deriveSlugId(data.name, oldId, taken);
    taken.add(newId);
    mapping.set(oldId, newId);
  }

  return mapping;
}

function applyRenames(entries, mapping, subdir) {
  let renamed = 0;
  for (const { path, data } of entries) {
    const oldId = data.entityId;
    if (!oldId) continue;
    const newId = mapping.get(oldId);
    if (!newId || newId === oldId) continue;

    const newPath = join(ENTITIES, subdir, `${newId}.json`);
    const updatedData = { ...data, entityId: newId };

    if (!DRY_RUN) {
      writeJson(path, updatedData);       // update entityId inside file first
      renameSync(path, newPath);          // then rename the file
    }
    console.log(`  ${oldId}.json → ${newId}.json`);
    renamed++;
  }
  return renamed;
}

function patchVideoActorRefs(comedianMapping) {
  const videoDir = join(ENTITIES, 'videos');
  const files = readdirSync(videoDir).filter(f => f.endsWith('.json'));
  let patched = 0;

  for (const file of files) {
    const path = join(videoDir, file);
    const data = readJson(path);
    const oldActorId = data.actor?.['@id'];
    if (!oldActorId) continue;

    const newActorId = comedianMapping.get(oldActorId);
    if (!newActorId || newActorId === oldActorId) continue;

    if (!DRY_RUN) {
      writeJson(path, { ...data, actor: { ...data.actor, '@id': newActorId } });
    }
    patched++;
  }
  return patched;
}

function patchWorkAuthorRefs(poetMapping) {
  const worksDir = join(ENTITIES, 'works');
  if (!existsSync(worksDir)) return 0;
  const files = readdirSync(worksDir).filter(f => f.endsWith('.json'));
  let patched = 0;

  for (const file of files) {
    const path = join(worksDir, file);
    const data = readJson(path);
    const oldAuthorId = data.author?.['@id'];
    if (!oldAuthorId) continue;

    const newAuthorId = poetMapping.get(oldAuthorId);
    if (!newAuthorId || newAuthorId === oldAuthorId) continue;

    if (!DRY_RUN) {
      writeJson(path, { ...data, author: { ...data.author, '@id': newAuthorId } });
    }
    patched++;
  }
  return patched;
}

function rebuildSameAsIndex(poetEntries, comedyEntries, videoEntries) {
  const index = {};
  const allEntities = [...poetEntries, ...comedyEntries, ...videoEntries];
  for (const { path } of allEntities) {
    // Re-read from disk to get the updated entityId
    const data = readJson(path);
    const id = data.entityId || data.videoId;
    if (!id) continue;
    for (const url of data.sameAs || []) {
      if (url && typeof url === 'string') index[url] = id;
    }
  }
  return index;
}

async function main() {
  console.log(`🔤 Re-slugging entity IDs${DRY_RUN ? ' (DRY RUN — no files written)' : ''}...\n`);

  const poetEntries = loadDir('poets');
  const comedyEntries = loadDir('comedy');
  const videoEntries = loadDir('videos');

  // Build rename maps
  const poetMap = buildRenameMap(poetEntries);
  const comedianMap = buildRenameMap(comedyEntries);

  // Show planned changes
  const poetChanges = [...poetMap.entries()].filter(([o, n]) => o !== n);
  const comedianChanges = [...comedianMap.entries()].filter(([o, n]) => o !== n);

  console.log(`📚 Poets to rename: ${poetChanges.length}`);
  const poetRenamed = applyRenames(poetEntries, poetMap, 'poets');

  console.log(`\n🎤 Comedians to rename: ${comedianChanges.length}`);
  const comedianRenamed = applyRenames(comedyEntries, comedianMap, 'comedy');

  console.log(`\n🎬 Patching video actor.@id cross-references...`);
  const videoPatched = patchVideoActorRefs(comedianMap);
  console.log(`  ${videoPatched} video files updated`);

  console.log(`\n📜 Patching work author.@id cross-references...`);
  const worksPatched = patchWorkAuthorRefs(poetMap);
  console.log(`  ${worksPatched} work files updated`);

  if (!DRY_RUN) {
    // Reload entries from disk (files have been renamed)
    const freshPoets = loadDir('poets');
    const freshComedy = loadDir('comedy');
    const freshVideos = loadDir('videos');

    const newSameAsIndex = rebuildSameAsIndex(freshPoets, freshComedy, freshVideos);
    writeJson(join(REGISTRY, 'sameas-index.json'), newSameAsIndex);
    console.log(`\n🔗 Rebuilt sameas-index.json — ${Object.keys(newSameAsIndex).length} URLs`);
  }

  console.log(`\n✅ Done.`);
  console.log(`   Poets renamed:    ${poetRenamed}`);
  console.log(`   Comedians renamed: ${comedianRenamed}`);
  console.log(`   Videos patched:   ${videoPatched}`);
  if (!DRY_RUN) {
    console.log(`\n   Next: npm run build:catalog`);
  }
}

main().catch(err => {
  console.error('Re-slug failed:', err);
  process.exit(1);
});
