import type { CartGroup, CartLine, CartSnapshot } from "@/shared/types/cart.type";

const HEADER = "Maison Rocheval · Order Summary";
const TITLE_PAD_LENGTH = 34;
export const MAX_ORDER_NOTE_LENGTH = 5000;

function formatQuantityLine(title: string, quantity: number): string {
  const padded = title.length < TITLE_PAD_LENGTH ? title.padEnd(TITLE_PAD_LENGTH, " ") : `${title} `;
  return `${padded}× ${quantity}`;
}

function formatGiftUnit(line: CartLine, index: number): string {
  const isPersonal =
    line.giftMessage?.kind === "personal" && Boolean(line.giftMessage.text.trim());
  const status = isPersonal ? "Personal message" : "Blank card";
  const idLabel = line.unitId ? ` (ID: ${line.unitId})` : "";
  return `• Gift #${index + 1}${idLabel} — ${status}`;
}

function formatGiftGroup(group: CartGroup): string {
  const header = formatQuantityLine(group.title, group.lines.length);
  const units = group.lines.map(formatGiftUnit).join("\n");
  return units ? `${header}\n${units}` : header;
}

export function buildBusinessOrderNote(snapshot: CartSnapshot): string {
  if (!snapshot.entries?.length) return "";

  const gifts = snapshot.entries
    .filter((e): e is { kind: "group"; group: CartGroup } => e.kind === "group")
    .map((e) => formatGiftGroup(e.group));

  const individual = snapshot.entries
    .filter((e): e is { kind: "line"; line: CartLine } => e.kind === "line")
    .map((e) => formatQuantityLine(e.line.title, e.line.quantity));

  const sections: string[] = [];
  if (gifts.length) sections.push(`Gift sets\n${gifts.join("\n\n")}`);
  if (individual.length) sections.push(`Individual items\n${individual.join("\n")}`);

  if (!sections.length) return "";

  const fullNote = `${HEADER}\n\n${sections.join("\n\n")}`;
  if (fullNote.length <= MAX_ORDER_NOTE_LENGTH) {
    return fullNote;
  }
  return `${fullNote.slice(0, MAX_ORDER_NOTE_LENGTH - 3)}...`;
}
