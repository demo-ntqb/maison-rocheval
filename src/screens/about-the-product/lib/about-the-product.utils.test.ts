import { describe, expect, it } from "vitest";
import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";
import {
  createProductFacts,
  displayName,
  flavourCharacter,
  tastingProfile,
} from "./about-the-product.utils";

const mockProduct: CatalogProductProfile = {
  availableForSale: true,
  description: "Description test",
  eyebrow: "Patrimoine",
  galleryImages: [],
  handle: "amour",
  id: "gid://shopify/Product/1",
  image: null,
  price: { amount: "150.00", currencyCode: "EUR" },
  profile: "Rich · Creamy",
  serving: "Serve cold",
  species: "Acipenser Schrenckii",
  speciesDescription: "A fine sturgeon species",
  speciesImage: null,
  specs: {
    color: "Golden",
    pearlSize: "3.2mm - 3.8mm",
    salt: "3.0% - 3.5%",
    tastingNotes: "Rich · Creamy · Cheese",
  },
  title: "Caviar Amour",
};

describe("about-the-product.utils", () => {
  it("displayName giữ nguyên title gốc", () => {
    expect(displayName("Caviar Amour")).toBe("Caviar Amour");
    expect(displayName("Kaluga Caviar")).toBe("Kaluga Caviar");
    expect(displayName("Special")).toBe("Special");
  });

  it("flavourCharacter trích xuất nốt hương cuối cùng và format Cheese thành Cheesy", () => {
    expect(flavourCharacter(mockProduct)).toBe("Cheesy");
    expect(
      flavourCharacter({
        ...mockProduct,
        specs: { ...mockProduct.specs, tastingNotes: "Nutty · Butter" },
      }),
    ).toBe("Butter");
  });

  it("tastingProfile giữ nguyên tastingNotes gốc", () => {
    expect(tastingProfile(mockProduct)).toBe("Rich · Creamy · Cheese");
  });

  it("createProductFacts tạo danh sách facts đầy đủ", () => {
    const labels = {
      color: "Color",
      commonName: "Common name",
      pearlSize: "Pearl size",
      salt: "Salt",
      species: "Species",
      tastingNotes: "Tasting notes",
    };
    const facts = createProductFacts(labels, mockProduct);
    expect(facts).toHaveLength(6);
    expect(facts[0]?.value).toBe("Acipenser Schrenckii");
    expect(facts[1]?.value).toBe("Caviar Amour");
  });
});
