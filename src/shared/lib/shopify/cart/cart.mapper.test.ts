import { describe, expect, it } from "vitest";

import type { ShopifyCart, ShopifyCartLine } from "./cart.type";
import { mapShopifyCart, mapShopifyCartLine } from "./cart.mapper";

function line(overrides: Partial<ShopifyCartLine> = {}): ShopifyCartLine {
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
      selectedOptions: [{ name: "Tin weight", value: "30g" }],
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

function giftLine(overrides: Partial<ShopifyCartLine> = {}): ShopifyCartLine {
  const base = line();
  return line({
    merchandise: {
      ...base.merchandise,
      id: "gid://shopify/ProductVariant/gift-30",
      requiresComponents: true,
      product: {
        id: "gid://shopify/Product/gift",
        handle: "linitiation",
        title: "L'Initiation",
        productType: "Gift Set",
      },
    },
    ...overrides,
  });
}

function cart(lines: ShopifyCartLine[]): ShopifyCart {
  return {
    id: "gid://shopify/Cart/cart?key=secret",
    totalQuantity: lines.reduce((total, item) => total + item.quantity, 0),
    checkoutUrl: "https://example.test/checkouts/current",
    buyerIdentity: { countryCode: "SG" },
    cost: { subtotalAmount: { amount: "300.00", currencyCode: "SGD" } },
    lines: { nodes: lines, pageInfo: { hasNextPage: false, endCursor: null } },
  };
}

describe("cart mapper", () => {
  it("maps caviar identity and money without floating-point conversion", () => {
    const mapped = mapShopifyCartLine(line());

    expect(mapped.id).toBe("gid://shopify/CartLine/1");
    expect(mapped.merchandiseId).toBe("gid://shopify/ProductVariant/1");
    expect(mapped.productId).toBe("gid://shopify/Product/1");
    expect(mapped.unitPrice.amount).toBe("75.00");
    expect(mapped.quantityEditable).toBe(true);
  });

  it("maps authoritative Gift Set metadata to stable unit identity and message", () => {
    const mapped = mapShopifyCartLine(
      giftLine({
        id: "gid://shopify/CartLine/gift-a",
        attributes: [
          { key: "_mr_unit_id", value: "unit-a" },
          { key: "_mr_gift_message_kind", value: "personal" },
          { key: "_mr_gift_message", value: "A" },
        ],
      }),
    );

    expect(mapped.kind).toBe("gift_set");
    expect(mapped.unitId).toBe("unit-a");
    expect(mapped.giftMessage).toEqual({ kind: "personal", text: "A" });
    expect(mapped.quantityEditable).toBe(false);
  });

  it("does not let forged legacy _mr_kind override authoritative Gift Set metadata", () => {
    const mapped = mapShopifyCartLine(
      giftLine({
        attributes: [
          { key: "_mr_kind", value: "caviar" },
          { key: "_mr_unit_id", value: "unit-a" },
        ],
      }),
    );

    expect(mapped.kind).toBe("gift_set");
    expect(mapped.unitId).toBe("unit-a");
  });

  it("does not let legacy _mr_kind turn caviar into a Gift Set", () => {
    const mapped = mapShopifyCartLine(
      line({ attributes: [{ key: "_mr_kind", value: "gift_set" }] }),
    );

    expect(mapped.kind).toBe("caviar");
    expect(mapped.quantityEditable).toBe(true);
    expect(mapped.unitId).toBeNull();
  });

  it("groups gift variants by Shopify Product.id while preserving unit messages", () => {
    const giftA = giftLine({
      id: "gid://shopify/CartLine/a",
      attributes: [
        { key: "_mr_unit_id", value: "unit-a" },
        { key: "_mr_gift_message_kind", value: "personal" },
        { key: "_mr_gift_message", value: "A" },
      ],
    });
    const giftCBase = giftLine();
    const giftC = giftLine({
      id: "gid://shopify/CartLine/c",
      attributes: [
        { key: "_mr_unit_id", value: "unit-c" },
        { key: "_mr_gift_message_kind", value: "personal" },
        { key: "_mr_gift_message", value: "C" },
      ],
      merchandise: {
        ...giftCBase.merchandise,
        id: "gid://shopify/ProductVariant/gift-50",
      },
    });

    const snapshot = mapShopifyCart(cart([giftA, giftC]), "SG");
    expect(snapshot.entries).toHaveLength(1);
    const group = snapshot.entries[0];
    expect(group?.kind).toBe("group");
    if (group?.kind !== "group") throw new Error("expected gift group");
    expect(group.group.id).toBe("gid://shopify/Product/gift");
    expect(group.group.lines.map((item) => [item.unitId, item.giftMessage])).toEqual([
      ["unit-a", { kind: "personal", text: "A" }],
      ["unit-c", { kind: "personal", text: "C" }],
    ]);
  });
});
