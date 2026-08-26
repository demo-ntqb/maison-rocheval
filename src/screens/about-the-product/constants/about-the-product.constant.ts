import { CAVIAR_COLLECTION } from "@/shared/constants/collection.constant";
import type { CollectionCaviar } from "../types/about-the-product.type";

const IMAGE_BASE = "/images/about-product/collection";

export const COLLECTION_CAVIARS: readonly CollectionCaviar[] = CAVIAR_COLLECTION.map((caviar) => ({
  id: caviar.id,
  closedTin: `${IMAGE_BASE}/tin-closed-${caviar.id}`,
  openTin: `${IMAGE_BASE}/tin-open-${caviar.id}`,
  dish: caviar.hasCustomDish ? `${IMAGE_BASE}/dish-${caviar.id}` : `${IMAGE_BASE}/dish-house`,
}));

export const COLLECTION_IMAGES = {
  heroDesktop: `${IMAGE_BASE}/hero-desktop`,
  heroMobile: `${IMAGE_BASE}/hero-mobile`,
  sturgeonDesktop: `${IMAGE_BASE}/sturgeon-desktop`,
  sturgeonMobile: `${IMAGE_BASE}/sturgeon-mobile`,
  tin: `${IMAGE_BASE}/tin-hero`,
} as const;
