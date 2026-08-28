import {
  COMMERCE_CONTEXTS,
  DEFAULT_ROUTE_LOCALE,
  ROUTE_LOCALES,
} from "../constants/commerce-context.constant";
import type { CommerceContext, RouteLocale } from "../types/commerce-context.type";

export function isRouteLocale(value: unknown): value is RouteLocale {
  return typeof value === "string" && (ROUTE_LOCALES as readonly string[]).includes(value as RouteLocale);
}

export function parseCommerceContext(localeOrRoute: string): CommerceContext {
  const normalized = localeOrRoute.toLowerCase().trim();

  if (isRouteLocale(normalized)) {
    return COMMERCE_CONTEXTS[normalized];
  }

  throw new Error(`[commerce-context] Invalid or unsupported route locale: "${localeOrRoute}"`);
}

export function getCommerceContextOrDefault(localeOrRoute?: string | null): CommerceContext {
  if (!localeOrRoute) return COMMERCE_CONTEXTS[DEFAULT_ROUTE_LOCALE];
  try {
    return parseCommerceContext(localeOrRoute);
  } catch {
    return COMMERCE_CONTEXTS[DEFAULT_ROUTE_LOCALE];
  }
}

