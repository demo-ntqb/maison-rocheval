import { describe, expect, it } from "vitest";

import { type CatalogProductDetail, CatalogProductType } from "@/shared/types/catalog.type";

import {
  createProductSelection,
  deriveProductSelection,
  productSelectionReducer,
} from "./product-detail-configurator";

const product: CatalogProductDetail = {
  productType: CatalogProductType.CAVIAR,
  availableForSale: true,
  description: "Kaluga description",
  short_description: null,
  descriptionHtml: "<p>Kaluga description</p>",
  galleryImages: [],
  handle: "kaluga",
  id: "gid://shopify/Product/kaluga",
  image: null,
  notes: "Rich · Creamy",
  subtitle: "Huso dauricus",
  packagingOptions: [
    {
      availableForSale: true,
      description: "Paper bag with ice",
      id: "standard",
      name: "Standard",
      personalizedMessage: false,
      priceModifier: 0,
      variantId: null,
    },
    {
      availableForSale: true,
      description: "Presentation box",
      id: "premium",
      name: "Premium",
      personalizedMessage: true,
      priceModifier: 32,
      variantId: "gid://shopify/ProductVariant/premium",
    },
  ],
  price: { amount: "159", currencyCode: "EUR" },
  productRichText: "",
  servingRichText: "",
  deliveryRichText: "",
  giftingRichText: "",
  relatedProducts: [],
  title: "Kaluga Caviar",
  variants: [
    {
      availableForSale: true,
      quantityAvailable: null,
      id: "gid://shopify/ProductVariant/30",
      optionValue: "30g",
      price: { amount: "159", currencyCode: "EUR" },
      sku: "KALUGA-30",
    },
    {
      availableForSale: true,
      quantityAvailable: null,
      id: "gid://shopify/ProductVariant/50",
      optionValue: "50g",
      price: { amount: "259", currencyCode: "EUR" },
      sku: "KALUGA-50",
    },
  ],
};

describe("product detail configurator", () => {
  it("khởi tạo selection canonical và tính total từ dữ liệu Shopify", () => {
    const selection = createProductSelection(product);
    const derived = deriveProductSelection(product, selection);

    expect(selection).toEqual({ quantity: 1, size: "30g" });
    expect(derived.totalPrice).toBe(159);
    expect(derived.currencyCode).toBe("EUR");
  });

  it("cập nhật bất biến và không cho quantity nhỏ hơn một", () => {
    const initial = createProductSelection(product);
    const configured = [
      { type: "select-size", size: "50g" } as const,
      { type: "set-quantity", quantity: 2 } as const,
    ].reduce(productSelectionReducer, initial);

    expect(initial).toEqual({ quantity: 1, size: "30g" });
    expect(deriveProductSelection(product, configured).totalPrice).toBe(518);
    expect(productSelectionReducer(configured, { type: "set-quantity", quantity: 0 }).quantity).toBe(1);
  });
});
