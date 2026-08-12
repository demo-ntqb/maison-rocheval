import { getTranslations } from "next-intl/server";
import { FaqSection } from "@/shared/components/composite/faq-section";

export async function ShopFaqSection() {
  const t = await getTranslations("aboutProduct.faq");
  const items=Array.from({length:5},(_,index)=>({id:`shop-faq-${index}`,question:t(`items.${index}.question`),answer:t(`items.${index}.answer`)}));
  return <section className="flex h-[846px] items-center justify-center"><FaqSection title={t("title")} items={items} buttonText={t("viewAll")} buttonLink="/products" logoBasePath="/images/about-brand/faq-caviar-tin" logoFallbackExtension="png" logoAlt={t("imageAlt")} /></section>;
}
