import type {
  CatalogCaviarDetail,
  CatalogGiftSetDetail,
  CatalogImage,
  CatalogPackagingOption,
  CatalogProductBaseDetail,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogProductProfile,
  CatalogVariant,
  StorefrontPresentationOption,
  StorefrontProduct,
} from "../../../types/catalog.type";
import { CatalogProductType } from "../../../types/catalog.type";
import {
  mapImage,
  metafieldsByKey,
  metaobjectFields,
  parseStringList,
  stripHtml,
} from "./catalog-mapper.helper.ts";

function mapProductCard(product: StorefrontProduct): CatalogProductCard {
  const fields = metafieldsByKey(product);
  const notes = parseStringList(fields.get("notes")?.value);
  const productType = (product.productType || CatalogProductType.CAVIAR) as CatalogProductType;

  return {
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

export function mapCollectionProductProfiles(products: StorefrontProduct[]): CatalogProductProfile[] {
  return products.map(mapProductProfile);
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

  if (profile.productType === CatalogProductType.GIFT_SET) {
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
