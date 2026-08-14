"use client";

import { useLocale, useTranslations } from "next-intl";

import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { useProductDetailConfigurator } from "../hooks/product-detail-configurator.hook";
import type {
  ProductDetailTranslationKey,
  ProductDetailTranslator,
} from "../types/product-detail.type";
import { ProductDetailHeading } from "./product-detail-heading";
import { ProductDetailOrderSummary } from "./product-detail-order-summary";
import { ProductDetailPackagingSelector } from "./product-detail-packaging-selector";
import { ProductDetailPerBoxSelector } from "./product-detail-per-box-selector";
import { ProductDetailSizeSelector } from "./product-detail-size-selector";

export function ProductDetailInfo({ product }: { product: CatalogProductDetail }) {
  const locale = useLocale();
  const t = useTranslations("productDetail");
  const configurator = useProductDetailConfigurator(product, locale);
  const translate: ProductDetailTranslator = (
    key: ProductDetailTranslationKey,
    values?: Record<string, number | string>,
  ) => (values ? t(key, values) : t(key));

  return (
    <div className="flex w-full flex-col gap-8">
      <ProductDetailHeading product={product} />
      <ProductDetailSizeSelector label={translate("sizeLabel")} onChange={configurator.selectSize} selectedSize={configurator.selection.size} variants={product.variants} />
      <ProductDetailPackagingSelector formatMoney={configurator.formatMoney} freeLabel={translate("free")} label={translate("packagingLabel")} onChange={configurator.selectPackaging} options={product.packagingOptions} selectedId={configurator.selection.packagingId} />
      <ProductDetailPerBoxSelector label={translate("perBoxLabel")} onChange={configurator.selectPerBox} selected={configurator.selection.perBox} />
      <div className="border-t border-line" />
      <ProductDetailOrderSummary activePackaging={configurator.activePackaging} activeVariant={configurator.activeVariant} formattedTotal={configurator.formatMoney(configurator.totalPrice)} onQuantityChange={configurator.setQuantity} selection={configurator.selection} title={product.title} translate={translate} />
    </div>
  );
}
