import { Minus, Plus } from "lucide-react";

export function ProductDetailQuantityControl({
  decreaseLabel,
  increaseLabel,
  onChange,
  quantity,
}: {
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between rounded-sm border border-line px-1">
      <button type="button" onClick={() => onChange(quantity - 1)} disabled={quantity <= 1} aria-label={decreaseLabel} className="flex size-11 items-center justify-center disabled:opacity-30">
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="font-sans text-sm font-medium">{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label={increaseLabel} className="flex size-11 items-center justify-center">
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
