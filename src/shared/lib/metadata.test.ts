import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/shopify/localization", () => ({
  getDiscoveredMarkets: async () => ({
    availableRouteLocales: ["en-sg", "fr-sg"],
  }),
}));

import { generatePageMetadata, generateRootMetadata, localizedPath } from "./metadata";

describe("SEO & Metadata", () => {
  it("luôn ghi rõ locale trên URL, kể cả default market", () => {
    expect(localizedPath("en-sg", "/")).toBe("/en-sg");
    expect(localizedPath("en-sg", "/products")).toBe("/en-sg/products");
  });

  it("chỉ publish canonical và hreflang cho contexts Shopify đang publish", async () => {
    const metadata = await generateRootMetadata("en-sg", "Maison Rocheval", "Description");

    expect(metadata.alternates?.canonical).toBe("https://maisonrocheval.com/en-sg");
    expect(metadata.openGraph?.locale).toBe("en_SG");
    expect(metadata.alternates?.languages).toEqual({
      "en-sg": "https://maisonrocheval.com/en-sg",
      "fr-sg": "https://maisonrocheval.com/fr-sg",
      "x-default": "https://maisonrocheval.com/en-sg",
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
