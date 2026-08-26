"use client";

import { Handbag } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { useCart } from "./cart-provider";

export interface CartTriggerProps {
  className?: string;
}

/** Header affordance that opens the bag drawer. */
export function CartTrigger({ className }: CartTriggerProps) {
  const t = useTranslations("cart");
  const { itemCount, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("openBag", { count: itemCount })}
      className={cn(
        "inline-flex size-12 cursor-pointer items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <Handbag aria-hidden="true" className="size-6" strokeWidth={1.5} />
    </button>
  );
}
