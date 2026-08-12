import * as React from "react";
import { getTranslations } from "next-intl/server";
import { FaqSection } from "@/shared/components/composite/faq-section";
import { FAQ_ITEMS } from "@/shared/constants/faq.constant";

export async function HomeFaqSection() {
  const t = await getTranslations("home.faq");

  return (
    <section className="flex w-full justify-center bg-white py-[100px] lg:pb-[200px] lg:pt-[100px]">
      <FaqSection
        title={t("title")}
        subtitle={t("subtitle")}
        items={FAQ_ITEMS}
        buttonText={t("moreQuestions")}
        buttonLink="/contact"
        logoUrl="/images/home/badge.webp"
        logoAlt="Maison Rocheval Seal"
      />
    </section>
  );
}
