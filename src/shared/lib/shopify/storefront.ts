import "server-only";

import {
  createShopifyRequestContext,
  createStorefrontClient,
  type AnyStorefrontQueryString,
} from "@shopify/hydrogen";

import { getBuyerIp } from "@/shared/lib/request/buyer-ip";
import { getShopifyMarket, type I18nBase } from "./config";
import { resolveStorefrontConfig } from "./storefront-config";

const STOREFRONT_API_VERSION = "2026-04";

type GraphqlError = { message: string };
type QueryOptions = { variables?: Record<string, unknown> };
export type StorefrontClient = {
  query<T extends object>(
    document: string,
    options?: QueryOptions,
  ): Promise<T & { errors?: GraphqlError[] }>;
};

function createStorefrontClientForRequest({
  privateStorefrontToken,
  storeDomain,
  market,
  request,
  type = "private_no_buyer_context",
}: {
  privateStorefrontToken: string;
  storeDomain: string;
  market: I18nBase;
  request: Request | { headers: Headers };
  type?: "private" | "private_no_buyer_context";
}): StorefrontClient {
  const buyerIp = request instanceof Request ? getBuyerIp(request) : undefined;
  const requestContext = createShopifyRequestContext({
    request,
    i18n: { language: market.language, country: market.country },
    ...(buyerIp ? { buyerIp } : {}),
  });

  const client = createStorefrontClient({
    type,
    requestContext,
    config: {
      storeDomain,
      privateStorefrontToken,
      apiVersion: STOREFRONT_API_VERSION,
    },
  });

  return {
    async query<T extends object>(document: string, options: QueryOptions = {}) {
      let result;
      try {
        result = await client.graphql(document as AnyStorefrontQueryString, {
          variables: options.variables,
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`[shopify] Storefront request failed: ${error.message}`, {
            cause: error,
          });
        }
        throw error;
      }

      const data = (result.data ?? ({} as T)) as T;
      if (result.errors?.length) {
        return Object.assign(data, {
          errors: result.errors.map(({ message }) => ({ message })),
        }) as T & { errors?: GraphqlError[] };
      }
      return data as T & { errors?: GraphqlError[] };
    },
  };
}

const catalogClients = new Map<string, StorefrontClient>();

/** Public catalog client without request-time APIs, safe inside cached functions. */
export function getCatalogStorefrontClient(locale: string): StorefrontClient {
  const market = getShopifyMarket(locale);
  const cacheKey = `${market.country}:${market.language}`;
  const existingClient = catalogClients.get(cacheKey);
  if (existingClient) return existingClient;

  const config = resolveStorefrontConfig();
  const client = createStorefrontClientForRequest({
    privateStorefrontToken: config.privateStorefrontToken,
    storeDomain: config.storeDomain,
    market,
    request: { headers: new Headers() },
    type: "private_no_buyer_context",
  });
  catalogClients.set(cacheKey, client);
  return client;
}

/** Request-scoped client for buyer cart operations; never use it in cached catalog paths. */
export function getBuyerStorefrontClient(locale: string, request: Request): StorefrontClient {
  const market = getShopifyMarket(locale);
  const config = resolveStorefrontConfig();
  return createStorefrontClientForRequest({
    privateStorefrontToken: config.privateStorefrontToken,
    storeDomain: config.storeDomain,
    market,
    request,
    type: "private",
  });
}
