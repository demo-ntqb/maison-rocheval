import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithoutRef } from "react";
import { describe, expect, it, vi } from "vitest";

import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";

import {
  AboutUnderstandProductTabs,
  type AboutUnderstandLabels,
} from "./about-understand-product-tabs";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props} />
  ),
}));

const labels: AboutUnderstandLabels = {
  atTable: "At the table",
  buyNow: "Buy now",
  facts: {
    color: "Color",
    commonName: "Common name",
    pearlSize: "Pearl size",
    salt: "Salt",
    species: "Species",
    tastingNotes: "Tasting notes",
  },
  selectorLabel: "Choose a caviar",
  sturgeonAlt: "Sturgeon",
};

function product(
  handle: string,
  title: string,
  tastingNotes: string,
): CatalogProductProfile {
  return {
    availableForSale: true,
    description: `${title} description`,
    eyebrow: "Patrimoine",
    galleryImages: [],
    handle,
    id: `gid://shopify/Product/${handle}`,
    image: {
      altText: `${title} tin`,
      height: 550,
      url: `https://cdn.shopify.com/${handle}.png`,
      width: 400,
    },
    price: { amount: "159.00", currencyCode: "EUR" },
    profile: tastingNotes,
    serving: `${title} serving suggestion`,
    species: `${title} species`,
    speciesDescription: `${title} species description`,
    specs: {
      color: `${title} color`,
      pearlSize: `${title} pearl size`,
      salt: `${title} salt`,
      tastingNotes,
    },
    title,
  };
}

const products = [
  product("amour", "Amour Caviar", "Rich · Creamy"),
  product("kaluga", "Kaluga Caviar", "Delicate · Long finish"),
];

describe("AboutUnderstandProductTabs", () => {
  it("đổi nội dung sản phẩm khi người dùng chọn tab bằng chuột và bàn phím", async () => {
    const user = userEvent.setup();
    render(<AboutUnderstandProductTabs labels={labels} products={products} />);

    const tabList = screen.getByRole("tablist", { name: labels.selectorLabel });
    const amourTab = screen.getByRole("tab", { name: "Amour" });
    const kalugaTab = screen.getByRole("tab", { name: "Kaluga" });

    expect(tabList).toContainElement(amourTab);
    expect(amourTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Amour" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Kaluga" })).not.toBeInTheDocument();

    await user.click(kalugaTab);

    expect(kalugaTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Kaluga" })).toBeVisible();
    expect(screen.getByRole("link", { name: labels.buyNow })).toHaveAttribute(
      "href",
      "/products/kaluga",
    );

    await user.keyboard("{ArrowLeft}");

    expect(amourTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Amour" })).toBeVisible();
  });
});
