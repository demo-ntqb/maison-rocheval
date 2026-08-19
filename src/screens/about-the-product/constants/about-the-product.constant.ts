import type { CollectionCaviar } from "../types/about-the-product.type";

const IMAGE_BASE = "/images/about-product/collection";

/**
 * The five caviars of the collection, in the order they appear in the Figma
 * carousel (409:18456 / 410:23383). Copy lives in `messages/<locale>.json`
 * under `aboutProduct.collection.products.<id>`; only the asset wiring is here.
 *
 * Harmonie, Oscietra and Kaluga share one plated-dish photograph, exactly as
 * the design does — the tins themselves are all distinct.
 */
export const COLLECTION_CAVIARS: readonly CollectionCaviar[] = [
  { id: "amour", closedTin: `${IMAGE_BASE}/tin-closed-amour`, openTin: `${IMAGE_BASE}/tin-open-amour`, dish: `${IMAGE_BASE}/dish-amour` },
  { id: "expression", closedTin: `${IMAGE_BASE}/tin-closed-expression`, openTin: `${IMAGE_BASE}/tin-open-expression`, dish: `${IMAGE_BASE}/dish-expression` },
  { id: "harmonie", closedTin: `${IMAGE_BASE}/tin-closed-harmonie`, openTin: `${IMAGE_BASE}/tin-open-harmonie`, dish: `${IMAGE_BASE}/dish-house` },
  { id: "oscietra", closedTin: `${IMAGE_BASE}/tin-closed-oscietra`, openTin: `${IMAGE_BASE}/tin-open-oscietra`, dish: `${IMAGE_BASE}/dish-house` },
  { id: "kaluga", closedTin: `${IMAGE_BASE}/tin-closed-kaluga`, openTin: `${IMAGE_BASE}/tin-open-kaluga`, dish: `${IMAGE_BASE}/dish-house` },
] as const;

export const COLLECTION_IMAGES = {
  heroDesktop: `${IMAGE_BASE}/hero-desktop`,
  heroMobile: `${IMAGE_BASE}/hero-mobile`,
  sturgeonDesktop: `${IMAGE_BASE}/sturgeon-desktop`,
  sturgeonMobile: `${IMAGE_BASE}/sturgeon-mobile`,
  tin: `${IMAGE_BASE}/tin-hero`,
} as const;
