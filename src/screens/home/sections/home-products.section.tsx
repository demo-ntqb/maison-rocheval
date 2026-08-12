import * as React from "react";
import { useTranslations } from "next-intl";
import { ProductGrid } from "@/shared/components/composite/product-grid";
import { VARIETIES } from "@/shared/constants/shop.constant";

export function HomeProductsSection() {
  const t = useTranslations("home.products");

  return (
    <section className="flex w-full flex-col items-center bg-white py-[100px] lg:py-[200px]">
      {/* Title & Subtitle */}
      <div className="mb-[64px] flex flex-col items-center text-center px-4">
        <span className="font-sans text-[11px] font-light tracking-widest text-gray-dark uppercase">
          {t("subtitle")}
        </span>
        <h2 className="mt-2 font-display text-[32px] font-medium leading-tight text-black">
          {t("title")}
        </h2>
      </div>

      {/* Slider Grid */}
      <div className="w-full max-w-[1000px] px-4 sm:px-6 lg:px-0">
        <ProductGrid products={VARIETIES} layoutType="slider" />
      </div>
    </section>
  );
}
