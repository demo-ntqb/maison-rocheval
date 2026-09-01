import { describe, expect, it } from "vitest";
import type { CartSnapshot } from "@/shared/types/cart.type";
import { buildBusinessOrderNote } from "./cart.note";

describe("buildBusinessOrderNote", () => {
  it("formats order summary matching user example", () => {
    const snapshot: CartSnapshot = {
      countryCode: "SG",
      itemCount: 4,
      subtotal: { amount: "1000.00", currencyCode: "SGD" },
      warnings: [],
      entries: [
        {
          kind: "line",
          line: {
            id: "gid://shopify/CartLine/1",
            merchandiseId: "gid://shopify/ProductVariant/1",
            productId: "gid://shopify/Product/1",
            kind: "caviar",
            image: null,
            quantity: 1,
            quantityAvailable: 10,
            quantityEditable: true,
            supportsGiftMessage: false,
            title: "Kaluga",
            weight: "30g",
            unitPrice: { amount: "250.00", currencyCode: "SGD" },
            subtotal: { amount: "250.00", currencyCode: "SGD" },
            giftMessage: null,
            unitId: null,
          },
        },
        {
          kind: "group",
          group: {
            id: "gid://shopify/Product/2",
            title: "L'Excellence",
            lines: [
              {
                id: "gid://shopify/CartLine/2",
                merchandiseId: "gid://shopify/ProductVariant/2",
                productId: "gid://shopify/Product/2",
                kind: "gift_set",
                image: null,
                quantity: 1,
                quantityAvailable: 10,
                quantityEditable: false,
                supportsGiftMessage: true,
                title: "L'Excellence",
                weight: "Set",
                unitPrice: { amount: "250.00", currencyCode: "SGD" },
                subtotal: { amount: "250.00", currencyCode: "SGD" },
                giftMessage: { kind: "personal", text: "123213123" },
                unitId: "unit-1",
              },
            ],
          },
        },
        {
          kind: "group",
          group: {
            id: "gid://shopify/Product/3",
            title: "L'Initiation",
            lines: [
              {
                id: "gid://shopify/CartLine/3",
                merchandiseId: "gid://shopify/ProductVariant/3",
                productId: "gid://shopify/Product/3",
                kind: "gift_set",
                image: null,
                quantity: 1,
                quantityAvailable: 10,
                quantityEditable: false,
                supportsGiftMessage: true,
                title: "L'Initiation",
                weight: "Set",
                unitPrice: { amount: "250.00", currencyCode: "SGD" },
                subtotal: { amount: "250.00", currencyCode: "SGD" },
                giftMessage: { kind: "personal", text: "312312321" },
                unitId: "unit-2",
              },
              {
                id: "gid://shopify/CartLine/4",
                merchandiseId: "gid://shopify/ProductVariant/3",
                productId: "gid://shopify/Product/3",
                kind: "gift_set",
                image: null,
                quantity: 1,
                quantityAvailable: 10,
                quantityEditable: false,
                supportsGiftMessage: true,
                title: "L'Initiation",
                weight: "Set",
                unitPrice: { amount: "250.00", currencyCode: "SGD" },
                subtotal: { amount: "250.00", currencyCode: "SGD" },
                giftMessage: { kind: "personal", text: "312321313" },
                unitId: "unit-3",
              },
            ],
          },
        },
      ],
    };

    const note = buildBusinessOrderNote(snapshot);

    const expected = `Maison Rocheval · Order Summary

Individual items

Kaluga                            × 1


Gift sets

L'Excellence                      × 1

Gift #1
123213123


L'Initiation                      × 2

Gift #1
312312321

Gift #2
312321313`;

    expect(note).toBe(expected);
  });

  it("handles empty / blank cases gracefully", () => {
    expect(buildBusinessOrderNote({ entries: [] } as unknown as CartSnapshot)).toBe("");
  });
});
