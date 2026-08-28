import "server-only";

import type { SupportedCountry, SupportedLanguage } from "@/shared/types/commerce-context.type";
import { getBuyerStorefrontClient, getCatalogStorefrontClient } from "../storefront";
import {
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
  CART_FETCH_QUERY,
} from "./cart.query";

export type ShopifyCartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
};

export type ShopifyCartResult = {
  id: string;
  checkoutUrl: string;
  totalAmount: number;
  currencyCode: string;
  lines: Array<{
    id: string;
    quantity: number;
    availableForSale: boolean;
    merchandiseId: string;
  }>;
};

export async function createShopifyCart(
  country: SupportedCountry,
  language: SupportedLanguage,
  lines: ShopifyCartLineInput[] = [],
  request?: Request,
): Promise<ShopifyCartResult | null> {
  const routeLocale = `${language.toLowerCase()}-${country.toLowerCase()}`;
  const client = request
    ? getBuyerStorefrontClient(routeLocale, request)
    : getCatalogStorefrontClient(routeLocale);

  const response = await client.query<{
    cartCreate: {
      cart: {
        id: string;
        checkoutUrl: string;
        cost: { totalAmount: { amount: string; currencyCode: string } };
        lines: {
          nodes: Array<{
            id: string;
            quantity: number;
            merchandise: { id: string; availableForSale?: boolean } | null;
          }>;
        };
      } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_CREATE_MUTATION, {
    variables: {
      country,
      language,
      input: {
        buyerIdentity: { countryCode: country },
        lines: lines.map((l) => ({
          merchandiseId: l.merchandiseId,
          quantity: l.quantity,
          attributes: l.attributes,
        })),
      },
    },
  });

  const cart = response?.cartCreate?.cart;
  if (!cart) return null;

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalAmount: Number.parseFloat(cart.cost.totalAmount.amount) || 0,
    currencyCode: cart.cost.totalAmount.currencyCode,
    lines: cart.lines.nodes.map((n) => ({
      id: n.id,
      quantity: n.quantity,
      availableForSale: n.merchandise?.availableForSale ?? true,
      merchandiseId: n.merchandise?.id ?? "",
    })),
  };
}

export async function updateShopifyCartBuyerIdentity(
  cartId: string,
  country: SupportedCountry,
  language: SupportedLanguage,
): Promise<{ checkoutUrl: string; totalAmount: number; currencyCode: string } | null> {
  const routeLocale = `${language.toLowerCase()}-${country.toLowerCase()}`;
  const client = getCatalogStorefrontClient(routeLocale);

  const response = await client.query<{
    cartBuyerIdentityUpdate: {
      cart: {
        id: string;
        checkoutUrl: string;
        cost: { totalAmount: { amount: string; currencyCode: string } };
      } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
    variables: {
      cartId,
      country,
      language,
      buyerIdentity: { countryCode: country },
    },
  });

  const cart = response?.cartBuyerIdentityUpdate?.cart;
  if (!cart) return null;

  return {
    checkoutUrl: cart.checkoutUrl,
    totalAmount: Number.parseFloat(cart.cost.totalAmount.amount) || 0,
    currencyCode: cart.cost.totalAmount.currencyCode,
  };
}

export async function fetchShopifyCart(
  cartId: string,
  country: SupportedCountry,
  language: SupportedLanguage,
): Promise<ShopifyCartResult | null> {
  const routeLocale = `${language.toLowerCase()}-${country.toLowerCase()}`;
  const client = getCatalogStorefrontClient(routeLocale);

  const response = await client.query<{
    cart: {
      id: string;
      checkoutUrl: string;
      cost: { totalAmount: { amount: string; currencyCode: string } };
      lines: {
        nodes: Array<{
          id: string;
          quantity: number;
          merchandise: { id: string; availableForSale?: boolean } | null;
        }>;
      };
    } | null;
  }>(CART_FETCH_QUERY, {
    variables: {
      id: cartId,
      country,
      language,
    },
  });

  const cart = response?.cart;
  if (!cart) return null;

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalAmount: Number.parseFloat(cart.cost.totalAmount.amount) || 0,
    currencyCode: cart.cost.totalAmount.currencyCode,
    lines: cart.lines.nodes.map((n) => ({
      id: n.id,
      quantity: n.quantity,
      availableForSale: n.merchandise?.availableForSale ?? true,
      merchandiseId: n.merchandise?.id ?? "",
    })),
  };
}
