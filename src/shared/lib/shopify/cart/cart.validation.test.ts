import { describe, expect, it } from "vitest";

import { GIFT_MESSAGE_MAX_LINES } from "@/shared/constants/cart.constant";
import { addCartLineSchema, updateCartLineSchema } from "./cart.validation";

describe("cart validation", () => {
  it("rejects non-ProductVariant merchandise IDs", () => {
    expect(
      addCartLineSchema.safeParse({
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
        merchandiseId: "gid://shopify/ProductVariant/1",
        quantity,
        operationId: "op",
        locale: "en-sg",
      }).success,
    ).toBe(false);
  });

  it("accepts structural add intent without browser commerce kind", () => {
    const parsed = addCartLineSchema.safeParse({
      kind: "caviar",
      merchandiseId: "gid://shopify/ProductVariant/1",
      quantity: 1,
      operationId: "op",
      locale: "en-sg",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).not.toHaveProperty("kind");
  });

  it("requires supplied gift unit IDs to be unique and match physical quantity", () => {
    expect(
      addCartLineSchema.safeParse({
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
});
