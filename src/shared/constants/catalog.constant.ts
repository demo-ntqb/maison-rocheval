import { CatalogCollectionHandle, CatalogProductType } from "../types/catalog.type.ts";

export const PRODUCT_CATEGORIES: string[] = [CatalogCollectionHandle.GIFT_SET, CatalogCollectionHandle.CAVIAR] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export const PRODUCT_CATEGORY_PRODUCT_TYPE_TO_HANDLE_MAP: Record<string, string> = {
  [CatalogProductType.CAVIAR]: CatalogCollectionHandle.CAVIAR,
  [CatalogProductType.GIFT_SET]: CatalogCollectionHandle.GIFT_SET,
} as const;

export const PRODUCT_CATEGORY_HANDLE_TO_PRODUCT_TYPE_MAP: Record<string,string> = {
  [CatalogCollectionHandle.CAVIAR]: CatalogProductType.CAVIAR,
  [CatalogCollectionHandle.GIFT_SET]: CatalogProductType.GIFT_SET,
} as const;