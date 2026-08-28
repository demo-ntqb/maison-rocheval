import { NextResponse } from "next/server";
import { z } from "zod";

import { isRouteLocale, parseCommerceContext } from "@/shared/lib/commerce-context";
import { createShopifyCart } from "@/shared/lib/shopify/cart";
import { getDiscoveredMarkets } from "@/shared/lib/shopify/localization";

const checkoutSchema = z.object({
  locale: z.string(),
  lines: z.array(
    z.object({
      merchandiseId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
      attributes: z
        .array(
          z.object({
            key: z.string().min(1),
            value: z.string(),
          }),
        )
        .optional(),
    }),
  ).min(1).max(50),
});

/** Creates the checkout cart in the same Shopify Markets context as the current URL. */
export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isRouteLocale(parsed.data.locale)) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const { availableRouteLocales } = await getDiscoveredMarkets();
  if (!availableRouteLocales.includes(parsed.data.locale)) {
    return NextResponse.json({ error: "Market context is not available" }, { status: 409 });
  }

  const context = parseCommerceContext(parsed.data.locale);
  const cart = await createShopifyCart(context.country, context.language, parsed.data.lines, request);
  if (!cart?.checkoutUrl) {
    return NextResponse.json({ error: "Unable to create checkout" }, { status: 502 });
  }

  return NextResponse.json(
    {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalAmount: cart.totalAmount,
      currencyCode: cart.currencyCode,
      lines: cart.lines,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
