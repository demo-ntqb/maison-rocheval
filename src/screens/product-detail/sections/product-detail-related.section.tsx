import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/shared/components/composite/product-card";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";

export interface ProductDetailRelatedSectionProps {
  products: CatalogProductCard[];
}

export async function ProductDetailRelatedSection({
  products,
}: ProductDetailRelatedSectionProps) {
  const t = await getTranslations("productDetail.related");

  return (
    <section className="flex w-full max-w-[1000px] flex-col items-center px-6 text-center lg:px-0">
      <h2 className="font-display text-2xl font-normal text-black sm:text-[28px]">
        {t("title")}
      </h2>

      <div className="mt-10 grid w-full gap-8 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Link
        href="/products"
        className="mt-12 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-widest text-black underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        {t("cta")}
      </Link>
    </section>
  );
}
