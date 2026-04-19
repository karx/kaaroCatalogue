#!/usr/bin/env node
/**
 * CLI runner for entity validation.
 * Validation logic lives in scripts/lib/validate.js (independently testable).
 *
 * Exit 0 = pass, Exit 1 = errors (blocks merge).
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  validatePersonEntity,
  validateVideoEntity,
  checkDuplicateSameAs,
  findFuzzyNameCollisions,
} from './lib/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENTITIES_DIR = join(ROOT, 'src/data/entities');
const REGISTRY_DIR = join(ROOT, 'src/data/registry');

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

function loadDir(subdir) {
  const dir = join(ENTITIES_DIR, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ file: join(subdir, f), data: readJson(join(dir, f)) }));
}

async function main() {
  const errors = [];
  const warnings = [];

  const registryPath = join(REGISTRY_DIR, 'sameas-index.json');
  const registry = existsSync(registryPath) ? readJson(registryPath) : {};
  const seenSameAs = {};

  const poetEntries = loadDir('poets');
  const comedyEntries = loadDir('comedy');
  const videoEntries = loadDir('videos');

  const comedianIds = new Set(comedyEntries.map(e => e.data.entityId).filter(Boolean));

  // Validate person entities
  for (const { file, data } of [...poetEntries, ...comedyEntries]) {
    errors.push(...validatePersonEntity(data, file));
    errors.push(...checkDuplicateSameAs(data, file, registry, seenSameAs));
  }

  // Validate video entities
  for (const { file, data } of videoEntries) {
    errors.push(...validateVideoEntity(data, file, comedianIds));
  }

  // Fuzzy name collision warnings (across all people)
  const allPeople = [...poetEntries, ...comedyEntries]
    .filter(e => e.data.name && e.data.entityId)
    .map(e => ({ id: e.data.entityId, name: e.data.name }));
  warnings.push(...findFuzzyNameCollisions(allPeople));

  // Report
  console.log('🔍 Kaaro Catalogue — Entity Validation\n');
  console.log(`   Poets:     ${poetEntries.length}`);
  console.log(`   Comedians: ${comedyEntries.length}`);
  console.log(`   Videos:    ${videoEntries.length}`);
  console.log();

  if (warnings.length > 0) {
    console.log(`⚠  ${warnings.length} warning(s):`);
    warnings.forEach(w => console.log(`   • ${w}`));
    console.log();
  }

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} error(s) — fix before merging:\n`);
    errors.forEach(e => console.log(`   • ${e}`));
    process.exit(1);
  }

  console.log('✅ All entities valid.');
}

main().catch(err => {
  console.error('Validation crashed:', err);
  process.exit(1);
});
