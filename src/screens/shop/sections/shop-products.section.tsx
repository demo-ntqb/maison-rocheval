import * as React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ProductGrid } from "@/shared/components/composite/product-grid";
import { VARIETIES } from "@/shared/constants/shop.constant";

export async function ShopProductsSection() {
  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations("shop"),
  ]);

  return (
    <section className="flex h-[1200px] w-full flex-col items-center bg-white">
      <h2 className="sr-only">Our caviar</h2>
      {/* Filters & Sorting Bar (w: 1000px) */}
      <div className="mb-12 flex w-full max-w-[1000px] items-center justify-between px-4 sm:px-6 lg:px-0">
        <span className="font-sans text-xs font-light text-gray-dark uppercase">
          {VARIETIES.length} items
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
        <NextIntlClientProvider messages={{ shop: messages.shop }}>
          <ProductGrid products={VARIETIES} layoutType="grid" />
        </NextIntlClientProvider>
      </div>
    </section>
  );
}
