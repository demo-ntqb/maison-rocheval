import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProductsCatalogSection, ProductsEditorialSection, ProductsFaqSection } from "@/screens/products";
import { ROUTES } from "@/shared/constants/route.constant";
import { getProductsByCategory, isProductCategory, mapMockToCatalogCard, PRODUCT_CATEGORIES, type ProductCategory } from "@/shared/lib/catalog-mock";
import { generatePageMetadata } from "@/shared/lib/metadata";

type Params = Promise<{ locale: string; category: string }>;

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ category }));
}

// --- Data Fetching Abstraction (Dành cho việc tích hợp Shopify Storefront API sau này) ---
/**
 * Lấy danh sách sản phẩm theo danh mục.
 * Sau này khi triển khai Shopify, bạn chỉ cần:
 * 1. Query danh sách sản phẩm thuộc collection tương ứng dựa theo handle (category).
 * 2. Sử dụng `mapCollectionProducts` từ `@/shared/lib/shopify/catalog-mapper` để chuyển đổi và trả về.
 */
async function fetchCategoryProducts(category: string) {
  if (!isProductCategory(category)) return [];
  return getProductsByCategory(category as ProductCategory).map(mapMockToCatalogCard);
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

  const products = await fetchCategoryProducts(category);

  return (
    <div
      className={`mx-auto w-full max-w-content flex flex-col gap-[120px] px-4 pb-24 sm:px-6 lg:gap-[200px] lg:px-0 ${category === "caviar" ? "lg:pb-72" : "lg:pb-50"}`}
    >
      <ProductsCatalogSection locale={locale} category={category as ProductCategory} products={products} />
      <ProductsEditorialSection category={category as ProductCategory} />
      <ProductsFaqSection category={category as ProductCategory} />
    </div>
  );
}
