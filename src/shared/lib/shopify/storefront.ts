import "server-only";

import {
  createShopifyRequestContext,
  createStorefrontClient,
  type AnyStorefrontQueryString,
} from "@shopify/hydrogen";

import { getShopifyMarket } from "./config";
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

function createCatalogClient({
  privateStorefrontToken,
  storeDomain,
}: {
  privateStorefrontToken: string;
  storeDomain: string;
}): StorefrontClient {
  const client = createStorefrontClient({
    type: "private_no_buyer_context",
    requestContext: createShopifyRequestContext({
      // Static catalog client: no request-scoped state, so a synthetic request
      // keeps the cache owner Next.js (never calls headers()/cookies() here).
      request: { headers: new Headers() },
      i18n: { language: "EN", country: "FR" },
    }),
    config: {
      storeDomain,
      privateStorefrontToken,
      apiVersion: STOREFRONT_API_VERSION,
      // Caching lives at the `use cache` boundary — never pass a cache here.
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
  const client = createCatalogClient(config);
  catalogClients.set(cacheKey, client);
  return client;
}
