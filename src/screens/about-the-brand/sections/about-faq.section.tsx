import { FaqSection } from "@/shared/components/composite/faq-section";
import { getTranslations } from "next-intl/server";

export async function AboutFaqSection() {
  const t = await getTranslations("aboutBrand.faq");
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `about-brand-faq-${index + 1}`,
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
  }));

  return (
    <section data-plumb-id="frame-2085667040" className="flex w-full flex-col items-center justify-center bg-white py-24 lg:py-[200px]">
      <FaqSection
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
