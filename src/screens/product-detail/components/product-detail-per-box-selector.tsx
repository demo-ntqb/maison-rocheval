import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import type { ProductPerBoxOption } from "../types/product-detail.type";

const PER_BOX_OPTIONS = [1, 2, 3, 4] as const;

export function ProductDetailPerBoxSelector({ label, onChange, selected }: {
  label: string;
  onChange: (value: ProductPerBoxOption) => void;
  selected: ProductPerBoxOption;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span id="per-box-label" className="font-display text-sm font-bold uppercase tracking-wider">{label}</span>
      <RadioGroup
        aria-labelledby="per-box-label"
        orientation="horizontal"
        value={String(selected)}
        onValueChange={(value) => onChange(Number(value) as ProductPerBoxOption)}
        className="grid grid-cols-4 gap-4"
      >
        {PER_BOX_OPTIONS.map((count) => (
          <span key={count} className="relative">
            <RadioGroupItem id={`per-box-${count}`} value={String(count)} className="peer sr-only" />
            <label htmlFor={`per-box-${count}`} className={cn(
              "flex min-h-12 cursor-pointer items-center justify-center rounded-sm border font-sans text-sm peer-focus-visible:ring-2",
              selected === count ? "border-black bg-navy-dark text-white" : "border-line text-black hover:border-black",
            )}>{count}</label>
          </span>
        ))}
      </RadioGroup>
    </div>
  );
}
