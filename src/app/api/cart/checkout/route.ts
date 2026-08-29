import { cartApiError, jsonNoStore } from "@/shared/lib/http/api-response";
import { hasJsonContentType, isSameOriginRequest } from "@/shared/lib/http/same-origin";
import {
  CartServiceError,
  checkoutSchema,
  clearCartId,
  getCartId,
  getCheckoutCart,
  setCartId,
} from "@/shared/lib/shopify/cart";
import { logCartEvent } from "@/shared/lib/shopify/cart/cart.logger";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Cross-origin checkout request rejected", retryable: false } },
      { status: 403 },
    );
  }
  if (!hasJsonContentType(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "JSON request required", retryable: false } },
      { status: 415 },
    );
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_LOCALE", message: "Invalid checkout locale", retryable: false } },
      { status: 400 },
    );
  }

  const cartId = await getCartId();
  if (!cartId) {
    return cartApiError(new CartServiceError("CART_EMPTY", "Cart is empty", 409));
  }

  const startedAt = Date.now();
  try {
    const cart = await getCheckoutCart({ request, cartId, locale: parsed.data.locale });
    if (!cart) {
      await clearCartId();
      return cartApiError(new CartServiceError("CART_EMPTY", "Cart is empty", 409));
    }
    if (cart.totalQuantity < 1) {
      return cartApiError(new CartServiceError("CART_EMPTY", "Cart is empty", 409));
    }
    if (!cart.checkoutUrl) {
      return cartApiError(
        new CartServiceError("CHECKOUT_UNAVAILABLE", "Checkout is unavailable", 502, true),
      );
    }

    await setCartId(cart.id);
    logCartEvent({
      action: "cart.checkout",
      quantity: cart.totalQuantity,
      country: cart.buyerIdentity.countryCode ?? undefined,
      locale: parsed.data.locale,
      durationMs: Date.now() - startedAt,
      result: "success",
    });
    return jsonNoStore({ checkoutUrl: cart.checkoutUrl });
  } catch (error) {
    logCartEvent({
      action: "cart.checkout",
      locale: parsed.data.locale,
      durationMs: Date.now() - startedAt,
      result: "failure",
      errorCode: error instanceof CartServiceError ? error.code : "UPSTREAM_UNAVAILABLE",
    });
    return cartApiError(error);
  }
}
