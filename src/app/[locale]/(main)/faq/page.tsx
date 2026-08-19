import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqAccordionSection, FaqHeroSection } from "@/screens/faq";
import { generateComingSoonMetadata, generatePageMetadata, isComingSoon } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

  const t = await getTranslations({ locale, namespace: "metadata.faq" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/faq",
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex w-full flex-col bg-canvas" data-screen="faq">
      <FaqHeroSection />
      <FaqAccordionSection />
    </div>
  );
}