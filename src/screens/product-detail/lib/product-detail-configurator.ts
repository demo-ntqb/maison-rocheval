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

/**
 * The product detail design prints the amount with a trailing currency
 * symbol (`888.88€`) rather than Intl's default leading placement for en.
 */
export function formatCatalogPrice(
  amount: number,
  currencyCode: string,
  locale: string,
): string {
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const value = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
  const symbol = new Intl.NumberFormat(intlLocale, {
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    style: "currency",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currencyCode;

  return locale === "fr" ? `${value} ${symbol}` : `${value}${symbol}`;
}
