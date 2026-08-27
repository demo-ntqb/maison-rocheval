"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useCart } from "@/shared/components/cart";
import type { CatalogCaviarDetail } from "@/shared/types/catalog.type";
import { formatCatalogPrice } from "../lib/product-detail-configurator";
import { ProductDetailPurchase } from "./product-detail-purchase";
import { ProductDetailSummary } from "./product-detail-summary";
import { ProductDetailTinWeightSelector } from "./product-detail-tin-weight-selector";

export interface ProductDetailCaviarPanelProps {
  product: CatalogCaviarDetail;
}

export function ProductDetailCaviarPanel({ product }: ProductDetailCaviarPanelProps) {
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

    cart.addLine({
      currencyCode: activeVariant.price.currencyCode,
      id: activeVariant.id,
      image: product.image,
      quantity,
      title: product.title,
      unitPrice: Number(activeVariant.price.amount),
      weight: activeVariant.optionValue,
      quantityAvailable: activeVariant.quantityAvailable,
    });
    setQuantity(1);
  };

  const maxQuantity = activeVariant?.quantityAvailable ?? 99;

  return (
    <div className="flex w-full flex-col gap-8">
      <ProductDetailSummary
        composition={composition}
        description={product.description}
        notes={product.notes}
        seeLessLabel={t("seeLess")}
        seeMoreLabel={t("seeMore")}
        subtitle={product.subtitle}
        title={product.title}
      />

      {product.variants.length > 0 ? (
        <ProductDetailTinWeightSelector
          label={t("sizeLabel")}
          layout="row"
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
