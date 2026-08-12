import * as React from "react";
import { useTranslations } from "next-intl";
import { FaqSection } from "@/shared/components/composite/faq-section";
import { FAQ_ITEMS } from "@/shared/constants/faq.constant";

export function AboutFaqSection() {
  const t = useTranslations("home.faq"); // Sử dụng chung bản dịch FAQ của trang chủ

  return (
    <section className="flex w-full justify-center bg-white py-[100px] lg:py-[200px]">
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
