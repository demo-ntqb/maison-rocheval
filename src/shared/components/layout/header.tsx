"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { navigation } from "@/shared/constants/site.constant";
import { Menu, X, ShoppingBag, Globe } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { AnnouncementBar } from "./announcement-bar";

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
  const resolvedVariant = initialVariant || (pathname === "/" || pathname === "/about" ? "transparent" : "solid");

  // Kiểm tra xem trang có hiển thị Announcement Bar không (chỉ trang Shop)
  const showAnnouncement = pathname.includes("/shop");

  // Lắng nghe sự kiện scroll để đổi trạng thái nền của transparent header
  useEffect(() => {
    if (resolvedVariant !== "transparent") {
      setIsScrolled(false);
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
    ? "bg-transparent border-transparent"
    : resolvedVariant === "transparent"
    ? "bg-black/90 border-white/10 backdrop-blur-md"
    : "bg-white border-gray-light border-b-[0.5px] shadow-sm";

  const textColorClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white"
    : "text-black";

  const textMutedColorClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white/80 hover:text-white"
    : "text-gray-dark hover:text-black";

  const textLabelMutedClass = isTransparentMode || resolvedVariant === "transparent"
    ? "text-white/60"
    : "text-gray-dark/70";

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col">
      {/* Announcement Bar at the top (only on Shop routes) */}
      {showAnnouncement && <AnnouncementBar />}

      <header
        className={cn(
          "w-full transition-all duration-300",
          headerBgClass
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Left Column: Navigation Links (Desktop) */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-8">
              {navigation.main.map((item) => {
                const isShop = item.id === "shop";
                if (isShop) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-sm px-5 text-xs font-semibold tracking-wider uppercase transition-all duration-200",
                        isTransparentMode || resolvedVariant === "transparent"
                          ? "bg-white text-black hover:bg-beige"
                          : "bg-black text-white hover:bg-gray-dark"
                      )}
                      data-plumb-id={`header-nav-${item.id}`}
                    >
                      {t(`nav.${item.id}`)}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "font-sans text-sm font-light uppercase tracking-wider transition-colors",
                      textMutedColorClass
                    )}
                    data-plumb-id={`header-nav-${item.id}`}
                  >
                    {t(`nav.${item.id}`)}
                  </Link>
                );
              })}
            </nav>

            {/* Left Column: Hamburger Button (Mobile) */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center p-2 focus:outline-none min-h-[48px] min-w-[48px]",
                  textColorClass
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label={t(isMobileMenuOpen ? "closeMenu" : "openMenu")}
              >
                {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>

            {/* Center Column: Logo */}
            <div className="flex flex-1 justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <Link href="/" className="flex flex-col items-center group">
                <span
                  className={cn(
                    "font-display text-lg sm:text-xl font-medium tracking-[0.25em] transition-colors duration-300",
                    textColorClass,
                    (isTransparentMode || resolvedVariant === "transparent") && "group-hover:text-beige"
                  )}
                >
                  MAISON ROCHEVAL
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[8px] font-light tracking-[0.4em] uppercase",
                    isTransparentMode || resolvedVariant === "transparent"
                      ? "text-white/40"
                      : "text-gray-dark/50"
                  )}
                >
                  Caviar & Fine Food
                </span>
              </Link>
            </div>

            {/* Right Column: Actions (Desktop/Mobile) */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Country Selector (Desktop) */}
              <span
                className={cn(
                  "hidden sm:inline-block font-sans text-[11px] font-light tracking-wider uppercase",
                  textLabelMutedClass
                )}
              >
                France - EUR €
              </span>

              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className={cn(
                  "flex items-center gap-1.5 font-sans text-xs font-light tracking-widest uppercase transition-colors min-h-[48px] px-2",
                  textMutedColorClass
                )}
                aria-label="Switch Language"
              >
                <Globe className={cn("size-3.5", textLabelMutedClass)} />
                <span>{locale === "en" ? "FR" : "EN"}</span>
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className={cn(
                  "flex items-center gap-2 font-sans text-xs font-light tracking-widest uppercase transition-colors min-h-[48px] px-2",
                  textMutedColorClass
                )}
              >
                <ShoppingBag className="size-4" />
                <span className="hidden md:inline">{t("cart")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide-down Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              "lg:hidden border-t transition-all duration-300",
              resolvedVariant === "transparent"
                ? "bg-black/95 border-white/10"
                : "bg-white border-gray-light"
            )}
          >
            <div className="space-y-4 px-4 py-6">
              {navigation.main.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "block font-sans text-sm uppercase tracking-widest py-2 border-b min-h-[48px] flex items-center",
                    resolvedVariant === "transparent"
                      ? "border-white/5 text-white/70 hover:text-white"
                      : "border-gray-light/20 text-gray-dark hover:text-black",
                    item.id === "shop" && (resolvedVariant === "transparent" ? "text-beige font-medium" : "text-black font-bold")
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(`nav.${item.id}`)}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <span
                  className={cn(
                    "font-sans text-[10px] tracking-widest uppercase",
                    resolvedVariant === "transparent" ? "text-white/40" : "text-gray-dark/40"
                  )}
                >
                  France - EUR €
                </span>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
