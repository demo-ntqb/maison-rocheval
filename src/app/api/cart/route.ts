import { isRouteLocale } from "@/shared/lib/commerce-context";
import { jsonNoStore, cartApiError } from "@/shared/lib/http/api-response";
import { clearCartId, getCart, getCartId, setCartId } from "@/shared/lib/shopify/cart";
import { getShopifyMarket } from "@/shared/lib/shopify/config";
import type { CartSnapshot } from "@/shared/types/cart.type";
import type { SupportedCountry } from "@/shared/types/commerce-context.type";

function expectedCurrency(country: SupportedCountry): string {
  // The current branch only enables Singapore. Keep this explicit until FR/US are re-enabled.
  return country === "SG" ? "SGD" : "SGD";
}

function emptyCart(locale: string): CartSnapshot {
  const market = getShopifyMarket(locale);
  return {
    entries: [],
    itemCount: 0,
    subtotal: { amount: "0.00", currencyCode: expectedCurrency(market.country) },
    countryCode: market.country,
    warnings: [],
  };
}

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale");
  if (!isRouteLocale(locale)) {
    return jsonNoStore(
      { error: { code: "INVALID_LOCALE", message: "Invalid cart locale", retryable: false } },
      { status: 400 },
    );
  }

  const cartId = await getCartId();
  if (!cartId) {
    return jsonNoStore({ cart: emptyCart(locale) });
  }

  try {
    const result = await getCart({ request, cartId, locale });
    if (!result) {
      await clearCartId();
      return jsonNoStore({ cart: emptyCart(locale) });
    }

    await setCartId(result.cartId);
    return jsonNoStore({ cart: result.snapshot });
  } catch (error) {
    return cartApiError(error);
  }
}
