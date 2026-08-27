import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { PRODUCT_CATEGORIES } from "@/shared/constants/catalog.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import { localizedPath } from "@/shared/lib/metadata";
import { getCollectionProducts } from "@/shared/lib/shopify/catalog";

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

function sitemapEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(routing.defaultLocale, path),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, absoluteUrl(locale, path)]),
      ),
    },
    changeFrequency: "weekly",
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productPaths: string[] = [];

  for (const category of PRODUCT_CATEGORIES) {
    const products = await getCollectionProducts(routing.defaultLocale, category);
    for (const p of products) {
      productPaths.push(ROUTES.PRODUCT_DETAIL(category, p.handle));
    }
  }

  const categoryPaths = PRODUCT_CATEGORIES.map((category) => ROUTES.PRODUCT_CATEGORY(category));
  return [...STATIC_PATHS, ...categoryPaths, ...productPaths].map(
    sitemapEntry,
  );
}
