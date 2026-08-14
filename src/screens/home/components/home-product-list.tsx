import { ProductCard } from "@/shared/components/composite/product-card";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";

export function HomeProductList({ products }: { products: CatalogProductCard[] }) {

  return (
    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3 justify-items-center" data-plumb-id="component-6-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} size="sm" />
      ))}
    </div>
  );
}
