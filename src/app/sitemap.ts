import type { MetadataRoute } from "next";

import { PRODUCT_CATEGORIES } from "@/shared/constants/catalog.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import { localizedPath } from "@/shared/lib/metadata";
import { getCollectionProducts } from "@/shared/lib/shopify/catalog";
import { getDiscoveredMarkets } from "@/shared/lib/shopify/localization";
import type { RouteLocale } from "@/shared/types/commerce-context.type";
import { DEFAULT_ROUTE_LOCALE } from "@/shared/constants/commerce-context.constant";

const STATIC_PATHS = [
  ROUTES.HOME,
  ROUTES.ABOUT_BRAND,
  ROUTES.ABOUT_PRODUCT,
  ROUTES.PRODUCTS,
  ROUTES.FAQ,
  ROUTES.CONTACT,
] as const;

function absoluteUrl(locale: string, path: string): string {
  return new URL(localizedPath(locale, path), SITE_URL).toString();
}

function sitemapEntry(path: string, locales: readonly RouteLocale[]): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(DEFAULT_ROUTE_LOCALE, path),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, absoluteUrl(locale, path)]),
      ),
    },
    changeFrequency: "weekly",
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productPaths: string[] = [];
  const { availableRouteLocales } = await getDiscoveredMarkets();
  const discoveryLocale = availableRouteLocales[0];
  if (!discoveryLocale) return [];

  for (const category of PRODUCT_CATEGORIES) {
    const products = await getCollectionProducts(discoveryLocale, category);
    for (const p of products) {
      productPaths.push(ROUTES.PRODUCT_DETAIL(category, p.handle));
    }
  }

  const categoryPaths = PRODUCT_CATEGORIES.map((category) => ROUTES.PRODUCT_CATEGORY(category));
  return [...STATIC_PATHS, ...categoryPaths, ...productPaths].map(
    (path) => sitemapEntry(path, availableRouteLocales),
  );
}
