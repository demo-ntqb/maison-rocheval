import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorialSplit } from "@/shared/components/composite/editorial-split";

export function HomeAboutSection() {
  const t = useTranslations("home.about");

  return (
    <section className="flex w-full justify-center bg-beige py-[100px] lg:py-[200px]">
      <EditorialSplit
        highlightText={t("highlight")}
        title={t("title")}
        description={t("description")}
        imageUrl="/images/home/about.jpg"
        imageAlt="The Art of Maturation"
        buttonText={t("explore")}
        buttonLink="/shop"
        imagePosition="left"
      />
    </section>
  );
}
