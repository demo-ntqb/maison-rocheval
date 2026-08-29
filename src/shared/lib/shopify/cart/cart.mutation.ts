export const CART_CREATE = `#graphql
  mutation MaisonCartCreate($input: CartInput!, $first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    cartCreate(input: $input) {
      cart {
        id totalQuantity checkoutUrl buyerIdentity { countryCode }
        cost { subtotalAmount { amount currencyCode } }
        lines(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id quantity attributes { key value }
            cost { amountPerQuantity { amount currencyCode } subtotalAmount { amount currencyCode } }
            merchandise { ... on ProductVariant {
              id title availableForSale quantityAvailable selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            } }
          }
        }
      }
      userErrors { code field message }
      warnings { code target message }
    }
  }
` as const;

export const CART_LINES_ADD = `#graphql
  mutation MaisonCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id totalQuantity checkoutUrl buyerIdentity { countryCode }
        cost { subtotalAmount { amount currencyCode } }
        lines(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id quantity attributes { key value }
            cost { amountPerQuantity { amount currencyCode } subtotalAmount { amount currencyCode } }
            merchandise { ... on ProductVariant {
              id title availableForSale quantityAvailable selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            } }
          }
        }
      }
      userErrors { code field message }
      warnings { code target message }
    }
  }
` as const;

export const CART_LINES_UPDATE = `#graphql
  mutation MaisonCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id totalQuantity checkoutUrl buyerIdentity { countryCode }
        cost { subtotalAmount { amount currencyCode } }
        lines(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id quantity attributes { key value }
            cost { amountPerQuantity { amount currencyCode } subtotalAmount { amount currencyCode } }
            merchandise { ... on ProductVariant {
              id title availableForSale quantityAvailable selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            } }
          }
        }
      }
      userErrors { code field message }
      warnings { code target message }
    }
  }
` as const;

export const CART_LINES_REMOVE = `#graphql
  mutation MaisonCartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id totalQuantity checkoutUrl buyerIdentity { countryCode }
        cost { subtotalAmount { amount currencyCode } }
        lines(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id quantity attributes { key value }
            cost { amountPerQuantity { amount currencyCode } subtotalAmount { amount currencyCode } }
            merchandise { ... on ProductVariant {
              id title availableForSale quantityAvailable selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            } }
          }
        }
      }
      userErrors { code field message }
      warnings { code target message }
    }
  }
` as const;

export const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation MaisonCartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!, $first: Int!, $after: String, $language: LanguageCode)
  @inContext(language: $language) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id totalQuantity checkoutUrl buyerIdentity { countryCode }
        cost { subtotalAmount { amount currencyCode } }
        lines(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id quantity attributes { key value }
            cost { amountPerQuantity { amount currencyCode } subtotalAmount { amount currencyCode } }
            merchandise { ... on ProductVariant {
              id title availableForSale quantityAvailable selectedOptions { name value }
              metafield(namespace: "custom", key: "title") { value }
              image { url altText width height }
              product { id handle title productType }
            } }
          }
        }
      }
      userErrors { code field message }
      warnings { code target message }
    }
  }
` as const;
