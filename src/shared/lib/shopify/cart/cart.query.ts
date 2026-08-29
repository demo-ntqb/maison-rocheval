import { MAISON_CART_FRAGMENT } from "./cart.fragment";

export const CART_QUERY = `#graphql
  query MaisonCartQuery(
    $id: ID!
    $first: Int!
    $after: String
    $language: LanguageCode
  ) @inContext(language: $language) {
    cart(id: $id) { ...MaisonCart }
  }
  ${MAISON_CART_FRAGMENT}
` as const;
