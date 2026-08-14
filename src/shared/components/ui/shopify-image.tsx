import type { ComponentPropsWithoutRef } from "react";

import type { CatalogImage } from "@/shared/lib/shopify/catalog-mapper";
import { shopifyImageSrcSet, shopifyImageUrl } from "@/shared/lib/shopify/image";
import { cn } from "@/shared/lib/utils";

const RESPONSIVE_WIDTHS = [200, 320, 480, 640, 800, 1000, 1200] as const;

type ShopifyImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "alt" | "height" | "src" | "srcSet" | "width"
> & {
  image: CatalogImage;
  priority?: boolean;
  responsiveWidths?: readonly number[];
};

export function ShopifyImage({
  className,
  image,
  priority = false,
  responsiveWidths = RESPONSIVE_WIDTHS,
  sizes,
  ...props
}: ShopifyImageProps) {
  return (
    <img
      {...props}
      src={shopifyImageUrl(image.url, { width: 800 })}
      srcSet={shopifyImageSrcSet(image.url, responsiveWidths)}
      sizes={sizes}
      alt={image.altText}
      width={image.width}
      height={image.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("size-full object-contain", className)}
    />
  );
}
