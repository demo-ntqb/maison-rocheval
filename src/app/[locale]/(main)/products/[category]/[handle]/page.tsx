import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailHeroSection, ProductDetailRelatedSection } from "@/screens/product-detail";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import { getMockProduct, getMockStaticParams, getProductsByCategory, isProductCategory, mapMockToCatalogCard, mapMockToProductDetail, type ProductCategory } from "@/shared/lib/catalog-mock";
import { generateJsonLd, generatePageMetadata, localizedPath } from "@/shared/lib/metadata";

type Params = Promise<{ locale: string; category: string; handle: string }>;

export function generateStaticParams() { return getMockStaticParams(); }

// --- Data Fetching Abstraction (Dành cho việc tích hợp Shopify Storefront API sau này) ---
/**
 * Lấy thông tin chi tiết sản phẩm.
 * Sau này khi triển khai Shopify, bạn chỉ cần:
 * 1. Viết GraphQL Query lấy product detail dựa theo handle.
 * 2. Gọi client Storefront API: const { product } = await storefrontClient.query({ query: PRODUCT_DETAIL_QUERY, variables: { handle } });
 * 3. Sử dụng helper `mapProductDetail` từ `@/shared/lib/shopify/catalog-mapper` để ánh xạ thành CatalogProductDetail và trả về.
 */
async function fetchProductDetail(category: string, handle: string) {
  if (!isProductCategory(category)) return null;
  const mock = getMockProduct(category as ProductCategory, handle);
  if (!mock) return null;
  return mapMockToProductDetail(mock);
}

/**
 * Lấy danh sách sản phẩm liên quan.
 * Sau này khi triển khai Shopify, bạn chỉ cần:
 * 1. Query danh sách sản phẩm cùng collection hoặc lấy danh sách ID/handle từ metafield `related_products` của sản phẩm hiện tại.
 * 2. Sử dụng `mapCollectionProducts` từ `@/shared/lib/shopify/catalog-mapper` để ánh xạ dữ liệu và trả về.
 */
async function fetchRelatedProducts(category: string, currentHandle: string) {
  if (!isProductCategory(category)) return [];
  return getProductsByCategory(category as ProductCategory)
    .filter((item) => item.handle !== currentHandle)
    .slice(0, 3)
    .map(mapMockToCatalogCard);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, category, handle } = await params;
  const product = await fetchProductDetail(category, handle);
  if (!product) return {};

  return generatePageMetadata(locale, product.title, product.description, {
    canonical: ROUTES.PRODUCT_DETAIL(category as ProductCategory, handle),
    image: product.image?.url ?? undefined,
  });
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { locale, category, handle } = await params;
  if (!isProductCategory(category)) notFound();

  const product = await fetchProductDetail(category, handle);
  if (!product) notFound();

  const related = await fetchRelatedProducts(category, handle);

  const path = ROUTES.PRODUCT_DETAIL(category, handle);
  const url = new URL(localizedPath(locale, path), SITE_URL).toString();

  const productJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.galleryImages.map((img) => img.url),
    sku: product.id,
    url,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      sku: variant.id,
      url,
    })),
  });

  const breadcrumbJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: new URL(localizedPath(locale, ROUTES.PRODUCTS), SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category === "caviar" ? "Caviar" : "Gift sets",
        item: new URL(
          localizedPath(locale, ROUTES.PRODUCT_CATEGORY(category)),
          SITE_URL
        ).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: url,
      },
    ],
  });

  return (
    <div className="flex w-full flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <ProductDetailHeroSection product={product} />
      <div className="pb-24 lg:pb-50">
        <ProductDetailRelatedSection category={category} products={related} />
      </div>
    </div>
  );
}

