"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
  SHIPPING_COUNTRIES,
} from "@/shared/constants/region.constant";
import {
  markRegionPromptDismissed,
  writeRegionPreference,
} from "@/shared/lib/region-preference";
import { cn } from "@/shared/lib/utils";
import type { CommerceContext } from "@/shared/types/commerce-context.type";
import type { AppLocale, RouteLocale, ShippingCountryCode } from "@/shared/types/region.type";

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
  /** Cặp country/language hiện đang được Shopify Markets publish. */
  availableContexts: readonly CommerceContext[];
  /** Quốc gia gợi ý ban đầu */
  initialCountryCode?: ShippingCountryCode;
  /** Ngôn ngữ gợi ý ban đầu */
  initialAppLocale?: AppLocale;
}

export function RegionPreferenceDialog({
  availableContexts,
  initialCountryCode,
  initialAppLocale = "en",
}: RegionPreferenceDialogProps) {
  const t = useTranslations("regionDialog");
  const activeRouteLocale = useLocale() as RouteLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const availableCountries = SHIPPING_COUNTRIES.filter((country) =>
    availableContexts.some((context) => context.country === country.code),
  );
  const firstContext = availableContexts[0];
  const initialContext = availableContexts.find(
    (context) => context.country === initialCountryCode && context.appLocale === initialAppLocale,
  ) ?? availableContexts.find((context) => context.country === initialCountryCode) ?? firstContext;
  const [countryCode, setCountryCode] = useState<ShippingCountryCode>(initialContext?.country ?? "SG");
  const [locale, setLocale] = useState<AppLocale>(initialContext?.appLocale ?? "en");

  const selectedCountry =
    availableCountries.find((country) => country.code === countryCode) ?? availableCountries[0];
  const availableLanguages = availableContexts
    .filter((context) => context.country === countryCode)
    .map((context) => context.appLocale);

  const handleDismiss = () => {
    markRegionPromptDismissed();
    setOpen(false);
  };

  const handleCountryChange = (newCountryCode: string) => {
    const validCountryCode = newCountryCode as ShippingCountryCode;
    setCountryCode(validCountryCode);
    if (!availableContexts.some((context) => context.country === validCountryCode && context.appLocale === locale)) {
      const firstLanguage = availableContexts.find((context) => context.country === validCountryCode)?.appLocale;
      if (firstLanguage) setLocale(firstLanguage);
    }
  };

  const handleConfirm = () => {
    const targetRouteLocale = availableContexts.find(
      (context) => context.country === countryCode && context.appLocale === locale,
    )?.routeLocale as RouteLocale | undefined;
    if (!targetRouteLocale) return;

    writeRegionPreference({ routeLocale: targetRouteLocale });
    setOpen(false);

    if (targetRouteLocale !== activeRouteLocale) {
      const queryString = searchParams?.toString();
      const nextHref = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextHref, { locale: targetRouteLocale });
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
            onChange={handleCountryChange}
            options={availableCountries.map((country) => ({
              value: country.code,
              label: `${country.flag} ${t(`countries.${country.code}`)}`,
            }))}
            display={
              <>
                <span className="text-xl leading-normal">{selectedCountry?.flag}</span>
                <span>{selectedCountry ? t(`countries.${selectedCountry.code}`) : ""}</span>
              </>
            }
            className="w-full md:min-w-0 md:flex-1"
          />
          <RegionSelectField
            id="region-preference-language"
            label={t("languageLabel")}
            value={locale}
            onChange={(next) => setLocale(next as AppLocale)}
            options={availableLanguages.map((option) => ({
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
