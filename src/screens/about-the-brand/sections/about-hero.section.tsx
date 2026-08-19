import { getTranslations } from "next-intl/server";


export async function AboutHeroSection() {
  const t = await getTranslations("aboutBrand.hero");

  return (
    <section
      aria-labelledby="about-brand-title"
      data-slot="about-hero-section"
      data-plumb-id="frame-2085667109"
      className="relative -mt-20 flex min-h-[100dvh] flex-col overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        <img
          src="/images/about-brand/hero-maison-lake.png"
          alt={t("imageAlt")}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-6 pt-28 lg:px-[54px]">
        <h1
          id="about-brand-title"
          data-plumb-id="the-maison"
          className="text-center font-display text-[clamp(2.5rem,4.6vw,3.375rem)] font-normal uppercase leading-none tracking-[-0.02em]"
        >
          {t("title")}
        </h1>

      </div>
    </section>
  );
}
