/**
 * Unit tests for scripts/lib/validate.js
 * Run: node --test scripts/__tests__/validate.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePersonEntity,
  validateVideoEntity,
  validateWorkEntity,
  checkDuplicateSameAs,
  nameSimilarity,
  findFuzzyNameCollisions,
} from '../lib/validate.js';

// ---------------------------------------------------------------------------
// validatePersonEntity
// ---------------------------------------------------------------------------

describe('validatePersonEntity', () => {
  const validPoet = {
    entityId: 'poet-kabir',
    name: 'Kabir',
    sameAs: ['https://en.wikipedia.org/wiki/Kabir'],
    source: { url: 'https://en.wikipedia.org/wiki/Kabir', name: 'Wikipedia', retrievedAt: '2026-01-01T00:00:00Z' },
  };

  it('passes a fully valid entity', () => {
    const errors = validatePersonEntity(validPoet, 'poets/poet-kabir.json');
    assert.deepEqual(errors, []);
  });

  it('errors when entityId is missing', () => {
    const entity = { ...validPoet, entityId: undefined };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing entityId')));
  });

  it('errors when entityId does not match filename', () => {
    const errors = validatePersonEntity(validPoet, 'poets/poet-wrong-name.json');
    assert.ok(errors.some(e => e.includes('does not match filename')));
  });

  it('errors when source.url is missing', () => {
    const entity = { ...validPoet, source: { name: 'Wikipedia' } };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing source.url')));
  });

  it('errors when source is absent entirely', () => {
    const entity = { ...validPoet, source: undefined };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing source.url')));
  });

  it('errors when sameAs is empty array', () => {
    const entity = { ...validPoet, sameAs: [] };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing sameAs')));
  });

  it('errors when sameAs is absent', () => {
    const entity = { ...validPoet, sameAs: undefined };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing sameAs')));
  });

  it('errors when name is missing', () => {
    const entity = { ...validPoet, name: undefined };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.some(e => e.includes('missing name')));
  });

  it('returns multiple errors for multiple missing fields', () => {
    const entity = { entityId: 'poet-kabir', sameAs: undefined, source: undefined };
    const errors = validatePersonEntity(entity, 'poets/poet-kabir.json');
    assert.ok(errors.length >= 3, `Expected ≥3 errors, got ${errors.length}: ${errors.join('; ')}`);
  });
});

// ---------------------------------------------------------------------------
// validateVideoEntity
// ---------------------------------------------------------------------------

describe('validateVideoEntity', () => {
  const validComedy = new Set(['comedian-vir-das', 'comedian-john-mulaney']);
  const validVideo = {
    videoId: 'video-001',
    name: 'Vir Das - Two Indias',
    actor: { '@type': 'Person', '@id': 'comedian-vir-das' },
  };

  it('passes a fully valid video', () => {
    const errors = validateVideoEntity(validVideo, 'videos/video-001.json', validComedy);
    assert.deepEqual(errors, []);
  });

  it('errors when videoId is missing', () => {
    const errors = validateVideoEntity({ ...validVideo, videoId: undefined }, 'videos/video-001.json', validComedy);
    assert.ok(errors.some(e => e.includes('missing videoId')));
  });

  it('errors when videoId does not match filename', () => {
    const errors = validateVideoEntity(validVideo, 'videos/video-999.json', validComedy);
    assert.ok(errors.some(e => e.includes('does not match filename')));
  });

  it('errors when name is missing', () => {
    const errors = validateVideoEntity({ ...validVideo, name: undefined }, 'videos/video-001.json', validComedy);
    assert.ok(errors.some(e => e.includes('missing name')));
  });

  it('errors when actor.@id is missing', () => {
    const video = { ...validVideo, actor: { '@type': 'Person' } };
    const errors = validateVideoEntity(video, 'videos/video-001.json', validComedy);
    assert.ok(errors.some(e => e.includes('missing actor.@id')));
  });

  it('errors when actor.@id references non-existent comedian', () => {
    const video = { ...validVideo, actor: { '@type': 'Person', '@id': 'comedian-nobody' } };
    const errors = validateVideoEntity(video, 'videos/video-001.json', validComedy);
    assert.ok(errors.some(e => e.includes('does not match any comedian entity')));
  });

  it('passes when validComedianIds is not provided (skips cross-ref check)', () => {
    const errors = validateVideoEntity(validVideo, 'videos/video-001.json', undefined);
    assert.deepEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// validateWorkEntity
// ---------------------------------------------------------------------------

describe('validateWorkEntity', () => {
  const validPoets = new Set(['poet-kabir', 'poet-kalidasa']);
  const validWork = {
    workId: 'work-abc123',
    name: 'Bijak',
    author: { '@type': 'Person', '@id': 'poet-kabir' },
  };

  it('passes a fully valid work', () => {
    const errors = validateWorkEntity(validWork, 'works/work-abc123.json', validPoets);
    assert.deepEqual(errors, []);
  });

  it('errors when workId is missing', () => {
    const errors = validateWorkEntity({ ...validWork, workId: undefined }, 'works/work-abc123.json', validPoets);
    assert.ok(errors.some(e => e.includes('missing workId')));
  });

  it('errors when workId does not match filename', () => {
    const errors = validateWorkEntity(validWork, 'works/work-wrong.json', validPoets);
    assert.ok(errors.some(e => e.includes('does not match filename')));
  });

  it('errors when name is missing', () => {
    const errors = validateWorkEntity({ ...validWork, name: undefined }, 'works/work-abc123.json', validPoets);
    assert.ok(errors.some(e => e.includes('missing name')));
  });

  it('errors when author.@id is missing', () => {
    const work = { ...validWork, author: { '@type': 'Person' } };
    const errors = validateWorkEntity(work, 'works/work-abc123.json', validPoets);
    assert.ok(errors.some(e => e.includes('missing author.@id')));
  });

  it('errors when author.@id references non-existent poet', () => {
    const work = { ...validWork, author: { '@type': 'Person', '@id': 'poet-nobody' } };
    const errors = validateWorkEntity(work, 'works/work-abc123.json', validPoets);
    assert.ok(errors.some(e => e.includes('does not match any poet entity')));
  });

  it('errors when author object is absent entirely', () => {
    const work = { ...validWork, author: undefined };
    const errors = validateWorkEntity(work, 'works/work-abc123.json', validPoets);
    assert.ok(errors.some(e => e.includes('missing author.@id')));
  });

  it('passes when validPoetIds is not provided (skips cross-ref check)', () => {
    const errors = validateWorkEntity(validWork, 'works/work-abc123.json', undefined);
    assert.deepEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// checkDuplicateSameAs
// ---------------------------------------------------------------------------

describe('checkDuplicateSameAs', () => {
  const wikiUrl = 'https://en.wikipedia.org/wiki/Kabir';

  it('passes when URL is new to both registry and batch', () => {
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir', sameAs: [wikiUrl] },
      'poets/poet-kabir.json',
      {},   // empty registry
      {}    // empty batch
    );
    assert.deepEqual(errors, []);
  });

  it('errors when URL already in registry under a different ID', () => {
    const registry = { [wikiUrl]: 'poet-kabir-old' };
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir-new', sameAs: [wikiUrl] },
      'poets/poet-kabir-new.json',
      registry,
      {}
    );
    assert.ok(errors.some(e => e.includes('already belongs to')));
  });

  it('passes when URL is in registry under the SAME ID (idempotent re-validation)', () => {
    const registry = { [wikiUrl]: 'poet-kabir' };
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir', sameAs: [wikiUrl] },
      'poets/poet-kabir.json',
      registry,
      {}
    );
    assert.deepEqual(errors, []);
  });

  it('errors when URL conflicts within the same PR batch', () => {
    const seenInBatch = { [wikiUrl]: 'poet-kabir' };
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir-duplicate', sameAs: [wikiUrl] },
      'poets/poet-kabir-duplicate.json',
      {},
      seenInBatch
    );
    assert.ok(errors.some(e => e.includes('same PR')));
  });

  it('accumulates seen URLs into seenInBatch for subsequent calls', () => {
    const seenInBatch = {};
    checkDuplicateSameAs(
      { entityId: 'poet-kabir', sameAs: [wikiUrl] },
      'poets/poet-kabir.json',
      {},
      seenInBatch
    );
    assert.equal(seenInBatch[wikiUrl], 'poet-kabir');
  });

  it('skips null/empty entries in sameAs array gracefully', () => {
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir', sameAs: [null, '', wikiUrl] },
      'poets/poet-kabir.json',
      {},
      {}
    );
    assert.deepEqual(errors, []);
  });

  it('handles entity with no sameAs array gracefully', () => {
    const errors = checkDuplicateSameAs(
      { entityId: 'poet-kabir' },
      'poets/poet-kabir.json',
      {},
      {}
    );
    assert.deepEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// nameSimilarity
// ---------------------------------------------------------------------------

describe('nameSimilarity', () => {
  it('returns 1 for identical names', () => {
    assert.equal(nameSimilarity('Kabir', 'Kabir'), 1);
  });

  it('returns 1 for case-insensitive match', () => {
    assert.equal(nameSimilarity('Kabir', 'KABIR'), 1);
  });

  it('returns 0 for completely different names', () => {
    const sim = nameSimilarity('Kalidasa', 'John Mulaney');
    assert.ok(sim === 0, `Expected 0, got ${sim}`);
  });

  it('returns high similarity for near-duplicates', () => {
    const sim = nameSimilarity('Kabir Das', 'Kabir');
    assert.ok(sim >= 0.5, `Expected ≥0.5, got ${sim}`);
  });

  it('returns 0 for empty strings', () => {
    assert.equal(nameSimilarity('', ''), 0);
  });

  it('is symmetric', () => {
    const a = nameSimilarity('Mirza Ghalib', 'Ghalib Mirza');
    const b = nameSimilarity('Ghalib Mirza', 'Mirza Ghalib');
    assert.equal(a, b);
  });
});

// ---------------------------------------------------------------------------
// findFuzzyNameCollisions
// ---------------------------------------------------------------------------

describe('findFuzzyNameCollisions', () => {
  it('returns empty for clearly distinct names', () => {
    const entities = [
      { id: 'poet-kabir', name: 'Kabir' },
      { id: 'poet-tagore', name: 'Rabindranath Tagore' },
      { id: 'comedian-john-mulaney', name: 'John Mulaney' },
    ];
    assert.deepEqual(findFuzzyNameCollisions(entities), []);
  });

  it('warns on near-duplicate names above threshold', () => {
    const entities = [
      { id: 'comedian-vir-das', name: 'Vir Das' },
      { id: 'comedian-vir-das-2', name: 'Vir Das' },
    ];
    const warnings = findFuzzyNameCollisions(entities);
    assert.ok(warnings.length > 0, 'Expected a warning for identical names');
    assert.ok(warnings[0].includes('100%'));
  });

  it('does not warn when similarity is below threshold', () => {
    const entities = [
      { id: 'a', name: 'Kabir' },
      { id: 'b', name: 'Kabir Das' },
    ];
    const warnings = findFuzzyNameCollisions(entities, 0.95);
    assert.deepEqual(warnings, []);
  });

  it('handles single-entity list', () => {
    const entities = [{ id: 'poet-kabir', name: 'Kabir' }];
    assert.deepEqual(findFuzzyNameCollisions(entities), []);
  });

  it('handles empty list', () => {
    assert.deepEqual(findFuzzyNameCollisions([]), []);
  });
});
