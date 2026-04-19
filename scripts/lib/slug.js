/**
 * Slug utilities for entity IDs.
 * Entity filename = entityId = "{type}-{slug}"
 * e.g. poets/poet-kabir.json, comedy/comedian-john-mulaney.json
 */

/**
 * Converts a display name to a URL-safe slug component.
 * Does NOT include the catalog-type prefix — callers add that.
 *
 * Examples:
 *   "Kabir"                      → "kabir"
 *   "A.K. Ramanujan"             → "ak-ramanujan"
 *   "Ramdhari Singh 'Dinkar'"    → "ramdhari-singh-dinkar"
 *   "Shah Abdul Latif Bhittai"   → "shah-abdul-latif-bhittai"
 */
export function nameToSlug(name) {
  return name
    .normalize('NFD')                   // decompose accents (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '')    // strip combining diacritics
    .toLowerCase()
    .replace(/['.'']/g, '')             // drop apostrophes/quotes mid-word
    .replace(/[^a-z0-9]+/g, '-')       // anything else → dash
    .replace(/^-+|-+$/g, '');          // trim leading/trailing dashes
}

/**
 * Returns true if an entityId is opaque (numeric or UUID-suffixed).
 * These are the ones that need renaming.
 *
 * Opaque:   "poet-001", "comedian-003", "poet-allama-iqbal-mk00k0nn"
 * Readable: "poet-kabir", "comedian-john-mulaney", "poet-bharavi"
 */
export function isOpaqueId(entityId) {
  // Purely numeric suffix: poet-001, comedian-003
  if (/\-0*\d{1,3}$/.test(entityId)) return true;
  // mk-prefixed generated segment (the timestamp-based ID format used by enrichment tools)
  // e.g. poet-allama-iqbal-mk00k0nn, comedian-mk087xaa-zgmhg, comedian-mk2k8xhj-rojo1
  if (/\-mk[0-9a-z]/.test(entityId)) return true;
  return false;
}

/**
 * Derives a new, readable entityId for an entity that has an opaque ID.
 * Preserves the catalog-type prefix from the original ID.
 *
 * Handles slug collisions by appending -2, -3, etc.
 *
 * @param {string} name - Display name (e.g. "Mirza Ghalib")
 * @param {string} originalId - Current opaque ID (e.g. "poet-004")
 * @param {Set<string>} taken - Set of entityIds already in use
 */
export function deriveSlugId(name, originalId, taken = new Set()) {
  // Preserve prefix: "poet" or "comedian" (first segment before first dash)
  const prefix = originalId.split('-')[0];
  const base = nameToSlug(name);
  let candidate = `${prefix}-${base}`;

  if (!taken.has(candidate)) return candidate;

  // Collision: append disambiguating counter
  let n = 2;
  while (taken.has(`${candidate}-${n}`)) n++;
  return `${candidate}-${n}`;
}
