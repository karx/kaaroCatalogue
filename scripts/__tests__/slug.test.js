/**
 * Unit tests for scripts/lib/slug.js
 * Run: node --test scripts/__tests__/slug.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { nameToSlug, isOpaqueId, deriveSlugId } from '../lib/slug.js';

// ---------------------------------------------------------------------------
// nameToSlug
// ---------------------------------------------------------------------------

describe('nameToSlug', () => {
  it('lowercases and handles simple names', () => {
    assert.equal(nameToSlug('Kabir'), 'kabir');
    assert.equal(nameToSlug('Kalidasa'), 'kalidasa');
  });

  it('converts spaces to dashes', () => {
    assert.equal(nameToSlug('Mirza Ghalib'), 'mirza-ghalib');
    assert.equal(nameToSlug('John Mulaney'), 'john-mulaney');
  });

  it('strips dots from initialisms', () => {
    assert.equal(nameToSlug('A.K. Ramanujan'), 'ak-ramanujan');
    assert.equal(nameToSlug('D.R. Bendre'), 'dr-bendre');
  });

  it("strips apostrophes and single quotes inside names", () => {
    assert.equal(nameToSlug("Ramdhari Singh 'Dinkar'"), 'ramdhari-singh-dinkar');
    assert.equal(nameToSlug("Suryakant Tripathi 'Nirala'"), 'suryakant-tripathi-nirala');
  });

  it('handles multi-word names with multiple spaces', () => {
    assert.equal(nameToSlug('Shah Abdul Latif Bhittai'), 'shah-abdul-latif-bhittai');
    assert.equal(nameToSlug('Anubhav Singh Bassi'), 'anubhav-singh-bassi');
  });

  it('collapses consecutive non-alphanumeric into single dash', () => {
    assert.equal(nameToSlug('Sri  Sri'), 'sri-sri');
    assert.equal(nameToSlug('Kazi Nazrul Islam'), 'kazi-nazrul-islam');
  });

  it('trims leading and trailing dashes', () => {
    assert.equal(nameToSlug(' Kabir '), 'kabir');
  });

  it('handles already-slug-like input idempotently', () => {
    assert.equal(nameToSlug('kabir'), 'kabir');
    assert.equal(nameToSlug('john-mulaney'), 'john-mulaney');
  });
});

// ---------------------------------------------------------------------------
// isOpaqueId
// ---------------------------------------------------------------------------

describe('isOpaqueId', () => {
  it('identifies numeric suffix IDs as opaque', () => {
    assert.equal(isOpaqueId('poet-001'), true);
    assert.equal(isOpaqueId('comedian-003'), true);
    assert.equal(isOpaqueId('poet-008'), true);
  });

  it('identifies UUID-suffix IDs as opaque', () => {
    assert.equal(isOpaqueId('poet-mir-taqi-mir-mk00jxnz'), true);
    assert.equal(isOpaqueId('poet-allama-iqbal-mk00k0nn'), true);
    assert.equal(isOpaqueId('comedian-mk087xaa-zgmhg'), true);
    assert.equal(isOpaqueId('comedian-mk2k8xhj-rojo1'), true);
  });

  it('identifies human-readable IDs as NOT opaque', () => {
    assert.equal(isOpaqueId('poet-kabir'), false);
    assert.equal(isOpaqueId('poet-bharavi'), false);
    assert.equal(isOpaqueId('poet-tulsidas'), false);
    assert.equal(isOpaqueId('comedian-john-mulaney'), false);
    assert.equal(isOpaqueId('comedian-vir-das'), false);
    assert.equal(isOpaqueId('poet-ak-ramanujan'), false);
  });
});

// ---------------------------------------------------------------------------
// deriveSlugId
// ---------------------------------------------------------------------------

describe('deriveSlugId', () => {
  it('derives readable ID from name with poet prefix', () => {
    assert.equal(deriveSlugId('Kalidasa', 'poet-001', new Set()), 'poet-kalidasa');
    assert.equal(deriveSlugId('Kabir', 'poet-002', new Set()), 'poet-kabir');
    assert.equal(deriveSlugId('Mirza Ghalib', 'poet-004', new Set()), 'poet-mirza-ghalib');
  });

  it('derives readable ID from name with comedian prefix', () => {
    assert.equal(deriveSlugId('John Mulaney', 'comedian-001', new Set()), 'comedian-john-mulaney');
    assert.equal(deriveSlugId('Vir Das', 'comedian-003', new Set()), 'comedian-vir-das');
  });

  it('strips UUID suffix from opaque IDs when deriving prefix', () => {
    // prefix is always first segment
    assert.equal(deriveSlugId('Mir Taqi Mir', 'poet-mir-taqi-mir-mk00jxnz', new Set()), 'poet-mir-taqi-mir');
    assert.equal(deriveSlugId('Allama Iqbal', 'poet-allama-iqbal-mk00k0nn', new Set()), 'poet-allama-iqbal');
  });

  it('handles name collision by appending counter', () => {
    const taken = new Set(['poet-kabir']);
    const id = deriveSlugId('Kabir', 'poet-002', taken);
    assert.equal(id, 'poet-kabir-2');
  });

  it('increments counter past multiple collisions', () => {
    const taken = new Set(['poet-kabir', 'poet-kabir-2']);
    const id = deriveSlugId('Kabir', 'poet-003', taken);
    assert.equal(id, 'poet-kabir-3');
  });

  it('produces deterministic output for the same inputs', () => {
    const a = deriveSlugId('Faiz Ahmed Faiz', 'poet-008', new Set());
    const b = deriveSlugId('Faiz Ahmed Faiz', 'poet-008', new Set());
    assert.equal(a, b);
  });
});
