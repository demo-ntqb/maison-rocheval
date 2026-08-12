import * as React from "react";
import { useTranslations } from "next-intl";

export function ShopHeroSection() {
  const t = useTranslations("shop");

  return (
    <section
      data-slot="shop-hero-section"
      className="w-full bg-white pt-12 pb-8 flex flex-col items-center text-center px-4"
    >
      <div className="flex max-w-[600px] flex-col items-center gap-2">
        <span className="font-sans text-[11px] font-light tracking-widest text-gray-dark uppercase">
          {t("subtitle")}
        </span>
        <h1 className="font-display text-[32px] font-medium leading-tight text-black">
          {t("title")}
        </h1>
        <div className="mt-6 h-[0.5px] w-20 bg-gray-light" />
      </div>
    </section>
  );
}
