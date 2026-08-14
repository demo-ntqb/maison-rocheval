import type {
  CatalogPackagingOption,
  CatalogVariant,
} from "@/shared/lib/shopify/catalog-mapper";

export type ProductPerBoxOption = 1 | 2 | 3 | 4;

export type ProductSelection = Readonly<{
  packagingId: string;
  perBox: ProductPerBoxOption;
  quantity: number;
  size: string;
}>;

export type ProductSelectionAction =
  | { packagingId: string; type: "select-packaging" }
  | { perBox: ProductPerBoxOption; type: "select-per-box" }
  | { quantity: number; type: "set-quantity" }
  | { size: string; type: "select-size" };

export type ProductSelectionView = Readonly<{
  activePackaging: CatalogPackagingOption | undefined;
  activeVariant: CatalogVariant | undefined;
  currencyCode: string;
  totalPrice: number;
}>;

export type ProductDetailTranslationKey =
  | "addToCart"
  | "boxOf"
  | "decreaseQty"
  | "deliveryNote"
  | "free"
  | "increaseQty"
  | "packagingLabel"
  | "perBoxFormat"
  | "perBoxLabel"
  | "personalizedMessage"
  | "sizeLabel"
  | "summaryLabel"
  | "unavailable";

export type ProductDetailTranslator = (
  key: ProductDetailTranslationKey,
  values?: Record<string, number | string>,
) => string;
