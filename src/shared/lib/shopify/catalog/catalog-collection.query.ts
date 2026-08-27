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

export const COLLECTION_PRODUCT_PROFILES_QUERY = `#graphql
  query CatalogCollectionProfiles(
    $handle: String!
    $productCount: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $productCount, sortKey: CREATED, reverse: false) {
        nodes {
          id
          handle
          title
          productType
          availableForSale
          descriptionHtml
          featuredImage { url altText width height }
          images(first: 10) { nodes { url altText width height } }
          priceRange { minVariantPrice { amount currencyCode } }
          metafields(identifiers: [
            { namespace: "custom", key: "subtitle" }
            { namespace: "custom", key: "notes" }
            { namespace: "custom", key: "short_description" }
            { namespace: "custom", key: "product_info" }
            { namespace: "custom", key: "serving" }
            { namespace: "custom", key: "delivery" }
            { namespace: "custom", key: "gifting" }
          ]) {
            key
            type
            value
          }
        }
      }
    }
  }
` as const;
