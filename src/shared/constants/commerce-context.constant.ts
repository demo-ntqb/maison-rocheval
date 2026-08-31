import type {
  AppLocale,
  CommerceContext,
  RouteLocale,
  SupportedCountry,
  SupportedLanguage,
} from "../types/commerce-context.type";

export const SUPPORTED_COUNTRIES: readonly SupportedCountry[] = ["FR", "US", "SG"] as const;
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ["EN", "FR"] as const;
export const APP_LOCALES: readonly AppLocale[] = ["en", "fr"] as const;

export const ROUTE_LOCALES: readonly RouteLocale[] = [
  "en-fr",
  "fr-fr",
  "en-us",
  "fr-us",
  "en-sg",
  "fr-sg",
] as const;

/** Initial headless channel default context */
export const DEFAULT_ROUTE_LOCALE: RouteLocale = "en-sg";
export const DEFAULT_COUNTRY: SupportedCountry = "SG";
export const DEFAULT_APP_LOCALE: AppLocale = "en";

export const COMMERCE_CONTEXTS: Record<RouteLocale, CommerceContext> = {
  "en-fr": { routeLocale: "en-fr", appLocale: "en", country: "FR", language: "EN" },
  "fr-fr": { routeLocale: "fr-fr", appLocale: "fr", country: "FR", language: "FR" },
  "en-us": { routeLocale: "en-us", appLocale: "en", country: "US", language: "EN" },
  "fr-us": { routeLocale: "fr-us", appLocale: "fr", country: "US", language: "FR" },
  "en-sg": { routeLocale: "en-sg", appLocale: "en", country: "SG", language: "EN" },
  "fr-sg": { routeLocale: "fr-sg", appLocale: "fr", country: "SG", language: "FR" },
} as const;

export const CANONICAL_ROUTE_LOCALE_BY_COUNTRY: Record<SupportedCountry, RouteLocale> = {
  FR: "fr-fr",
  US: "en-us",
  SG: "en-sg",
} as const;
