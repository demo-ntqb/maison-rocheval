import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "./shared/constants/route.constant";
import { DEFAULT_ROUTE_LOCALE } from "./shared/constants/commerce-context.constant";
import {
  ACCESS_GATE_COOKIE,
  createAccessGateGrant,
  hasAccessGateGrant,
  isAccessGatePinValid,
  shouldShowAccessGate,
} from "./shared/lib/access-gate";
import { isRouteLocale, parseCommerceContext } from "./shared/lib/commerce-context";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function getRouteContext(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const routeLocale = isRouteLocale(segments[0]) ? segments[0] : DEFAULT_ROUTE_LOCALE;
  const routePath = isRouteLocale(segments[0]) ? `/${segments.slice(1).join("/")}` : pathname;

  return { routeLocale, routePath: routePath || "/" };
}

function isShopRoute(pathname: string): boolean {
  return pathname === ROUTES.SHOP;
}

function isCatalogRoute(pathname: string): boolean {
  return pathname === ROUTES.PRODUCTS || pathname.startsWith(`${ROUTES.PRODUCTS}/`);
}

function localizedUrl(request: NextRequest, locale: string, path: string): URL {
  const url = request.nextUrl.clone();
  url.pathname = locale === DEFAULT_ROUTE_LOCALE ? path : `/${locale}${path}`;
  url.searchParams.delete("pin");
  return url;
}

export function proxy(request: NextRequest) {
  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse.headers.has("location")) return i18nResponse;

  const { routeLocale, routePath } = getRouteContext(request.nextUrl.pathname);
  if (!isShopRoute(routePath) && !isCatalogRoute(routePath)) return i18nResponse;

  const country = parseCommerceContext(routeLocale).country;
  if (!shouldShowAccessGate(country)) {
    return isShopRoute(routePath)
      ? NextResponse.redirect(localizedUrl(request, routeLocale, ROUTES.PRODUCTS))
      : i18nResponse;
  }

  const hasAccess = hasAccessGateGrant(request.cookies.get(ACCESS_GATE_COOKIE)?.value);
  if (isCatalogRoute(routePath) && !hasAccess) {
    return NextResponse.redirect(localizedUrl(request, routeLocale, ROUTES.SHOP));
  }

  if (!isShopRoute(routePath)) return i18nResponse;

  const pin = request.nextUrl.searchParams.get("pin");
  if (pin !== null) {
    const isValidPin = isAccessGatePinValid(pin);
    const url = localizedUrl(request, routeLocale, isValidPin ? ROUTES.PRODUCTS : ROUTES.SHOP);

    const response = NextResponse.redirect(url);
    const grant = createAccessGateGrant();
    if (isValidPin && grant) {
      response.cookies.set(ACCESS_GATE_COOKIE, grant, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  }

  return hasAccess ? NextResponse.redirect(localizedUrl(request, routeLocale, ROUTES.PRODUCTS)) : i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
