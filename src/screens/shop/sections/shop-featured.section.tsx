import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorialFeatured } from "@/shared/components/composite/editorial-featured";

export function ShopFeaturedSection() {
  const t = useTranslations("home.about"); // Tái sử dụng bản dịch về quy trình affinage

  return (
    <section className="flex w-full justify-center bg-beige py-[100px] lg:py-[200px]">
      <EditorialFeatured
        highlightText={t("highlight")}
        title={t("title")}
        description={t("description")}
        imageUrl="/images/shop/featured.jpg"
        imageAlt="Gourmet Caviar Pairing Experience"
        buttonText={t("explore")}
        buttonLink="/shop"
        textPosition="top"
      />
    </section>
  );
}
