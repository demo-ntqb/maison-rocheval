import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProductsCatalogSection, ProductsEditorialSection, ProductsFaqSection } from "@/screens/products";
import { ROUTES } from "@/shared/constants/route.constant";
import { getCollectionProducts } from "@/shared/lib/shopify/catalog";
import { isProductCategory, PRODUCT_CATEGORIES, type ProductCategory } from "@/shared/constants/catalog.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";
import { CatalogCollectionHandle } from "@/shared/types/catalog.type";

type Params = Promise<{ locale: string; category: string }>;

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ category }));
}

// --- Data Fetching Abstraction (Dành cho việc tích hợp Shopify Storefront API sau này) ---
/**
 * Lấy danh sách sản phẩm theo danh mục từ Shopify Storefront API.
 */
async function fetchCategoryProducts(locale: string, category: string) {
  if (!isProductCategory(category)) return [];
  return getCollectionProducts(locale, category);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isProductCategory(category)) return {};
  const t = await getTranslations({ locale, namespace: "metadata.products" });
  return generatePageMetadata(locale, t(`${category}.title`), t(`${category}.description`), { canonical: ROUTES.PRODUCT_CATEGORY(category) });
}

export default async function ProductCategoryPage({ params }: { params: Params }) {
  const { locale, category } = await params;
  if (!isProductCategory(category)) notFound();

  const products = await fetchCategoryProducts(locale, category);

  return (
    <div
      className={`mx-auto w-full max-w-content flex flex-col gap-[120px] px-4 pb-24 sm:px-6 lg:gap-[200px] lg:px-0 ${category === CatalogCollectionHandle.CAVIAR ? "lg:pb-72" : "lg:pb-50"}`}
    >
      <ProductsCatalogSection locale={locale} category={category as ProductCategory} products={products} />
      <ProductsEditorialSection category={category as ProductCategory} />
      <ProductsFaqSection category={category as ProductCategory} />
    </div>
  );
}
