import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type {
  CatalogHandlesQuery,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogProductProfile,
  CollectionProductsQuery,
  ProductDetailQuery,
  StorefrontResult,
} from "../../../types/catalog.type";
import { getShopifyMarket } from "../config";
import { getCatalogStorefrontClient } from "../storefront";
import {
  mapCollectionProductProfiles,
  mapCollectionProducts,
  mapProductDetail,
} from "./catalog.mapper";
import {
  CATALOG_HANDLES_QUERY,
  COLLECTION_PRODUCT_PROFILES_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_DETAIL_QUERY,
} from "./catalog.query";

function assertSuccessful(result: StorefrontResult, operation: string): void {
  if (!result.errors?.length) return;
  const realErrors = result.errors.filter(
    (error) =>
      !error.message.includes("quantityAvailable") &&
      !error.message.includes("unauthenticated_read_product_inventory"),
  );
  if (realErrors.length === 0) return;
  const details = realErrors.map((error) => error.message).join("; ");
  throw new Error(`[shopify] ${operation} query failed: ${details}`);
}

function collectionVariables(locale: string, handle: string, productCount: number) {
  const market = getShopifyMarket(locale);
  return { country: market.country, handle, language: market.language, productCount };
}

function tagCollection(locale: string, handle: string): void {
  cacheTag(
    "shopify-products",
    "shopify-collections",
    `shopify-collection-${handle}`,
    `shopify-market-${locale}`,
  );
}

export async function getCollectionProducts(
  locale: string,
  handle: string,
  productCount = 50,
): Promise<CatalogProductCard[]> {
  "use cache";
  cacheLife("minutes");
  tagCollection(locale, handle);
  const result = await getCatalogStorefrontClient(locale).query<CollectionProductsQuery>(
    COLLECTION_PRODUCTS_QUERY,
    { variables: collectionVariables(locale, handle, productCount) },
  );
  assertSuccessful(result, "CatalogCollection");
  return mapCollectionProducts(result.collection?.products.nodes ?? []);
}

export async function getCollectionProductProfiles(
  locale: string,
  handle: string,
  productCount = 50,
): Promise<CatalogProductProfile[]> {
  "use cache";
  cacheLife("minutes");
  tagCollection(locale, handle);
  const result = await getCatalogStorefrontClient(locale).query<CollectionProductsQuery>(
    COLLECTION_PRODUCT_PROFILES_QUERY,
    { variables: collectionVariables(locale, handle, productCount) },
  );
  assertSuccessful(result, "CatalogCollectionProfiles");
  return mapCollectionProductProfiles(result.collection?.products.nodes ?? []);
}

export async function getProductDetail(
  locale: string,
  handle: string,
): Promise<CatalogProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("shopify-products", "shopify-metaobjects", `shopify-product-${handle}`, `shopify-market-${locale}`);
  const market = getShopifyMarket(locale);
  const result = await getCatalogStorefrontClient(locale).query<ProductDetailQuery>(
    PRODUCT_DETAIL_QUERY,
    { variables: { country: market.country, handle, language: market.language } },
  );
  
  assertSuccessful(result, "CatalogProductDetail");
  if (!result.product) return null;
  return mapProductDetail(result.product);
}

/**
 * Cached lookup of catalog handles.
 */
export async function getCatalogHandles(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("shopify-products", "shopify-collections", "shopify-collection-caviar");
  const market = getShopifyMarket("en");
  const result = await getCatalogStorefrontClient("en").query<CatalogHandlesQuery>(
    CATALOG_HANDLES_QUERY,
    { variables: { country: market.country, language: market.language } },
  );
  assertSuccessful(result, "CatalogHandles");
  const handles = result.collection?.products.nodes.map(({ handle }) => handle) ?? [];
  if (handles.length === 0) {
    throw new Error("[shopify] Catalog handles query returned no products.");
  }
  return handles;
}

