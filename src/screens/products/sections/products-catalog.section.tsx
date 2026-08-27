import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ToggleButton } from "@/shared/components/ui/toggle-button";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/shared/constants/catalog.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import type { CatalogProductCard } from "@/shared/types/catalog.type";
import { ProductsProductGrid } from "../components/products-product-grid";

export async function ProductsCatalogSection({
  locale,
  category,
  products,
}: {
  locale: string;
  category: ProductCategory;
  products: readonly CatalogProductCard[];
}) {
  const t = await getTranslations({ locale, namespace: "products" });

  return (
    <section
      data-plumb-id="frame-2085667044"
      aria-labelledby="products-catalog-title"
      className="mx-auto flex w-full max-w-content flex-col gap-[54px] px-4 pt-12 sm:px-6 lg:px-0 lg:pt-[100px]"
    >
      <div className="flex flex-col items-center gap-8 text-center" data-plumb-id="component-7">
        <div data-plumb-id="component-7-2">
          <h1 id="products-catalog-title" data-plumb-id="lorem-ipsum-dolor-2" className="font-display text-[32px] leading-none text-ink">
            {t(`categoryContent.${category}.title`)}
          </h1>
          <p data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a" className="mt-4 max-w-150 font-sans text-sm leading-5 text-ink">
            {t(`categoryContent.${category}.description`)}
          </p>
        </div>
        <nav aria-label={t("categoryNavLabel")} className="flex gap-3" data-plumb-id="frame-2085667292">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <ToggleButton
                key={cat}
                asChild
                active={isActive}
              >
                <Link
                  href={ROUTES.PRODUCT_CATEGORY(cat)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span data-plumb-id="toggle">{t(`categories.${cat}`)}</span>
                </Link>
              </ToggleButton>
            );
          })}
        </nav>
      </div>
      <ProductsProductGrid products={products} />
    </section>
  );
}
