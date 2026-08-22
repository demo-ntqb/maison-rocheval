"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { LANGUAGE_SWITCHER_ENABLED } from "@/shared/constants/region.constant";
import { ROUTES } from "@/shared/constants/route.constant";
import { navigation } from "@/shared/constants/site.constant";
import { cn } from "@/shared/lib/utils";

import { AnnouncementBar } from "./announcement-bar";
import { getHeaderRouteConfig } from "./header.config";
import { LanguageSwitcher } from "./language-switcher";
import { useHeaderScroll } from "./use-header-scroll";

const MobileMenu = dynamic(
  () => import("./mobile-menu").then((module) => module.MobileMenu),
  { ssr: false },
);

type HeaderVariant = "transparent" | "solid";

export interface HeaderProps {
  initialVariant?: HeaderVariant;
}

export function Header({ initialVariant }: HeaderProps) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const routeConfig = getHeaderRouteConfig(pathname);

  const variant = initialVariant ?? routeConfig.variant;
  const isTransparent = variant === "transparent";
  const hasLightHero = routeConfig.heroTone === "light";
  const showAnnouncement = routeConfig.announcement;

  const isScrolled = useHeaderScroll(isTransparent);

  const useDarkText = !isTransparent || hasLightHero;

  const textColorClass = cn(useDarkText ? "text-black hover:text-gray-dark" : "text-white hover:text-white/80",
    isTransparent &&
    isScrolled && pathname === ROUTES.HOME && 'text-black hover:text-gray-dark'
  );

  const backgroundHeader = hasLightHero
    ? "border-b border-gray-light bg-white backdrop-blur-md"
    : "border-b border-white/10 bg-black/90 backdrop-blur-md"


  const headerBgClass = cn(
    !isTransparent &&
    "border-b border-gray-light bg-white shadow-sm",

    isTransparent &&
    !isScrolled &&
    "border-transparent bg-transparent",

    isTransparent &&
    isScrolled && pathname === ROUTES.HOME && 'border-b border-gray-light bg-white backdrop-blur-md',

    isTransparent &&
    isScrolled && pathname !== ROUTES.HOME && backgroundHeader
  );

  const mobileLinks = navigation.main.map((item) => ({
    ...item,
    label: t(`nav.${item.id}`),
  }));

  return (
    <div className="sticky top-0 z-50 flex w-full flex-col">
      {showAnnouncement && (
        <AnnouncementBar
          message={t("announcement")}
          dismissLabel={t("dismissAnnouncement")}
        />
      )}

      <header
        data-plumb-id="header"
        className={cn(
          "flex w-full flex-row justify-between px-4 py-5 transition-colors duration-300 sm:px-6 lg:px-8",
          headerBgClass
        )}
      >
        <div className="w-full">
          <div
            className="relative flex h-10 items-center justify-between"
            data-plumb-id="frame-2085667020"
          >
            <nav
              aria-label="Main navigation"
              className="hidden flex-1 items-center gap-8 lg:flex"
              data-plumb-id="frame-2085667019"
            >
              {navigation.main.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-11 items-center font-sans text-sm font-normal transition-colors",
                    textColorClass
                  )}
                >
                  <span
                    data-plumb-id={
                      item.id === "about"
                        ? "our-brand"
                        : item.id === "collection"
                          ? "our-collection"
                          : undefined
                    }
                  >
                    {t(`nav.${item.id}`)}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex flex-1 lg:hidden">
              <button
                type="button"
                className={cn(
                  "inline-flex size-12 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer",
                  textColorClass
                )}
                aria-label={t("openMenu")}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>

              {isMobileMenuOpen && (
                <MobileMenu
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                  menuLabel={t("menuLabel")}
                  links={mobileLinks}
                />
              )}
            </div>

            <div className="absolute left-1/2 flex -translate-x-1/2 justify-center">
              <Link
                href="/"
                data-slot="header-logo"
                className={cn(
                  "flex size-12 items-center justify-center transition-opacity hover:opacity-70",
                  textColorClass,
                  ROUTES.HOME === pathname && !isScrolled && "hidden"
                )}
              >
                <IconMaisonRochevalLogo
                  className="h-10 w-21 max-w-none shrink-0"
                  aria-hidden="true"
                  focusable="false"
                  data-plumb-id="group"
                />
                <span className="sr-only">Maison Rocheval</span>
              </Link>
            </div>

            <div
              className="flex flex-1 items-center justify-end gap-1 sm:gap-4 lg:gap-8"
              data-plumb-id="frame-2085667020-2"
            >
              {LANGUAGE_SWITCHER_ENABLED && <LanguageSwitcher className={textColorClass} />}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
