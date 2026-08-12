import * as React from "react";
import { getTranslations } from "next-intl/server";

export async function ShopHeroSection() {
  const t = await getTranslations("shop");

  return (
    <section data-slot="shop-hero-section" className="sr-only">
      <h1>{t("title")}</h1>
    </section>
  );
}
