import "server-only";

import {
  createShopifyRequestContext,
  createStorefrontClient,
  type AnyStorefrontQueryString,
} from "@shopify/hydrogen";

import { getShopifyMarket, type I18nBase } from "./config";
import { resolveStorefrontConfig } from "./storefront-config";

const STOREFRONT_API_VERSION = "2026-04";

type GraphqlError = { message: string };
type QueryOptions = { variables?: Record<string, unknown> };
type StorefrontClient = {
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
  const client =
    type === "private"
      ? createStorefrontClient({
          type: "private",
          requestContext: createShopifyRequestContext({
            request,
            i18n: { language: market.language, country: market.country },
            buyerIp:
              ("headers" in request &&
                (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                  request.headers.get("x-real-ip"))) ||
              "127.0.0.1",
          }),
          config: {
            storeDomain,
            privateStorefrontToken,
            apiVersion: STOREFRONT_API_VERSION,
          },
        })
      : createStorefrontClient({
          type: "private_no_buyer_context",
          requestContext: createShopifyRequestContext({
            request,
            i18n: { language: market.language, country: market.country },
          }),
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

/** Request-scoped client for buyer cart mutations; never use it in cached catalog paths. */
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
