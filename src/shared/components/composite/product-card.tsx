import { cva, type VariantProps } from "class-variance-authority";

import { Link } from "@/i18n/navigation";
import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import { PRODUCT_CATEGORY_PRODUCT_TYPE_TO_HANDLE_MAP } from "@/shared/constants/catalog.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { cn } from "@/shared/lib/utils";
import type { CatalogProductCard } from "@/shared/types/catalog.type";

const productCardVariants = cva(
  "flex flex-col border-[0.5px] border-stone rounded-[2px] bg-canvas text-center overflow-hidden shrink-0 transition-all duration-300 hover:shadow-sm hover:bg-warm",
  {
    variants: {
      size: {
        sm: "w-[200px] h-[360px]",
        md: "w-[312px] h-[488px]",
        responsive: "w-[250px] h-[408px] lg:w-[280px] lg:h-[438px] xl:w-[312px] xl:h-[488px]",
      },
    },
    defaultVariants: {
      size: "responsive",
    },
  }
)

const productImageVariants = cva(
  "shrink-0 relative flex items-center justify-center overflow-hidden",
  {
    variants: {
      size: {
        sm: "w-[200px] h-[200px]",
        md: "w-[312px] h-[312px]",
        responsive: "w-[250px] h-[250px] lg:w-[280px] lg:h-[280px] xl:w-[312px] xl:h-[312px]",
      },
    },
    defaultVariants: {
      size: "responsive",
    },
  }
)

const productInfoVariants = cva(
  "flex flex-col gap-3 shrink-0 items-center",
  {
    variants: {
      size: {
        sm: "p-4 h-[160px]",
        md: "p-6 h-[176px]",
        responsive: "p-6 h-[158px] xl:h-[176px]",
      },
    },
    defaultVariants: {
      size: "responsive",
    },
  }
)

export interface ProductCardProps
  extends Omit<React.ComponentProps<"article">, "size">,
  VariantProps<typeof productCardVariants> {
  product: CatalogProductCard;
  priority?: boolean;
}

export function ProductCard({
  product,
  priority = false,
  size = "responsive",
  className,
  ...props
}: ProductCardProps) {
  const category = PRODUCT_CATEGORY_PRODUCT_TYPE_TO_HANDLE_MAP?.[product.productType] || '';

  return (
    <article
      className={cn(productCardVariants({ size, className }))}
      data-plumb-id="component-22"
      {...props}
    >
      <Link
        href={ROUTES.PRODUCT_DETAIL(category, product.handle)}
        className={cn(productImageVariants({ size }))}
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
        href={ROUTES.PRODUCT_DETAIL(category, product.handle)}
        className={cn(productInfoVariants({ size }))}
        data-plumb-id="frame-2085667164"
      >
        <div className="flex flex-col gap-1 items-center" data-plumb-id="frame-2085667136">
          <h3
            className="font-display text-[20px] font-bold text-black leading-[24px] truncate w-full"
            data-plumb-id="kaluga-caviar"
          >
            {product.title}
          </h3>
          <p
            className="font-sans text-[12px] font-light text-gray-dark not-italic truncate w-full"
            data-plumb-id="huso-duricus"
          >
            {product.subtitle}
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
            {product.notes}
          </p>
          <p
            className="font-sans text-[12px] font-light text-gray-dark line-clamp-1 xl:line-clamp-2 w-full"
            data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
          >
            {product.short_description}
          </p>
        </div>
      </Link>
    </article>
  );
}
