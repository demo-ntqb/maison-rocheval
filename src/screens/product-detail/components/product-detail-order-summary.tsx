import { ShoppingCart } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import type { CatalogPackagingOption, CatalogVariant } from "@/shared/lib/shopify/catalog-mapper";
import type { ProductDetailTranslator, ProductSelection } from "../types/product-detail.type";
import { ProductDetailQuantityControl } from "./product-detail-quantity-control";

const CART_ENABLED = false;

export function ProductDetailOrderSummary({ activePackaging, activeVariant, formattedTotal, onQuantityChange, selection, title, translate }: {
  activePackaging: CatalogPackagingOption | undefined;
  activeVariant: CatalogVariant | undefined;
  formattedTotal: string;
  onQuantityChange: (quantity: number) => void;
  selection: ProductSelection;
  title: string;
  translate: ProductDetailTranslator;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-display text-sm font-bold uppercase tracking-wider">{translate("summaryLabel")}</p>
      <div className="rounded-sm border border-line bg-warm/30 p-3 font-sans text-sm">
        <p className="font-display font-bold uppercase tracking-wider">{translate("boxOf", { packaging: activePackaging?.name ?? "", perBox: selection.perBox })}</p>
        <p className="text-muted-ink">{translate("perBoxFormat", { perBox: selection.perBox, size: selection.size, title })}</p>
        {activePackaging?.personalizedMessage ? <p className="mt-1 text-xs italic text-muted-ink">{translate("personalizedMessage")}</p> : null}
      </div>
      <p className="font-display text-3xl font-bold sm:text-4xl">{formattedTotal}</p>
      <div className="grid grid-cols-[120px_1fr] gap-4">
        <ProductDetailQuantityControl decreaseLabel={translate("decreaseQty")} increaseLabel={translate("increaseQty")} onChange={onQuantityChange} quantity={selection.quantity} />
        <Button type="button" disabled={!CART_ENABLED || !activeVariant?.availableForSale} className="min-h-12 w-full gap-2 rounded-sm bg-navy-dark font-sans text-xs uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingCart data-icon="inline-start" aria-hidden="true" />
          <span>{activeVariant?.availableForSale ? translate("addToCart") : translate("unavailable")}</span>
        </Button>
      </div>
      <p className="font-sans text-xs text-muted-ink">{translate("deliveryNote")}</p>
    </div>
  );
}
