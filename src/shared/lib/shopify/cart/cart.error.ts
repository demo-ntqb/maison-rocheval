import type { ShopifyCartUserError } from "./cart.type";

export type CartApiErrorCode =
  | "INVALID_INPUT"
  | "CART_NOT_FOUND"
  | "CART_EMPTY"
  | "LINE_NOT_FOUND"
  | "INVALID_QUANTITY"
  | "OUT_OF_STOCK"
  | "INVALID_COUNTRY"
  | "INVALID_LOCALE"
  | "SHOPIFY_USER_ERROR"
  | "UPSTREAM_UNAVAILABLE"
  | "CHECKOUT_UNAVAILABLE";

export class CartServiceError extends Error {
  constructor(
    public readonly code: CartApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable = false,
    public readonly field?: string[],
  ) {
    super(message);
    this.name = "CartServiceError";
  }
}

export function throwForUserErrors(errors: ShopifyCartUserError[]): void {
  const first = errors[0];
  if (!first) return;

  const code = first.code?.toUpperCase() ?? "";
  if (code.includes("OUT_OF_STOCK") || code.includes("QUANTITY")) {
    throw new CartServiceError("OUT_OF_STOCK", "Requested quantity is unavailable", 409, false, first.field ?? undefined);
  }

  throw new CartServiceError(
    "SHOPIFY_USER_ERROR",
    "Shopify rejected the cart operation",
    422,
    false,
    first.field ?? undefined,
  );
}
