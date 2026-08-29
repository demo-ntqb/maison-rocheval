export const MAISON_CART_FRAGMENT = `
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
` as const;
