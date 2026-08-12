import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorialFeatured } from "@/shared/components/composite/editorial-featured";

export function AboutHistorySection() {
  const t = useTranslations("about.history");

  return (
    <section className="flex w-full justify-center bg-white py-[100px] lg:py-[200px]">
      <EditorialFeatured
        title={t("title")}
        description={t("description")}
        imageUrl="/images/about/history.jpg"
        imageAlt="Sustainable Sturgeons Farm in Pure Waters"
      />
    </section>
  );
}
