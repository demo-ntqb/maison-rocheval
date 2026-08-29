import { cartApiError, jsonNoStore } from "@/shared/lib/http/api-response";
import { hasJsonContentType, isSameOriginRequest } from "@/shared/lib/http/same-origin";
import { getRequestCountry, setRequestCountry } from "@/shared/lib/region/region-cookie";
import {
  CartServiceError,
  clearCartId,
  getCartId,
  regionSchema,
  setCartId,
  updateCartBuyerIdentity,
} from "@/shared/lib/shopify/cart";
import { getShopifyMarket } from "@/shared/lib/shopify/config";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "Cross-origin region mutation rejected", retryable: false } },
      { status: 403 },
    );
  }
  if (!hasJsonContentType(request)) {
    return jsonNoStore(
      { error: { code: "INVALID_INPUT", message: "JSON request required", retryable: false } },
      { status: 415 },
    );
  }

  const parsed = regionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonNoStore(
      { error: { code: "INVALID_LOCALE", message: "Invalid region context", retryable: false } },
      { status: 400 },
    );
  }

  const { locale } = parsed.data;
  const market = getShopifyMarket(locale);
  const previousCountry = await getRequestCountry();
  const changed = previousCountry !== market.country;
  await setRequestCountry(market.country);

  const cartId = await getCartId();
  if (!cartId) {
    return jsonNoStore({ changed, countryCode: market.country });
  }

  try {
    const result = await updateCartBuyerIdentity({ request, locale, cartId });
    await setCartId(result.cartId);
    return jsonNoStore({ changed, countryCode: market.country, cart: result.snapshot });
  } catch (error) {
    if (error instanceof CartServiceError && error.code === "CART_NOT_FOUND") {
      await clearCartId();
      return jsonNoStore({ changed, countryCode: market.country });
    }
    return cartApiError(error);
  }
}
