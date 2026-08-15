import { describe, expect, it } from "vitest";

import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";

import {
  createProductSelection,
  deriveProductSelection,
  productSelectionReducer,
} from "./product-detail-configurator";

const product: CatalogProductDetail = {
  availableForSale: true,
  delivery: {
    duration: "Overnight delivery",
    shipping: "FedEx Priority Overnight",
  },
  description: "Kaluga description",
  descriptionHtml: "<p>Kaluga description</p>",
  eyebrow: "Patrimoine",
  galleryImages: [],
  gifting: {
    addOns: "Mother of pearl spoon",
    box: "Bolduc ribbon box",
    message: "Personalized card",
  },
  handle: "kaluga",
  id: "gid://shopify/Product/kaluga",
  image: null,
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
  profile: "Rich · Creamy",
  relatedProducts: [],
  serving: "Serve chilled",
  shelfLife: "Four weeks",
  species: "Huso dauricus",
  speciesDescription: "Large pearls",
  speciesImage: null,
  specs: {
    color: "Bronze",
    ingredients: "Roe, salt",
    nutritionalData: "254 kcal",
    pearlSize: "3.2–3.8mm",
    salt: "3.5%",
    tastingNotes: "Rich · Creamy",
  },
  specsDescription: "Large pearls",
  storage: "Keep refrigerated",
  title: "Kaluga Caviar",
  variants: [
    {
      availableForSale: true,
      id: "gid://shopify/ProductVariant/30",
      optionValue: "30g",
      price: { amount: "159", currencyCode: "EUR" },
      sku: "KALUGA-30",
    },
    {
      availableForSale: true,
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

    expect(selection).toEqual({ packagingId: "standard", perBox: 1, quantity: 1, size: "30g" });
    expect(derived.totalPrice).toBe(159);
    expect(derived.currencyCode).toBe("EUR");
  });

  it("cập nhật bất biến và không cho quantity nhỏ hơn một", () => {
    const initial = createProductSelection(product);
    const configured = [
      { type: "select-size", size: "50g" } as const,
      { type: "select-packaging", packagingId: "premium" } as const,
      { type: "select-per-box", perBox: 3 } as const,
      { type: "set-quantity", quantity: 2 } as const,
    ].reduce(productSelectionReducer, initial);

    expect(initial).toEqual({ packagingId: "standard", perBox: 1, quantity: 1, size: "30g" });
    expect(deriveProductSelection(product, configured).totalPrice).toBe(1618);
    expect(productSelectionReducer(configured, { type: "set-quantity", quantity: 0 }).quantity).toBe(1);
  });
});
