import { isRouteLocale, parseCommerceContext } from "@/shared/lib/commerce-context";
import type { SupportedCountry, SupportedLanguage } from "@/shared/types/commerce-context.type";

export type I18nBase = {
  country: SupportedCountry;
  language: SupportedLanguage;
};

type StorefrontConfig = {
  publicStorefrontToken: string;
  storeDomain: string;
};

export const storefrontConfig = {
  publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() ?? "",
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() ?? "",
} satisfies StorefrontConfig;

export function getShopifyMarket(locale: string): I18nBase {
  if (!isRouteLocale(locale)) {
    throw new Error(`[shopify] Unsupported market locale: "${locale}"`);
  }
  const context = parseCommerceContext(locale);
  return {
    country: context.country,
    language: context.language,
  };
}
