import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { ProductDetailInfo } from "./product-detail-info";

const messages: Record<string, string> = {
  addToCart: "Add to cart",
  boxOf: "{packaging} box of {perBox}",
  decreaseQty: "Decrease quantity",
  deliveryNote: "Delivery note",
  free: "Free",
  increaseQty: "Increase quantity",
  packagingLabel: "Packaging",
  perBoxFormat: "{perBox} × {size} {title} per box",
  perBoxLabel: "Per box",
  personalizedMessage: "Personalized message available",
  sizeLabel: "Size",
  summaryLabel: "Summary",
  unavailable: "Unavailable",
};

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, number | string>) =>
    Object.entries(values ?? {}).reduce(
      (message, [name, value]) => message.replace(`{${name}}`, String(value)),
      messages[key] ?? key,
    ),
}));

const money = (amount: string) => ({ amount, currencyCode: "EUR" });
const product = {
  productType: "Caviar" as const,
  availableForSale: true,
  delivery: {
    duration: "Overnight delivery",
    shipping: "FedEx Priority Overnight",
  },
  description: "Large pearls",
  descriptionHtml: "<p>Large pearls</p>",
  eyebrow: "Patrimoine",
  galleryImages: [],
  gifting: {
    addOns: "Mother of pearl spoon",
    box: "Bolduc ribbon box",
    message: "Personalized card",
  },
  handle: "kaluga",
  id: "kaluga",
  image: null,
  packagingOptions: [
    { availableForSale: true, description: "Paper bag", id: "standard", name: "Standard", personalizedMessage: false, priceModifier: 0, variantId: null },
    { availableForSale: true, description: "Presentation box", id: "premium", name: "Premium", personalizedMessage: true, priceModifier: 32, variantId: "premium-variant" },
  ],
  price: money("159"),
  profile: "Rich · Creamy",
  relatedProducts: [],
  serving: "Serve chilled",
  shelfLife: "Four weeks",
  species: "Huso dauricus",
  speciesDescription: "Large pearls",
  speciesImage: null,
  specs: { color: "Bronze", ingredients: "Roe, salt", nutritionalData: "254 kcal", pearlSize: "3.2mm", salt: "3.5%", tastingNotes: "Rich · Creamy" },
  specsDescription: "Large pearls",
  storage: "Keep refrigerated",
  title: "Kaluga Caviar",
  variants: [
    { availableForSale: true, id: "30", optionValue: "30g", price: money("159"), sku: "K-30" },
    { availableForSale: true, id: "50", optionValue: "50g", price: money("259"), sku: "K-50" },
  ],
} satisfies CatalogProductDetail;

describe("ProductDetailInfo", () => {
  it("cập nhật selection, summary và total qua controls thật", async () => {
    const user = userEvent.setup();
    render(<ProductDetailInfo product={product} />);

    const size30 = screen.getByRole("radio", { name: "30g" });
    const size50 = screen.getByRole("radio", { name: "50g" });
    expect(size30).toBeChecked();
    expect(screen.getByText("€159.00")).toBeVisible();

    await user.click(size50);
    expect(size50).toBeChecked();

    await user.click(screen.getByRole("radio", { name: /Premium/ }));
    await user.click(screen.getByRole("radio", { name: "3" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(screen.getByText("Premium box of 3")).toBeVisible();
    expect(screen.getByText("3 × 50g Kaluga Caviar per box")).toBeVisible();
    expect(screen.getByText("Personalized message available")).toBeVisible();
    expect(screen.getByText("€1,618.00")).toBeVisible();
  });
});
