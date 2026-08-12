"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui";
import { MichelinRating } from "@/shared/components/ui/michelin-rating";

export interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  currencyCode: string;
  imageUrl: string;
  imageAlt?: string;
  rating?: number; // Ví dụ: số sao Michelin (3 sao, v.v.)
  description?: string;
}

export interface ProductCardProps extends React.ComponentProps<"div"> {
  product: Product;
  size?: "sm" | "md"; // sm = 284px (Homepage Slider), md = 312px (Shop Grid)
}

export function ProductCard({
  product,
  size = "md",
  className,
  ...props
}: ProductCardProps) {
  const t = useTranslations("shop");

  // Format giá tiền đơn giản
  const formattedPrice = new Intl.NumberFormat(typeof window !== "undefined" ? window.navigator.language : "fr-FR", {
    style: "currency",
    currency: product.currencyCode || "EUR",
  }).format(product.price);

  return (
    <div
      data-slot="product-card"
      className={cn(
        "group flex flex-col rounded-sm border border-gray-light bg-white transition-all duration-300 hover:border-black",
        size === "sm" ? "w-full max-w-[284px]" : "w-full max-w-[312px]",
        className
      )}
      {...props}
    >
      {/* Product Image / Media Container */}
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-square w-full overflow-hidden border-b border-gray-light bg-offwhite"
        aria-label={product.title}
      >
        <picture>
          <source srcSet={product.imageUrl} type="image/webp" />
          <img
            src={product.imageUrl}
            alt={product.imageAlt || product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </picture>
      </Link>

      {/* Product Details Info Block */}
      <div className="flex flex-col gap-3 p-6 pb-8 text-left">
        {/* Michelin rating if available */}
        {product.rating ? (
          <MichelinRating
            count={product.rating}
            starClassName="size-4 text-black"
            className="gap-1"
          />
        ) : (
          // Giữ chiều cao cố định để không lệch hàng giữa các card
          <div className="h-4" />
        )}

        {/* Product Title */}
        <Link
          href={`/products/${product.handle}`}
          className="block outline-none focus-visible:underline"
        >
          <h3 className="font-display text-[20px] font-bold leading-snug text-black transition-colors hover:text-gray-dark">
            {product.title}
          </h3>
        </Link>

        {/* Short description / details */}
        {product.description && (
          <p className="line-clamp-2 min-h-[40px] font-sans text-xs font-light leading-relaxed text-gray-dark">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <span className="font-sans text-sm font-medium text-black">
          {formattedPrice}
        </span>

        {/* Action Button: Add to Bag */}
        <Button
          variant="default"
          size="lg"
          className="mt-2 w-full font-display text-xs tracking-widest min-h-[48px]"
          aria-label={`${t("addToBag")} ${product.title}`}
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement cart addition logic
          }}
        >
          {t("addToBag")}
        </Button>
      </div>
    </div>
  );
}
