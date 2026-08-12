import * as React from "react";
import { useTranslations } from "next-intl";
import { ProductGrid } from "@/shared/components/composite/product-grid";
import { VARIETIES } from "@/shared/constants/shop.constant";

export function ShopProductsSection() {
  const t = useTranslations("shop");

  return (
    <section className="flex w-full flex-col items-center bg-white pb-[100px] pt-4">
      {/* Filters & Sorting Bar (w: 1000px) */}
      <div className="mb-8 flex w-full max-w-[1000px] items-center justify-between border-b border-gray-light/20 pb-4 px-4 sm:px-6 lg:px-0">
        <span className="font-sans text-xs font-light text-gray-dark uppercase">
          {VARIETIES.length} {t("title").toLowerCase()}
        </span>
        
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="font-sans text-xs font-medium text-black hover:text-gray-dark uppercase underline underline-offset-4"
          >
            {t("filter")}
          </button>
          <span className="font-sans text-xs font-light text-gray-dark uppercase">
            {t("sort")}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-[1000px] px-4 sm:px-6 lg:px-0">
        <ProductGrid products={VARIETIES} layoutType="grid" />
      </div>
    </section>
  );
}
