import type { ComponentPropsWithoutRef } from "react";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";
import type { ProductsProductViewModel } from "../types/products.type";

interface ProductsProductCardProps extends ComponentPropsWithoutRef<"article"> {
  priority?: boolean;
  product: ProductsProductViewModel;
}

export function ProductsProductCard({
  className,
  priority = false,
  product,
  ...props
}: ProductsProductCardProps) {
  const { content } = product;
  const href = `/products/${product.handle}` as const;

  return (
    <article
      data-plumb-id={product.plumbCardId}
      className={cn(
        "flex w-full max-w-[312px] flex-col overflow-hidden rounded-brand border-[0.5px] border-line bg-canvas text-center lg:h-[540px]",
        !priority && "products-card-deferred",
        className,
      )}
      {...props}
    >
      <Link
        href={href}
        aria-label={content.title}
        className="flex aspect-square w-full shrink-0 items-end justify-center pb-2 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ink"
      >
        <Picture
          basePath={product.imageBasePath}
          fallbackExtension="png"
          alt={content.imageAlt}
          priority={priority}
          width={product.imageWidth}
          height={product.imageHeight}
          sizes="200px"
          responsiveWidths={[200]}
          pictureClassName="block h-[275px] w-[200px]"
          className="size-full object-contain"
          data-plumb-id={product.plumbImageId}
        />
      </Link>

      <div className="flex min-h-[228px] flex-1 flex-col px-6 pb-8 pt-6">
        <div className="flex flex-col items-center gap-1">
          <p className="font-sans text-sm font-light leading-[18px] text-ink">
            {content.eyebrow}
          </p>
          <Link
            href={href}
            className="-my-3 inline-flex min-h-12 items-center justify-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <h3 className="font-display text-xl font-bold leading-6 text-ink">
              {content.title}
            </h3>
          </Link>
          <p className="font-sans text-xs font-light leading-[15px] text-muted-ink">
            {content.species}
          </p>
        </div>

        <div className="my-3 border-t-[0.5px] border-line" aria-hidden="true" />

        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs font-light leading-[15px] text-ink">
            {content.profile}
          </p>
          <p className="line-clamp-4 font-sans text-xs font-light leading-[15px] text-ink">
            {content.description}
          </p>
        </div>
      </div>
    </article>
  );
}
