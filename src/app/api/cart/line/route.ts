import { cartApiError, jsonNoStore } from "@/shared/lib/http/api-response";
import { hasJsonContentType, isSameOriginRequest } from "@/shared/lib/http/same-origin";
import {
  CartServiceError,
  getCartId,
  setCartId,
  updateCartLineQuantity,
  updateCartLineSchema,
  updateGiftMessage,
} from "@/shared/lib/shopify/cart";

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Cross-origin cart mutation rejected", retryable: false } },
      { status: 403 },
    );
  }
  if (!hasJsonContentType(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "JSON request required", retryable: false } },
      { status: 415 },
    );
  }

  const parsed = updateCartLineSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Invalid cart-line update", retryable: false } },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const cartId = await getCartId();
  if (!cartId) {
    return cartApiError(
      new CartServiceError("CART_NOT_FOUND", "Cart is unavailable", 404),
      input.operationId,
    );
  }

  try {
    const result =
      input.action === "quantity"
        ? await updateCartLineQuantity({
            request,
            locale: input.locale,
            cartId,
            lineId: input.lineId,
            quantity: input.quantity,
          })
        : await updateGiftMessage({
            request,
            locale: input.locale,
            cartId,
            lineId: input.lineId,
            giftMessage: input.giftMessage,
          });

    await setCartId(result.cartId);
    return jsonNoStore({
      operationId: input.operationId,
      cart: result.snapshot,
      warnings: result.snapshot.warnings,
    });
  } catch (error) {
    return cartApiError(error, input.operationId);
  }
}
