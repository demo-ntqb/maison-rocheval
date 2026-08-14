import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";

export function ProductDetailHeading({ product }: { product: CatalogProductDetail }) {
  return (
    <div className="flex flex-col">
      {product.eyebrow ? (
        <p className="font-sans text-sm tracking-wide text-black">{product.eyebrow}</p>
      ) : null}
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
        {product.title}
      </h1>
      <p className="mt-1 font-display text-sm text-muted-ink">{product.species}</p>
      <div className="mt-6 border-t border-line" />
    </div>
  );
}
