import { MAISON_CART_FRAGMENT } from "./cart.fragment";

const PAYLOAD_FIELDS = `
  cart { ...MaisonCart }
  userErrors { code field message }
  warnings { code target message }
`;

export const CART_CREATE = `#graphql
  mutation MaisonCartCreate(
    $input: CartInput!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartCreate(input: $input) { ${PAYLOAD_FIELDS} }
  }
  ${MAISON_CART_FRAGMENT}
` as const;

export const CART_LINES_ADD = `#graphql
  mutation MaisonCartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { ${PAYLOAD_FIELDS} }
  }
  ${MAISON_CART_FRAGMENT}
` as const;

export const CART_LINES_UPDATE = `#graphql
  mutation MaisonCartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { ${PAYLOAD_FIELDS} }
  }
  ${MAISON_CART_FRAGMENT}
` as const;

export const CART_LINES_REMOVE = `#graphql
  mutation MaisonCartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${PAYLOAD_FIELDS} }
  }
  ${MAISON_CART_FRAGMENT}
` as const;

export const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation MaisonCartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { ${PAYLOAD_FIELDS} }
  }
  ${MAISON_CART_FRAGMENT}
` as const;
