import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next-intl Link wrapper
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { ProductCard } from "./product-card";
import type { CatalogProductCard } from "@/shared/types/catalog.type";
import { CatalogCollectionHandle, CatalogProductType } from "@/shared/types/catalog.type";

describe("ProductCard — Stable Category Routing & Translated ProductType (Phase 1 Regression)", () => {
  const frenchGiftSetProduct: CatalogProductCard = {
    category: CatalogCollectionHandle.GIFT_SET,
    id: "gid://shopify/Product/123",
    handle: "lexcellence",
    title: "L'Excellence",
    subtitle: "Coffret d'exception",
    description: "Coffret cadeau comprenant caviar et accessoires.",
    short_description: "Coffret d'exception avec caviar et accessoires.",
    notes: "Prestige · Raffiné",
    // When Shopify returns French catalog, productType is localized to "Coffret Cadeau"
    productType: "Coffret Cadeau" as unknown as CatalogProductType,
    availableForSale: true,
    image: null,
    price: { amount: "599", currencyCode: "EUR" },
  };

  it("không sinh ra URL có category rỗng dạng /products//<handle> khi productType bị dịch", () => {
    render(<ProductCard product={frenchGiftSetProduct} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const href = link.getAttribute("href");
      expect(href).toBeDefined();
      // Expected: No double slashes representing empty category in product URL
      // Currently fails: href is "/products//lexcellence"
      expect(href).not.toContain("//lexcellence");
      expect(href).not.toBe("/products//lexcellence");
    }
  });

  it("tạo đúng route /products/gift-set/lexcellence cho sản phẩm thuộc gift set dù productType là 'Coffret Cadeau'", () => {
    render(<ProductCard product={frenchGiftSetProduct} />);

    const links = screen.getAllByRole("link");
    const headingLink = links[links.length - 1];
    const href = headingLink.getAttribute("href");

    // Expected contract: French translated productType "Coffret Cadeau" must still map to stable category "gift-set"
    // Currently fails: href is "/products//lexcellence" instead of "/products/gift-set/lexcellence"
    expect(href).toBe("/products/gift-set/lexcellence");
  });
});
