import { describe, expect, it } from "vitest";

import {
  mapCollectionProducts,
  resolveProductCategory,
} from "./catalog.mapper";
import { CatalogCollectionHandle, CatalogProductType, type StorefrontProduct } from "../../../types/catalog.type";

describe("Catalog Mapper & Stable Category Resolution (Phase 6)", () => {
  it("nhận diện đúng category từ collection handles", () => {
    const giftSetProduct = {
      handle: "lexcellence",
      productType: "Translated Type",
      collections: {
        nodes: [{ handle: "gift-set" }],
      },
    };
    expect(resolveProductCategory(giftSetProduct)).toBe(CatalogCollectionHandle.GIFT_SET);

    const caviarProduct = {
      handle: "kaluga",
      productType: "Translated Type",
      collections: {
        nodes: [{ handle: "caviar" }],
      },
    };
    expect(resolveProductCategory(caviarProduct)).toBe(CatalogCollectionHandle.CAVIAR);
  });

  it("fallback chính xác khi productType bị dịch sang tiếng Pháp", () => {
    expect(resolveProductCategory({ productType: "Coffret Cadeau" })).toBe(
      CatalogCollectionHandle.GIFT_SET,
    );
    expect(resolveProductCategory({ productType: "coffret" })).toBe(
      CatalogCollectionHandle.GIFT_SET,
    );
    expect(resolveProductCategory({ productType: "Gift Set" })).toBe(
      CatalogCollectionHandle.GIFT_SET,
    );
    expect(resolveProductCategory({ productType: "Caviar" })).toBe(
      CatalogCollectionHandle.CAVIAR,
    );
    expect(resolveProductCategory({ productType: "" })).toBe(
      CatalogCollectionHandle.CAVIAR,
    );
  });

  it("mapCollectionProducts gán đúng category và không bao giờ để rỗng", () => {
    const rawProducts: StorefrontProduct[] = [
      {
        id: "gid://shopify/Product/1",
        handle: "lexcellence",
        title: "L'Excellence",
        productType: "Coffret Cadeau",
        availableForSale: true,
        descriptionHtml: "<p>Description</p>",
        featuredImage: null,
        priceRange: { minVariantPrice: { amount: "599", currencyCode: "EUR" } },
        metafields: [],
      },
    ];

    const mapped = mapCollectionProducts(rawProducts);
    expect(mapped[0].category).toBe(CatalogCollectionHandle.GIFT_SET);
    expect(mapped[0].productType).toBe(CatalogProductType.GIFT_SET);
  });
});
