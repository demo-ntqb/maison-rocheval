import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorialFeatured } from "@/shared/components/composite/editorial-featured";

export function HomeIntroSection() {
  const t = useTranslations("home.intro");

  return (
    <section className="flex w-full justify-center bg-white py-[100px] lg:py-[200px]">
      <EditorialFeatured
        title={t("title")}
        description={t("description")}
        imageUrl="/images/home/intro.jpg"
        imageAlt="Maison Rocheval Heritage Craftsmanship"
        buttonText={t("learnMore")}
        buttonLink="/about"
      />
    </section>
  );
}
