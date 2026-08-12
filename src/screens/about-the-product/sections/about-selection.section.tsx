import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorialSplit } from "@/shared/components/composite/editorial-split";

export function AboutSelectionSection() {
  const t = useTranslations("about.selection");

  return (
    <section className="flex w-full justify-center bg-beige py-[100px] lg:py-[200px]">
      <EditorialSplit
        highlightText={t("highlight")}
        title={t("title")}
        description={t("description")}
        imageUrl="/images/about/selection.jpg"
        imageAlt="Expert caviar selection and quality control"
        imagePosition="left"
      />
    </section>
  );
}
