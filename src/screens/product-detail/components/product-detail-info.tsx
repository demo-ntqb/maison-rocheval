"use client";

import { useState } from "react";
import { Info, Minus, Plus, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";
import type { DetailedProduct } from "../types/product-detail.type";

export interface ProductDetailInfoProps {
  product: DetailedProduct;
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const t = useTranslations("productDetail");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "30g");
  const [selectedPackaging, setSelectedPackaging] = useState<string>(
    product.packagingOptions[0]?.id ?? "standard",
  );
  const [selectedPerBox, setSelectedPerBox] = useState<number>(product.perBoxOptions[1] ?? 2);
  const [quantity, setQuantity] = useState<number>(2);

  // Compute calculated price
  const basePrice = product.price;
  const sizeMultiplier =
    selectedSize === "50g"
      ? 1.5
      : selectedSize === "125g"
      ? 3.2
      : selectedSize === "250g"
      ? 6.0
      : 1.0;
  const activePackaging = product.packagingOptions.find((p) => p.id === selectedPackaging);
  const packagingModifier = activePackaging?.priceModifier ?? 0;

  const unitPrice = Math.round((basePrice * sizeMultiplier + packagingModifier) * 100) / 100;
  const totalPrice = Math.round(unitPrice * selectedPerBox * quantity * 100) / 100;

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Product Title & Identity */}
      <div className="flex flex-col">
        {!!product.eyebrow && (
          <p className="font-sans text-sm tracking-wide text-black">{product.eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
          {product.title}
        </h1>
        <p className="mt-1 font-display text-sm text-muted-ink">{product.species}</p>
        <div className="mt-6 border-t border-line" />
      </div>

      {/* Size Selector */}
      <div className="flex flex-col gap-4">
        <label id="size-label" className="font-display text-sm font-bold uppercase tracking-wider text-black">
          {t("sizeLabel")}
        </label>
        <div
          role="radiogroup"
          aria-labelledby="size-label"
          className="grid grid-cols-4 gap-4"
        >
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex min-h-12 items-center justify-center rounded-sm border font-sans text-sm font-normal transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-black bg-navy-dark font-medium text-white shadow-sm"
                    : "border-line bg-transparent text-black hover:border-black",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packaging Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span id="packaging-label" className="font-display text-sm font-bold uppercase tracking-wider text-black">
            {t("packagingLabel")}
          </span>
          <Info className="size-3.5 text-muted-ink" aria-hidden="true" />
        </div>
        <div
          role="radiogroup"
          aria-labelledby="packaging-label"
          className="flex flex-col gap-3"
        >
          {product.packagingOptions.map((pkg) => {
            const isSelected = selectedPackaging === pkg.id;
            return (
              <label
                key={pkg.id}
                className={cn(
                  "flex min-h-[56px] cursor-pointer items-center justify-between rounded-sm border px-4 py-3 transition-all",
                  isSelected
                    ? "border-black bg-canvas ring-1 ring-black"
                    : "border-line bg-canvas hover:border-black/60",
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="packaging"
                    value={pkg.id}
                    checked={isSelected}
                    onChange={() => setSelectedPackaging(pkg.id)}
                    className="size-4 accent-navy-dark"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-medium text-black">{pkg.name}</span>
                    {!!pkg.description && (
                      <span className="font-sans text-xs text-muted-ink">{pkg.description}</span>
                    )}
                  </div>
                </div>
                {pkg.priceModifier > 0 && (
                  <span className="font-sans text-xs font-medium text-muted-ink">
                    +€{pkg.priceModifier}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Per Box Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span id="perbox-label" className="font-display text-sm font-bold uppercase tracking-wider text-black">
            {t("perBoxLabel")}
          </span>
          <Info className="size-3.5 text-muted-ink" aria-hidden="true" />
        </div>
        <div
          role="radiogroup"
          aria-labelledby="perbox-label"
          className="grid grid-cols-4 gap-4"
        >
          {product.perBoxOptions.map((count) => {
            const isSelected = selectedPerBox === count;
            return (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedPerBox(count)}
                className={cn(
                  "flex min-h-12 items-center justify-center rounded-sm border font-sans text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-black bg-navy-dark font-medium text-white shadow-sm"
                    : "border-line bg-transparent text-black hover:border-black",
                )}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line" />

      {/* Summary Block & Actions */}
      <div className="flex flex-col gap-5">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-black">
          {t("summaryLabel")}
        </p>

        {/* Selected Summary Card */}
        <div className="flex items-center gap-3 rounded-sm border border-line bg-warm/40 p-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-sm border border-line bg-warm p-1">
            <Picture
              basePath={product.imageBasePath}
              fallbackExtension="png"
              alt={product.imageAlt}
              width={100}
              height={100}
              sizes="48px"
              pictureClassName="block size-full"
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col text-xs font-sans">
            <span className="font-medium text-black">
              {product.title} — {selectedSize}
            </span>
            <span className="text-muted-ink">
              {activePackaging?.name} packaging • {selectedPerBox} per box
            </span>
          </div>
        </div>

        {/* Price Display */}
        <p className="font-display text-3xl font-bold text-black sm:text-4xl">
          €{totalPrice.toFixed(2)}
        </p>

        {/* Quantity & Add to Cart Controls */}
        <div className="grid grid-cols-[120px_1fr] gap-4">
          {/* Quantity Controls */}
          <div className="flex min-h-12 items-center justify-between rounded-sm border border-line bg-canvas px-2">
            <button
              type="button"
              onClick={handleDecreaseQty}
              disabled={quantity <= 1}
              aria-label={t("decreaseQty")}
              className="flex size-9 items-center justify-center text-black hover:bg-warm focus-visible:outline-none disabled:opacity-30"
            >
              <Minus className="size-4" />
            </button>
            <span className="font-sans text-sm font-medium text-black">{quantity}</span>
            <button
              type="button"
              onClick={handleIncreaseQty}
              aria-label={t("increaseQty")}
              className="flex size-9 items-center justify-center text-black hover:bg-warm focus-visible:outline-none"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            type="button"
            className="min-h-12 w-full gap-2 rounded-sm bg-navy-dark font-sans text-xs font-medium tracking-widest text-white uppercase hover:bg-navy-dark/90"
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span>{t("addToCart")}</span>
          </Button>
        </div>

        {/* Delivery Note */}
        <div className="flex items-center gap-2 pt-2 text-xs font-sans text-muted-ink">
          <ShoppingCart className="size-4 shrink-0 text-muted-ink" aria-hidden="true" />
          <span>{t("deliveryNote")}</span>
        </div>
      </div>
    </div>
  );
}
