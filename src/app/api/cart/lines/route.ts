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
  resolveCartMerchandise,
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

  const parsed = addCartLineSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Invalid add-to-cart request", retryable: false } },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const startedAt = Date.now();
  let resolvedKind: "caviar" | "gift_set" | undefined;

  try {
    const merchandise = await resolveCartMerchandise({
      request,
      locale: input.locale,
      merchandiseId: input.merchandiseId,
    });
    resolvedKind = merchandise.kind;

    const giftUnitIds = input.unitIds ?? [];
    if (merchandise.kind === "gift_set" && giftUnitIds.length === 0) {
      throw new CartServiceError(
        "INVALID_INPUT",
        "Gift-set physical units require stable unit IDs",
        400,
      );
    }
    if (merchandise.kind === "caviar" && input.unitIds !== undefined) {
      throw new CartServiceError(
        "INVALID_INPUT",
        "Gift unit IDs are not valid for this merchandise",
        400,
      );
    }

    let cartId = await getCartId();
    let result;

    if (!cartId) {
      result = await createCartWithLines({
        request,
        locale: input.locale,
        lines: buildInitialCartLines(
          merchandise.kind === "gift_set"
            ? {
                kind: "gift_set",
                merchandiseId: merchandise.merchandiseId,
                unitIds: giftUnitIds,
              }
            : {
                kind: "caviar",
                merchandiseId: merchandise.merchandiseId,
                quantity: input.quantity,
              },
        ),
      });
    } else if (merchandise.kind === "caviar") {
      result = await addCaviar({
        request,
        locale: input.locale,
        cartId,
        merchandiseId: merchandise.merchandiseId,
        quantity: input.quantity,
      });

      if (!result) {
        await clearCartId();
        result = await createCartWithLines({
          request,
          locale: input.locale,
          lines: buildInitialCartLines({
            kind: "caviar",
            merchandiseId: merchandise.merchandiseId,
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
          merchandiseId: merchandise.merchandiseId,
          unitIds: giftUnitIds,
        });
      } catch (error) {
        if (!(error instanceof CartServiceError) || error.code !== "CART_NOT_FOUND") throw error;
        await clearCartId();
        result = await createCartWithLines({
          request,
          locale: input.locale,
          lines: buildInitialCartLines({
            kind: "gift_set",
            merchandiseId: merchandise.merchandiseId,
            unitIds: giftUnitIds,
          }),
        });
      }
    }

    cartId = result.cartId;
    await setCartId(cartId);
    logCartEvent({
      action: "cart.lines.add",
      operationId: input.operationId,
      kind: merchandise.kind,
      quantity: input.quantity,
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
      action: "cart.lines.add",
      operationId: input.operationId,
      kind: resolvedKind,
      quantity: input.quantity,
      locale: input.locale,
      durationMs: Date.now() - startedAt,
      result: "failure",
      errorCode: error instanceof CartServiceError ? error.code : "UPSTREAM_UNAVAILABLE",
    });
    return cartApiError(error, input.operationId);
  }
}
