import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import type { CatalogGiftSetDetail } from "@/shared/lib/shopify/catalog-mapper";
import { ProductDetailBreadcrumb } from "../components/product-detail-breadcrumb";
import { ProductDetailGallery } from "../components/product-detail-gallery";
import { ProductDetailGiftSetPanel } from "../components/product-detail-gift-set-panel";
import { ProductDetailInformation } from "../components/product-detail-information";

export interface ProductDetailGiftSetSectionProps {
  product: CatalogGiftSetDetail;
}

export async function ProductDetailGiftSetSection({ product }: ProductDetailGiftSetSectionProps) {
  const messages = (await getMessages()) as { productDetail: unknown };
  const catalogT = await getTranslations("products");

  return (
    <NextIntlClientProvider messages={{ productDetail: messages.productDetail }}>
      <section className="mx-auto w-full max-w-content px-4 pt-25 pb-50 lg:px-0">
        <ProductDetailBreadcrumb
          category="gift-sets"
          categoryLabel={catalogT("categories.gift-sets")}
          shopLabel={catalogT("breadcrumb.shop")}
          title={product.title}
        />

        <div className="grid grid-cols-1 gap-[54px] pt-8 lg:grid-cols-[1fr_350px] lg:pt-0">
          <div className="lg:sticky lg:top-32 lg:self-start lg:py-8">
            <ProductDetailGallery images={product.galleryImages} title={product.title} />
          </div>

          <div className="flex w-full flex-col gap-[54px] lg:py-8">
            <ProductDetailGiftSetPanel product={product} />
            <ProductDetailInformation product={product} />
          </div>
        </div>
      </section>
    </NextIntlClientProvider>
  );
}
