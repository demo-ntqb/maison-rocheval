export const PRODUCT_DETAIL_QUERY = `#graphql
  query CatalogProductDetail(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      handle
      title
      productType
      availableForSale
      descriptionHtml
      featuredImage { url altText width height }
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { nodes { url altText width height } }
      variants(first: 20) {
        nodes {
          id
          title
          sku
          availableForSale
          quantityAvailable
          price { amount currencyCode }
          selectedOptions { name value }
          metafield(namespace: "custom", key: "title") {
            value
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "subtitle" }
        { namespace: "custom", key: "notes" }
        { namespace: "custom", key: "set_includes" }
        { namespace: "custom", key: "short_description" }
        { namespace: "custom", key: "product_info" }
        { namespace: "custom", key: "serving" }
        { namespace: "custom", key: "delivery" }
        { namespace: "custom", key: "gifting" }
        { namespace: "custom", key: "related_products" }
      ]) {
        key
        type
        value
        references(first: 10) {
          nodes {
            ... on Product { ...CatalogProductCard }
          }
        }
      }
    }
    presentationBox: product(handle: "presentation-box") {
      ...CatalogProductCard
      variants(first: 10) {
        nodes {
          id
          title
          sku
          availableForSale
          quantityAvailable
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
    presentationOptions: metaobjects(type: "presentation_option", first: 10) {
      nodes {
        type
        handle
        fields { key type value }
      }
    }
  }
  fragment CatalogProductCard on Product {
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
