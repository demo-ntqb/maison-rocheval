import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { COMMERCE_CONTEXTS, DEFAULT_ROUTE_LOCALE, SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES } from "@/shared/constants/commerce-context.constant";
import type {
  CommerceContext,
  RouteLocale,
  SupportedCountry,
  SupportedLanguage,
} from "@/shared/types/commerce-context.type";
import { getCatalogStorefrontClient } from "../storefront";
import { LOCALIZATION_DISCOVERY_QUERY } from "./localization.query";

export type ShopifyLocalizationResponse = {
  localization?: {
    availableCountries: Array<{
      isoCode: string;
      name: string;
      availableLanguages: Array<{
        isoCode: string;
        name: string;
      }>;
      currency?: {
        isoCode: string;
        symbol: string;
      };
    }>;
  };
  errors?: Array<{ message: string }>;
};

export type AvailableMarketsDiscovery = {
  availableCountries: SupportedCountry[];
  availableLanguages: SupportedLanguage[];
  availableContexts: CommerceContext[];
  availableRouteLocales: RouteLocale[];
};

/**
 * Pure filter helper: computes the intersection of Shopify available countries/languages
 * with the application's supported allowlists [FR, US, SG] and [EN, FR].
 */
export function filterAvailableMarkets(
  shopifyCountries: readonly string[],
  shopifyLanguages: readonly string[],
): {
  availableCountries: SupportedCountry[];
  availableLanguages: SupportedLanguage[];
} {
  const allowedCountriesSet = new Set<string>(SUPPORTED_COUNTRIES);
  const allowedLanguagesSet = new Set<string>(SUPPORTED_LANGUAGES);

  const availableCountries = shopifyCountries
    .map((c) => c.toUpperCase())
    .filter((c): c is SupportedCountry => allowedCountriesSet.has(c));

  const availableLanguages = shopifyLanguages
    .map((l) => l.toUpperCase())
    .filter((l): l is SupportedLanguage => allowedLanguagesSet.has(l));

  return { availableCountries, availableLanguages };
}

/**
 * Builds the list of valid CommerceContext objects matching the discovered active markets.
 */
export function buildAvailableContexts(
  countryLanguages: ReadonlyArray<{ country: string; languages: readonly string[] }>,
): CommerceContext[] {
  const supportedCountries = new Set<string>(SUPPORTED_COUNTRIES);
  const supportedLanguages = new Set<string>(SUPPORTED_LANGUAGES);

  return Object.values(COMMERCE_CONTEXTS).filter((context) => {
    const country = countryLanguages.find(
      (candidate) => candidate.country.toUpperCase() === context.country,
    );
    return Boolean(
      country &&
        supportedCountries.has(context.country) &&
        country.languages.some(
          (language) =>
            language.toUpperCase() === context.language && supportedLanguages.has(context.language),
        ),
    );
  });
}

/**
 * Server-cached discovery service for active Shopify markets.
 * Cache TTL: 10 minutes (cacheLife("minutes")).
 * Invalidation tags: "shopify-localization", "shopify-market-context".
 */
export async function getDiscoveredMarkets(): Promise<AvailableMarketsDiscovery> {
  "use cache";
  cacheLife("minutes");
  cacheTag("shopify-localization", "shopify-market-context");

  const client = getCatalogStorefrontClient(DEFAULT_ROUTE_LOCALE);
  const result = await client.query<ShopifyLocalizationResponse>(LOCALIZATION_DISCOVERY_QUERY);

  if (result.errors?.length || !result.localization) {
    throw new Error(
      `[shopify] Localization discovery failed: ${result.errors?.map((error) => error.message).join("; ") ?? "missing localization"}`,
    );
  }

  const countryLanguages = result.localization.availableCountries.map((country) => ({
    country: country.isoCode,
    languages: country.availableLanguages.map((language) => language.isoCode),
  }));
  const availableContexts = buildAvailableContexts(countryLanguages);
  const { availableCountries } = filterAvailableMarkets(
    result.localization.availableCountries.map((country) => country.isoCode),
    [],
  );
  const availableLanguages = [...new Set(availableContexts.map((context) => context.language))];

  return {
    availableCountries,
    availableLanguages,
    availableContexts,
    availableRouteLocales: availableContexts.map((context) => context.routeLocale),
  };
}

/** Returns a context only when Shopify Markets currently publishes that exact pair. */
export async function getAvailableCommerceContext(locale: string): Promise<CommerceContext | null> {
  const { availableContexts } = await getDiscoveredMarkets();
  return availableContexts.find((context) => context.routeLocale === locale) ?? null;
}
