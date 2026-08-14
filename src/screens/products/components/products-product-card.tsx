import type { ComponentPropsWithoutRef } from "react";

import { Link } from "@/i18n/navigation";
import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import { cn } from "@/shared/lib/utils";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";

interface ProductsProductCardProps extends ComponentPropsWithoutRef<"article"> {
  priority?: boolean;
  product: CatalogProductCard;
}

export function ProductsProductCard({
  className,
  priority = false,
  product,
  ...props
}: ProductsProductCardProps) {
  const href = `/products/${product.handle}` as const;

  return (
    <article
      className={cn(
        "flex w-full max-w-[312px] flex-col overflow-hidden rounded-brand border-[0.5px] border-line bg-canvas text-center lg:h-[540px]",
        !priority && "products-card-deferred",
        className,
      )}
      {...props}
    >
      <Link
        href={href}
        aria-label={product.title}
        className="flex aspect-square w-full shrink-0 items-end justify-center pb-2 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ink"
      >
        {product.image ? (
          <ShopifyImage
            image={product.image}
            priority={priority}
            sizes="200px"
            responsiveWidths={[200, 320]}
            className="h-[275px] w-[200px]"
          />
        ) : null}
      </Link>

      <div className="flex min-h-[228px] flex-1 flex-col px-6 pb-8 pt-6">
        <div className="flex flex-col items-center gap-1">
          <p className="font-sans text-sm font-light leading-[18px] text-ink">
            {product.eyebrow}
          </p>
          <Link
            href={href}
            className="-my-3 inline-flex min-h-12 items-center justify-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <h3 className="font-display text-xl font-bold leading-6 text-ink">
              {product.title}
            </h3>
          </Link>
          <p className="font-sans text-xs font-light leading-[15px] text-muted-ink">
            {product.species}
          </p>
        </div>

        <div className="my-3 border-t-[0.5px] border-line" aria-hidden="true" />

        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs font-light leading-[15px] text-ink">
            {product.profile}
          </p>
          <p className="line-clamp-4 font-sans text-xs font-light leading-[15px] text-ink">
            {product.description}
          </p>
        </div>
      </div>
    </article>
  );
}
