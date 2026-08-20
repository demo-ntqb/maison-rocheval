import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  AboutSourceRitualSection,
  AboutHeroSection,
  AboutStorySection,
  AboutRitualSection,
  AboutSelectionSection,
  AboutVenuesSection,
} from "@/screens/about-the-brand";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import {
  generateComingSoonMetadata,
  generateJsonLd,
  generatePageMetadata,
  isComingSoon,
  localizedPath,
} from "@/shared/lib/metadata";

const OG_IMAGE = "/images/about-brand/hero-maison-lake-desktop.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

  const t = await getTranslations({ locale, namespace: "metadata.aboutBrand" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/about-the-brand",
    image: new URL(OG_IMAGE, SITE_URL).toString(),
  });
}

export default async function AboutBrandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [nav, meta] = await Promise.all([
    getTranslations({ locale, namespace: "header.nav" }),
    getTranslations({ locale, namespace: "metadata.aboutBrand" }),
  ]);

  const pageUrl = new URL(localizedPath(locale, ROUTES.ABOUT_BRAND), SITE_URL).toString();

  const breadcrumbJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: nav("home"),
        item: new URL(localizedPath(locale, ROUTES.HOME), SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: nav("about"),
        item: pageUrl,
      },
    ],
  });

  const aboutPageJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: meta("title"),
    description: meta("description"),
    url: pageUrl,
    mainEntity: {
      "@type": "Organization",
      name: "Maison Rocheval",
      url: SITE_URL,
    },
  });

  return (
    <div data-plumb-id="about-the-brand" className="flex w-full flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: aboutPageJsonLd }} />
      <AboutHeroSection />
      <AboutStorySection />
      <AboutVenuesSection />
      <AboutSelectionSection />
      <AboutRitualSection />
      <AboutSourceRitualSection />
    </div>
  );
}
