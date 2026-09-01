import { describe, expect, it } from "vitest";

import { GIFT_MESSAGE_MAX_CHARS, GIFT_MESSAGE_MAX_LINES } from "@/shared/constants/cart.constant";
import { addCartLineSchema, updateCartLineSchema } from "./cart.validation";

describe("cart validation", () => {
  it("rejects non-ProductVariant merchandise IDs", () => {
    expect(
      addCartLineSchema.safeParse({
        kind: "caviar",
        merchandiseId: "gid://shopify/Product/1",
        quantity: 1,
        operationId: "op",
        locale: "en-sg",
      }).success,
    ).toBe(false);
  });

  it.each([0, -1, 1.5])("rejects invalid quantity %s", (quantity) => {
    expect(
      addCartLineSchema.safeParse({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity,
        operationId: "op",
        locale: "en-sg",
      }).success,
    ).toBe(false);
  });

  it("requires gift unit IDs to be unique and match physical quantity", () => {
    expect(
      addCartLineSchema.safeParse({
        kind: "gift_set",
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity: 2,
        unitIds: ["same", "same"],
        operationId: "op",
        locale: "en-sg",
      }).success,
    ).toBe(false);
  });

  it("rejects a personal gift message beyond the existing line limit", () => {
    const text = Array.from({ length: GIFT_MESSAGE_MAX_LINES + 1 }, (_, index) => `${index}`).join("\n");
    expect(
      updateCartLineSchema.safeParse({
        action: "gift_message",
        lineId: "gid://shopify/CartLine/1",
        giftMessage: { kind: "personal", text },
        operationId: "op",
        locale: "fr-sg",
      }).success,
    ).toBe(false);
  });

  it("rejects a personal gift message beyond the character limit", () => {
    const text = "a".repeat(GIFT_MESSAGE_MAX_CHARS + 1);
    expect(
      updateCartLineSchema.safeParse({
        action: "gift_message",
        lineId: "gid://shopify/CartLine/1",
        giftMessage: { kind: "personal", text },
        operationId: "op",
        locale: "en-sg",
      }).success,
    ).toBe(false);
  });
});
