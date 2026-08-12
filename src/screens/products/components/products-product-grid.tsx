import { ProductsProductCard } from "./products-product-card";
import type { ProductsProductViewModel } from "../types/products.type";

interface ProductsProductGridProps {
  products: readonly ProductsProductViewModel[];
}

export function ProductsProductGrid({ products }: ProductsProductGridProps) {
  return (
    <ul className="grid w-full grid-cols-1 gap-x-8 gap-y-[54px] sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.id} className="flex justify-center">
          <ProductsProductCard product={product} priority={index === 0} />
        </li>
      ))}
    </ul>
  );
}
