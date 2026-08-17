import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  AboutFaqSection,
  AboutHeroSection,
  AboutHistorySection,
  AboutCultivationSection,
  AboutUnderstandSection,
  AboutSelectionSection,
} from "@/screens/about-the-product";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.aboutProduct" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/about-the-product",
  });
}

export default async function AboutProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full">
      <AboutHeroSection />
      <AboutHistorySection />
      <AboutCultivationSection />
      <AboutUnderstandSection locale={locale} />
      <AboutSelectionSection />
      <AboutFaqSection />
    </div>
  );
}
