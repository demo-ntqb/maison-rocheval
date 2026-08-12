import * as React from "react";
import { useTranslations } from "next-intl";

export function AboutHeroSection() {
  const t = useTranslations("about.hero");

  return (
    <section
      data-slot="about-hero-section"
      className="relative -mt-20 flex h-[600px] w-full flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet="/images/about/hero.webp" type="image/webp" />
          <img
            src="/images/about/hero.jpg"
            alt="Maison Rocheval Caviar Craftsmanship"
            className="h-full w-full object-cover opacity-75"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-[600px] animate-fade-in">
        <h1 className="font-display text-[48px] sm:text-[64px] font-medium tracking-[0.2em] text-white uppercase">
          {t("title")}
        </h1>
        <p className="mt-4 font-sans text-sm sm:text-base font-light tracking-wide text-white/80 leading-relaxed">
          {t("description")}
        </p>
      </div>
    </section>
  );
}
