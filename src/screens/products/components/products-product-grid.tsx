import { ProductCard } from "@/shared/components/composite/product-card";
import { cn } from "@/shared/lib/utils";
import type { CatalogProductCard } from "@/shared/types/catalog.type";

interface ProductsProductGridProps {
  products: readonly CatalogProductCard[];
}

export function ProductsProductGrid({ products }: ProductsProductGridProps) {
  return (
    <ul className="grid w-full grid-cols-1 gap-x-8 gap-y-[54px] sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => {
        const isPriority = index === 0;
        return (
          <li key={product.id} className="flex justify-center">
            <ProductCard
              product={product}
              priority={isPriority}
              className={cn(!isPriority && "products-card-deferred")}
            />
          </li>
        );
      })}
    </ul>
  );
}
