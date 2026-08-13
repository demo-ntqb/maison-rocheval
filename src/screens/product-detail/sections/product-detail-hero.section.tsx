import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ProductDetailImageGallery } from "../components/product-detail-image-gallery";
import { ProductDetailInfo } from "../components/product-detail-info";
import { ProductDetailSpecs } from "../components/product-detail-specs";
import { getProductDetail } from "../constants/product-detail.constant";

export interface ProductDetailHeroSectionProps {
  handle: string;
}

export async function ProductDetailHeroSection({ handle }: ProductDetailHeroSectionProps) {
  const product = getProductDetail(handle);
  const messages = (await getMessages()) as Record<string, unknown>;

  return (
    <section className="w-full max-w-[1000px] px-6 lg:px-0">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-sm text-black">
        <Link
          href="/products"
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
            bestSeller={product.bestSeller}
          />

          {/* Right Column: Product Info & Configurator */}
          <ProductDetailInfo product={product} />
        </div>

        {/* Specification Accordion Section */}
        <div className="mt-16 sm:mt-24">
          <ProductDetailSpecs product={product} />
        </div>
      </NextIntlClientProvider>
    </section>
  );
}
