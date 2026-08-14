import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/shared/constants/site.constant";
import { localizedPath } from "@/shared/lib/metadata";
import { getCatalogHandles } from "@/shared/lib/shopify/catalog";

const STATIC_PATHS = ["/", "/products", "/about-the-brand", "/about-the-product"] as const;

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
    changeFrequency: path.startsWith("/products/") ? "daily" : "weekly",
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const handles = await getCatalogHandles();
  return [
    ...STATIC_PATHS.map(sitemapEntry),
    ...handles.map((handle) => sitemapEntry(`/products/${handle}`)),
  ];
}
