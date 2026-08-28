export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CatalogCollection(
    $handle: String!
    $productCount: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $productCount, sortKey: CREATED, reverse: false) {
        nodes {
          ...CollectionProductCard
        }
      }
    }
  }
  fragment CollectionProductCard on Product {
    id
    handle
    title
    productType
    availableForSale
    descriptionHtml
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    collections(first: 5) {
      nodes {
        handle
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "subtitle" }
      { namespace: "custom", key: "notes" }
      { namespace: "custom", key: "short_description" }
    ]) {
      key
      type
      value
    }
  }
` as const;

