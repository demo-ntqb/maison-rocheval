import { describe, expect, it } from "vitest";

import {
  getMockProduct,
  getMockStaticParams,
  getProductsByCategory,
  isProductCategory,
  mockCatalog,
} from "./catalog-mock";

describe("mock catalog", () => {
  it("only accepts the two product categories and resolves every card", () => {
    expect(isProductCategory("caviar")).toBe(true);
    expect(isProductCategory("gift-sets")).toBe(true);
    expect(isProductCategory("other")).toBe(false);

    for (const product of mockCatalog) {
      expect(getMockProduct(product.category, product.handle)).toBe(product);
    }
  });

  it("rejects a product in the wrong category and emits every static route", () => {
    expect(getMockProduct("caviar", "linitiation")).toBeUndefined();
    expect(getProductsByCategory("caviar")).toHaveLength(5);
    expect(getProductsByCategory("gift-sets")).toHaveLength(3);
    expect(getMockStaticParams()).toEqual(expect.arrayContaining([
      { category: "caviar", handle: "amour" },
      { category: "gift-sets", handle: "linitiation" },
    ]));
  });
});
