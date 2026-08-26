export interface CaviarConfig {
  id: string;
  translationKey: string;
  plumbId: string;
  hasCustomDish: boolean;
}

export const CAVIAR_COLLECTION: readonly CaviarConfig[] = [
  {
    id: "amour",
    translationKey: "amour",
    plumbId: "amour",
    hasCustomDish: true,
  },
  {
    id: "lexpression",
    translationKey: "lexpression",
    plumbId: "l-expression",
    hasCustomDish: true,
  },
  {
    id: "harmonie",
    translationKey: "harmonie",
    plumbId: "harmonie",
    hasCustomDish: false,
  },
  {
    id: "oscietra",
    translationKey: "oscietra",
    plumbId: "oscietra",
    hasCustomDish: false,
  },
  {
    id: "kaluga",
    translationKey: "kaluga",
    plumbId: "kaluga",
    hasCustomDish: false,
  },
] as const;

export const COLLECTION_CAVIAR_IDS = CAVIAR_COLLECTION.map((c) => c.id);

export type CollectionCaviarId = typeof COLLECTION_CAVIAR_IDS[number];
