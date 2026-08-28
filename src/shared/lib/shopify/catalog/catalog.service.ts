import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type {
  CatalogProductCard,
  CatalogProductDetail,
  CollectionProductsQuery,
  ProductDetailQuery,
  StorefrontResult,
} from "../../../types/catalog.type";
import { getShopifyMarket } from "../config";
import { getAvailableCommerceContext } from "../localization";
import { getCatalogStorefrontClient } from "../storefront";
import {
  mapCollectionProducts,
  mapProductDetail,
} from "./catalog.mapper";
import {
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

async function isPublishedMarket(locale: string): Promise<boolean> {
  return Boolean(await getAvailableCommerceContext(locale));
}

function tagCollection(locale: string, handle: string): void {
  cacheTag(
    "shopify-products",
    "shopify-collections",
    "shopify-market-context",
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
  if (!(await isPublishedMarket(locale))) return [];
  const result = await getCatalogStorefrontClient(locale).query<CollectionProductsQuery>(
    COLLECTION_PRODUCTS_QUERY,
    { variables: collectionVariables(locale, handle, productCount) },
  );
  assertSuccessful(result, "CatalogCollection");
  return mapCollectionProducts(result.collection?.products.nodes ?? []);
}


export async function getProductDetail(
  locale: string,
  handle: string,
): Promise<CatalogProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(
    "shopify-products",
    "shopify-metaobjects",
    "shopify-market-context",
    `shopify-product-${handle}`,
    `shopify-market-${locale}`,
  );
  if (!(await isPublishedMarket(locale))) return null;
  const market = getShopifyMarket(locale);
  const result = await getCatalogStorefrontClient(locale).query<ProductDetailQuery>(
    PRODUCT_DETAIL_QUERY,
    { variables: { country: market.country, handle, language: market.language } },
  );
  
  assertSuccessful(result, "CatalogProductDetail");
  if (!result.product) return null;
  return mapProductDetail(result.product);
}

