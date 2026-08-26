import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FaqAccordionSection, FaqHeroSection } from "@/screens/faq";
import { ROUTES } from "@/shared/constants/route.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "metadata.faq" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: ROUTES.FAQ,
  });
}

export default function FaqPage() {
  return (
    <div className="flex w-full flex-col bg-canvas" data-screen="faq">
      <FaqHeroSection />
      <FaqAccordionSection />
    </div>
  );
}
