import { ROUTES } from "@/shared/constants/route.constant";
import { CatalogCollectionHandle } from "@/shared/types/catalog.type";
import type { CartEntry, CartGiftMessage, CartLine, CartSnapshot, CartWarning } from "@/shared/types/cart.type";
import type { SupportedCountry } from "@/shared/types/commerce-context.type";
import type { ShopifyCart, ShopifyCartAttribute, ShopifyCartLine, ShopifyCartWarning } from "./cart.type";

export const CART_ATTRIBUTE = {
  kind: "_mr_kind",
  unitId: "_mr_unit_id",
  giftMessageKind: "_mr_gift_message_kind",
  giftMessage: "_mr_gift_message",
} as const;

function attributesToRecord(attributes: ShopifyCartAttribute[]): Record<string, string> {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, value]));
}

function resolveKind(line: ShopifyCartLine, attributes: Record<string, string>): CartLine["kind"] {
  if (attributes[CART_ATTRIBUTE.kind] === "gift_set") return "gift_set";
  if (attributes[CART_ATTRIBUTE.kind] === "caviar") return "caviar";

  const productType = line.merchandise.product.productType.toLowerCase();
  return productType.includes("gift") || productType.includes("coffret") ? "gift_set" : "caviar";
}

function mapGiftMessage(attributes: Record<string, string>): CartGiftMessage | null {
  const kind = attributes[CART_ATTRIBUTE.giftMessageKind];
  if (kind === "blank") return { kind: "blank" };
  if (kind === "personal") {
    return { kind: "personal", text: attributes[CART_ATTRIBUTE.giftMessage] ?? "" };
  }
  return null;
}

function resolveVariantLabel(line: ShopifyCartLine): string {
  return (
    line.merchandise.metafield?.value ||
    line.merchandise.selectedOptions[0]?.value ||
    line.merchandise.title
  );
}

export function mapShopifyCartLine(line: ShopifyCartLine): CartLine {
  const attributes = attributesToRecord(line.attributes);
  const kind = resolveKind(line, attributes);

  return {
    id: line.id,
    merchandiseId: line.merchandise.id,
    productId: line.merchandise.product.id,
    kind,
    image: line.merchandise.image,
    quantity: line.quantity,
    quantityAvailable: line.merchandise.quantityAvailable,
    quantityEditable: kind === "caviar",
    supportsGiftMessage: kind === "gift_set",
    title: line.merchandise.product.title,
    weight: resolveVariantLabel(line),
    unitPrice: line.cost.amountPerQuantity,
    subtotal: line.cost.subtotalAmount,
    giftMessage: kind === "gift_set" ? mapGiftMessage(attributes) : null,
    unitId: kind === "gift_set" ? attributes[CART_ATTRIBUTE.unitId] ?? null : null,
  };
}

function mapWarnings(warnings: ShopifyCartWarning[]): CartWarning[] {
  return warnings.map((warning) => ({ code: warning.code }));
}

export function mapShopifyCart(
  cart: ShopifyCart,
  countryCode: SupportedCountry,
  warnings: ShopifyCartWarning[] = [],
): CartSnapshot {
  const entries: CartEntry[] = [];
  const giftGroupIndexes = new Map<string, number>();

  for (const rawLine of cart.lines.nodes) {
    const line = mapShopifyCartLine(rawLine);
    if (line.kind === "caviar") {
      entries.push({ kind: "line", line });
      continue;
    }

    const existingIndex = giftGroupIndexes.get(line.productId);
    if (existingIndex !== undefined) {
      const entry = entries[existingIndex];
      if (entry?.kind === "group") entry.group.lines.push(line);
      continue;
    }

    const index = entries.length;
    giftGroupIndexes.set(line.productId, index);
    entries.push({
      kind: "group",
      group: {
        id: line.productId,
        title: line.title,
        addHref: ROUTES.PRODUCT_DETAIL(
          CatalogCollectionHandle.GIFT_SET,
          rawLine.merchandise.product.handle,
        ),
        lines: [line],
      },
    });
  }

  return {
    entries,
    itemCount: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    countryCode,
    warnings: mapWarnings(warnings),
  };
}
