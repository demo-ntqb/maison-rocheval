export const CART_MERCHANDISE_QUERY = `#graphql
  query MaisonCartMerchandise($id: ID!) {
    node(id: $id) {
      __typename
      ... on ProductVariant {
        id
        requiresComponents
        product { productType }
      }
    }
  }
` as const;

export const CART_QUERY = `#graphql
  query MaisonCartQuery(
    $id: ID!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cart(id: $id) {
      id
      totalQuantity
      checkoutUrl
      buyerIdentity { countryCode }
      cost { subtotalAmount { amount currencyCode } }
      lines(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          quantity
          attributes { key value }
          cost {
            amountPerQuantity { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              requiresComponents
              availableForSale
              quantityAvailable
              selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            }
          }
        }
      }
    }
  }
` as const;
