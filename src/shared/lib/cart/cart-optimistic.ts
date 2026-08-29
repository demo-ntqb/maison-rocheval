import { flattenCartLines, mapCartEntryLines } from "./cart-entry";
import { multiplyMoney, sumMoney } from "./cart-money";
import type { PendingCartOperation } from "./cart-operation";
import type { CartEntry, CartLine, CartSnapshot } from "@/shared/types/cart.type";

function applyOperation(entries: CartEntry[], operation: PendingCartOperation): CartEntry[] {
  if (operation.type === "add_caviar") {
    const index = entries.findIndex(
      (entry) =>
        entry.kind === "line" &&
        entry.line.kind === "caviar" &&
        entry.line.merchandiseId === operation.merchandiseId,
    );

    if (index >= 0) {
      const current = entries[index] as Extract<CartEntry, { kind: "line" }>;
      const max = current.line.quantityAvailable ?? 99;
      const quantity = Math.min(current.line.quantity + operation.quantity, max);
      const next = [...entries];
      next[index] = {
        kind: "line",
        line: { ...current.line, quantity, subtotal: multiplyMoney(current.line.unitPrice, quantity) },
      };
      return next;
    }

    const quantity = Math.min(operation.quantity, operation.optimistic.quantityAvailable ?? 99);
    return [
      ...entries,
      {
        kind: "line",
        line: {
          id: `optimistic:${operation.id}`,
          merchandiseId: operation.merchandiseId,
          productId: operation.productId,
          kind: "caviar",
          image: operation.optimistic.image,
          quantity,
          quantityAvailable: operation.optimistic.quantityAvailable,
          quantityEditable: true,
          supportsGiftMessage: false,
          title: operation.optimistic.title,
          weight: operation.optimistic.weight,
          unitPrice: operation.optimistic.unitPrice,
          subtotal: multiplyMoney(operation.optimistic.unitPrice, quantity),
          giftMessage: null,
          unitId: null,
        },
      },
    ];
  }

  if (operation.type === "add_gift") {
    const newLines: CartLine[] = operation.units.map(({ unitId }) => ({
      id: `optimistic:${unitId}`,
      merchandiseId: operation.merchandiseId,
      productId: operation.productId,
      kind: "gift_set",
      image: operation.optimistic.image,
      quantity: 1,
      quantityAvailable: operation.optimistic.quantityAvailable,
      quantityEditable: false,
      supportsGiftMessage: true,
      title: operation.optimistic.title,
      weight: operation.optimistic.weight,
      unitPrice: operation.optimistic.unitPrice,
      subtotal: operation.optimistic.unitPrice,
      giftMessage: null,
      unitId,
    }));
    const groupIndex = entries.findIndex(
      (entry) => entry.kind === "group" && entry.group.id === operation.productId,
    );
    if (groupIndex >= 0) {
      const existing = entries[groupIndex] as Extract<CartEntry, { kind: "group" }>;
      const next = [...entries];
      next[groupIndex] = {
        kind: "group",
        group: { ...existing.group, lines: [...existing.group.lines, ...newLines] },
      };
      return next;
    }

    return [
      ...entries,
      {
        kind: "group",
        group: {
          id: operation.productId,
          title: operation.group.title,
          addHref: operation.group.addHref,
          lines: newLines,
        },
      },
    ];
  }

  if (operation.type === "set_quantity") {
    return entries
      .map((entry) =>
        mapCartEntryLines(entry, (line) => {
          if (line.id !== operation.lineId && line.merchandiseId !== operation.merchandiseId) return line;
          if (line.kind !== "caviar") return line;
          const quantity = Math.min(operation.quantity, line.quantityAvailable ?? 99);
          return { ...line, quantity, subtotal: multiplyMoney(line.unitPrice, quantity) };
        }),
      )
      .filter((entry): entry is CartEntry => entry !== null);
  }

  if (operation.type === "remove") {
    return entries
      .map((entry) =>
        mapCartEntryLines(entry, (line) => {
          const sameUnit = operation.unitId && line.unitId === operation.unitId;
          const sameLine = line.id === operation.lineId;
          return sameUnit || sameLine ? null : line;
        }),
      )
      .filter((entry): entry is CartEntry => entry !== null);
  }

  return entries
    .map((entry) =>
      mapCartEntryLines(entry, (line) => {
        const sameUnit = operation.unitId && line.unitId === operation.unitId;
        const sameLine = line.id === operation.lineId;
        return sameUnit || sameLine ? { ...line, giftMessage: operation.giftMessage } : line;
      }),
    )
    .filter((entry): entry is CartEntry => entry !== null);
}

export function replayCartOperations(
  confirmed: CartSnapshot,
  pending: PendingCartOperation[],
): CartSnapshot {
  const entries = pending.reduce(
    (current, operation) => applyOperation(current, operation),
    confirmed.entries,
  );
  const lines = flattenCartLines(entries);
  return {
    ...confirmed,
    entries,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: sumMoney(lines.map((line) => line.subtotal), confirmed.subtotal.currencyCode),
  };
}
