"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { IconCaretDown } from "@/shared/components/icons/ic-caret-down";
import { IconX } from "@/shared/components/icons/ic-x";
import { IconMaisonRochevalSymbol } from "@/shared/components/icons/maison-rocheval-symbol";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DEFAULT_SHIPPING_COUNTRY,
  LANGUAGE_OPTIONS,
  SHIPPING_COUNTRIES
} from "@/shared/constants/region.constant";
import {
  markRegionPromptDismissed,
  writeRegionPreference,
} from "@/shared/lib/region-preference";
import { cn } from "@/shared/lib/utils";
import type { AppLocale, ShippingCountryCode } from "@/shared/types/region.type";

/**
 * Ô select theo design (node 409:18538): một `<select>` gốc phủ trong suốt lên
 * phần hiển thị. Giữ được toàn bộ a11y + picker gốc của mobile, trong khi vẫn
 * vẽ được flag 20px / nhãn 16px / caret 16px như Figma.
 *
 * Cao 48px trên mobile (chuẩn tap target) và về đúng 40px của Figma từ md trở lên.
 */
function RegionSelectField({
  id,
  label,
  value,
  display,
  onChange,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  display: React.ReactNode;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={id}
        className="font-display text-base leading-normal text-black"
      >
        {label}
      </label>
      <div className="relative flex h-12 w-full items-center justify-between rounded-brand border-[0.5px] border-stroke-2 px-4 transition-colors focus-within:border-ink md:h-10">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer appearance-none rounded-brand bg-transparent text-base opacity-0 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="flex items-center gap-4 font-sans text-base leading-normal font-normal whitespace-nowrap text-black"
        >
          {display}
        </span>
        <IconCaretDown
          aria-hidden="true"
          focusable="false"
          className="size-4 shrink-0 text-black"
        />
      </div>
    </div>
  );
}

export interface RegionPreferenceDialogProps {
  /** Quốc gia gợi ý ban đầu, suy ra từ locale đang hoạt động. */
  initialCountryCode?: ShippingCountryCode;
}

export function RegionPreferenceDialog({
  initialCountryCode = DEFAULT_SHIPPING_COUNTRY,
}: RegionPreferenceDialogProps) {
  const t = useTranslations("regionDialog");
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [countryCode, setCountryCode] = useState<ShippingCountryCode>(initialCountryCode);
  const [locale, setLocale] = useState<AppLocale>(activeLocale);

  const selectedCountry =
    SHIPPING_COUNTRIES.find((country) => country.code === countryCode) ?? SHIPPING_COUNTRIES[0];

  // Đóng bằng nút X: chỉ im lặng trong phiên này, chưa ghi vào localStorage —
  // lần truy cập sau vẫn hỏi lại vì người dùng chưa thực sự chọn.
  const handleDismiss = () => {
    markRegionPromptDismissed();
    setOpen(false);
  };

  const handleConfirm = () => {
    writeRegionPreference({ countryCode, locale });
    setOpen(false);

    if (locale !== activeLocale) {
      router.replace(pathname, { locale });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleDismiss();
        }
      }}
    >
      {/* `rounded-[…]` chứ không phải `rounded-brand`: tailwind-merge không nhận ra
          key theme tuỳ biến nên không loại được `rounded-xl` mặc định của
          DialogContent — giá trị arbitrary thì loại được. */}
      <DialogContent
        showCloseButton={false}
        className="flex max-w-[calc(100%-2rem)] flex-col gap-8 rounded-[var(--radius-brand)] border-[0.5px] border-stroke-1 bg-white p-8 text-base ring-0 drop-shadow-[16px_16px_16px_rgba(0,0,0,0.05)] sm:max-w-[600px] lg:p-[54px]"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <IconMaisonRochevalSymbol
              className="h-8 w-[27px] shrink-0 text-black"
              aria-hidden="true"
              focusable="false"
            />
            {/* Không cần onClick: Radix tự gọi onOpenChange(false) → handleDismiss. */}
            <DialogClose className="-m-3 inline-flex size-12 items-center justify-center p-3 text-black transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2">
              <IconX className="size-6" aria-hidden="true" focusable="false" />
              <span className="sr-only">{t("close")}</span>
            </DialogClose>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-4">
              <DialogTitle className="font-display text-[32px] leading-8 font-normal text-black">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="font-sans text-sm leading-5 font-normal text-black">
                {t("description")}
              </DialogDescription>
            </div>
            <p className="font-sans text-sm leading-normal font-normal text-black">
              {t("note")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          <RegionSelectField
            id="region-preference-country"
            label={t("countryLabel")}
            value={countryCode}
            onChange={(next) => setCountryCode(next as ShippingCountryCode)}
            options={SHIPPING_COUNTRIES.map((country) => ({
              value: country.code,
              label: `${country.flag} ${t(`countries.${country.code}`)}`,
            }))}
            display={
              <>
                <span className="text-xl leading-normal">{selectedCountry.flag}</span>
                <span>{t(`countries.${selectedCountry.code}`)}</span>
              </>
            }
            className="w-full md:min-w-0 md:flex-1"
          />
          <RegionSelectField
            id="region-preference-language"
            label={t("languageLabel")}
            value={locale}
            onChange={(next) => setLocale(next as AppLocale)}
            options={LANGUAGE_OPTIONS.map((option) => ({
              value: option,
              label: t(`languages.${option}`),
            }))}
            display={<span>{t(`languages.${locale}`)}</span>}
            className="w-full md:w-[200px] md:shrink-0"
          />
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex h-12 w-full items-center justify-center rounded-brand bg-navy-dark px-8 py-2 font-sans text-base leading-normal font-normal text-white transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 md:w-[200px]"
        >
          {t("continue")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
