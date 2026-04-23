/**
 * Pure validation functions for entity files.
 * All functions are stateless and return arrays of error/warning strings.
 * This module is tested independently from the CLI runner.
 */

import { basename } from 'path';

// ---------------------------------------------------------------------------
// Person entity validators
// ---------------------------------------------------------------------------

/**
 * Validates required fields on a person entity (poet or comedian).
 * Returns an array of error strings (empty = valid).
 */
export function validatePersonEntity(entity, filePath) {
  const errors = [];
  const id = entity.entityId;
  const file = filePath;

  if (!id) {
    errors.push(`${file}: missing entityId`);
    return errors; // cannot continue without an ID
  }

  const expectedFilename = `${id}.json`;
  if (basename(file) !== expectedFilename) {
    errors.push(
      `${file}: entityId "${id}" does not match filename — expected ${expectedFilename}`
    );
  }

  if (!entity.source?.url) {
    errors.push(`${file}: missing source.url — every entity needs attribution`);
  }

  if (!Array.isArray(entity.sameAs) || entity.sameAs.length === 0) {
    errors.push(`${file}: missing sameAs — required for deduplication`);
  }

  if (!entity.name) {
    errors.push(`${file}: missing name`);
  }

  return errors;
}

/**
 * Validates required fields on a video entity.
 * Returns an array of error strings.
 */
export function validateVideoEntity(entity, filePath, validComedianIds) {
  const errors = [];
  const id = entity.videoId;
  const file = filePath;

  if (!id) {
    errors.push(`${file}: missing videoId`);
    return errors;
  }

  const expectedFilename = `${id}.json`;
  if (basename(file) !== expectedFilename) {
    errors.push(
      `${file}: videoId "${id}" does not match filename — expected ${expectedFilename}`
    );
  }

  if (!entity.name) {
    errors.push(`${file}: missing name`);
  }

  const actorId = entity.actor?.['@id'];
  if (!actorId) {
    errors.push(`${file}: missing actor.@id`);
  } else if (validComedianIds && !validComedianIds.has(actorId)) {
    errors.push(
      `${file}: actor.@id "${actorId}" does not match any comedian entity`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

/**
 * Checks a single entity's sameAs URLs against:
 *   1. The persisted registry (registryMap: url → entityId)
 *   2. A running in-memory map of URLs seen in the current batch
 *
 * Returns errors for any collision and mutates seenInBatch for subsequent calls.
 *
 * @param {object} entity - The entity to check
 * @param {string} filePath - Path for error messages
 * @param {Record<string,string>} registryMap - Persisted sameAs index
 * @param {Record<string,string>} seenInBatch - Mutable accumulator for this run
 */
export function checkDuplicateSameAs(entity, filePath, registryMap, seenInBatch) {
  const errors = [];
  const id = entity.entityId || entity.videoId;
  if (!id || !Array.isArray(entity.sameAs)) return errors;

  for (const url of entity.sameAs) {
    if (!url || typeof url !== 'string') continue;

    // Against persisted registry
    if (registryMap[url] && registryMap[url] !== id) {
      errors.push(
        `${filePath}: sameAs "${url}" already belongs to "${registryMap[url]}" — duplicate entity`
      );
    }

    // Within the current batch (catches intra-PR duplicates)
    if (seenInBatch[url] && seenInBatch[url] !== id) {
      errors.push(
        `${filePath}: sameAs "${url}" conflicts with "${seenInBatch[url]}" in the same PR — duplicate entity`
      );
    } else {
      seenInBatch[url] = id;
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Poetry work validators
// ---------------------------------------------------------------------------

/**
 * Validates required fields on a poetry work entity.
 * Returns an array of error strings.
 */
export function validateWorkEntity(entity, filePath, validPoetIds) {
  const errors = [];
  const id = entity.workId;
  const file = filePath;

  if (!id) {
    errors.push(`${file}: missing workId`);
    return errors;
  }

  const expectedFilename = `${id}.json`;
  if (basename(file) !== expectedFilename) {
    errors.push(
      `${file}: workId "${id}" does not match filename — expected ${expectedFilename}`
    );
  }

  if (!entity.name) {
    errors.push(`${file}: missing name`);
  }

  const authorId = entity.author?.['@id'];
  if (!authorId) {
    errors.push(`${file}: missing author.@id`);
  } else if (validPoetIds && !validPoetIds.has(authorId)) {
    errors.push(
      `${file}: author.@id "${authorId}" does not match any poet entity`
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Fuzzy name collision detection
// ---------------------------------------------------------------------------

/**
 * Computes Jaccard similarity between two names using word-token overlap.
 * Returns a value in [0, 1]. Values >= 0.8 are flagged as possible duplicates.
 */
export function nameSimilarity(a, b) {
  const tokenize = s =>
    s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const tokA = new Set(tokenize(a));
  const tokB = new Set(tokenize(b));
  const intersection = [...tokA].filter(t => tokB.has(t)).length;
  const union = new Set([...tokA, ...tokB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Given a list of {id, name} objects, returns warnings for pairs whose
 * name similarity exceeds the threshold (default 0.8).
 */
export function findFuzzyNameCollisions(entities, threshold = 0.8) {
  const warnings = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const sim = nameSimilarity(entities[i].name, entities[j].name);
      if (sim >= threshold) {
        warnings.push(
          `Possible duplicate: "${entities[i].name}" (${entities[i].id}) ` +
          `and "${entities[j].name}" (${entities[j].id}) — ${(sim * 100).toFixed(0)}% similar`
        );
      }
    }
  }
  return warnings;
}
