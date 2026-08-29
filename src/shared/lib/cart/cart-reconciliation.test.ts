import { describe, expect, it } from "vitest";

import { isOperationApplied } from "./cart-reconciliation";
import type { CartSnapshot } from "@/shared/types/cart.type";

function snapshot(lines: Array<{
  id: string;
  merchandiseId: string;
  kind: "caviar" | "gift_set";
  quantity: number;
  unitId?: string | null;
  giftMessage?: { kind: "blank" } | { kind: "personal"; text: string } | null;
}>): CartSnapshot {
  return {
    entries: lines.map((line) => ({
      kind: "line" as const,
      line: {
        id: line.id,
        merchandiseId: line.merchandiseId,
        productId: "gid://shopify/Product/1",
        kind: line.kind,
        image: null,
        quantity: line.quantity,
        quantityAvailable: 10,
        quantityEditable: line.kind === "caviar",
        supportsGiftMessage: line.kind === "gift_set",
        title: "Product",
        weight: "30g",
        unitPrice: { amount: "10.00", currencyCode: "SGD" },
        subtotal: { amount: `${line.quantity * 10}.00`, currencyCode: "SGD" },
        giftMessage: line.giftMessage ?? null,
        unitId: line.unitId ?? null,
      },
    })),
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: { amount: "0.00", currencyCode: "SGD" },
    countryCode: "SG",
    warnings: [],
  };
}

describe("ambiguous cart mutation reconciliation", () => {
  it("recognizes an already-applied caviar add by absolute target quantity", () => {
    const cart = snapshot([
      {
        id: "gid://shopify/CartLine/1",
        merchandiseId: "gid://shopify/ProductVariant/1",
        kind: "caviar",
        quantity: 3,
      },
    ]);

    expect(
      isOperationApplied(
        {
          id: "op",
          type: "add_caviar",
          createdAt: 1,
          merchandiseId: "gid://shopify/ProductVariant/1",
          productId: "gid://shopify/Product/1",
          quantity: 1,
          targetQuantity: 3,
          optimistic: {
            image: null,
            title: "Product",
            weight: "30g",
            unitPrice: { amount: "10.00", currencyCode: "SGD" },
            quantityAvailable: 10,
          },
        },
        cart,
      ),
    ).toBe(true);
  });

  it("recognizes an already-applied gift add only when every stable unit ID exists", () => {
    const cart = snapshot([
      {
        id: "gid://shopify/CartLine/a",
        merchandiseId: "gid://shopify/ProductVariant/gift",
        kind: "gift_set",
        quantity: 1,
        unitId: "A",
      },
      {
        id: "gid://shopify/CartLine/b",
        merchandiseId: "gid://shopify/ProductVariant/gift",
        kind: "gift_set",
        quantity: 1,
        unitId: "B",
      },
    ]);

    const base = {
      id: "op",
      type: "add_gift" as const,
      createdAt: 1,
      merchandiseId: "gid://shopify/ProductVariant/gift",
      productId: "gid://shopify/Product/gift",
      group: { title: "Gift" },
      optimistic: {
        image: null,
        title: "Gift",
        weight: "30g",
        unitPrice: { amount: "10.00", currencyCode: "SGD" },
        quantityAvailable: 10,
      },
    };

    expect(isOperationApplied({ ...base, units: [{ unitId: "A" }, { unitId: "B" }] }, cart)).toBe(true);
    expect(isOperationApplied({ ...base, units: [{ unitId: "A" }, { unitId: "C" }] }, cart)).toBe(false);
  });

  it("recognizes remove and gift-message results without array-index identity", () => {
    const cart = snapshot([
      {
        id: "gid://shopify/CartLine/c",
        merchandiseId: "gid://shopify/ProductVariant/gift",
        kind: "gift_set",
        quantity: 1,
        unitId: "C",
        giftMessage: { kind: "personal", text: "C" },
      },
    ]);

    expect(
      isOperationApplied(
        {
          id: "remove-b",
          type: "remove",
          createdAt: 1,
          lineId: "gid://shopify/CartLine/b",
          merchandiseId: "gid://shopify/ProductVariant/gift",
          unitId: "B",
        },
        cart,
      ),
    ).toBe(true);

    expect(
      isOperationApplied(
        {
          id: "message-c",
          type: "gift_message",
          createdAt: 1,
          lineId: "gid://shopify/CartLine/c",
          merchandiseId: "gid://shopify/ProductVariant/gift",
          unitId: "C",
          giftMessage: { kind: "personal", text: "C" },
        },
        cart,
      ),
    ).toBe(true);
  });
});
