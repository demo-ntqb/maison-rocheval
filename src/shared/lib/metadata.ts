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
    alternates: { canonical },
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
    alternates: pageUrl ? { canonical: pageUrl } : undefined,
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

