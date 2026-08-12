import "server-only";

import { storefrontConfig } from "./config";
import { getOptionalPrivateStorefrontToken } from "./env";

export const MOCK_SHOP_DOMAIN = "mock.shop";
const MOCK_SHOP_PRIVATE_TOKEN = "mock-private-token";

export type ResolvedStorefrontConfig = {
  privateStorefrontToken: string;
  storeDomain: string;
};

let didWarnAboutMockShop = false;

/**
 * Resolve one server-only Storefront API configuration. The zero-secret
 * mock.shop fallback mirrors Shopify's Next.js Hydrogen starter and keeps CI
 * deterministic before a merchant store is connected.
 */
export function resolveStorefrontConfig(): ResolvedStorefrontConfig {
  const privateStorefrontToken = getOptionalPrivateStorefrontToken();

  if (!privateStorefrontToken) {
    if (!didWarnAboutMockShop && process.env.NODE_ENV !== "test") {
      didWarnAboutMockShop = true;
      console.warn(
        `[shopify] PRIVATE_STOREFRONT_API_TOKEN is not configured; using ${MOCK_SHOP_DOMAIN}.`,
      );
    }

    return {
      privateStorefrontToken: MOCK_SHOP_PRIVATE_TOKEN,
      storeDomain: MOCK_SHOP_DOMAIN,
    };
  }

  if (!storefrontConfig.storeDomain) {
    throw new Error(
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is required when PRIVATE_STOREFRONT_API_TOKEN is set.",
    );
  }

  return {
    privateStorefrontToken,
    storeDomain: storefrontConfig.storeDomain,
  };
}
