import { COLLECTION_CAVIAR_IDS } from "@/shared/constants/collection.constant";
import type { CollectionCaviar } from "../types/about-the-product.type";

const IMAGE_BASE = "/images/about-product/collection";

export const COLLECTION_CAVIARS: readonly CollectionCaviar[] = COLLECTION_CAVIAR_IDS.map((id) => ({
  id,
  closedTin: `${IMAGE_BASE}/tin-closed-${id}`,
  openTin: `${IMAGE_BASE}/tin-open-${id}`,
  dish: id === "amour" || id === "expression" ? `${IMAGE_BASE}/dish-${id}` : `${IMAGE_BASE}/dish-house`,
}));

export const COLLECTION_IMAGES = {
  heroDesktop: `${IMAGE_BASE}/hero-desktop`,
  heroMobile: `${IMAGE_BASE}/hero-mobile`,
  sturgeonDesktop: `${IMAGE_BASE}/sturgeon-desktop`,
  sturgeonMobile: `${IMAGE_BASE}/sturgeon-mobile`,
  tin: `${IMAGE_BASE}/tin-hero`,
} as const;
