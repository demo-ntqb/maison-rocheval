export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          nodes {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                product {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `#graphql
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

export const CART_FETCH_QUERY = `#graphql
  query CartFetch($id: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cart(id: $id) {
      id
      checkoutUrl
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 50) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
` as const;
