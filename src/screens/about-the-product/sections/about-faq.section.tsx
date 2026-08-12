import { getTranslations } from "next-intl/server";

import { FaqSection } from "@/shared/components/composite/faq-section";

export async function AboutFaqSection() {
  const t = await getTranslations("aboutProduct.faq");
  const items = Array.from({ length: 5 }, (_, index) => ({ id: `about-product-faq-${index}`, question: t(`items.${index}.question`), answer: t(`items.${index}.answer`) }));
  return <section data-plumb-id="frame-2085667040" className="flex min-h-[1232px] flex-col items-center justify-center bg-canvas py-24 lg:py-[200px]"><FaqSection className="min-h-[832px]" title={t("title")} items={items} buttonText={t("viewAll")} buttonLink="/about-the-product" logoBasePath="/images/about-brand/faq-caviar-tin" logoFallbackExtension="png" logoAlt={t("imageAlt")} /></section>;
}
