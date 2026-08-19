"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { ROUTES } from "@/shared/constants/route.constant";
import { navigation } from "@/shared/constants/site.constant";
import { cn } from "@/shared/lib/utils";
import { AnnouncementBar } from "./announcement-bar";

const MobileMenu = dynamic(
  () => import("./mobile-menu").then((module) => module.MobileMenu),
  { ssr: false },
);

const TRANSPARENT_ROUTES: string[] = [ROUTES.HOME, ROUTES.ABOUT_BRAND, ROUTES.ABOUT_PRODUCT];

const LIGHT_HERO_ROUTES: string[] = [ROUTES.HOME, ROUTES.ABOUT_BRAND, ROUTES.ABOUT_PRODUCT];

const ANNOUNCEMENT_ROUTES: string[] = [ROUTES.PRODUCTS]

export interface HeaderProps {
  initialVariant?: "transparent" | "solid";
}

export function Header({ initialVariant }: HeaderProps) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Tự động nhận diện variant dựa trên route hiện tại nếu không truyền prop cứng
  const resolvedVariant = initialVariant ||
    (TRANSPARENT_ROUTES.includes(pathname)
      ? "transparent"
      : "solid");

  // Các trang có hero sáng màu: header trong suốt phải dùng chữ đen
  const hasLightHero = LIGHT_HERO_ROUTES.includes(pathname);

  // Kiểm tra xem trang có hiển thị Announcement Bar không (chỉ trang Shop)
  const showAnnouncement = ANNOUNCEMENT_ROUTES.some((route) => pathname.includes(route));

  // Lắng nghe sự kiện scroll để đổi trạng thái nền của transparent header.
  // Trên home, hero báo hiệu [data-home-hero-journey] trên <html> — nền giữ
  // trong suốt cho đến khi scroll qua khỏi hero section.
  useEffect(() => {
    if (resolvedVariant !== "transparent") {
      return;
    }

    const handleScroll = () => {
      const heroJourneyActive = document.documentElement.hasAttribute(
        "data-home-hero-journey",
      );
      if (window.scrollY > 50 && !heroJourneyActive) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [resolvedVariant, pathname]);

  // Chuyển đổi ngôn ngữ EN / FR
  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "fr" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  // Xác định màu chữ chính và màu chữ hover
  let textColorClass = "text-black";
  let textMutedColorClass = "text-black hover:text-gray-dark";

  if (resolvedVariant === "transparent" && !hasLightHero) {
    textColorClass = "text-white";
    textMutedColorClass = "text-white/80 hover:text-white";
  }

  // Xác định nền header
  let headerBgClass = "-mb-px border-b-[0.5px] border-gray-light bg-white shadow-sm";

  if (resolvedVariant === "transparent" && !isScrolled) {
    headerBgClass = "border-transparent bg-transparent";
  } else if (resolvedVariant === "transparent" && isScrolled) {
    headerBgClass = hasLightHero
      ? "-mb-px border-b-[0.5px] border-gray-light bg-white shadow-sm"
      : "border-b border-white/10 bg-black/90 backdrop-blur-md";
  }


  return (
    <div className="sticky top-0 z-50 flex w-full flex-col">
      {/* Announcement Bar at the top (only on Shop routes) */}
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
        <div className="mx-auto w-full max-w-[1336px]">
          <div className="relative flex h-10 items-center justify-between" data-plumb-id="frame-2085667020">
            {/* Left Column: Navigation Links (Desktop) */}
            <nav aria-label="Main navigation" className="hidden flex-1 items-center gap-8 lg:flex" data-plumb-id="frame-2085667019">
              {navigation.main.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-11 items-center font-sans text-sm font-normal transition-colors",
                      textMutedColorClass
                    )}
                  >
                    <span data-plumb-id={item.id === "about" ? "our-brand" : item.id === "collection" ? "our-collection" : undefined}>
                      {t(`nav.${item.id}`)}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Left Column: Hamburger Button (Mobile) */}
            <div className="flex flex-1 lg:hidden">
              <button
                type="button"
                className={cn(
                  "inline-flex size-12 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2",
                  textColorClass,
                )}
                aria-label={t("openMenu")}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>
              {isMobileMenuOpen ? (
                <MobileMenu
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                  menuLabel={t("menuLabel")}
                  links={navigation.main.map((item) => ({
                    ...item,
                    label: t(`nav.${item.id}`),
                  }))}
                />
              ) : null}
            </div>

            {/* Center Column: Logo */}
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
                <IconMaisonRochevalLogo className="h-10 w-[84px] max-w-none shrink-0" aria-hidden="true" focusable="false" data-plumb-id="group" />
                <span className="sr-only">Maison Rocheval</span>
              </Link>
            </div>

            {/* Right Column: Actions (Desktop/Mobile) */}
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-4 lg:gap-8" data-plumb-id="frame-2085667020-2">
              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className={cn(
                  "inline-flex min-h-12 items-center px-2 font-sans text-sm font-normal transition-colors",
                  textMutedColorClass
                )}
                aria-label={locale === "en" ? "FR / EN — Afficher le site en français" : "FR / EN — View the site in English"}
              >
                <span data-plumb-id="fr-en">FR / EN</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
