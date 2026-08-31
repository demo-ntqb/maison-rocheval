import { CART_ATTRIBUTE, isGiftSetMerchandise } from "./cart.mapper";
import type { ShopifyCart, ShopifyCartAttribute, ShopifyCartLine } from "./cart.type";

type GiftSetSummary = {
  title: string;
  quantity: number;
  units: ShopifyCartLine[];
};

function attributesToRecord(attributes: ShopifyCartAttribute[]): Record<string, string> {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, value]));
}

function formatGiftUnit(line: ShopifyCartLine, index: number): string {
  const attributes = attributesToRecord(line.attributes);
  const kind = attributes[CART_ATTRIBUTE.giftMessageKind];

  if (kind === "blank") {
    return `  Gift #${index + 1}: Blank card`;
  }

  if (kind === "personal") {
    const message = attributes[CART_ATTRIBUTE.giftMessage] ?? "";
    const [firstLine = "", ...remainingLines] = message.split("\n");
    return [
      `  Gift #${index + 1}: ${firstLine}`,
      ...remainingLines.map((messageLine) => `    ${messageLine}`),
    ].join("\n");
  }

  return `  Gift #${index + 1}: No card selected`;
}

function buildIndividualItems(lines: ShopifyCartLine[]): string | null {
  const items = lines.filter((line) => !isGiftSetMerchandise(line.merchandise));
  if (items.length === 0) return null;

  return [
    "Individual items",
    ...items.map((line) => `- ${line.merchandise.product.title} × ${line.quantity}`),
  ].join("\n");
}

function buildGiftSets(lines: ShopifyCartLine[]): string | null {
  const groups = new Map<string, GiftSetSummary>();

  for (const line of lines) {
    if (!isGiftSetMerchandise(line.merchandise)) continue;

    const key = line.merchandise.product.id;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.units.push(line);
      continue;
    }

    groups.set(key, {
      title: line.merchandise.product.title,
      quantity: line.quantity,
      units: [line],
    });
  }

  if (groups.size === 0) return null;

  const rows = Array.from(groups.values()).flatMap((group) => [
    `- ${group.title} × ${group.quantity}`,
    ...group.units.map(formatGiftUnit),
  ]);

  return ["Gift sets", ...rows].join("\n");
}

/**
 * Builds the staff-facing Shopify Order note from authoritative cart data.
 *
 * Gift Set line attributes remain the machine-readable source of truth for
 * each physical unit. The cart note is only a readable fulfillment summary.
 * Returning an empty string when no Gift Set exists also clears a stale note
 * if all Gift Sets were removed before checkout.
 */
export function buildCartOrderNote(cart: ShopifyCart): string {
  const giftSets = buildGiftSets(cart.lines.nodes);
  if (!giftSets) return "";

  const sections = ["Maison Rocheval order summary"];
  const individualItems = buildIndividualItems(cart.lines.nodes);
  if (individualItems) sections.push(individualItems);
  sections.push(giftSets);

  return sections.join("\n\n");
}
