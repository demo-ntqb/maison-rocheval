import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import type { CatalogVariant } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";

type ProductDetailSizeSelectorProps = {
  label: string;
  onChange: (size: string) => void;
  selectedSize: string;
  variants: CatalogVariant[];
};

function SizeOption({ index, selected, variant }: {
  index: number;
  selected: boolean;
  variant: CatalogVariant;
}) {
  const id = `product-size-${index}`;
  return (
    <span className="relative">
      <RadioGroupItem id={id} value={variant.optionValue} className="peer sr-only" />
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-12 cursor-pointer items-center justify-center rounded-sm border font-sans text-sm peer-focus-visible:ring-2",
          selected ? "border-black bg-navy-dark text-white" : "border-line text-black hover:border-black",
        )}
      >
        {variant.optionValue}
      </label>
    </span>
  );
}

export function ProductDetailSizeSelector({
  label,
  onChange,
  selectedSize,
  variants,
}: ProductDetailSizeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <span id="size-label" className="font-display text-sm font-bold uppercase tracking-wider">
        {label}
      </span>
      <RadioGroup
        aria-labelledby="size-label"
        orientation="horizontal"
        value={selectedSize}
        onValueChange={onChange}
        className="grid grid-cols-4 gap-4"
      >
        {variants.map((variant, index) => (
          <SizeOption key={variant.id} index={index} selected={selectedSize === variant.optionValue} variant={variant} />
        ))}
      </RadioGroup>
    </div>
  );
}
