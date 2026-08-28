import type { Metadata } from "next";
import { businessInfo, seoDefaults, SITE_URL } from "@/shared/constants/site.constant";
import { routing } from "@/i18n/routing";
import { getDiscoveredMarkets } from "@/shared/lib/shopify/localization";

const OG_LOCALE: Record<string, string> = {
  "en-sg": "en_SG",
  "fr-sg": "fr_SG",
  "en-us": "en_US",
  "fr-us": "fr_US",
  "en-fr": "en_FR",
  "fr-fr": "fr_FR",
  en: "en_US",
  fr: "fr_FR",
};

/** Every public URL carries its Shopify market and language context. */
export function localizedPath(locale: string, path: string): string {
  const isDefault = locale === routing.defaultLocale;
  const suffix = path === "/" ? "" : path;
  if (isDefault) {
    return suffix === "" ? "/" : suffix;
  }
  return `/${locale}${suffix}`;
}

/** Builds `hreflang` only for country/language pairs currently published by Shopify. */
async function buildLanguageAlternates(path: string): Promise<Record<string, string>> {
  const { availableRouteLocales } = await getDiscoveredMarkets();
  const languages: Record<string, string> = {};
  for (const locale of availableRouteLocales) {
    languages[locale] = new URL(localizedPath(locale, path), SITE_URL).toString();
  }
  languages["x-default"] = new URL(localizedPath(routing.defaultLocale, path), SITE_URL).toString();
  return languages;
}

/**
 * Generate root metadata for the site, per locale
 */
export async function generateRootMetadata(locale: string, title: string, description: string): Promise<Metadata> {
  const canonical = new URL(localizedPath(locale, "/"), SITE_URL).toString();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${businessInfo.name}`,
    },
    description,
    keywords: seoDefaults.keywords,
    creator: businessInfo.name,
    publisher: businessInfo.name,
    applicationName: businessInfo.name,
    formatDetection: {
      email: false,
      telephone: false,
      address: false,
    },
    alternates: { canonical, languages: await buildLanguageAlternates("/") },
    icons: {
      icon: [
        { url: "/mr-light.png", media: "(prefers-color-scheme: light)", type: "image/png", sizes: "500x500" },
        { url: "/mr-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png", sizes: "500x500" },
      ],
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      url: canonical,
      siteName: businessInfo.name,
      title,
      description,
      images: [
        {
          url: seoDefaults.image,
          width: 1200,
          height: 630,
          alt: businessInfo.name,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seoDefaults.image],
      creator: seoDefaults.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

/**
 * Generate metadata for a specific page, per locale
 */
export async function generatePageMetadata(
  locale: string,
  title: string,
  description: string,
  options?: {
    image?: string;
    canonical?: string;
    noindex?: boolean;
    ogType?: "website" | "article";
  }
): Promise<Metadata> {
  const pageImage = options?.image ?? seoDefaults.image;
  const pageUrl = options?.canonical
    ? new URL(localizedPath(locale, options.canonical), SITE_URL).toString()
    : undefined;

  return {
    title,
    description,
    alternates:
      pageUrl && options?.canonical
        ? { canonical: pageUrl, languages: await buildLanguageAlternates(options.canonical) }
        : undefined,
    robots: options?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: options?.ogType || "website",
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      title,
      description,
      url: pageUrl,
      siteName: businessInfo.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pageImage],
      creator: seoDefaults.twitterHandle,
    },
  };
}


/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Brand-level `Organization` JSON-LD, rendered once in the root layout so every
 * page (including the coming-soon placeholder) ties the domain to the brand entity.
 * `url` is always the canonical (default-locale) homepage — the org is one entity,
 * not one per locale.
 */
export function generateOrganizationJsonLd(): string {
  return generateJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessInfo.name,
    url: SITE_URL,
    logo: new URL("/apple-icon.png", SITE_URL).toString(),
  });
}
