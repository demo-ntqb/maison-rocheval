"use client";

import { Handbag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/route.constant";

export interface CartEmptyProps {
  onContinue: () => void;
}

export function CartEmpty({ onContinue }: CartEmptyProps) {
  const t = useTranslations("cart.empty");

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex h-[237px] w-[298px] max-w-full flex-col items-center justify-center px-4 text-center">
        <Handbag aria-hidden="true" className="size-6 text-black" strokeWidth={1.5} />
        <p className="mt-5 font-sans text-sm/[normal] font-normal text-black">{t("label")}</p>
        <Button
          asChild
          className="mt-3.5 h-8 w-40 max-w-full bg-black px-4 font-sans text-xs font-normal uppercase tracking-[0.12em] text-white hover:bg-ink-soft"
        >
          <Link href={ROUTES.PRODUCTS} onClick={onContinue}>
            {t("cta")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
