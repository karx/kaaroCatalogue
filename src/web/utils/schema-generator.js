/**
 * Schema Generator Utility
 * Generates JSON-LD structured data from catalog entities
 */

/**
 * Generate JSON-LD for a Person entity (Comedian or Poet)
 * @param {Object} entity - The entity data
 * @param {string} catalogType - 'comedy' or 'poets'
 * @returns {Object} JSON-LD structured data
 */
export function generatePersonSchema(entity, catalogType) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": entity.entityId,
    "name": entity.name,
  };

  // Common fields
  if (entity.alternateName?.length) {
    schema.alternateName = entity.alternateName;
  }
  
  if (entity.knowsLanguage) {
    schema.knowsLanguage = entity.knowsLanguage;
  }
  
  if (entity.homeLocation) {
    schema.homeLocation = entity.homeLocation;
  }
  
  if (entity.sameAs?.length) {
    schema.sameAs = entity.sameAs;
  }
  
  if (entity.award?.length) {
    schema.award = entity.award;
  }

  // Poet-specific fields
  if (catalogType === 'poets') {
    if (entity.birthDate) schema.birthDate = entity.birthDate;
    if (entity.deathDate) schema.deathDate = entity.deathDate;
    if (entity.hasOccupation) schema.hasOccupation = entity.hasOccupation;
    if (entity.additionalType) schema.additionalType = entity.additionalType;
  }

  // Comedian-specific fields
  if (catalogType === 'comedy') {
    if (entity.genre?.length) {
      schema.genre = entity.genre;
    }
  }

  return schema;
}

/**
 * Generate JSON-LD for a Book/Literary Work
 * @param {Object} work - The work data
 * @returns {Object} JSON-LD structured data
 */
export function generateBookSchema(work) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": work.workId,
    "name": work.name,
    "author": work.author,
    "inLanguage": work.inLanguage,
    "dateCreated": work.dateCreated,
    "genre": work.genre,
    "abstract": work.abstract,
    "keywords": work.keywords,
  };
}

/**
 * Generate JSON-LD for a VideoObject
 * @param {Object} video - The video data
 * @returns {Object} JSON-LD structured data
 */
export function generateVideoSchema(video) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": video.videoId,
    "name": video.name,
    "actor": video.actor,
    "duration": video.duration,
    "embedUrl": video.embedUrl,
    "uploadDate": video.uploadDate,
    "thumbnailUrl": video.thumbnailUrl,
  };
}

/**
 * Generate JSON-LD for a catalog collection
 * @param {Object} catalog - The catalog data
 * @returns {Object} JSON-LD structured data
 */
export function generateCatalogSchema(catalog) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": catalog.name,
    "description": catalog.description,
    "numberOfItems": catalog.metadata?.totalEntities || catalog.entities?.length || 0,
    "itemListElement": catalog.entities?.slice(0, 10).map((entity, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "@id": entity.entityId,
        "name": entity.name,
      }
    })),
  };
}

/**
 * Update the page's JSON-LD script tag
 * @param {Object} schema - The schema data to inject
 */
export function updatePageSchema(schema) {
  const schemaTag = document.getElementById('schema-ld');
  if (schemaTag) {
    schemaTag.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * Update page meta tags
 * @param {Object} meta - Meta tag values
 */
export function updatePageMeta({ title, description }) {
  document.title = title ? `${title} | KaaroCatalogue` : 'KaaroCatalogue';
  
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag && description) {
    descTag.setAttribute('content', description);
  }
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && title) {
    ogTitle.setAttribute('content', title);
  }
  
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) {
    ogDesc.setAttribute('content', description);
  }
}
