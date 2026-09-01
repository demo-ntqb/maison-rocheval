"use client";

import { Handbag } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { useCart } from "./cart-provider";

export interface CartTriggerProps {
  className?: string;
}

/** Header affordance that opens the bag drawer with animated count badge. */
export function CartTrigger({ className }: CartTriggerProps) {
  const t = useTranslations("cart");
  const { itemCount, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("openBag", { count: itemCount })}
      className={cn(
        "relative inline-flex size-11 cursor-pointer items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lg:size-12",
        className,
      )}
    >
      <Handbag aria-hidden="true" className="size-5 transition-transform hover:scale-105 lg:size-6" strokeWidth={1.5} />

      {itemCount > 0 && (
        <span
          key={itemCount}
          className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-medium text-white transition-all duration-300 animate-in zoom-in-75"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
