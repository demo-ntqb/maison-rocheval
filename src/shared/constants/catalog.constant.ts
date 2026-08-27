import { CatalogCollectionHandle, CatalogProductType } from "../types/catalog.type.ts";

export const PRODUCT_CATEGORIES: string[] = [CatalogCollectionHandle.GIFT_SET, CatalogCollectionHandle.CAVIAR] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export const CAVIAR_HANDLES: string[] = ["amour", "expression", "harmonie", "ossetra", "kaluga"];

export const GIFT_SET_HANDLES: string[] = ["linitiation", "lexcellence", "lopulence"];

export const PRODUCT_CATEGORY_TITLE_TO_HANDLE_MAP: Record<string, string> = {
  [CatalogProductType.CAVIAR]: CatalogCollectionHandle.CAVIAR,
  [CatalogProductType.GIFT_SET]: CatalogCollectionHandle.GIFT_SET,
} as const;

export const PRODUCT_CATEGORY_HANDLE_TO_TITLE_MAP: Record<string,string> = {
  [CatalogCollectionHandle.CAVIAR]: CatalogProductType.CAVIAR,
  [CatalogCollectionHandle.GIFT_SET]: CatalogProductType.GIFT_SET,
} as const;