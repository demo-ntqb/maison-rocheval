/**
 * TODO: Note that this collection data might be managed in Shopify in the future
 * (e.g., using Shopify Storefront API, Metafields, or Metaobjects).
 * Currently maintained as a static list of IDs for performance and build stability.
 */
export const COLLECTION_CAVIAR_IDS = [
  "amour",
  "expression",
  "harmonie",
  "oscietra",
  "kaluga",
] as const;

export type CollectionCaviarId = typeof COLLECTION_CAVIAR_IDS[number];
