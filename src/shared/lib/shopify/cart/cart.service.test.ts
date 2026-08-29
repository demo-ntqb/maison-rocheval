// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getBuyerStorefrontClient: vi.fn(),
}));

vi.mock("../storefront", () => ({
  getBuyerStorefrontClient: mocks.getBuyerStorefrontClient,
}));

function line(overrides: Record<string, unknown> = {}) {
  return {
    id: "gid://shopify/CartLine/1",
    quantity: 1,
    attributes: [{ key: "_mr_kind", value: "caviar" }],
    cost: {
      amountPerQuantity: { amount: "75.00", currencyCode: "SGD" },
      subtotalAmount: { amount: "75.00", currencyCode: "SGD" },
    },
    merchandise: {
      id: "gid://shopify/ProductVariant/1",
      title: "30g",
      availableForSale: true,
      quantityAvailable: 10,
      selectedOptions: [],
      metafield: null,
      image: null,
      product: {
        id: "gid://shopify/Product/1",
        handle: "amour",
        title: "Amour",
        productType: "Caviar",
      },
    },
    ...overrides,
  };
}

function cart(lines: ReturnType<typeof line>[]) {
  return {
    id: "gid://shopify/Cart/current?key=secret",
    totalQuantity: lines.reduce((total, item) => total + item.quantity, 0),
    checkoutUrl: "https://example.test/checkouts/current",
    buyerIdentity: { countryCode: "SG" },
    cost: { subtotalAmount: { amount: "75.00", currencyCode: "SGD" } },
    lines: { nodes: lines, pageInfo: { hasNextPage: false, endCursor: null } },
  };
}
describe("Shopify cart service business inputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("rejects quantity changes for gift-set physical units", async () => {
    const query = vi.fn().mockResolvedValue({
      cart: cart([
        line({
          attributes: [
            { key: "_mr_kind", value: "gift_set" },
            { key: "_mr_unit_id", value: "unit-a" },
          ],
        }),
      ]),
    });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { updateCartLineQuantity } = await import("./cart.service");

    await expect(
      updateCartLineQuantity({
        request: new Request("https://maison.test"),
        locale: "en-sg",
        cartId: "gid://shopify/Cart/current?key=secret",
        lineId: "gid://shopify/CartLine/1",
        quantity: 2,
      }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("adds every gift-set unit as its own quantity-one Shopify line", async () => {
    const query = vi.fn().mockResolvedValue({
      cartLinesAdd: { cart: cart([]), userErrors: [], warnings: [] },
    });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { addGiftSet } = await import("./cart.service");

    await addGiftSet({
      request: new Request("https://maison.test"),
      locale: "en-sg",
      cartId: "gid://shopify/Cart/current?key=secret",
      merchandiseId: "gid://shopify/ProductVariant/2",
      unitIds: ["unit-a", "unit-b", "unit-c"],
    });

    const variables = query.mock.calls[0]?.[1]?.variables as { lines: Array<{ quantity: number }> };
    expect(variables.lines).toHaveLength(3);
    expect(variables.lines.every((item) => item.quantity === 1)).toBe(true);
  });

  it("preserves the stable unit ID when updating a gift message", async () => {
    const giftLine = line({
      attributes: [
        { key: "_mr_kind", value: "gift_set" },
        { key: "_mr_unit_id", value: "unit-a" },
      ],
    });
    const query = vi
      .fn()
      .mockResolvedValueOnce({ cart: cart([giftLine]) })
      .mockResolvedValueOnce({ cartLinesUpdate: { cart: cart([giftLine]), userErrors: [], warnings: [] } });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { updateGiftMessage } = await import("./cart.service");

    await updateGiftMessage({
      request: new Request("https://maison.test"),
      locale: "en-sg",
      cartId: "gid://shopify/Cart/current?key=secret",
      lineId: "gid://shopify/CartLine/1",
      giftMessage: { kind: "personal", text: "For you" },
    });

    expect(query.mock.calls[1]?.[1]?.variables.lines).toEqual([
      {
        id: "gid://shopify/CartLine/1",
        attributes: [
          { key: "_mr_kind", value: "gift_set" },
          { key: "_mr_unit_id", value: "unit-a" },
          { key: "_mr_gift_message_kind", value: "personal" },
          { key: "_mr_gift_message", value: "For you" },
        ],
      },
    ]);
  });

  it("merges caviar by merchandise ID instead of adding a second Shopify line", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ cart: cart([line()]) })
      .mockResolvedValueOnce({ cartLinesUpdate: { cart: cart([line({ quantity: 3 })]), userErrors: [], warnings: [] } });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { addCaviar } = await import("./cart.service");

    await addCaviar({
      request: new Request("https://maison.test"),
      locale: "en-sg",
      cartId: "gid://shopify/Cart/current?key=secret",
      merchandiseId: "gid://shopify/ProductVariant/1",
      quantity: 2,
    });

    expect(query.mock.calls[1]?.[1]?.variables.lines).toEqual([
      { id: "gid://shopify/CartLine/1", quantity: 3 },
    ]);
  });
});
