import type {
  CatalogCaviarDetail,
  CatalogGiftSetDetail,
  CatalogImage,
  CatalogProductBaseDetail,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogProductProfile,
  CatalogVariant,
  StorefrontProduct,
} from "../../../types/catalog.type";
import { CatalogCollectionHandle, CatalogProductType } from "../../../types/catalog.type";
import {
  mapImage,
  metafieldsByKey,
  parseStringList,
  stripHtml,
} from "./catalog-mapper.helper.ts";

/**
 * Resolves the stable product category ("caviar" or "gift-set")
 * regardless of whether Shopify localized the productType string (e.g. "Gift Set" vs "Coffret Cadeau").
 */
export function resolveProductCategory(
  product: StorefrontProduct | { handle?: string; productType?: string; collections?: { nodes?: Array<{ handle?: string }> } },
): CatalogCollectionHandle.CAVIAR | CatalogCollectionHandle.GIFT_SET {
  // 1. Check collection handles from GraphQL response
  const collectionHandles = product.collections?.nodes?.map((c) => c.handle?.toLowerCase()) ?? [];
  if (collectionHandles.includes(CatalogCollectionHandle.GIFT_SET)) {
    return CatalogCollectionHandle.GIFT_SET;
  }
  if (collectionHandles.includes(CatalogCollectionHandle.CAVIAR)) {
    return CatalogCollectionHandle.CAVIAR;
  }

  // 2. Fallback based on productType (supports English, French, and common variants)
  const rawType = product.productType?.toLowerCase().trim() ?? "";
  if (
    rawType === "gift set" ||
    rawType === "gift-set" ||
    rawType === "coffret cadeau" ||
    rawType === "coffret" ||
    rawType.includes("gift") ||
    rawType.includes("coffret")
  ) {
    return CatalogCollectionHandle.GIFT_SET;
  }

  return CatalogCollectionHandle.CAVIAR;
}

function mapProductCard(product: StorefrontProduct): CatalogProductCard {
  const fields = metafieldsByKey(product);
  const notes = parseStringList(fields.get("notes")?.value);
  const category = resolveProductCategory(product);
  const isGiftSet = category === CatalogCollectionHandle.GIFT_SET;
  const productType = isGiftSet ? CatalogProductType.GIFT_SET : CatalogProductType.CAVIAR;

  return {
    category,
    productType,
    availableForSale: product.availableForSale,
    description: stripHtml(product.descriptionHtml),
    short_description: fields.get("short_description")?.value || "",
    handle: product.handle,
    id: product.id,
    image: mapImage(product.featuredImage, product.title),
    notes: notes.length ? notes.join(" · ") : "",
    price: product.priceRange.minVariantPrice,
    subtitle: fields.get("subtitle")?.value || "",
    title: product.title,
  };
}

export function mapCollectionProducts(products: StorefrontProduct[]): CatalogProductCard[] {
  return products.map(mapProductCard);
}

function mapGalleryImages(product: StorefrontProduct, fallback: CatalogImage | null): CatalogImage[] {
  const galleryImages = (product.images?.nodes ?? []).map((entry) => ({
    altText: entry.altText || product.title,
    height: entry.height ?? 1200,
    url: entry.url,
    width: entry.width ?? 1200,
  }));
  return galleryImages.length > 0 ? galleryImages : fallback ? [fallback] : [];
}

function mapProductProfile(product: StorefrontProduct): CatalogProductProfile {
  const card = mapProductCard(product);

  return {
    ...card,
    galleryImages: mapGalleryImages(product, card.image),
  };
}

function mapVariants(product: StorefrontProduct): CatalogVariant[] {
  return (product.variants?.nodes ?? []).map((variant) => ({
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? null,
    id: variant.id,
    optionValue: variant.metafield?.value || variant.selectedOptions[0]?.value || variant.title,
    price: variant.price,
    sku: variant.sku || "",
  }));
}

export function mapProductDetail(
  product: StorefrontProduct,
): CatalogProductDetail {
  const profile = mapProductProfile(product);
  const fields = metafieldsByKey(product);
  const baseDetail: CatalogProductBaseDetail = {
    ...profile,
    descriptionHtml: product.descriptionHtml,
    productRichText: fields.get("product_info")?.value || "",
    servingRichText: fields.get("serving")?.value || "",
    deliveryRichText: fields.get("delivery")?.value || "",
    giftingRichText: fields.get("gifting")?.value || "",
    packagingOptions: [],
    relatedProducts: mapCollectionProducts(fields.get("related_products")?.references?.nodes ?? []),
    variants: mapVariants(product),
    composition: parseStringList(fields.get("set_includes")?.value),
  };

  if (profile.category === CatalogCollectionHandle.GIFT_SET || profile.productType === CatalogProductType.GIFT_SET) {
    return {
      ...baseDetail,
      productType: CatalogProductType.GIFT_SET,
      setIncludes: fields.get("set_includes")?.value || undefined,
    } as CatalogGiftSetDetail;
  }

  return {
    ...baseDetail,
    productType: CatalogProductType.CAVIAR,
  } as CatalogCaviarDetail;
}
