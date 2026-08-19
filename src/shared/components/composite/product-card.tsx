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

export function ProductCard({ product, priority = false, className, ...props }: ProductCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col border-[0.5px] border-gray-light rounded-[2px] bg-canvas text-center overflow-hidden shrink-0 transition-shadow hover:shadow-sm transition-colors duration-300 hover:bg-warm",
        "w-[250px] h-[393px] lg:w-[280px] lg:h-[465px]",
        className
      )}
      data-plumb-id="product"
      {...props}
    >
      <div
        className="w-full flex-1 flex items-end justify-center pb-2 pt-2 bg-transparent relative"
        data-plumb-id="component-22"
      >
        <Link
          href={ROUTES.PRODUCT_DETAIL(product.handle)}
          className="w-[145px] h-[200px] lg:w-[200px] lg:h-[275px] shrink-0 relative flex items-center justify-center"
          data-plumb-id="frame-2085667163"
        >
          {/* Overlapping shadow haze (simulates component-28/29 background pattern) */}
          <div
            className="absolute w-[130px] h-[130px] lg:w-[180px] lg:h-[180px] rounded-full bg-radial from-[#bfbbb6]/40 to-transparent blur-md -z-10 translate-y-[-10px]"
            data-plumb-id="component-28"
          />

          {product.image ? (
            <div className="w-[125px] h-[125px] lg:w-[170px] lg:h-[170px] relative z-10 flex items-center justify-center" data-plumb-id="frame-2085667138">
              <ShopifyImage
                image={product.image}
                priority={priority}
                sizes="(max-width: 639px) 125px, 170px"
                responsiveWidths={[125, 170, 340]}
                className="size-full object-contain"
                data-plumb-id="image-5"
              />
            </div>
          ) : null}
        </Link>
      </div>

      <div
        className="flex flex-col justify-between p-6 min-h-[153px]"
        data-plumb-id="frame-2085667164"
      >
        <div className="flex flex-col gap-1 items-center" data-plumb-id="frame-2085667136">
          <Link href={ROUTES.PRODUCT_DETAIL(product.handle)} className="block w-full">
            <h3
              className="font-display text-[20px] font-bold text-ink leading-none truncate"
              data-plumb-id="kaluga-caviar"
            >
              {product.title}
            </h3>
          </Link>
          <p
            className="font-sans text-[12px] font-light text-gray-dark italic truncate w-full"
            data-plumb-id="huso-duricus"
          >
            {product.species}
          </p>
        </div>

        <div className="border-t-[0.5px] border-gray-light w-full" data-plumb-id="vector-1307" />

        <div className="flex flex-col gap-1 items-center w-full" data-plumb-id="frame-2085667167">
          <p
            className="font-sans text-[12px] font-normal text-ink truncate w-full"
            data-plumb-id="rich-creamy-long-finish"
          >
            {product.profile}
          </p>
          <p
            className="font-sans text-[12px] font-light text-gray-dark line-clamp-1 w-full"
            data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
          >
            {product.description}
          </p>
        </div>
      </div>
    </article>
  );
}
