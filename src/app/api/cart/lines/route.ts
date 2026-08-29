import { cartApiError, jsonNoStore } from "@/shared/lib/http/api-response";
import { hasJsonContentType, isSameOriginRequest } from "@/shared/lib/http/same-origin";
import {
  addCartLineSchema,
  addCaviar,
  addGiftSet,
  buildInitialCartLines,
  CartServiceError,
  clearCartId,
  createCartWithLines,
  getCartId,
  setCartId,
} from "@/shared/lib/shopify/cart";

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

  const parsed = addCartLineSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Invalid add-to-cart request", retryable: false } },
      { status: 400 },
    );
  }

  const input = parsed.data;
  try {
    let cartId = await getCartId();
    let result;

    if (!cartId) {
      result = await createCartWithLines({
        request,
        locale: input.locale,
        lines: buildInitialCartLines(
          input.kind === "caviar"
            ? { kind: "caviar", merchandiseId: input.merchandiseId, quantity: input.quantity }
            : { kind: "gift_set", merchandiseId: input.merchandiseId, unitIds: input.unitIds },
        ),
      });
    } else if (input.kind === "caviar") {
      result = await addCaviar({
        request,
        locale: input.locale,
        cartId,
        merchandiseId: input.merchandiseId,
        quantity: input.quantity,
      });

      if (!result) {
        await clearCartId();
        result = await createCartWithLines({
          request,
          locale: input.locale,
          lines: buildInitialCartLines({
            kind: "caviar",
            merchandiseId: input.merchandiseId,
            quantity: input.quantity,
          }),
        });
      }
    } else {
      try {
        result = await addGiftSet({
          request,
          locale: input.locale,
          cartId,
          merchandiseId: input.merchandiseId,
          unitIds: input.unitIds,
        });
      } catch (error) {
        if (!(error instanceof CartServiceError) || error.code !== "CART_NOT_FOUND") throw error;
        await clearCartId();
        result = await createCartWithLines({
          request,
          locale: input.locale,
          lines: buildInitialCartLines({
            kind: "gift_set",
            merchandiseId: input.merchandiseId,
            unitIds: input.unitIds,
          }),
        });
      }
    }

    cartId = result.cartId;
    await setCartId(cartId);
    return jsonNoStore({
      operationId: input.operationId,
      cart: result.snapshot,
      warnings: result.snapshot.warnings,
    });
  } catch (error) {
    return cartApiError(error, input.operationId);
  }
}
