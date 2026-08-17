import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import { localizedPath } from "@/shared/lib/metadata";

const STATIC_PATHS = [ROUTES.HOME] as const;

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

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map(sitemapEntry);
}
