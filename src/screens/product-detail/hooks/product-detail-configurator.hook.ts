"use client";

import { useReducer } from "react";

import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import {
  createProductSelection,
  deriveProductSelection,
  formatProductMoney,
  productSelectionReducer,
} from "../lib/product-detail-configurator";

export function useProductDetailConfigurator(product: CatalogProductDetail, locale: string) {
  const [selection, dispatch] = useReducer(
    productSelectionReducer,
    product,
    createProductSelection,
  );
  const view = deriveProductSelection(product, selection);

  return {
    ...view,
    formatMoney: (amount: number) => formatProductMoney(amount, view.currencyCode, locale),
    selectPackaging: (packagingId: string) => dispatch({ type: "select-packaging", packagingId }),
    selectPerBox: (perBox: 1 | 2 | 3 | 4) => dispatch({ type: "select-per-box", perBox }),
    selectSize: (size: string) => dispatch({ type: "select-size", size }),
    selection,
    setQuantity: (quantity: number) => dispatch({ type: "set-quantity", quantity }),
  };
}
