import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { ROUTES } from "@/shared/constants/route.constant";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { ProductDetailImageGallery } from "../components/product-detail-image-gallery";
import { ProductDetailInfo } from "../components/product-detail-info";
import { ProductDetailSpecs } from "../components/product-detail-specs";

export interface ProductDetailHeroSectionProps {
  product: CatalogProductDetail;
}

export async function ProductDetailHeroSection({ product }: ProductDetailHeroSectionProps) {
  const messages = (await getMessages()) as { productDetail: unknown; products: unknown };
  const catalogT = await getTranslations("products");
  
  const categoryKey = product.productType === "Gift Set" ? "gift-sets" : "caviar";
  const categoryLabel = catalogT(`categories.${categoryKey}`);
  const shopLabel = catalogT("breadcrumb.shop");

  return (
    <NextIntlClientProvider messages={{ productDetail: messages.productDetail, products: messages.products }}>
      <section className="mx-auto w-full px-4 lg:px-0 py-8 lg:pt-25 lg:pb-50">
        <div className="mx-auto w-full max-w-250 flex flex-col gap-8">
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList className="font-sans text-xs uppercase tracking-[0.08em] text-ink">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={ROUTES.PRODUCTS}>{shopLabel}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={product.productType === "Gift Set" ? ROUTES.PRODUCT_CATEGORY("gift-sets") : ROUTES.PRODUCT_CATEGORY("caviar")}>
                    {categoryLabel}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title.toUpperCase()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Main Container */}
          <div className="grid grid-cols-1 lg:grid-cols-[596px_350px] gap-13.5 w-full justify-center">
            {/* Left Column: Image Gallery */}
            <div className="flex flex-col gap-13.5 w-full max-w-149">
              <div className="flex flex-col gap-4 w-full py-8">
                <ProductDetailImageGallery images={product.galleryImages} title={product.title} />
              </div>
            </div>

            {/* Right Column: Info & Options */}
            <div className="flex flex-col gap-13.5 w-full max-w-87.5 py-8">
              <ProductDetailInfo product={product} />
              <div className="mt-8">
                <ProductDetailSpecs product={product} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </NextIntlClientProvider>
  );
}
