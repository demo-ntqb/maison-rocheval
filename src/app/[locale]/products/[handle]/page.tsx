import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import {
  ProductDetailAssistanceSection,
  ProductDetailHeroSection,
  ProductDetailRelatedSection,
} from "@/screens/product-detail";
import { SITE_URL } from "@/shared/constants/site.constant";
import { getCatalogHandles, getProductDetail } from "@/shared/lib/shopify/catalog";
import {
  generateJsonLd,
  generatePageMetadata,
  localizedPath,
} from "@/shared/lib/metadata";

const LEGACY_HANDLES: Record<string, string> = {
  "caviar-amur": "amour",
  "caviar-kaluga": "kaluga",
  "caviar-russian-hybrid": "russian-hybrid",
  expression: "lexpression",
};

function canonicalHandle(handle: string): string {
  return LEGACY_HANDLES[handle] ?? handle;
}

function productPath(locale: string, handle: string): string {
  const path = `/products/${handle}`;
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export async function generateStaticParams() {
  return (await getCatalogHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  const canonical = canonicalHandle(handle);
  const product = await getProductDetail(locale, canonical);

  if (!product) return {};

  return generatePageMetadata(locale, product.title, product.description, {
    canonical: `/products/${canonical}`,
    image: product.image?.url,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const canonical = canonicalHandle(handle);
  if (canonical !== handle) permanentRedirect(productPath(locale, canonical));

  const product = await getProductDetail(locale, canonical);
  if (!product) notFound();

  const productUrl = new URL(localizedPath(locale, `/products/${product.handle}`), SITE_URL);
  const productJsonLd = generateJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.galleryImages.map(({ url }) => url),
    sku: product.variants[0]?.sku || undefined,
    url: productUrl.toString(),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      sku: variant.sku || undefined,
      url: productUrl.toString(),
    })),
  });

  return (
    <div className="flex flex-col items-center gap-[120px] pb-[120px] pt-12 sm:gap-[160px] sm:pb-[160px] sm:pt-16 lg:gap-[200px] lg:pb-[200px] lg:pt-[100px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd }} />
      <ProductDetailHeroSection product={product} />
      <ProductDetailAssistanceSection />
      <ProductDetailRelatedSection products={product.relatedProducts} />
    </div>
  );
}
