import { describe, expect, it } from "vitest";

import { countGiftUnitsByVariant } from "./cart-entry";
import { replayCartOperations } from "./cart-optimistic";
import type { CartSnapshot } from "@/shared/types/cart.type";

const EMPTY: CartSnapshot = {
  entries: [],
  itemCount: 0,
  subtotal: { amount: "0.00", currencyCode: "SGD" },
  countryCode: "SG",
  warnings: [],
};

const optimistic = {
  image: null,
  title: "L'Initiation",
  weight: "30g",
  unitPrice: { amount: "100.00", currencyCode: "SGD" },
  quantityAvailable: 10,
};

describe("cart optimistic replay", () => {
  it("keeps one physical gift line per unit and exact subtotal", () => {
    const visible = replayCartOperations(EMPTY, [
      {
        id: "op-gift",
        type: "add_gift",
        createdAt: 1,
        merchandiseId: "variant-30",
        productId: "product-gift",
        units: [{ unitId: "A" }, { unitId: "B" }, { unitId: "C" }],
        group: { title: "L'Initiation" },
        optimistic,
      },
    ]);

    const group = visible.entries[0];
    expect(group?.kind).toBe("group");
    if (group?.kind !== "group") throw new Error("expected gift group");
    expect(group.group.lines.map((line) => [line.unitId, line.quantity])).toEqual([
      ["A", 1],
      ["B", 1],
      ["C", 1],
    ]);
    expect(visible.subtotal).toEqual({ amount: "300.00", currencyCode: "SGD" });
  });

  it("counts gift inventory per merchandiseId rather than product group", () => {
    const visible = replayCartOperations(EMPTY, [
      {
        id: "op-30",
        type: "add_gift",
        createdAt: 1,
        merchandiseId: "variant-30",
        productId: "product-gift",
        units: [{ unitId: "A" }, { unitId: "B" }, { unitId: "C" }, { unitId: "D" }],
        group: { title: "L'Initiation" },
        optimistic,
      },
    ]);

    expect(countGiftUnitsByVariant(visible.entries, "variant-30")).toBe(4);
    expect(countGiftUnitsByVariant(visible.entries, "variant-50")).toBe(0);
  });

  it("removing middle gift unit does not shift the remaining unit identities", () => {
    const visible = replayCartOperations(EMPTY, [
      {
        id: "op-add",
        type: "add_gift",
        createdAt: 1,
        merchandiseId: "variant-30",
        productId: "product-gift",
        units: [{ unitId: "A" }, { unitId: "B" }, { unitId: "C" }],
        group: { title: "L'Initiation" },
        optimistic,
      },
      {
        id: "op-remove",
        type: "remove",
        createdAt: 2,
        lineId: "optimistic:B",
        merchandiseId: "variant-30",
        unitId: "B",
      },
    ]);

    const group = visible.entries[0];
    if (group?.kind !== "group") throw new Error("expected gift group");
    expect(group.group.lines.map((line) => line.unitId)).toEqual(["A", "C"]);
  });
});
