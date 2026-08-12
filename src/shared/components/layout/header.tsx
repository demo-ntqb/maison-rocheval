"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Menu, ShoppingCart } from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { navigation } from "@/shared/constants/site.constant";
import { cn } from "@/shared/lib/utils";
import { AnnouncementBar } from "./announcement-bar";

const MobileMenu = dynamic(
  () => import("./mobile-menu").then((module) => module.MobileMenu),
  { ssr: false },
);

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
    (["/", "/about-the-brand", "/about-the-product"].includes(pathname)
      ? "transparent"
      : "solid");

  // Kiểm tra xem trang có hiển thị Announcement Bar không (chỉ trang Shop)
  const showAnnouncement = pathname.includes("/products");

  // Lắng nghe sự kiện scroll để đổi trạng thái nền của transparent header
  useEffect(() => {
    if (resolvedVariant !== "transparent") {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
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

  // Xác định màu sắc và class động dựa trên variant và scroll state
  const isTransparentMode = resolvedVariant === "transparent" && !isScrolled;

  const headerBgClass = isTransparentMode
    ? "border-transparent bg-transparent"
    : resolvedVariant === "transparent"
    ? "border-b border-white/10 bg-black/90 backdrop-blur-md"
    : "-mb-px border-b-[0.5px] border-gray-light bg-white shadow-sm";

  const textColorClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white"
    : "text-black";

  const textMutedColorClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white/80 hover:text-white"
    : "text-black hover:text-gray-dark";

  const textLabelMutedClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white/60"
    : "text-black";

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
        data-plumb-id="component-7"
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
              <Link href="/" className={cn("flex size-12 items-center justify-center transition-opacity hover:opacity-70", textColorClass)}>
                <IconMaisonRochevalLogo className="h-10 w-[84px] max-w-none shrink-0" aria-hidden="true" focusable="false" data-plumb-id="group" />
                <span className="sr-only">Maison Rocheval</span>
              </Link>
            </div>

            {/* Right Column: Actions (Desktop/Mobile) */}
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-4 lg:gap-8" data-plumb-id="frame-2085667020-2">
              {/* Country Selector (Desktop) */}
              <span
                className={cn(
                  "hidden min-h-11 items-center font-sans text-sm font-normal lg:inline-flex",
                  textLabelMutedClass
                )}
              >
                <span data-plumb-id="france-uer">France - UER €</span>
              </span>

              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className={cn(
                  "hidden min-h-12 items-center px-2 font-sans text-sm font-normal transition-colors sm:flex",
                  textMutedColorClass
                )}
                aria-label={locale === "en" ? "FR / EN — Afficher le site en français" : "FR / EN — View the site in English"}
              >
                <span data-plumb-id="fr-en">FR / EN</span>
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                prefetch={false}
                className={cn(
                  "flex min-h-12 min-w-12 items-center justify-center gap-2 px-2 font-sans text-sm font-normal transition-colors",
                  textMutedColorClass
                )}
                aria-label={t("cart")}
              >
                <span className="flex items-center gap-2" data-plumb-id="frame-2085667208">
                  <ShoppingCart className="size-4" strokeWidth={1.25} aria-hidden="true" data-plumb-id="shoppingcartsimple" />
                  <span className="hidden md:inline" data-plumb-id="cart">{t("cart")}</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
