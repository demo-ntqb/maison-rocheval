import { getTranslations } from "next-intl/server";

import { FaqSection } from "@/shared/components/composite/faq-section";
import { ROUTES } from "@/shared/constants/route.constant";

export async function AboutFaqSection() {
  const t = await getTranslations("aboutProduct.faq");
  const items = Array.from({ length: 5 }, (_, index) => ({ id: `about-product-faq-${index}`, question: t(`items.${index}.question`), answer: t(`items.${index}.answer`) }));

  return (
    <section data-plumb-id="frame-2085667040" className="flex flex-col items-center justify-center bg-canvas py-24 lg:py-[200px]">
      <FaqSection
        title={t("title")}
        items={items}
        buttonText={t("viewAll")}
        buttonLink={ROUTES.ABOUT_PRODUCT}
        logoBasePath="/images/about-brand/faq-caviar-tin"
        logoFallbackExtension="png"
        logoAlt={t("imageAlt")}
      />
    </section>
  );
}
