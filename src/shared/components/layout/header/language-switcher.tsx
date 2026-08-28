"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { parseCommerceContext } from "@/shared/lib/commerce-context";
import { updateRegionPreferenceLocale } from "@/shared/lib/region-preference";
import { cn } from "@/shared/lib/utils";
import type { RouteLocale } from "@/shared/types/region.type";

interface LanguageSwitcherProps {
  availableRouteLocales: readonly RouteLocale[];
  className?: string;
}

export function LanguageSwitcher({ availableRouteLocales, className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const context = parseCommerceContext(locale);
  const currentAppLocale = context.appLocale;
  const nextAppLocale = currentAppLocale === "en" ? "fr" : "en";
  const nextRouteLocale = `${nextAppLocale}-${context.country.toLowerCase()}` as RouteLocale;
  const canToggleLanguage = availableRouteLocales.includes(nextRouteLocale);

  const toggleLanguage = () => {
    if (!canToggleLanguage) return;

    updateRegionPreferenceLocale(nextAppLocale);

    const queryString = searchParams?.toString();
    const nextHref = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextHref, { locale: nextRouteLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={!canToggleLanguage}
      className={cn(
        "inline-flex min-h-12 items-center px-2 font-sans text-sm font-normal transition-colors disabled:cursor-default disabled:opacity-60",
        className
      )}
      aria-label={
        currentAppLocale === "en"
          ? "FR / EN — Afficher le site en français"
          : "FR / EN — View the site in English"
      }
    >
      <span data-plumb-id="fr-en">FR / EN</span>
    </button>
  );
}
