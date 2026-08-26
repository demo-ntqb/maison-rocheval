"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { IconX } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import type { CartGiftMessage, CartLine } from "@/shared/types/cart.type";

const MAX_LINES = 12;

/** The Figma radio is a 20px Phosphor ring with a filled core when selected. */
const RADIO_ITEM =
  "size-5 border-black data-checked:border-black data-checked:bg-transparent [&_[data-slot=radio-group-indicator]]:size-5 [&_[data-slot=radio-group-indicator]>span]:size-[9px] [&_[data-slot=radio-group-indicator]>span]:bg-black";

function clampLines(value: string): string {
  const lines = value.split("\n");
  return lines.length <= MAX_LINES ? value : lines.slice(0, MAX_LINES).join("\n");
}

export interface CartMessageDialogProps {
  line: CartLine | null;
  onOpenChange: (open: boolean) => void;
  onSave: (lineId: string, giftMessage: CartGiftMessage) => void;
}

export function CartMessageDialog({ line, onOpenChange, onSave }: CartMessageDialogProps) {
  return (
    <Dialog open={line !== null} onOpenChange={onOpenChange}>
      {/* Keyed on the line so each editing session starts from that line's own
          saved message instead of syncing state in an effect. */}
      {line ? (
        <CartMessageForm
          key={line.id}
          line={line}
          onClose={() => onOpenChange(false)}
          onSave={onSave}
        />
      ) : null}
    </Dialog>
  );
}

function CartMessageForm({
  line,
  onClose,
  onSave,
}: {
  line: CartLine;
  onClose: () => void;
  onSave: (lineId: string, giftMessage: CartGiftMessage) => void;
}) {
  const t = useTranslations("cart.messageDialog");
  const fieldId = useId();

  const [kind, setKind] = useState<CartGiftMessage["kind"]>(line.giftMessage?.kind ?? "blank");
  const [text, setText] = useState(
    line.giftMessage?.kind === "personal" ? line.giftMessage.text : "",
  );

  const isPersonal = kind === "personal";
  const linesRemaining = MAX_LINES - (text === "" ? 0 : text.split("\n").length);

  return (
    <DialogContent
      showCloseButton={false}
      aria-describedby={undefined}
      className={cn(
        "inset-5 flex w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-3 overflow-hidden",
        "rounded-brand border-[0.5px] border-stone bg-white p-4 text-black ring-0",
        "shadow-[15px_15px_32px_rgba(0,0,0,0.05)]",
        "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[700px] sm:w-[500px] sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2",
      )}
    >
      <div className="flex h-8 shrink-0 items-center justify-between gap-4">
        <DialogTitle className="min-w-0 font-sans text-base/[normal] font-medium text-black">
          {t("title", { title: line.title })}
        </DialogTitle>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] p-[4px] text-gray-icon transition-colors hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <IconX aria-hidden="true" className="size-6" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-brand border-[0.5px] border-gray-light p-4">
        <RadioGroup
          value={kind}
          onValueChange={(value) => setKind(value as CartGiftMessage["kind"])}
          aria-label={t("optionLabel")}
          className="grid shrink-0 gap-2"
        >
          <div className="flex h-8 items-center gap-2">
            <RadioGroupItem value="blank" id={`${fieldId}-blank`} className={RADIO_ITEM} />
            <label
              htmlFor={`${fieldId}-blank`}
              className="cursor-pointer font-sans text-base/[normal] font-normal text-black"
            >
              {t("blankCard")}
            </label>
          </div>
          <div className="flex h-8 items-center gap-2">
            <RadioGroupItem value="personal" id={`${fieldId}-personal`} className={RADIO_ITEM} />
            <label
              htmlFor={`${fieldId}-personal`}
              className="cursor-pointer font-sans text-base/[normal] font-normal text-black"
            >
              {t("personalMessage")}
            </label>
          </div>
        </RadioGroup>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-center gap-1 transition-opacity",
            !isPersonal && "opacity-30",
          )}
        >
          <p className="font-sans text-xs/[normal] font-light text-black">{t("hint")}</p>
          <label className="sr-only" htmlFor={`${fieldId}-text`}>
            {t("placeholder")}
          </label>
          <textarea
            id={`${fieldId}-text`}
            value={text}
            disabled={!isPersonal}
            onChange={(event) => setText(clampLines(event.target.value))}
            placeholder={t("placeholder")}
            className="cart-message-lines w-full shrink-0 resize-none border-0 bg-transparent p-0 font-sans text-sm font-light text-black outline-none placeholder:text-black/50 disabled:cursor-not-allowed"
          />
          <p className="font-sans text-xs/[normal] font-light text-black">
            {t("linesRemaining", { count: linesRemaining })}
          </p>
        </div>
      </div>

      <Button
        type="button"
        className="h-12 w-full shrink-0 bg-navy-dark px-8 text-base/[normal]"
        disabled={isPersonal && text.trim() === ""}
        onClick={() => onSave(line.id, isPersonal ? { kind: "personal", text } : { kind: "blank" })}
      >
        {t("save")}
      </Button>
    </DialogContent>
  );
}
