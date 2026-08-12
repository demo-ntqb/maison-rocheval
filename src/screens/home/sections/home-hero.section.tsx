import * as React from "react";
import { useTranslations } from "next-intl";
import { MichelinRating } from "@/shared/components/ui/michelin-rating";

export function HomeHeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section
      data-slot="home-hero-section"
      className="relative -mt-20 flex h-[800px] w-full flex-col items-center justify-between bg-black overflow-hidden"
    >
      {/* Background Media with Radial Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet="/images/home/hero.webp" type="image/webp" />
          <img
            src="/images/home/hero.jpg"
            alt="Maison Rocheval Luxury Caviar Presentation"
            className="h-full w-full object-cover opacity-80"
          />
        </picture>
        {/* Radial Gradient overlay from Figma: #77848f00 to #071b26 (deep navy) */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#071b26]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b26] via-transparent to-black/40" />
      </div>

      {/* Spacing for Header overlap */}
      <div className="h-20 w-full" />

      {/* Center Column: Logo & Tagline */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            {/* Huge Decorative Brand Name */}
            <h1 className="font-display text-[64px] sm:text-[84px] font-medium tracking-[0.25em] text-white leading-none">
              MAISON ROCHEVAL
            </h1>
            <span className="mt-2 text-xs sm:text-sm font-light tracking-[0.5em] text-white/60 uppercase">
              {t("subtitle")}
            </span>
          </div>
          <p className="max-w-[450px] font-sans text-sm sm:text-base font-light tracking-wide text-white/80 leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Bottom Column: Michelin Rating Stars rating (h: 140px) */}
      <div className="relative z-10 flex h-[140px] w-full items-center justify-center pb-8 animate-slide-up">
        <div className="flex flex-col items-center gap-2">
          <MichelinRating count={3} starClassName="size-[30px] text-white" />
        </div>
      </div>
    </section>
  );
}
