import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  AboutCollectionSection,
  AboutHeroSection,
  AboutOriginSection,
} from "@/screens/about-the-product";
import { generateComingSoonMetadata, generatePageMetadata, isComingSoon } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

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
    <div className="flex w-full flex-col">
      <AboutHeroSection />
      <AboutOriginSection />
      <AboutCollectionSection />
    </div>
  );
}
