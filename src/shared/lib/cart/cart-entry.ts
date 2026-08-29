import type { CartEntry, CartLine } from "@/shared/types/cart.type";

export function flattenCartLines(entries: CartEntry[]): CartLine[] {
  return entries.flatMap((entry) => (entry.kind === "line" ? [entry.line] : entry.group.lines));
}

export function mapCartEntryLines(
  entry: CartEntry,
  mapper: (line: CartLine) => CartLine | null,
): CartEntry | null {
  if (entry.kind === "line") {
    const line = mapper(entry.line);
    return line ? { kind: "line", line } : null;
  }

  const lines = entry.group.lines.map(mapper).filter((line): line is CartLine => line !== null);
  return lines.length > 0 ? { kind: "group", group: { ...entry.group, lines } } : null;
}

export function countGiftUnitsByVariant(entries: CartEntry[], merchandiseId: string): number {
  return flattenCartLines(entries)
    .filter((line) => line.kind === "gift_set" && line.merchandiseId === merchandiseId)
    .reduce((total, line) => total + line.quantity, 0);
}
