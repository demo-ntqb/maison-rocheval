import { getTranslations } from "next-intl/server";

import { FaqSection } from "@/shared/components/composite/faq-section";
import { ROUTES } from "@/shared/constants/route.constant";

export async function ProductsFaqSection() {
  const t = await getTranslations("products.faq");
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `products-faq-${index + 1}`,
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
  }));

  return (
    <FaqSection
      data-plumb-id="component-6"
      title={t("title")}
      items={items}
      buttonText={t("viewAll")}
      buttonLink={ROUTES.ABOUT_PRODUCT}
      logoBasePath="/images/about-brand/faq-caviar-tin"
      logoFallbackExtension="png"
      logoAlt={t("imageAlt")}
      className="products-faq-deferred gap-[54px] lg:h-[832px]"
    />
  );
}
