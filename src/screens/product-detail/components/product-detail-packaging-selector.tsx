import { Info } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import type { CatalogPackagingOption } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";
import { ProductDetailPackagingThumbnail } from "./product-detail-packaging-thumbnail";

type PackagingOptionProps = {
  formatMoney: (amount: number) => string;
  freeLabel: string;
  index: number;
  option: CatalogPackagingOption;
  selected: boolean;
};

function PackagingOption({ formatMoney, freeLabel, index, option, selected }: PackagingOptionProps) {
  const id = `product-packaging-${index}`;
  const price = option.priceModifier === 0 ? freeLabel : `+${formatMoney(option.priceModifier)}`;
  return (
    <span className="relative">
      <RadioGroupItem id={id} value={option.id} className="peer sr-only" />
      <label htmlFor={id} className={cn(
        "flex cursor-pointer items-center justify-between rounded-sm border p-3 peer-focus-visible:ring-2",
        selected ? "border-black ring-[0.5px] ring-black" : "border-line",
      )}>
        <span className="flex items-center gap-3">
          <span className="size-13.5 shrink-0 overflow-hidden rounded-sm border border-line bg-warm">
            <ProductDetailPackagingThumbnail id={option.id} />
          </span>
          <span className="flex flex-col text-left">
            <span className="font-display text-sm font-bold uppercase tracking-wider">{option.name}</span>
            <span className="font-sans text-xs text-muted-ink">{option.description}</span>
          </span>
        </span>
        <span className="pl-3 font-sans text-sm">{price}</span>
      </label>
    </span>
  );
}

export function ProductDetailPackagingSelector({
  formatMoney,
  freeLabel,
  label,
  onChange,
  options,
  selectedId,
}: {
  formatMoney: (amount: number) => string;
  freeLabel: string;
  label: string;
  onChange: (id: string) => void;
  options: CatalogPackagingOption[];
  selectedId: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span id="packaging-label" className="font-display text-sm font-bold uppercase tracking-wider">{label}</span>
        <Info className="size-3.5 text-muted-ink" aria-hidden="true" />
      </div>
      <RadioGroup aria-labelledby="packaging-label" value={selectedId} onValueChange={onChange}>
        {options.map((option, index) => (
          <PackagingOption key={option.id} formatMoney={formatMoney} freeLabel={freeLabel} index={index} option={option} selected={selectedId === option.id} />
        ))}
      </RadioGroup>
    </div>
  );
}
