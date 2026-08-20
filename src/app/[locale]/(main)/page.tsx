import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  HomeAboutSection,
  HomeHeroSection,
  HomeIntroSection,
  HomeProductsSection,
} from "@/screens/home";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import {
  generateComingSoonMetadata,
  generateJsonLd,
  generatePageMetadata,
  isComingSoon,
  localizedPath,
} from "@/shared/lib/metadata";

const OG_IMAGE = "/images/home/hero-home-desktop.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/",
    image: new URL(OG_IMAGE, SITE_URL).toString(),
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [meta] = await Promise.all([
    getTranslations({ locale, namespace: "metadata.home" }),
  ]);

  const pageUrl = new URL(localizedPath(locale, ROUTES.HOME), SITE_URL).toString();

  const webpageJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta("title"),
    description: meta("description"),
    url: pageUrl,
  });

  return (
    <div className="flex w-full flex-col" data-screen="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webpageJsonLd }} />
      <HomeHeroSection />
      <HomeIntroSection />
      <HomeAboutSection />
      <HomeProductsSection locale={locale} />
    </div>
  );
}
