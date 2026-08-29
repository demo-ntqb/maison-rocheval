import { flattenCartLines } from "./cart-entry";
import type { PendingCartOperation } from "./cart-operation";
import type { CartGiftMessage, CartSnapshot } from "@/shared/types/cart.type";

function sameGiftMessage(
  left: CartGiftMessage | null,
  right: CartGiftMessage | null,
): boolean {
  if (left === null || right === null) return left === right;
  if (left.kind !== right.kind) return false;
  if (left.kind === "blank" && right.kind === "blank") return true;
  return left.kind === "personal" && right.kind === "personal" && left.text === right.text;
}

/**
 * Determines whether an ambiguous commerce mutation is already reflected in
 * an authoritative Shopify cart snapshot. This never requests a mutation.
 */
export function isOperationApplied(
  operation: PendingCartOperation,
  cart: CartSnapshot,
): boolean {
  const lines = flattenCartLines(cart.entries);

  switch (operation.type) {
    case "add_caviar": {
      const line = lines.find(
        (candidate) =>
          candidate.kind === "caviar" &&
          candidate.merchandiseId === operation.merchandiseId,
      );
      return Boolean(line && line.quantity >= operation.targetQuantity);
    }

    case "add_gift": {
      const expected = new Set(operation.units.map((unit) => unit.unitId));
      for (const line of lines) {
        if (line.kind === "gift_set" && line.unitId) expected.delete(line.unitId);
      }
      return expected.size === 0;
    }

    case "set_quantity": {
      const line = lines.find(
        (candidate) =>
          candidate.id === operation.lineId ||
          (candidate.kind === "caviar" &&
            candidate.merchandiseId === operation.merchandiseId),
      );
      return Boolean(line && line.quantity === operation.quantity);
    }

    case "remove": {
      return !lines.some((line) => {
        if (operation.unitId) return line.unitId === operation.unitId;
        return line.id === operation.lineId;
      });
    }

    case "gift_message": {
      const line = lines.find((candidate) =>
        operation.unitId ? candidate.unitId === operation.unitId : candidate.id === operation.lineId,
      );
      return Boolean(line && sameGiftMessage(line.giftMessage, operation.giftMessage));
    }

    default:
      return false;
  }
}
