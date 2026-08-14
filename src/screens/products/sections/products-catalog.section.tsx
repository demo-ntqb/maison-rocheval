import { getTranslations } from "next-intl/server";

import { ProductsProductGrid } from "../components/products-product-grid";
import { getCollectionProducts } from "@/shared/lib/shopify/catalog";

export async function ProductsCatalogSection({ locale }: { locale: string }) {
  const [products, t] = await Promise.all([
    getCollectionProducts(locale, "our-caviar"),
    getTranslations({ locale, namespace: "products.catalog" }),
  ]);

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
        {t("itemCount", { count: products.length })}
      </p>
      <ProductsProductGrid products={products} />
    </section>
  );
}
