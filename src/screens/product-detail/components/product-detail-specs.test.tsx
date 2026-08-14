import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { ProductDetailSpecs } from "./product-detail-specs";

const messages: Record<string, string> = {
  addOns: "Add Ons",
  box: "Box",
  color: "Color",
  customerService: "Customer Service",
  deliveryTitle: "Delivery Info",
  duration: "Duration",
  giftingTitle: "Gifting",
  ingredients: "Ingredients",
  message: "Message",
  nutritionalData: "Nutritional Data per 100g",
  pearlSize: "Pearl Size",
  recommendation: "Serving Recommendation",
  salt: "Salt",
  servingTitle: "Serving Info",
  shelfLife: "Shelf Life",
  shipping: "Shipping",
  specificationTitle: "Specification",
  storage: "Storage",
  tastingNotes: "Tasting Notes",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const money = (amount: string) => ({ amount, currencyCode: "EUR" });

const mockProduct: CatalogProductDetail = {
  availableForSale: true,
  delivery: {
    duration: "Perishable – ships Fedex Priority Overnight.",
    shipping: "Perishable – ships Fedex Priority Overnight with Surround Premium.",
  },
  description: "Kaluga hybrid caviar",
  descriptionHtml: "<p>Kaluga hybrid caviar</p>",
  eyebrow: "Patrimoine",
  galleryImages: [],
  gifting: {
    addOns: "Includes mother-of-pearl spoon.",
    box: "Delivered in signature box with Bolduc ribbon.",
    message: JSON.stringify({
      children: [
        {
          children: [
            { type: "text", value: "Personalized message card. For more details, please contact " },
            { children: [{ type: "text", value: "Customer Service" }], type: "link", url: "/contact" },
            { type: "text", value: "." },
          ],
          type: "paragraph",
        },
      ],
      type: "root",
    }),
  },
  handle: "kaluga",
  id: "kaluga",
  image: null,
  packagingOptions: [],
  price: money("159"),
  profile: "Rich · Creamy",
  relatedProducts: [],
  serving: "Serve ideally between 26-32°F.\nPlan for about 1 ounce per person.",
  shelfLife: "Four weeks refrigerated",
  species: "Huso dauricus",
  speciesDescription: "Kaluga-Huso is the rising star of the caviar world.",
  speciesImage: null,
  specs: {
    color: "Golden",
    ingredients: "STURGEON ROE (Acipenser Dauricus), salt, E285",
    nutritionalData: "Energy 1059 kJ/ 254kcal",
    pearlSize: "3.2mm - 3.8mm",
    salt: "3.0% - 3.5%",
    tastingNotes: "Rich · Creamy · Long finish",
  },
  specsDescription: "Kaluga-Huso is the rising star of the caviar world.",
  storage: "Keep refrigerated",
  title: "Kaluga Caviar",
  variants: [],
};

describe("ProductDetailSpecs", () => {
  it("renders all 4 accordion sections and expands delivery & gifting", async () => {
    const user = userEvent.setup();
    render(<ProductDetailSpecs product={mockProduct} />);

    // Check accordion triggers
    expect(screen.getByRole("button", { name: /Specification/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Serving Info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delivery Info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gifting/i })).toBeInTheDocument();

    // Specification is open by default
    expect(screen.getByText("Kaluga hybrid caviar")).toBeVisible();
    expect(screen.getByText("3.2mm - 3.8mm")).toBeVisible();
    expect(screen.getByText("3.0% - 3.5%")).toBeVisible();
    expect(screen.getByText("Golden")).toBeVisible();
    expect(screen.getByText("STURGEON ROE (Acipenser Dauricus), salt, E285")).toBeVisible();

    // Expand Delivery Info
    const deliveryTrigger = screen.getByRole("button", { name: /Delivery Info/i });
    await user.click(deliveryTrigger);
    expect(screen.getByText("Perishable – ships Fedex Priority Overnight with Surround Premium.")).toBeVisible();

    // Expand Gifting
    const giftingTrigger = screen.getByRole("button", { name: /Gifting/i });
    await user.click(giftingTrigger);
    expect(screen.getByText("Delivered in signature box with Bolduc ribbon.")).toBeVisible();
    expect(screen.getByText("Includes mother-of-pearl spoon.")).toBeVisible();

    // Check Customer Service link in message
    const customerServiceLink = screen.getByRole("link", { name: "Customer Service" });
    expect(customerServiceLink).toBeInTheDocument();
    expect(customerServiceLink).toHaveAttribute("href", "/contact");
  });

  it("hides accordion items when their data is empty", () => {
    const productWithPartialSpecs: CatalogProductDetail = {
      ...mockProduct,
      delivery: { duration: "", shipping: "" },
      gifting: { addOns: "", box: "", message: "" },
    };

    render(<ProductDetailSpecs product={productWithPartialSpecs} />);

    expect(screen.getByRole("button", { name: /Specification/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Serving Info/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delivery Info/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gifting/i })).not.toBeInTheDocument();
  });

  it("renders rich text AST in description", () => {
    const productWithRichSpecs: CatalogProductDetail = {
      ...mockProduct,
      description: JSON.stringify({
        children: [
          {
            children: [
              { type: "text", value: "Rich description with " },
              { children: [{ type: "text", value: "learn more" }], type: "link", url: "/about" },
            ],
            type: "paragraph",
          },
        ],
        type: "root",
      }),
    };

    render(<ProductDetailSpecs product={productWithRichSpecs} />);

    expect(screen.getByText("Rich description with")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "learn more" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("renders nothing when all accordion item data is empty", () => {
    const emptyProduct: CatalogProductDetail = {
      ...mockProduct,
      delivery: { duration: "", shipping: "" },
      description: "",
      descriptionHtml: "",
      gifting: { addOns: "", box: "", message: "" },
      serving: "",
      shelfLife: "",
      specs: {
        color: "",
        ingredients: "",
        nutritionalData: "",
        pearlSize: "",
        salt: "",
        tastingNotes: "",
      },
      specsDescription: "",
      storage: "",
    };

    const { container } = render(<ProductDetailSpecs product={emptyProduct} />);
    expect(container).toBeEmptyDOMElement();
  });
});
