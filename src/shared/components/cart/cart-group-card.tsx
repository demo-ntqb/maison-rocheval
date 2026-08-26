"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import type { CartGroup, CartLine } from "@/shared/types/cart.type";

import { CartLineItem } from "./cart-line-item";

export interface CartGroupCardProps {
  group: CartGroup;
  locale: string;
  onEditMessage: (line: CartLine) => void;
  onNavigate: () => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
}

/**
 * A gift set renders as one card: a heading row carrying the set name plus its
 * component count, then every component line separated by a dashed rule.
 */
export function CartGroupCard({
  group,
  locale,
  onEditMessage,
  onNavigate,
  onQuantityChange,
  onRemove,
}: CartGroupCardProps) {
  const t = useTranslations("cart");

  return (
    <section
      aria-label={group.title}
      className="flex flex-col rounded-brand border-[0.5px] border-stone"
    >
      <header className="flex items-center justify-between gap-4 border-b-[0.5px] border-stone p-4">
        <h3 className="min-w-0 font-display text-base/[1.2] font-bold text-black">
          {group.title} ({group.lines.length})
        </h3>
        {group.addHref ? (
          <Link
            href={group.addHref}
            onClick={onNavigate}
            aria-label={t("addToGroup", { title: group.title })}
            className="relative shrink-0 font-sans text-sm/[normal] font-normal text-black underline underline-offset-2 transition-opacity after:absolute after:-inset-x-2 after:-inset-y-3 hover:opacity-70"
          >
            {t("add")}
          </Link>
        ) : null}
      </header>

      {group.lines.map((line, index) => (
        <div
          key={line.id}
          className={cn(
            "p-4",
            index < group.lines.length - 1 && "border-b-[0.5px] border-dashed border-stone",
          )}
        >
          <CartLineItem
            line={line}
            locale={locale}
            onEditMessage={onEditMessage}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        </div>
      ))}
    </section>
  );
}
