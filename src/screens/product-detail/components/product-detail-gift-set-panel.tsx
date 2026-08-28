"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useCart } from "@/shared/components/cart";
import { ROUTES } from "@/shared/constants/route.constant";
import { CatalogCollectionHandle, type CatalogGiftSetDetail } from "@/shared/types/catalog.type";
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

  const firstAvailableVariant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selectedOption, setSelectedOption] = useState(firstAvailableVariant?.optionValue ?? "");
  const [quantity, setQuantity] = useState(1);

  const activeVariant =
    product.variants.find((variant) => variant.optionValue === selectedOption) ??
    product.variants[0];

  const handleVariantChange = (optionValue: string) => {
    setSelectedOption(optionValue);
    const targetVariant = product.variants.find((variant) => variant.optionValue === optionValue);
    if (targetVariant) {
      const maxQty = targetVariant.quantityAvailable ?? 99;
      setQuantity((prev) => Math.min(prev, maxQty));
    }
  };

  const composition = product.composition ?? [];

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
        addHref: ROUTES.PRODUCT_DETAIL(CatalogCollectionHandle.GIFT_SET, product.handle),
        id: product.id,
        title: product.title,
      },
      quantity,
      unit: {
        currencyCode: activeVariant.price.currencyCode,
        image: product.image,
        id: activeVariant.id,
        title: product.title,
        unitPrice: Number(activeVariant.price.amount),
        weight: stripTitlePrefix(activeVariant.optionValue, product.title),
        quantityAvailable: activeVariant.quantityAvailable,
      },
    });
    setQuantity(1);
  };

  const maxQuantity = activeVariant?.quantityAvailable ?? 99;

  return (
    <div className="flex w-full flex-col gap-8">
      <ProductDetailSummary
        composition={composition}
        description={product.description}
        seeLessLabel={t("seeLess")}
        seeMoreLabel={t("seeMore")}
        subtitle={product.subtitle || product.notes}
        title={product.title}
      />

      {product.variants.length > 0 ? (
        <ProductDetailTinWeightSelector
          label={t("sizeLabel")}
          onChange={handleVariantChange}
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
        maxQuantity={maxQuantity}
      />
    </div>
  );
}
