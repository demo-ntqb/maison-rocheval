import type {
  CatalogImage,
  StorefrontMetafield,
  StorefrontMetaobject,
  StorefrontProduct,
} from "./catalog.type.ts";

export function metafieldsByKey(product: StorefrontProduct): Map<string, StorefrontMetafield> {
  return new Map(
    product.metafields.flatMap((field) => (field ? [[field.key, field] as const] : [])),
  );
}

export function metaobjectFields(reference?: StorefrontMetaobject | null): Map<string, string> {
  return new Map(reference?.fields.map(({ key, value }) => [key, value]) ?? []);
}

export function parseStringList(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function richTextNodeValue(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const record = node as { children?: unknown[]; value?: unknown };
  if (typeof record.value === "string") return record.value;
  return record.children?.map(richTextNodeValue).filter(Boolean).join(" ") ?? "";
}

export function richTextToPlainText(value?: string): string {
  if (!value) return "";
  try {
    return richTextNodeValue(JSON.parse(value)).replace(/\s+/gu, " ").trim();
  } catch {
    return value;
  }
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
}

export function mapImage(
  image: StorefrontProduct["featuredImage"],
  fallbackAlt: string,
): CatalogImage | null {
  if (!image) return null;
  return {
    altText: image.altText || fallbackAlt,
    height: image.height ?? 1200,
    url: image.url,
    width: image.width ?? 1200,
  };
}
