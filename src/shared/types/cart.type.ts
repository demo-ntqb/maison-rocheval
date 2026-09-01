import type { SupportedCountry } from "./commerce-context.type";

export type CartMoney = {
  amount: string;
  currencyCode: string;
};

export type CartLineImage = {
  altText: string | null;
  height: number | null;
  url: string;
  width: number | null;
};

export type ProductPurchaseMetadata = {
  image?: CartLineImage | null;
  title?: string;
  weight?: string;
  unitPrice?: CartMoney;
  quantityAvailable?: number | null;
};

export type OptimisticProductData = ProductPurchaseMetadata;

/** A gift card is either left blank or carries a hand-written note. */
export type CartGiftMessage =
  | { kind: "blank" }
  | { kind: "personal"; text: string };

export type CartLineKind = "caviar" | "gift_set";

export type CartLine = {
  /** Physical cart-line identity. Shopify CartLine GID after reconciliation. */
  id: string;
  /** Shopify ProductVariant GID. */
  merchandiseId: string;
  /** Shopify Product GID. */
  productId: string;
  kind: CartLineKind;
  image: CartLineImage | null;
  quantity: number;
  quantityAvailable: number | null;
  quantityEditable: boolean;
  supportsGiftMessage: boolean;
  title: string;
  /** Existing UI name retained to minimize visual changes. */
  weight: string;
  unitPrice: CartMoney;
  subtotal: CartMoney;
  giftMessage: CartGiftMessage | null;
  /** Stable identity of one physical gift-set unit. */
  unitId: string | null;
};

/** A gift set: one presentation card holding physical unit lines. */
export type CartGroup = {
  addHref?: string;
  /** Canonical Shopify Product GID. */
  id: string;
  lines: CartLine[];
  title: string;
};

export type CartEntry =
  | { group: CartGroup; kind: "group" }
  | { kind: "line"; line: CartLine };

export type CartWarning = {
  code: string;
  lineId?: string;
};

export type CartSnapshot = {
  entries: CartEntry[];
  itemCount: number;
  subtotal: CartMoney;
  countryCode: SupportedCountry;
  warnings: CartWarning[];
};
