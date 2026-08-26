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
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
      metafields(identifiers: [
        { namespace: "rocheval", key: "subtitle" }
        { namespace: "rocheval", key: "short_description" }
        { namespace: "rocheval", key: "collection_line" }
        { namespace: "rocheval", key: "tasting_notes" }
        { namespace: "rocheval", key: "species_scientific_name" }
        { namespace: "rocheval", key: "species_description" }
        { namespace: "rocheval", key: "species_image" }
        { namespace: "rocheval", key: "pearl_size" }
        { namespace: "rocheval", key: "salt_content" }
        { namespace: "rocheval", key: "pearl_colour" }
        { namespace: "rocheval", key: "ingredients" }
        { namespace: "rocheval", key: "nutrition" }
        { namespace: "rocheval", key: "storage" }
        { namespace: "rocheval", key: "serving" }
        { namespace: "rocheval", key: "shelf_life" }
        { namespace: "rocheval", key: "shipping" }
        { namespace: "rocheval", key: "duration" }
        { namespace: "rocheval", key: "box" }
        { namespace: "rocheval", key: "message" }
        { namespace: "rocheval", key: "add_ons" }
        { namespace: "rocheval", key: "related_products" }
      ]) {
        key
        type
        value
        references(first: 3) {
          nodes {
            ... on Product { ...CatalogProductCard }
          }
        }
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
    presentationBox: product(handle: "presentation-box") {
      ...CatalogProductCard
      variants(first: 10) {
        nodes {
          id
          title
          sku
          availableForSale
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
