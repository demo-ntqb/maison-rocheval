import "server-only";

import { cacheLife, cacheTag } from "next/cache";

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
import type {
  CatalogHandlesQuery,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogProductProfile,
  CollectionProductsQuery,
  ProductDetailQuery,
  StorefrontResult,
} from "./catalog.type";

function assertSuccessful(result: StorefrontResult, operation: string): void {
  if (!result.errors?.length) return;
  const details = result.errors.map((error) => error.message).join("; ");
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
  return mapProductDetail(result.product, result.presentationOptions.nodes, result.presentationBox);
}

const DEFAULT_CATALOG_HANDLES = [
  "amour",
  "kaluga",
  "russian-hybrid",
  "lexpression",
  "harmonie",
];

/**
 * Cached lookup of catalog handles. Only real data (or a transient error) is
 * ever cached — the fallback list lives in the uncached wrapper below, so a
 * Shopify outage never pins stale handles for the whole cacheLife window.
 */
async function fetchCatalogHandles(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("shopify-products", "shopify-collections", "shopify-collection-our-caviar");
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

export async function getCatalogHandles(): Promise<string[]> {
  try {
    return await fetchCatalogHandles();
  } catch (error) {
    console.warn("[shopify] Failed to fetch catalog handles, using fallback:", error);
    return DEFAULT_CATALOG_HANDLES;
  }
}

