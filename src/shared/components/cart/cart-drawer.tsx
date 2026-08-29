"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { IconShoppingCart, IconX } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { formatBrandPrice } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import type { CartGiftMessage, CartLine } from "@/shared/types/cart.type";

import { CartEmpty } from "./cart-empty";
import { CartGroupCard } from "./cart-group-card";
import { CartLineItem } from "./cart-line-item";
import { CartMessageDialog } from "./cart-message-dialog";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const {
    checkout,
    close,
    entries,
    isCheckingOut,
    isOpen,
    itemCount,
    removeLine,
    setGiftMessage,
    setLineQuantity,
    setOpen,
    subtotal,
    cartError,
  } = useCart();

  const [messageLine, setMessageLine] = useState<CartLine | null>(null);

  const handleSaveMessage = (lineId: string, giftMessage: CartGiftMessage) => {
    setGiftMessage(lineId, giftMessage);
    setMessageLine(null);
  };

  const isDrawerVisible = isOpen && messageLine === null;

  return (
    <>
      <Sheet
        open={isDrawerVisible}
        onOpenChange={(open) => {
          if (open || isDrawerVisible) setOpen(open);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          aria-describedby={undefined}
          className="
            flex flex-col gap-0 overflow-hidden rounded-brand border-[0.5px] border-stone bg-white p-0 text-black
            shadow-[15px_15px_32px_rgba(0,0,0,0.05)]
            data-[side=right]:inset-5 data-[side=right]:h-auto data-[side=right]:w-auto data-[side=right]:border-l-[0.5px]
            data-[side=right]:sm:inset-y-4 data-[side=right]:sm:right-4 data-[side=right]:sm:left-auto
            data-[side=right]:sm:w-[600px] data-[side=right]:sm:max-w-none
          "
        >
          <div className="flex shrink-0 items-center justify-between gap-4 p-4 pb-0">
            <SheetTitle className="font-sans text-base/[normal] font-medium text-black">
              {t("title", { count: itemCount })}
            </SheetTitle>
            <button
              type="button"
              onClick={close}
              aria-label={t("close")}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] p-[4px] text-gray-icon transition-colors hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <IconX aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {entries.length === 0 ? (
              <CartEmpty onContinue={close} />
            ) : (
              entries.map((entry) =>
                entry.kind === "group" ? (
                  <CartGroupCard
                    key={entry.group.id}
                    group={entry.group}
                    locale={locale}
                    onEditMessage={setMessageLine}
                    onNavigate={close}
                    onQuantityChange={setLineQuantity}
                    onRemove={removeLine}
                  />
                ) : (
                  <div key={entry.line.id} className="rounded-brand border-[0.5px] border-stone p-4">
                    <CartLineItem
                      line={entry.line}
                      locale={locale}
                      onEditMessage={setMessageLine}
                      onQuantityChange={setLineQuantity}
                      onRemove={removeLine}
                    />
                  </div>
                ),
              )
            )}
          </div>

          {entries.length > 0 ? (
            <div className="flex w-full shrink-0 flex-col items-center gap-4 border-t-[0.5px] border-muted-text/50 bg-white p-4">
              {cartError ? (
                <div
                  aria-live="polite"
                  className={cn("w-full rounded-brand border border-red-200 bg-red-50 p-3 font-sans text-xs text-red-800")}
                >
                  {t(cartError)}
                </div>
              ) : null}
              <div className="flex w-full items-center justify-between gap-4 py-1">
                <p className="font-sans text-base/[normal] font-medium text-black">{t("total")}</p>
                <p className="font-sans text-2xl/[normal] font-medium text-black">
                  {formatBrandPrice(Number(subtotal.amount), subtotal.currencyCode, locale)}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => void checkout()}
                disabled={isCheckingOut || cartError === "itemUnavailable"}
                className="h-12 w-full cursor-pointer bg-navy-dark px-8 text-base/[normal]"
              >
                {t("checkout")}
              </Button>

              <p className="flex items-center gap-2 font-sans text-sm/[normal] font-normal text-black/50">
                <IconShoppingCart aria-hidden="true" className="size-4 shrink-0 text-black/30" />
                <span>{t("deliveryNote")}</span>
              </p>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <CartMessageDialog
        line={messageLine}
        onOpenChange={(open) => {
          if (!open) setMessageLine(null);
        }}
        onSave={handleSaveMessage}
      />
    </>
  );
}
