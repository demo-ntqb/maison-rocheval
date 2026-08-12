import { getTranslations } from "next-intl/server";

import { PRODUCTS } from "../constants/products.constant";
import { ProductsProductGrid } from "../components/products-product-grid";
import type { ProductsProductViewModel } from "../types/products.type";

export async function ProductsCatalogSection() {
  const t = await getTranslations("products.catalog");
  const products: ProductsProductViewModel[] = PRODUCTS.map((product) => ({
    ...product,
    content: {
      description: t(`cards.${product.translationKey}.description`),
      eyebrow: t(`cards.${product.translationKey}.eyebrow`),
      imageAlt: t(`cards.${product.translationKey}.imageAlt`),
      profile: t(`cards.${product.translationKey}.profile`),
      species: t(`cards.${product.translationKey}.species`),
      title: t(`cards.${product.translationKey}.title`),
    },
  }));

  return (
    <section
      data-plumb-id="frame-2085667044"
      aria-labelledby="products-catalog-title"
      className="flex w-full max-w-content flex-col gap-[54px] px-4 sm:px-6 lg:px-0"
    >
      <h2 id="products-catalog-title" className="sr-only">
        {t("title")}
      </h2>
      <p data-plumb-id="5-items" className="font-sans text-sm leading-[18px] text-ink">
        {t("itemCount", { count: PRODUCTS.length })}
      </p>
      <ProductsProductGrid products={products} />
    </section>
  );
}
