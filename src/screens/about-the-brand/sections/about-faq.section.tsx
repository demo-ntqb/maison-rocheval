import * as React from "react";
import { getTranslations } from "next-intl/server";
import { FaqSection } from "@/shared/components/composite/faq-section";

export async function AboutFaqSection() {
  const t = await getTranslations("aboutBrand.faq");
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `about-brand-faq-${index + 1}`,
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
  }));

  return (
    <section data-plumb-id="frame-2085667040" className="flex min-h-[1232px] w-full flex-col items-center justify-center bg-white py-24 lg:py-[200px]">
      <FaqSection
        className="min-h-[832px]"
        title={t("title")}
        items={items}
        buttonText={t("viewAll")}
        buttonLink="/about-the-brand"
        logoBasePath="/images/about-brand/faq-caviar-tin"
        logoFallbackExtension="png"
        logoAlt={t("imageAlt")}
      />
    </section>
  );
}
