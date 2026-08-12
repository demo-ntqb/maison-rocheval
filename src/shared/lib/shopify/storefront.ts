import "server-only";

import { createStorefrontClient } from "@shopify/hydrogen";
import { headers } from "next/headers";
import { cache } from "react";

import { getBuyerIp } from "./buyer-ip";
import { getShopifyMarket } from "./config";
import { resolveStorefrontConfig } from "./storefront-config";

type StorefrontClient = ReturnType<typeof createStorefrontClient>["storefront"];

const catalogClients = new Map<string, StorefrontClient>();

/**
 * Module-scoped client for public catalog reads. It never reads request headers
 * or cookies, so cached Server Components remain statically renderable.
 */
export function getCatalogStorefrontClient(locale: string): StorefrontClient {
  const market = getShopifyMarket(locale);
  const cacheKey = `${market.country}:${market.language}`;
  const existingClient = catalogClients.get(cacheKey);
  if (existingClient) return existingClient;

  const { storeDomain, privateStorefrontToken } = resolveStorefrontConfig();
  const { storefront: client } = createStorefrontClient({
    storeDomain,
    privateStorefrontToken,
    i18n: market,
  });

  catalogClients.set(cacheKey, client);
  return client;
}

/**
 * Request-scoped client reserved for cart and account work. Calling it opts
 * only that caller into dynamic rendering and forwards Shopify's required
 * buyer IP; do not call it from the root layout or cached catalog functions.
 */
export const getBuyerStorefrontClient = cache(async (locale: string): Promise<StorefrontClient> => {
  const requestHeaders = await headers();
  const { storeDomain, privateStorefrontToken } = resolveStorefrontConfig();
  const { storefront } = createStorefrontClient({
    storeDomain,
    privateStorefrontToken,
    i18n: getShopifyMarket(locale),
    storefrontHeaders: {
      buyerIp: getBuyerIp(requestHeaders),
      buyerIpSig: null,
      cookie: requestHeaders.get("cookie"),
      purpose: requestHeaders.get("sec-purpose") ?? requestHeaders.get("purpose"),
      requestGroupId: requestHeaders.get("x-request-id"),
    },
  });

  return storefront;
});
