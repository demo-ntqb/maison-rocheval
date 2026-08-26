import { IconMinus } from "@/shared/components/icons/ic-minus";
import { IconPlus } from "@/shared/components/icons/ic-plus";
import { cn } from "@/shared/lib/utils";

/** Figma: 40px square, 2px radius, 0.5px hairline — identical on both frames. */
const STEP_BUTTON =
  "flex size-10 cursor-pointer items-center justify-center rounded-[2px] border-[0.5px] border-stone transition-colors hover:border-navy-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-darker disabled:cursor-not-allowed disabled:hover:border-stone";

export interface ProductDetailStepperProps {
  className?: string;
  decreaseLabel: string;
  increaseLabel: string;
  max?: number;
  onChange: (quantity: number) => void;
  quantity: number;
}

export function ProductDetailStepper({
  className,
  decreaseLabel,
  increaseLabel,
  max = 99,
  onChange,
  quantity,
}: ProductDetailStepperProps) {
  const canDecrease = quantity > 1;
  const canIncrease = quantity < max;

  return (
    <div className={cn("flex items-center", className)}>
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={!canDecrease}
        onClick={() => onChange(quantity - 1)}
        className={STEP_BUTTON}
      >
        <IconMinus
          aria-hidden="true"
          className={cn("size-4 lg:size-6", canDecrease ? "text-black" : "text-black/30")}
        />
      </button>

      <output
        aria-live="polite"
        className="flex size-10 items-center justify-center font-sans text-sm text-black"
      >
        {quantity}
      </output>

      <button
        type="button"
        aria-label={increaseLabel}
        disabled={!canIncrease}
        onClick={() => onChange(quantity + 1)}
        className={STEP_BUTTON}
      >
        <IconPlus
          aria-hidden="true"
          className={cn("size-4 lg:size-6", canIncrease ? "text-black" : "text-black/30")}
        />
      </button>
    </div>
  );
}
