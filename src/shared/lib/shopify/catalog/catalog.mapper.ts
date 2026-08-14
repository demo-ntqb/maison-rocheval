import {
  mapImage,
  metafieldsByKey,
  metaobjectFields,
  parseStringList,
  richTextToPlainText,
  stripHtml,
} from "./catalog-mapper.helper.ts";
import type {
  CatalogImage,
  CatalogPackagingOption,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogProductProfile,
  CatalogVariant,
  StorefrontPresentationOption,
  StorefrontProduct,
} from "./catalog.type.ts";

function mapProductCard(product: StorefrontProduct): CatalogProductCard {
  const fields = metafieldsByKey(product);
  const tastingNotes = parseStringList(fields.get("tasting_notes")?.value);
  return {
    availableForSale: product.availableForSale,
    description: fields.get("short_description")?.value || stripHtml(product.descriptionHtml),
    eyebrow: fields.get("collection_line")?.value || "",
    handle: product.handle,
    id: product.id,
    image: mapImage(product.featuredImage, product.title),
    price: product.priceRange.minVariantPrice,
    profile: tastingNotes.join(" · "),
    species: fields.get("species_scientific_name")?.value || "",
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
  const fields = metafieldsByKey(product);
  return {
    ...card,
    galleryImages: mapGalleryImages(product, card.image),
    serving: richTextToPlainText(fields.get("serving")?.value),
    speciesDescription: richTextToPlainText(fields.get("species_description")?.value) || card.description,
    specs: {
      color: fields.get("pearl_colour")?.value || "",
      pearlSize: fields.get("pearl_size")?.value || "",
      salt: fields.get("salt_content")?.value || "",
      tastingNotes: parseStringList(fields.get("tasting_notes")?.value).join(" · "),
    },
  };
}

export function mapCollectionProductProfiles(products: StorefrontProduct[]): CatalogProductProfile[] {
  return products.map(mapProductProfile);
}

function mapVariants(product: StorefrontProduct): CatalogVariant[] {
  return (product.variants?.nodes ?? []).map((variant) => ({
    availableForSale: variant.availableForSale,
    id: variant.id,
    optionValue: variant.selectedOptions[0]?.value || variant.title,
    price: variant.price,
    sku: variant.sku || "",
  }));
}

function emptyPresentationBox(): StorefrontProduct {
  return {
    availableForSale: false,
    descriptionHtml: "",
    featuredImage: null,
    handle: "presentation-box",
    id: "",
    metafields: [],
    priceRange: { minVariantPrice: { amount: "0", currencyCode: "EUR" } },
    title: "Presentation Box",
  };
}

function mapPackagingOption(
  entry: StorefrontPresentationOption,
  variantsByName: Map<string, CatalogVariant>,
): CatalogPackagingOption {
  const fields = metaobjectFields(entry);
  const name = fields.get("name") || entry.handle;
  const variant = variantsByName.get(name.toLowerCase()) ?? variantsByName.get(entry.handle.toLowerCase());
  return {
    availableForSale: variant?.availableForSale ?? entry.handle === "standard",
    description: fields.get("description") || "",
    id: entry.handle,
    name,
    personalizedMessage: fields.get("personalized_message") === "true",
    priceModifier: Number(fields.get("price") || variant?.price.amount || 0),
    variantId: variant?.id ?? null,
  };
}

function mapPackagingOptions(entries: StorefrontPresentationOption[], box: StorefrontProduct | null) {
  const variants = mapVariants(box ?? emptyPresentationBox());
  const variantsByName = new Map(variants.map((variant) => [variant.optionValue.toLowerCase(), variant]));
  return entries.map((entry) => mapPackagingOption(entry, variantsByName));
}

export function mapProductDetail(
  product: StorefrontProduct,
  presentationOptions: StorefrontPresentationOption[],
  presentationBox: StorefrontProduct | null,
): CatalogProductDetail {
  const profile = mapProductProfile(product);
  const fields = metafieldsByKey(product);
  return {
    ...profile,
    descriptionHtml: product.descriptionHtml,
    packagingOptions: mapPackagingOptions(presentationOptions, presentationBox),
    relatedProducts: mapCollectionProducts(fields.get("related_products")?.references?.nodes ?? []),
    specs: {
      ...profile.specs,
      ingredients: fields.get("ingredients")?.value || "",
      nutritionalData: richTextToPlainText(fields.get("nutrition")?.value),
    },
    specsDescription: profile.speciesDescription,
    storage: richTextToPlainText(fields.get("storage")?.value),
    shelfLife: fields.get("shelf_life")?.value || "",
    variants: mapVariants(product),
  };
}
