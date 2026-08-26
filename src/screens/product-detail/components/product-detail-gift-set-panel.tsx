"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCart } from "@/shared/components/cart";
import { ROUTES } from "@/shared/constants/route.constant";
import type { CatalogGiftSetDetail } from "@/shared/lib/shopify/catalog-mapper";
import { formatCatalogPrice } from "../lib/product-detail-configurator";
import { ProductDetailPurchase } from "./product-detail-purchase";
import { ProductDetailSummary } from "./product-detail-summary";
import { ProductDetailTinWeightSelector } from "./product-detail-tin-weight-selector";

export interface ProductDetailGiftSetPanelProps {
  product: CatalogGiftSetDetail;
}

/** Variant labels are the full sentence shown in the radio ("L'Initiation, Three 30g Tins") — the cart line only wants the part after the product name. */
function stripTitlePrefix(optionValue: string, title: string): string {
  const prefix = `${title}, `;
  return optionValue.startsWith(prefix) ? optionValue.slice(prefix.length) : optionValue;
}

export function ProductDetailGiftSetPanel({ product }: ProductDetailGiftSetPanelProps) {
  const locale = useLocale();
  const t = useTranslations("productDetail");
  const cart = useCart();

  const [selectedOption, setSelectedOption] = useState(
    product.variants[0]?.optionValue ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const activeVariant =
    product.variants.find((variant) => variant.optionValue === selectedOption) ??
    product.variants[0];

  const composition = (product.composition ?? []).map((key) =>
    t.has(`composition.${key}`) ? t(`composition.${key}`) : key,
  );

  const formattedPrice = formatCatalogPrice(
    Number(activeVariant?.price.amount ?? product.price.amount),
    activeVariant?.price.currencyCode ?? product.price.currencyCode,
    locale,
  );

  const handleAddToCart = () => {
    if (!activeVariant) {
      return;
    }

    cart.addGiftSetUnits({
      group: {
        addHref: ROUTES.PRODUCT_DETAIL("gift-sets", product.handle),
        id: product.id,
        title: product.title,
      },
      quantity,
      unit: {
        currencyCode: activeVariant.price.currencyCode,
        image: product.image,
        title: product.title,
        unitPrice: Number(activeVariant.price.amount),
        weight: stripTitlePrefix(activeVariant.optionValue, product.title),
      },
    });
    setQuantity(1);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <ProductDetailSummary
        composition={composition}
        description={product.description}
        seeLessLabel={t("seeLess")}
        seeMoreLabel={t("seeMore")}
        subtitle={product.profile || product.subtitle}
        title={product.title}
      />

      {product.variants.length > 0 ? (
        <ProductDetailTinWeightSelector
          label={t("sizeLabel")}
          onChange={setSelectedOption}
          selected={selectedOption}
          variants={product.variants}
        />
      ) : null}

      <ProductDetailPurchase
        addToCartLabel={t("addToCart")}
        available={activeVariant?.availableForSale ?? product.availableForSale}
        decreaseLabel={t("decreaseQty")}
        deliveryNote={t("deliveryNote")}
        formattedPrice={formattedPrice}
        increaseLabel={t("increaseQty")}
        onAddToCart={handleAddToCart}
        onQuantityChange={setQuantity}
        quantity={quantity}
        unavailableLabel={t("unavailable")}
      />
    </div>
  );
}
