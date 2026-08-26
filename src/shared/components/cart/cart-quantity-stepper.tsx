"use client";

import { IconMinus, IconPlus } from "@/shared/components/icons";

export interface CartQuantityStepperProps {
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (quantity: number) => void;
  quantity: number;
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
}: CartQuantityStepperProps) {
  const buttonClassName =
    "relative flex size-8 shrink-0 items-center justify-center rounded-brand border-[0.5px] border-gray-light text-black transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0 hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed";

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
      <button
        type="button"
        aria-label={increaseLabel}
        className={buttonClassName}
        onClick={() => onChange(quantity + 1)}
      >
        <IconPlus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
