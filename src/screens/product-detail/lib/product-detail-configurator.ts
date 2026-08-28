import type { CatalogProductDetail } from "@/shared/types/catalog.type";
import type {
  ProductSelection,
  ProductSelectionAction,
  ProductSelectionView,
} from "../types/product-detail.type";

export function createProductSelection(product: CatalogProductDetail): ProductSelection {
  return {
    quantity: 1,
    size: product.variants[0]?.optionValue ?? "",
  };
}

export function productSelectionReducer(
  state: ProductSelection,
  action: ProductSelectionAction,
): ProductSelection {
  if (action.type === "select-size") return { ...state, size: action.size };
  return { ...state, quantity: Math.max(1, action.quantity) };
}

export function deriveProductSelection(
  product: CatalogProductDetail,
  selection: ProductSelection,
): ProductSelectionView {
  const activeVariant = product.variants.find(({ optionValue }) => optionValue === selection.size);
  const currencyCode = activeVariant?.price.currencyCode ?? product.price.currencyCode;
  const variantPrice = Number(activeVariant?.price.amount ?? product.price.amount);
  const totalPrice = variantPrice * selection.quantity;

  return {
    activeVariant,
    currencyCode,
    totalPrice,
  };
}

import { formatBrandPrice } from "@/shared/lib/money";

/**
 * Format catalog price using the shared brand price formatter.
 */
export function formatCatalogPrice(
  amount: number,
  currencyCode: string,
  locale: string,
): string {
  return formatBrandPrice(amount, currencyCode, locale);
}
