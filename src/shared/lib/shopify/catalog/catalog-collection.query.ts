export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CatalogCollection(
    $handle: String!
    $productCount: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $productCount) {
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
    availableForSale
    descriptionHtml
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    metafields(identifiers: [
      { namespace: "rocheval", key: "short_description" }
      { namespace: "rocheval", key: "collection_line" }
      { namespace: "rocheval", key: "tasting_notes" }
      { namespace: "rocheval", key: "species_scientific_name" }
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
      products(first: $productCount) {
        nodes {
          id
          handle
          title
          availableForSale
          descriptionHtml
          featuredImage { url altText width height }
          images(first: 10) { nodes { url altText width height } }
          priceRange { minVariantPrice { amount currencyCode } }
          metafields(identifiers: [
            { namespace: "rocheval", key: "short_description" }
            { namespace: "rocheval", key: "collection_line" }
            { namespace: "rocheval", key: "tasting_notes" }
            { namespace: "rocheval", key: "species_scientific_name" }
            { namespace: "rocheval", key: "species_description" }
            { namespace: "rocheval", key: "species_image" }
            { namespace: "rocheval", key: "pearl_size" }
            { namespace: "rocheval", key: "salt_content" }
            { namespace: "rocheval", key: "pearl_colour" }
            { namespace: "rocheval", key: "serving" }
          ]) {
            key
            type
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
` as const;
