import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductDetailGiftSetSection,
  ProductDetailHeroSection,
  ProductDetailRelatedSection,
} from "@/screens/product-detail";
import { isProductCategory, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_HANDLE_TO_PRODUCT_TYPE_MAP, type ProductCategory } from "@/shared/constants/catalog.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { SITE_URL } from "@/shared/constants/site.constant";
import { generateJsonLd, generatePageMetadata, localizedPath } from "@/shared/lib/metadata";
import { getCollectionProducts, getProductDetail } from "@/shared/lib/shopify/catalog";
import { getDiscoveredMarkets } from "@/shared/lib/shopify/localization";
import { CatalogProductType } from "@/shared/types/catalog.type";

type Params = Promise<{ locale: string; category: string; handle: string }>;

export async function generateStaticParams() {
  const params: { category: string; handle: string }[] = [];
  const { availableRouteLocales } = await getDiscoveredMarkets();
  const discoveryLocale = availableRouteLocales[0];
  if (!discoveryLocale) return params;
  for (const category of PRODUCT_CATEGORIES) {
    const products = await getCollectionProducts(discoveryLocale, category);
    for (const p of products) {
      params.push({ category, handle: p.handle });
    }
  }
  return params;
}

// --- Data Fetching Abstraction ---
/**
 * Lấy thông tin chi tiết sản phẩm từ Shopify Storefront API.
 */
async function fetchProductDetail(locale: string, category: string, handle: string) {
  if (!isProductCategory(category)) return null;
  const product = await getProductDetail(locale, handle);
  if (!product) return null;

  if (product.category !== category) {
    return null;
  }

  return product;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, category, handle } = await params;
  const product = await fetchProductDetail(locale, category, handle);
  if (!product) return {};

  return await generatePageMetadata(locale, product.title, product.description, {
    canonical: ROUTES.PRODUCT_DETAIL(category as ProductCategory, handle),
    image: product.image?.url ?? undefined,
  });
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { locale, category, handle } = await params;
  if (!isProductCategory(category)) notFound();

  const product = await fetchProductDetail(locale, category, handle);
  if (!product) notFound();

  const related = product.relatedProducts.length > 0
    ? product.relatedProducts : [];

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
      availability: variant.availableForSale
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
        name: PRODUCT_CATEGORY_HANDLE_TO_PRODUCT_TYPE_MAP?.[category] || '',
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
      {product.productType === CatalogProductType.GIFT_SET ? (
        <ProductDetailGiftSetSection product={product} />
      ) : (
        <ProductDetailHeroSection product={product} />
      )}
      <div className="pb-24 lg:pb-50">
        <ProductDetailRelatedSection category={category} products={related} />
      </div>
    </div>
  );
}
