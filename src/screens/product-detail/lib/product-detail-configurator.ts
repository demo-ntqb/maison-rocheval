import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import type {
  ProductSelection,
  ProductSelectionAction,
  ProductSelectionView,
} from "../types/product-detail.type";

export function createProductSelection(product: CatalogProductDetail): ProductSelection {
  return {
    packagingId: product.packagingOptions[0]?.id ?? "",
    perBox: 1,
    quantity: 1,
    size: product.variants[0]?.optionValue ?? "",
  };
}

export function productSelectionReducer(
  state: ProductSelection,
  action: ProductSelectionAction,
): ProductSelection {
  if (action.type === "select-size") return { ...state, size: action.size };
  if (action.type === "select-packaging") {
    return { ...state, packagingId: action.packagingId };
  }
  if (action.type === "select-per-box") return { ...state, perBox: action.perBox };
  return { ...state, quantity: Math.max(1, action.quantity) };
}

export function deriveProductSelection(
  product: CatalogProductDetail,
  selection: ProductSelection,
): ProductSelectionView {
  const activeVariant = product.variants.find(({ optionValue }) => optionValue === selection.size);
  const activePackaging = product.packagingOptions.find(({ id }) => id === selection.packagingId);
  const currencyCode = activeVariant?.price.currencyCode ?? product.price.currencyCode;
  const variantPrice = Number(activeVariant?.price.amount ?? product.price.amount);
  const packagingPrice = activePackaging?.priceModifier ?? 0;
  const boxPrice = variantPrice * selection.perBox + packagingPrice;
  const totalPrice = boxPrice * selection.quantity;

  return {
    activePackaging,
    activeVariant,
    currencyCode,
    totalPrice,
  };
}

export function formatProductMoney(
  amount: number,
  currencyCode: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    currency: currencyCode,
    style: "currency",
  }).format(amount);
}
