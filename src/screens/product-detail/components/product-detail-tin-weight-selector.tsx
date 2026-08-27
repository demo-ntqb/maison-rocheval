import { useTranslations } from "next-intl";

import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { CatalogVariant } from "@/shared/types/catalog.type";

/**
 * Caviar tins are short labels ("30g") and Figma lays them out as four equal
 * 40px chips on one 12px-gapped row; gift sets carry a full sentence per
 * option and stack instead.
 */
export type ProductDetailTinWeightLayout = "row" | "stack";

export interface ProductDetailTinWeightSelectorProps {
  label: string;
  layout?: ProductDetailTinWeightLayout;
  onChange: (optionValue: string) => void;
  selected: string;
  variants: readonly CatalogVariant[];
}

export function ProductDetailTinWeightSelector({
  label,
  layout = "stack",
  onChange,
  selected,
  variants,
}: ProductDetailTinWeightSelectorProps) {
  const isRow = layout === "row";
  const t = useTranslations("productDetail");

  return (
    <div className="flex w-full flex-col gap-3">
      <span id="tin-weight-label" className="font-sans text-sm leading-normal text-black">
        {label}
      </span>
      <RadioGroup
        aria-labelledby="tin-weight-label"
        value={selected}
        onValueChange={onChange}
        className={cn("flex w-full gap-3", isRow ? "flex-row items-center" : "flex-col")}
      >
        {variants.map((variant, index) => {
          const id = `tin-weight-${index}`;
          const isSelected = variant.optionValue === selected;
          const isOutOfStock = !variant.availableForSale;

          const itemContent = (
            <div key={variant.id} className={cn("relative", isRow ? "min-w-px flex-1" : "w-full")}>
              <RadioGroupItem
                id={id}
                value={variant.optionValue}
                className="peer sr-only"
                disabled={isOutOfStock}
              />
              <label
                htmlFor={id}
                className={cn(
                  "flex w-full items-center rounded-[2px] font-sans text-base leading-normal transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy-darker",
                  isRow ? "h-10 justify-center px-4 py-1" : "h-12 px-6",
                  isSelected
                    ? "bg-navy-darker text-white cursor-default"
                    : isOutOfStock
                    ? "border-[0.5px] border-[#d8d8d8] text-[#9c9c9c] opacity-50 cursor-not-allowed"
                    : "border-[0.5px] border-line text-black hover:border-navy-darker cursor-pointer",
                )}
              >
                {variant.optionValue}
              </label>
            </div>
          );

          if (isOutOfStock) {
            return (
              <Tooltip key={variant.id}>
                <TooltipTrigger asChild>
                  {itemContent}
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  {t("outOfStock")}
                </TooltipContent>
              </Tooltip>
            );
          }

          return itemContent;
        })}
      </RadioGroup>
    </div>
  );
}
