import type { Metadata } from "next";
import { businessInfo, seoDefaults, SITE_URL } from "@/shared/constants/site.constant";
import { routing } from "@/i18n/routing";

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
};

/** Prefixes a path with the locale segment, except for the default locale ("as-needed" mode). */
export function localizedPath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path;
  const suffix = path === "/" ? "" : path;
  return `/${locale}${suffix}`;
}

/** Builds `alternates.languages` (hreflang) for an unlocalized path, across every configured locale. */
function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = new URL(localizedPath(locale, path), SITE_URL).toString();
  }
  languages["x-default"] = new URL(localizedPath(routing.defaultLocale, path), SITE_URL).toString();
  return languages;
}

/**
 * Generate root metadata for the site, per locale
 */
export function generateRootMetadata(locale: string, title: string, description: string): Metadata {
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
    alternates: { canonical, languages: buildLanguageAlternates("/") },
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
export function generatePageMetadata(
  locale: string,
  title: string,
  description: string,
  options?: {
    image?: string;
    canonical?: string;
    noindex?: boolean;
    ogType?: "website" | "article";
  }
): Metadata {
  const pageImage = options?.image ?? seoDefaults.image;
  const pageUrl = options?.canonical
    ? new URL(localizedPath(locale, options.canonical), SITE_URL).toString()
    : undefined;

  return {
    title,
    description,
    alternates:
      pageUrl && options?.canonical
        ? { canonical: pageUrl, languages: buildLanguageAlternates(options.canonical) }
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

