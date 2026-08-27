"use client";

import { useTranslations } from "next-intl";

import { IconEnvelopeSimple } from "@/shared/components/icons";
import { formatBrandPrice } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import type { CartLine } from "@/shared/types/cart.type";

import { CartQuantityStepper } from "./cart-quantity-stepper";

const UNDERLINED_ACTION =
  "relative shrink-0 cursor-pointer font-sans text-sm/[normal] font-normal text-black underline underline-offset-2 transition-opacity after:absolute after:-inset-x-2 after:-inset-y-3 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2";

export interface CartLineItemProps {
  line: CartLine;
  locale: string;
  onEditMessage: (line: CartLine) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
}

/**
 * Mobile stacks the action row (message button or stepper, plus the line total)
 * under the image and details; from `sm` the design tucks it into the details
 * column, level with the bottom of the image.
 */
export function CartLineItem({
  line,
  locale,
  onEditMessage,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  const t = useTranslations("cart");

  const unitPrice = formatBrandPrice(line.unitPrice, line.currencyCode, locale, {
    minimumFractionDigits: 0,
  });
  const lineTotal = formatBrandPrice(line.unitPrice * line.quantity, line.currencyCode, locale);
  const messageCount = line.giftMessage?.kind === "personal" ? 1 : 0;
  const messageLabel = line.giftMessage ? t("message") : t("addMessage");

  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-6 gap-y-6 sm:grid-cols-[150px_1fr] sm:grid-rows-[1fr_auto] sm:gap-y-0">
      <div className="relative size-[100px] overflow-hidden bg-surface-3 sm:row-span-2 sm:size-[150px]">
        {line.image ? (
          <img
            src={line.image.url}
            alt={line.image.altText}
            width={line.image.width}
            height={line.image.height}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 639px) 100px, 150px"
            className="size-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-2 self-start">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 font-display text-base/[1.2] font-bold text-black">{line.title}</p>
          <button
            type="button"
            aria-label={t("removeLine", { title: line.title })}
            className={UNDERLINED_ACTION}
            onClick={() => onRemove(line.id)}
          >
            {t("remove")}
          </button>
        </div>

        <div className="flex flex-col gap-2 font-sans text-sm/[normal] font-light text-gray-mid">
          <p>
            <span>{t("weightLabel")}</span> <span>{line.weight}</span>
          </p>
          <p>
            <span>{t("priceLabel")}</span> <span>{unitPrice}</span>
          </p>
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:col-start-2">
        {line.quantityEditable ? (
          <CartQuantityStepper
            decreaseLabel={t("decreaseQuantity", { title: line.title })}
            increaseLabel={t("increaseQuantity", { title: line.title })}
            onChange={(quantity) => onQuantityChange(line.id, quantity)}
            quantity={line.quantity}
            maxQuantity={line.quantityAvailable}
            notEnoughStockLabel={t("notEnoughStock")}
          />
        ) : line.supportsGiftMessage ? (
          <button
            type="button"
            onClick={() => onEditMessage(line)}
            aria-label={messageCount > 0 ? `${messageLabel} (${messageCount})` : messageLabel}
            className={cn(
              "relative flex h-8 w-[150px] shrink-0 items-center justify-center gap-2 rounded-brand border-[0.5px] border-gray-light",
              "cursor-pointer font-sans text-sm/[normal] font-normal text-black transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0",
              "hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
          >
            <IconEnvelopeSimple aria-hidden="true" className="size-4 shrink-0" />
            <span>{messageLabel}</span>
            {messageCount > 0 ? <span>({messageCount})</span> : null}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        <p className="shrink-0 font-sans text-base/[normal] font-normal text-black">{lineTotal}</p>
      </div>
    </div>
  );
}
