import { routing } from "@/i18n/routing";

type I18nBase = {
  country: "FR";
  language: "EN" | "FR";
};

export type StorefrontLocale = (typeof routing.locales)[number];

type StorefrontConfig = {
  publicStorefrontToken: string;
  storeDomain: string;
};

export const storefrontConfig = {
  publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() ?? "",
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ?? "",
} satisfies StorefrontConfig;

/**
 * Maison Rocheval currently has language routes (`en`, `fr`) rather than
 * country routes. Both languages therefore use the France market so catalog
 * prices remain in one market/currency while copy changes language.
 *
 * When the business adds country-specific pricing, replace this mapping with
 * explicit BCP-47 routes (for example `en-GB`, `fr-FR`) instead of detecting a
 * country inside a cached catalog request.
 */
const MARKET_BY_LOCALE = {
  en: { country: "FR", language: "EN" },
  fr: { country: "FR", language: "FR" },
} satisfies Record<StorefrontLocale, I18nBase>;

export function getShopifyMarket(locale: string): I18nBase {
  if (locale === "fr") return MARKET_BY_LOCALE.fr;
  return MARKET_BY_LOCALE.en;
}
