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
import { logCartEvent } from "@/shared/lib/shopify/cart/cart.logger";

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

  const startedAt = Date.now();
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
    logCartEvent({
      action: input.action === "quantity" ? "cart.line.quantity" : "cart.line.gift_message",
      operationId: input.operationId,
      quantity: input.action === "quantity" ? input.quantity : undefined,
      country: result.snapshot.countryCode,
      locale: input.locale,
      durationMs: Date.now() - startedAt,
      warningCodes: result.snapshot.warnings.map((warning) => warning.code),
      result: "success",
      ...(input.action === "gift_message"
        ? {
            hasGiftMessage: input.giftMessage !== null,
            messageLength:
              input.giftMessage?.kind === "personal" ? input.giftMessage.text.length : 0,
          }
        : {}),
    });
    return jsonNoStore({
      operationId: input.operationId,
      cart: result.snapshot,
      warnings: result.snapshot.warnings,
    });
  } catch (error) {
    logCartEvent({
      action: input.action === "quantity" ? "cart.line.quantity" : "cart.line.gift_message",
      operationId: input.operationId,
      quantity: input.action === "quantity" ? input.quantity : undefined,
      locale: input.locale,
      durationMs: Date.now() - startedAt,
      result: "failure",
      errorCode: error instanceof CartServiceError ? error.code : "UPSTREAM_UNAVAILABLE",
      ...(input.action === "gift_message"
        ? {
            hasGiftMessage: input.giftMessage !== null,
            messageLength:
              input.giftMessage?.kind === "personal" ? input.giftMessage.text.length : 0,
          }
        : {}),
    });
    return cartApiError(error, input.operationId);
  }
}
