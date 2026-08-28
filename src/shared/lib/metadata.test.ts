import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/shopify/localization", () => ({
  getDiscoveredMarkets: async () => ({
    availableRouteLocales: ["en-sg", "fr-sg"],
  }),
}));

import { generatePageMetadata, generateRootMetadata, localizedPath } from "./metadata";

describe("SEO & Metadata", () => {
  it("không ghi locale trên URL đối với default market", () => {
    expect(localizedPath("en-sg", "/")).toBe("/");
    expect(localizedPath("en-sg", "/products")).toBe("/products");
  });

  it("chỉ publish canonical và hreflang cho contexts Shopify đang publish", async () => {
    const metadata = await generateRootMetadata("en-sg", "Maison Rocheval", "Description");

    expect(metadata.alternates?.canonical).toBe("https://maisonrocheval.com/");
    expect(metadata.openGraph?.locale).toBe("en_SG");
    expect(metadata.alternates?.languages).toEqual({
      "en-sg": "https://maisonrocheval.com/",
      "fr-sg": "https://maisonrocheval.com/fr-sg",
      "x-default": "https://maisonrocheval.com/",
    });
  });

  it("giữ canonical product cùng market context", async () => {
    const metadata = await generatePageMetadata(
      "fr-sg",
      "L'Excellence",
      "Coffret cadeau",
      { canonical: "/products/gift-set/lexcellence" },
    );

    expect(metadata.alternates?.canonical).toBe(
      "https://maisonrocheval.com/fr-sg/products/gift-set/lexcellence",
    );
  });
});
