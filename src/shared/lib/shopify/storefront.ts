import "server-only";

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
  const endpoint = `https://${storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

  return {
    async query<T extends object>(document: string, options: QueryOptions = {}) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Shopify-Storefront-Private-Token": privateStorefrontToken,
        },
        body: JSON.stringify({ query: document, variables: options.variables ?? {} }),
      });

      const payload = (await response.json()) as {
        data?: T;
        errors?: GraphqlError[];
      };

      if (!response.ok && !payload.errors?.length) {
        throw new Error(`[shopify] Storefront request failed with status ${response.status}.`);
      }

      return Object.assign(payload.data ?? ({} as T), { errors: payload.errors });
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

