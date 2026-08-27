"use client";

import { IconMinus, IconPlus } from "@/shared/components/icons";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export interface CartQuantityStepperProps {
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (quantity: number) => void;
  quantity: number;
  maxQuantity?: number | null;
  notEnoughStockLabel?: string;
}

/**
 * Three 32px cells (−, count, +) exactly as the cart line renders them. The
 * boxes stay 32px to match the design; an invisible `after` pad grows the real
 * hit area to the 44px touch-target floor.
 */
export function CartQuantityStepper({
  decreaseLabel,
  increaseLabel,
  onChange,
  quantity,
  maxQuantity,
  notEnoughStockLabel,
}: CartQuantityStepperProps) {
  const isMaxReached = maxQuantity !== undefined && maxQuantity !== null && quantity >= maxQuantity;

  const buttonClassName =
    "relative flex size-8 shrink-0 items-center justify-center rounded-brand border-[0.5px] border-gray-light text-black transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0 hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed";

  const plusButton = (
    <button
      type="button"
      aria-label={increaseLabel}
      aria-disabled={isMaxReached}
      className={cn(
        buttonClassName,
        isMaxReached && "opacity-40 cursor-not-allowed hover:bg-transparent"
      )}
      onClick={() => {
        if (!isMaxReached) {
          onChange(quantity + 1);
        }
      }}
    >
      <IconPlus aria-hidden="true" className="size-4" />
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={decreaseLabel}
        className={buttonClassName}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <IconMinus aria-hidden="true" className="size-4" />
      </button>
      <span className="flex size-8 shrink-0 items-center justify-center text-center font-sans text-sm/[normal] font-light text-black">
        {quantity}
      </span>
      {isMaxReached && notEnoughStockLabel ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {plusButton}
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            {notEnoughStockLabel}
          </TooltipContent>
        </Tooltip>
      ) : (
        plusButton
      )}
    </div>
  );
}
