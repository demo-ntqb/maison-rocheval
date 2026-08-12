import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { getShopifyMarket } from "./config";
import { getCatalogStorefrontClient } from "./storefront";

const FEATURED_CATALOG_QUERY = `#graphql
  query FeaturedCatalog(
    $productCount: Int!
    $collectionCount: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $productCount, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        vendor
        availableForSale
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
    collections(first: $collectionCount) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;

type Money = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  altText: string | null;
  height: number | null;
  url: string;
  width: number | null;
};

export type ShopifyProductCard = {
  availableForSale: boolean;
  compareAtPriceRange: { minVariantPrice: Money };
  featuredImage: ShopifyImage | null;
  handle: string;
  id: string;
  priceRange: { maxVariantPrice: Money; minVariantPrice: Money };
  title: string;
  vendor: string;
};

export type ShopifyCollectionCard = {
  description: string;
  handle: string;
  id: string;
  image: ShopifyImage | null;
  title: string;
};

type FeaturedCatalogQuery = {
  collections: { nodes: ShopifyCollectionCard[] };
  products: { nodes: ShopifyProductCard[] };
};

export type FeaturedCatalog = {
  collections: ShopifyCollectionCard[];
  products: ShopifyProductCard[];
};

/**
 * Typed and locale-aware catalog read for home/landing screens. Cache tags are
 * ready for a Shopify webhook route to invalidate in the cart/catalog phase.
 */
export async function getFeaturedCatalog(
  locale: string,
  options: { collectionCount?: number; productCount?: number } = {},
): Promise<FeaturedCatalog> {
  "use cache";

  cacheLife("minutes");
  cacheTag("shopify-products", "shopify-collections", `shopify-market-${locale}`);

  const market = getShopifyMarket(locale);
  const storefront = getCatalogStorefrontClient(locale);
  const result = await storefront.query<FeaturedCatalogQuery>(FEATURED_CATALOG_QUERY, {
    variables: {
      collectionCount: options.collectionCount ?? 3,
      productCount: options.productCount ?? 8,
      country: market.country,
      language: market.language,
    },
  });

  if (result.errors?.length) {
    const details = result.errors.map((error) => error.message).join("; ");
    throw new Error(`[shopify] FeaturedCatalog query failed: ${details}`);
  }

  return {
    collections: result.collections.nodes,
    products: result.products.nodes,
  };
}
