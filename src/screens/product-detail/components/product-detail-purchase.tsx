import { IconShoppingCart } from "@/shared/components/icons/ic-shopping-cart";
import { ProductDetailStepper } from "./product-detail-stepper";

export interface ProductDetailPurchaseProps {
  addToCartLabel: string;
  available: boolean;
  decreaseLabel: string;
  deliveryNote: string;
  formattedPrice: string;
  increaseLabel: string;
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  quantity: number;
  unavailableLabel: string;
  maxQuantity?: number;
  notEnoughStockLabel?: string;
}

export function ProductDetailPurchase({
  addToCartLabel,
  available,
  decreaseLabel,
  deliveryNote,
  formattedPrice,
  increaseLabel,
  onAddToCart,
  onQuantityChange,
  quantity,
  unavailableLabel,
  maxQuantity,
  notEnoughStockLabel,
}: ProductDetailPurchaseProps) {
  return (
    <div className="flex w-full flex-col gap-8">
      <p className="font-sans text-[32px] font-medium leading-normal text-black">
        {formattedPrice}
      </p>

      <div className="flex w-full flex-col gap-4">
        {/* Figma stacks the stepper above a full-width CTA on mobile and puts
            them on one 16px-gapped row from the 1000px content width up. */}
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
          <ProductDetailStepper
            className="self-start lg:self-center"
            decreaseLabel={decreaseLabel}
            increaseLabel={increaseLabel}
            onChange={onQuantityChange}
            quantity={quantity}
            max={maxQuantity}
            notEnoughStockLabel={notEnoughStockLabel}
          />

          <button
            type="button"
            disabled={!available}
            onClick={onAddToCart}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] bg-navy-darker px-8 font-sans text-base text-white transition-colors hover:bg-navy-hover active:bg-navy-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-darker disabled:cursor-not-allowed disabled:bg-navy-dark disabled:text-navy-disabled-text lg:h-10 lg:flex-1 lg:gap-1 lg:px-5 lg:text-sm"
          >
            <IconShoppingCart aria-hidden="true" className="size-6 shrink-0 lg:size-5" />
            <span>{available ? addToCartLabel : unavailableLabel}</span>
          </button>
        </div>

        {/* Figma shows the delivery reassurance on the mobile frame only. */}
        <p className="flex items-center gap-2 font-sans text-sm leading-[18px] text-black/50 lg:hidden">
          <IconShoppingCart aria-hidden="true" className="size-4 shrink-0 text-black/30" />
          <span>{deliveryNote}</span>
        </p>
      </div>
    </div>
  );
}
