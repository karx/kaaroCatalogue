#!/usr/bin/env node
/**
 * Assembles per-entity files into monolithic catalog index JSONs.
 * Source of truth: src/data/entities/
 * Output: src/data/catalogs/ and src/web/data/catalogs/
 *
 * Run: node scripts/build-catalog.js [--catalog poets|comedy|all]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const ENTITIES_DIR = join(ROOT, 'src/data/entities');
const REGISTRY_DIR = join(ROOT, 'src/data/registry');
const CATALOGS_OUT = join(ROOT, 'src/data/catalogs');
const WEB_CATALOGS_OUT = join(ROOT, 'src/web/data/catalogs');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function loadEntities(subdir) {
  const dir = join(ENTITIES_DIR, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJson(join(dir, f)))
    .sort((a, b) => {
      const idA = a.entityId || a.videoId || '';
      const idB = b.entityId || b.videoId || '';
      return idA.localeCompare(idB);
    });
}

function buildPoetsCatalog() {
  const manifest = existsSync(join(REGISTRY_DIR, 'poets-manifest.json'))
    ? readJson(join(REGISTRY_DIR, 'poets-manifest.json'))
    : {};

  const entities = loadEntities('poets');
  const works = loadEntities('works');

  const catalog = {
    '@context': 'https://schema.org',
    catalogId: manifest.catalogId || 'poets-catalog',
    catalogType: 'poets',
    name: manifest.name || 'Indian Kavi Index',
    description: manifest.description || '',
    createdAt: manifest.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      ...(manifest.metadata || {}),
      totalEntities: entities.length,
      totalWorks: works.length,
      lastSync: new Date().toISOString(),
      generatedBy: 'build-catalog.js',
    },
    entities,
    works,
  };

  return catalog;
}

function buildComedyCatalog() {
  const manifest = existsSync(join(REGISTRY_DIR, 'comedy-manifest.json'))
    ? readJson(join(REGISTRY_DIR, 'comedy-manifest.json'))
    : {};

  const entities = loadEntities('comedy');
  const videos = loadEntities('videos');

  const catalog = {
    '@context': 'https://schema.org',
    catalogId: manifest.catalogId || 'comedy-catalog',
    catalogType: 'comedy',
    name: manifest.name || 'Global Stand-Up Comedy Index',
    description: manifest.description || '',
    createdAt: manifest.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      ...(manifest.metadata || {}),
      totalEntities: entities.length,
      totalVideos: videos.length,
      lastSync: new Date().toISOString(),
      generatedBy: 'build-catalog.js',
    },
    entities,
    videos,
  };

  return catalog;
}

function writeCatalog(name, catalog) {
  ensureDir(CATALOGS_OUT);
  ensureDir(WEB_CATALOGS_OUT);

  const filename = `${name}-index.json`;
  writeJson(join(CATALOGS_OUT, filename), catalog);
  writeJson(join(WEB_CATALOGS_OUT, filename), catalog);
  const extras = [
    catalog.works ? `${catalog.works.length} works` : null,
    catalog.videos ? `${catalog.videos.length} videos` : null,
  ].filter(Boolean).join(', ');
  console.log(`  ✓ ${filename} — ${catalog.entities?.length ?? 0} entities${extras ? `, ${extras}` : ''}`);
}

async function main() {
  const arg = process.argv[2];
  const target = arg === '--catalog' ? process.argv[3] : 'all';

  console.log(`🔨 Building catalog(s): ${target}\n`);

  if (target === 'all' || target === 'poets') {
    const poets = buildPoetsCatalog();
    writeCatalog('poets', poets);
  }

  if (target === 'all' || target === 'comedy') {
    const comedy = buildComedyCatalog();
    writeCatalog('comedy', comedy);
  }

  console.log('\n✅ Build complete.');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
