"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { updateRegionPreferenceLocale } from "@/shared/lib/region-preference";
import { cn } from "@/shared/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "fr" : "en";
    updateRegionPreferenceLocale(nextLocale);
    const queryString = searchParams?.toString();
    const nextHref = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextHref, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "inline-flex min-h-12 items-center px-2 font-sans text-sm font-normal transition-colors cursor-pointer",
        className
      )}
      aria-label={
        locale === "en"
          ? "FR / EN — Afficher le site en français"
          : "FR / EN — View the site in English"
      }
    >
      <span data-plumb-id="fr-en">FR / EN</span>
    </button>
  );
}
