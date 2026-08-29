import { cartApiError, jsonNoStore } from "@/shared/lib/http/api-response";
import { hasJsonContentType, isSameOriginRequest } from "@/shared/lib/http/same-origin";
import {
  CartServiceError,
  getCartId,
  removeCartLine,
  removeCartLineSchema,
  setCartId,
} from "@/shared/lib/shopify/cart";
import { logCartEvent } from "@/shared/lib/shopify/cart/cart.logger";

export async function POST(request: Request) {
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

  const parsed = removeCartLineSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Invalid cart remove request", retryable: false } },
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
    const result = await removeCartLine({
      request,
      locale: input.locale,
      cartId,
      lineId: input.lineId,
    });
    await setCartId(result.cartId);
    logCartEvent({
      action: "cart.line.remove",
      operationId: input.operationId,
      country: result.snapshot.countryCode,
      locale: input.locale,
      durationMs: Date.now() - startedAt,
      warningCodes: result.snapshot.warnings.map((warning) => warning.code),
      result: "success",
    });
    return jsonNoStore({
      operationId: input.operationId,
      cart: result.snapshot,
      warnings: result.snapshot.warnings,
    });
  } catch (error) {
    logCartEvent({
      action: "cart.line.remove",
      operationId: input.operationId,
      locale: input.locale,
      durationMs: Date.now() - startedAt,
      result: "failure",
      errorCode: error instanceof CartServiceError ? error.code : "UPSTREAM_UNAVAILABLE",
    });
    return cartApiError(error, input.operationId);
  }
}
