import type {
  CatalogImage,
  StorefrontMetafield,
  StorefrontProduct,
} from "../../../types/catalog.type";

export function metafieldsByKey(product: StorefrontProduct): Map<string, StorefrontMetafield> {
  return new Map(
    product.metafields.flatMap((field) => (field ? [[field.key, field] as const] : [])),
  );
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
