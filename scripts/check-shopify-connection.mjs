import path from "node:path";
import { fileURLToPath } from "node:url";

import { createStorefrontClient } from "@shopify/hydrogen";
import nextEnv from "@next/env";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(PROJECT_ROOT);

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

const { storefront } = createStorefrontClient({
  storeDomain,
  privateStorefrontToken: token,
  i18n: { country: "FR", language: "EN" },
});

const result = await storefront.query(
  `#graphql
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
  `,
  { variables: { country: "FR", language: "EN" } },
);

if (result.errors?.length) {
  throw new Error(result.errors.map((error) => error.message).join("; "));
}

console.log(
  [
    `Connected to Shopify storefront: ${result.shop.name} (${result.shop.primaryDomain.url})`,
    `Catalog access: ${result.products.nodes.length} product sample, ${result.collections.nodes.length} collection sample`,
  ].join("\n"),
);
