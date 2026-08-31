import type { CartMoney } from "@/shared/types/cart.type";

export type ShopifyCartAttribute = { key: string; value: string };
export type ShopifyCartWarning = { code: string; target?: string | null; message: string };
export type ShopifyCartUserError = { code?: string | null; field?: string[] | null; message: string };

export type ShopifyCartMerchandiseNode = {
  __typename: string;
  id?: string;
  requiresComponents?: boolean;
  product?: { productType: string };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  attributes: ShopifyCartAttribute[];
  cost: {
    amountPerQuantity: CartMoney;
    subtotalAmount: CartMoney;
  };
  merchandise: {
    id: string;
    title: string;
    requiresComponents: boolean;
    availableForSale: boolean;
    quantityAvailable: number | null;
    selectedOptions: Array<{ name: string; value: string }>;
    metafield: { value: string } | null;
    image: {
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
    } | null;
    product: {
      id: string;
      handle: string;
      title: string;
      productType: string;
    };
  };
};

export type ShopifyCart = {
  id: string;
  totalQuantity: number;
  checkoutUrl: string;
  buyerIdentity: { countryCode: string | null };
  cost: { subtotalAmount: CartMoney };
  lines: {
    nodes: ShopifyCartLine[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type ShopifyCartPayload = {
  cart: ShopifyCart | null;
  userErrors: ShopifyCartUserError[];
  warnings: ShopifyCartWarning[];
};
