import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import type { CatalogImage } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";

export function ProductDetailGalleryImage({
  alt,
  className,
  image,
  priority = false,
  sizes,
}: {
  alt: string;
  className?: string;
  image: CatalogImage;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <ShopifyImage
      image={{ ...image, altText: alt }}
      priority={priority}
      sizes={sizes}
      className={cn("size-full object-contain", className)}
    />
  );
}
