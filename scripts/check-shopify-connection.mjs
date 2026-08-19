import path from "node:path";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";
import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(PROJECT_ROOT);

const STOREFRONT_API_VERSION = "2026-04";

const privateStorefrontToken = process.env.PRIVATE_STOREFRONT_API_TOKEN?.trim();
const storeDomain = privateStorefrontToken
  ? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim()
  : "mock.shop";
const token = privateStorefrontToken || "mock-private-token";

if (!storeDomain) {
  throw new Error(
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is required when PRIVATE_STOREFRONT_API_TOKEN is set.",
  );
}

const storefront = createStorefrontClient({
  type: "private_no_buyer_context",
  requestContext: createShopifyRequestContext({
    request: { headers: new Headers() },
    i18n: { language: "EN", country: "FR" },
  }),
  config: {
    storeDomain,
    privateStorefrontToken: token,
    apiVersion: STOREFRONT_API_VERSION,
  },
});

const result = await storefront.graphql(`#graphql
  query StorefrontConnectionCheck($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      name
      primaryDomain {
        url
      }
    }
    products(first: 1) {
      nodes {
        id
      }
    }
    collections(first: 1) {
      nodes {
        id
      }
    }
  }
`);

if (result.errors?.length) {
  throw new Error(result.errors.map((error) => error.message).join("; "));
}

console.log(
  [
    `Connected to Shopify storefront: ${result.data.shop.name} (${result.data.shop.primaryDomain.url})`,
    `Catalog access: ${result.data.products.nodes.length} product sample, ${result.data.collections.nodes.length} collection sample`,
  ].join("\n"),
);