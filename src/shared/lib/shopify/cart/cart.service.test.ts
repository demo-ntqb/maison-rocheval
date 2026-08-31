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
    attributes: [],
    cost: {
      amountPerQuantity: { amount: "75.00", currencyCode: "SGD" },
      subtotalAmount: { amount: "75.00", currencyCode: "SGD" },
    },
    merchandise: {
      id: "gid://shopify/ProductVariant/1",
      title: "30g",
      requiresComponents: false,
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

function giftLine(overrides: Record<string, unknown> = {}) {
  const base = line();
  return line({
    attributes: [{ key: "_mr_unit_id", value: "unit-a" }],
    merchandise: {
      ...base.merchandise,
      id: "gid://shopify/ProductVariant/gift",
      requiresComponents: true,
      product: {
        ...base.merchandise.product,
        id: "gid://shopify/Product/gift",
        handle: "linitiation",
        title: "L'Initiation",
        productType: "Gift Set",
      },
    },
    ...overrides,
  });
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

  it("builds a caviar line without client-controlled kind metadata", async () => {
    const { buildInitialCartLines } = await import("./cart.service");

    expect(
      buildInitialCartLines({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity: 3,
      }),
    ).toEqual([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 3 }]);
  });

  it("builds one Shopify CartLine per physical gift unit without _mr_kind", async () => {
    const { buildInitialCartLines } = await import("./cart.service");
    const lines = buildInitialCartLines({
      kind: "gift_set",
      merchandiseId: "gid://shopify/ProductVariant/2",
      unitIds: ["unit-a", "unit-b", "unit-c"],
    });

    expect(lines).toHaveLength(3);
    expect(lines.every((item) => item.quantity === 1)).toBe(true);
    expect(lines.map((item) => item.attributes)).toEqual([
      [{ key: "_mr_unit_id", value: "unit-a" }],
      [{ key: "_mr_unit_id", value: "unit-b" }],
      [{ key: "_mr_unit_id", value: "unit-c" }],
    ]);
  });

  it("rejects quantity changes for authoritative gift-set units even with a forged legacy kind", async () => {
    const query = vi.fn().mockResolvedValue({
      cart: cart([
        giftLine({
          attributes: [
            { key: "_mr_kind", value: "caviar" },
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

    const variables = query.mock.calls[0]?.[1]?.variables as {
      lines: Array<{ quantity: number; attributes?: Array<{ key: string; value: string }> }>;
    };
    expect(variables.lines).toHaveLength(3);
    expect(variables.lines.every((item) => item.quantity === 1)).toBe(true);
    expect(JSON.stringify(variables.lines)).not.toContain("_mr_kind");
  });

  it("preserves the stable unit ID and removes legacy _mr_kind when updating a gift message", async () => {
    const existing = giftLine({
      attributes: [
        { key: "_mr_kind", value: "gift_set" },
        { key: "_mr_unit_id", value: "unit-a" },
      ],
    });
    const query = vi
      .fn()
      .mockResolvedValueOnce({ cart: cart([existing]) })
      .mockResolvedValueOnce({ cartLinesUpdate: { cart: cart([existing]), userErrors: [], warnings: [] } });
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
          { key: "_mr_unit_id", value: "unit-a" },
          { key: "_mr_gift_message_kind", value: "personal" },
          { key: "_mr_gift_message", value: "For you" },
        ],
      },
    ]);
  });

  it("writes a staff-readable business summary into the Shopify cart note before checkout", async () => {
    const checkoutCart = cart([
      line(),
      giftLine({
        attributes: [
          { key: "_mr_unit_id", value: "unit-a" },
          { key: "_mr_gift_message_kind", value: "personal" },
          { key: "_mr_gift_message", value: "For you\nAlways" },
        ],
      }),
      giftLine({
        id: "gid://shopify/CartLine/2",
        attributes: [
          { key: "_mr_unit_id", value: "unit-b" },
          { key: "_mr_gift_message_kind", value: "blank" },
        ],
      }),
    ]);
    const query = vi
      .fn()
      .mockResolvedValueOnce({ cart: checkoutCart })
      .mockResolvedValueOnce({
        cartNoteUpdate: { cart: checkoutCart, userErrors: [], warnings: [] },
      });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { getCheckoutCart } = await import("./cart.service");

    await getCheckoutCart({
      request: new Request("https://maison.test"),
      locale: "en-sg",
      cartId: "gid://shopify/Cart/current?key=secret",
    });

    expect(query.mock.calls[1]?.[0]).toContain("cartNoteUpdate");
    expect(query.mock.calls[1]?.[1]?.variables.note).toBe(
      "Maison Rocheval order summary\n\nIndividual items\n- Amour × 1\n\nGift sets\n- L'Initiation × 2\n  Gift #1: For you\n    Always\n  Gift #2: Blank card",
    );
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

  it("resolves Gift Set behavior from authoritative Shopify variant metadata", async () => {
    const query = vi.fn().mockResolvedValue({
      node: {
        __typename: "ProductVariant",
        id: "gid://shopify/ProductVariant/gift",
        requiresComponents: true,
        product: { productType: "Gift Set" },
      },
    });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { resolveCartMerchandise } = await import("./cart.service");

    await expect(
      resolveCartMerchandise({
        request: new Request("https://maison.test"),
        locale: "en-sg",
        merchandiseId: "gid://shopify/ProductVariant/gift",
      }),
    ).resolves.toEqual({
      merchandiseId: "gid://shopify/ProductVariant/gift",
      kind: "gift_set",
      requiresComponents: true,
    });
  });

  it("rejects unsupported componentized merchandise instead of treating it as caviar", async () => {
    const query = vi.fn().mockResolvedValue({
      node: {
        __typename: "ProductVariant",
        id: "gid://shopify/ProductVariant/other-bundle",
        requiresComponents: true,
        product: { productType: "Caviar" },
      },
    });
    mocks.getBuyerStorefrontClient.mockReturnValue({ query });
    const { resolveCartMerchandise } = await import("./cart.service");

    await expect(
      resolveCartMerchandise({
        request: new Request("https://maison.test"),
        locale: "en-sg",
        merchandiseId: "gid://shopify/ProductVariant/other-bundle",
      }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});
