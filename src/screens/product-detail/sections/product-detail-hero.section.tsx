import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/route.constant";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { ProductDetailImageGallery } from "../components/product-detail-image-gallery";
import { ProductDetailInfo } from "../components/product-detail-info";
import { ProductDetailSpecs } from "../components/product-detail-specs";

export interface ProductDetailHeroSectionProps {
  product: CatalogProductDetail;
}

export async function ProductDetailHeroSection({ product }: ProductDetailHeroSectionProps) {
  const messages = (await getMessages()) as Record<string, unknown>;

  return (
    <section className="w-full max-w-[1000px] px-6 lg:px-0">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-sm text-black">
        <Link
          href={ROUTES.PRODUCTS}
          className="underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Shop
        </Link>
        <span aria-hidden="true">&gt;</span>
        <span className="font-medium text-black">{product.title}</span>
      </nav>

      <NextIntlClientProvider messages={{ productDetail: messages.productDetail }}>
        {/* Main Product Layout (2 Columns) */}
        <div className="mt-8 grid gap-[54px] lg:grid-cols-[546px_1fr]">
          {/* Left Column: Image Gallery */}
          <ProductDetailImageGallery
            images={product.galleryImages}
            title={product.title}
          />

          {/* Right Column: Product Info & Configurator */}
          <div className="flex flex-col gap-16 sm:gap-24">

            <ProductDetailInfo product={product} />
            <ProductDetailSpecs product={product} />
          </div>
        </div>
      </NextIntlClientProvider>
    </section>
  );
}
