import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { CatalogCollectionHandle, type CatalogCaviarDetail } from "@/shared/types/catalog.type";
import { ProductDetailBreadcrumb } from "../components/product-detail-breadcrumb";
import { ProductDetailCaviarPanel } from "../components/product-detail-caviar-panel";
import { ProductDetailGallery } from "../components/product-detail-gallery";
import { ProductDetailInformation } from "../components/product-detail-information";

export interface ProductDetailHeroSectionProps {
  product: CatalogCaviarDetail;
}

export async function ProductDetailHeroSection({ product }: ProductDetailHeroSectionProps) {
  const messages = (await getMessages()) as { productDetail: unknown };
  const catalogT = await getTranslations("products");

  return (
    <NextIntlClientProvider messages={{ productDetail: messages.productDetail }}>
      <section className="mx-auto w-full max-w-content px-4 pt-25 pb-50 lg:px-0">
        <ProductDetailBreadcrumb
          category={CatalogCollectionHandle.CAVIAR}
          categoryLabel={catalogT("categories.caviar")}
          shopLabel={catalogT("breadcrumb.shop")}
          title={product.title}
        />

        {/* Figma: 596/350 columns split by a 54px gutter, each padded 32px
            vertically on desktop; mobile keeps the 32px lead only. */}
        <div className="grid grid-cols-1 gap-[54px] pt-8 lg:grid-cols-[1fr_350px] lg:pt-0">
          <div className="lg:sticky lg:top-32 lg:self-start lg:py-8">
            <ProductDetailGallery images={product.galleryImages} title={product.title} />
          </div>

          <div className="flex w-full flex-col gap-[54px] lg:py-8">
            <ProductDetailCaviarPanel product={product} />
            <ProductDetailInformation product={product} />
          </div>
        </div>
      </section>
    </NextIntlClientProvider>
  );
}
