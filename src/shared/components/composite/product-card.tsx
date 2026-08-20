import * as React from "react";

import { Link } from "@/i18n/navigation";
import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import { ROUTES } from "@/shared/constants/route.constant";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";

export interface ProductCardProps extends React.ComponentProps<"article"> {
  product: CatalogProductCard;
  priority?: boolean;
  size?: "sm" | "md";
}

export function ProductCard({
  product,
  priority = false,
  size,
  className,
  ...props
}: ProductCardProps) {
  // If size is provided, use static sizes. If not, use responsive sizes.
  const sizeClasses = size === "sm"
    ? "w-[200px] h-[360px]"
    : size === "md"
      ? "w-[312px] h-[488px]"
      : "w-[250px] h-[408px] lg:w-[280px] lg:h-[438px] xl:w-[312px] xl:h-[488px]";

  const imageSizeClasses = size === "sm"
    ? "w-[200px] h-[200px]"
    : size === "md"
      ? "w-[312px] h-[312px]"
      : "w-[250px] h-[250px] lg:w-[280px] lg:h-[280px] xl:w-[312px] xl:h-[312px]";

  const infoHeightClasses = size === "sm"
    ? "h-[160px]"
    : size === "md"
      ? "h-[176px]"
      : "h-[158px] xl:h-[176px]";

  const infoPaddingClasses = size === "sm" ? "p-4" : "p-6";

  return (
    <article
      className={cn(
        "flex flex-col border-[0.5px] border-stone rounded-[2px] bg-canvas text-center overflow-hidden shrink-0 transition-all duration-300 hover:shadow-sm hover:bg-warm",
        sizeClasses,
        className
      )}
      data-plumb-id="component-22"
      {...props}
    >
      <Link
        href={ROUTES.PRODUCT_DETAIL(product.handle)}
        className={cn(
          "shrink-0 relative flex items-center justify-center overflow-hidden",
          imageSizeClasses
        )}
        data-plumb-id="catalog-image"
      >
        {product.image ? (
          <ShopifyImage
            image={product.image}
            priority={priority}
            sizes={
              size === "sm"
                ? "200px"
                : size === "md"
                  ? "312px"
                  : "(max-width: 768px) 250px, (max-width: 1200px) 280px, 312px"
            }
            responsiveWidths={[200, 250, 280, 312, 500, 624]}
            className="size-full object-contain"
            data-plumb-id="image-5"
          />
        ) : null}
      </Link>

      <Link
        href={ROUTES.PRODUCT_DETAIL(product.handle)}
        className={cn(
          "flex flex-col gap-3 shrink-0 items-center",
          infoPaddingClasses,
          infoHeightClasses
        )}
        data-plumb-id="frame-2085667164"
      >
        <div className="flex flex-col gap-1 items-center" data-plumb-id="frame-2085667136">
          <h3
            className="font-display text-[20px] font-bold text-black leading-none truncate w-full"
            data-plumb-id="kaluga-caviar"
          >
            {product.title}
          </h3>
          <p
            className="font-sans text-[12px] font-light text-gray-dark not-italic truncate w-full"
            data-plumb-id="huso-duricus"
          >
            {product.species}
          </p>
        </div>

        <div
          className="border-t-[0.5px] border-stone w-full"
          data-plumb-id="vector-1307"
        />

        <div className="flex flex-col gap-1 items-center w-full" data-plumb-id="frame-2085667167">
          <p
            className="font-sans text-[12px] font-normal text-black truncate w-full"
            data-plumb-id="rich-creamy-long-finish"
          >
            {product.profile}
          </p>
          <p
            className="font-sans text-[12px] font-light text-gray-dark line-clamp-1 xl:line-clamp-2 w-full"
            data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
          >
            {product.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
