// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../storefront", () => ({
  getBuyerStorefrontClient: vi.fn(),
}));

describe("Shopify cart service business inputs", () => {
  it("builds one caviar line with commerce metadata", async () => {
    const { buildInitialCartLines } = await import("./cart.service");

    expect(
      buildInitialCartLines({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity: 3,
      }),
    ).toEqual([
      {
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity: 3,
        attributes: [{ key: "_mr_kind", value: "caviar" }],
      },
    ]);
  });

  it("builds one Shopify CartLine per physical gift unit", async () => {
    const { buildInitialCartLines } = await import("./cart.service");
    const lines = buildInitialCartLines({
      kind: "gift_set",
      merchandiseId: "gid://shopify/ProductVariant/2",
      unitIds: ["unit-a", "unit-b", "unit-c"],
    });

    expect(lines).toHaveLength(3);
    expect(lines.every((line) => line.quantity === 1)).toBe(true);
    expect(lines.map((line) => line.attributes)).toEqual([
      [
        { key: "_mr_kind", value: "gift_set" },
        { key: "_mr_unit_id", value: "unit-a" },
      ],
      [
        { key: "_mr_kind", value: "gift_set" },
        { key: "_mr_unit_id", value: "unit-b" },
      ],
      [
        { key: "_mr_kind", value: "gift_set" },
        { key: "_mr_unit_id", value: "unit-c" },
      ],
    ]);
  });
});
