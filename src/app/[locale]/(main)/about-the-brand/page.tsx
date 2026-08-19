import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  AboutFaqSection,
  AboutHeroSection,
  AboutHistorySection,
  AboutRitualSection,
  AboutSelectionSection,
  AboutVenuesSection,
} from "@/screens/about-the-brand";
import { generateComingSoonMetadata, generatePageMetadata, isComingSoon } from "@/shared/lib/metadata";

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
  });
}

export default async function AboutBrandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div data-plumb-id="about-the-brand" className="flex w-full flex-col">
      <AboutHeroSection />
      <AboutHistorySection />
      <AboutVenuesSection />
      <AboutSelectionSection />
      <AboutRitualSection />
      <AboutFaqSection />
    </div>
  );
}
