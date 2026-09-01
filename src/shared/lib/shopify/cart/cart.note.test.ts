import { describe, expect, it } from "vitest";
import type { CartSnapshot } from "@/shared/types/cart.type";
import { buildBusinessOrderNote, MAX_ORDER_NOTE_LENGTH } from "./cart.note";

describe("buildBusinessOrderNote", () => {
  it("formats order summary using gift set unit ID and message summary", () => {
    const snapshot: CartSnapshot = {
      countryCode: "SG",
      itemCount: 4,
      subtotal: { amount: "1000.00", currencyCode: "SGD" },
      warnings: [],
      entries: [
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
                giftMessage: { kind: "personal", text: "Happy Birthday" },
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
                giftMessage: { kind: "blank" },
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
                giftMessage: { kind: "personal", text: "Warm wishes" },
                unitId: "unit-3",
              },
            ],
          },
        },
        {
          kind: "line",
          line: {
            id: "gid://shopify/CartLine/1",
            merchandiseId: "gid://shopify/ProductVariant/1",
            productId: "gid://shopify/Product/1",
            kind: "caviar",
            image: null,
            quantity: 2,
            quantityAvailable: 10,
            quantityEditable: true,
            supportsGiftMessage: false,
            title: "Kaluga",
            weight: "30g",
            unitPrice: { amount: "250.00", currencyCode: "SGD" },
            subtotal: { amount: "500.00", currencyCode: "SGD" },
            giftMessage: null,
            unitId: null,
          },
        },
      ],
    };

    const note = buildBusinessOrderNote(snapshot);

    const expected = `Maison Rocheval · Order Summary

Gift sets
L'Excellence                      × 1
• Gift #1 (ID: unit-1) — Personal message

L'Initiation                      × 2
• Gift #1 (ID: unit-2) — Blank card
• Gift #2 (ID: unit-3) — Personal message

Individual items
Kaluga                            × 2`;

    expect(note).toBe(expected);
  });

  it("safely truncates if note exceeds MAX_ORDER_NOTE_LENGTH", () => {
    const hugeLines = Array.from({ length: 300 }, (_, i) => ({
      id: `gid://shopify/CartLine/${i}`,
      merchandiseId: `gid://shopify/ProductVariant/${i}`,
      productId: "gid://shopify/Product/huge",
      kind: "gift_set" as const,
      image: null,
      quantity: 1,
      quantityAvailable: 10,
      quantityEditable: false,
      supportsGiftMessage: true,
      title: "Extremely Long Title For A Luxury Gift Set",
      weight: "Set",
      unitPrice: { amount: "250.00", currencyCode: "SGD" },
      subtotal: { amount: "250.00", currencyCode: "SGD" },
      giftMessage: { kind: "personal" as const, text: "Some message" },
      unitId: `unit-long-identifier-${i}`,
    }));

    const snapshot: CartSnapshot = {
      countryCode: "SG",
      itemCount: 300,
      subtotal: { amount: "75000.00", currencyCode: "SGD" },
      warnings: [],
      entries: [
        {
          kind: "group",
          group: {
            id: "gid://shopify/Product/huge",
            title: "Extremely Long Title For A Luxury Gift Set",
            lines: hugeLines,
          },
        },
      ],
    };

    const note = buildBusinessOrderNote(snapshot);
    expect(note.length).toBeLessThanOrEqual(MAX_ORDER_NOTE_LENGTH);
    expect(note.endsWith("...")).toBe(true);
  });

  it("handles empty / blank cases gracefully", () => {
    expect(buildBusinessOrderNote({ entries: [] } as unknown as CartSnapshot)).toBe("");
  });
});
